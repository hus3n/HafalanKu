import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { WhatsAppSession } from './whatsapp.model';
import { AppError } from '../../utils/AppError';
import { prisma } from '../../config/database';

// In-memory sockets & state tracking per userId
const activeSockets = new Map<string, any>();
const activeQRCodes = new Map<string, string>();
const reconnectAttempts = new Map<string, number>();

export class WhatsappService {
  async initSession(userId: string) {
    const sessionDir = path.resolve(process.cwd(), `./whatsapp_sessions/${userId}`);

    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] as [number, number, number] }));

    return new Promise((resolve, reject) => {
      let resolved = false;

      // Close existing socket if present
      if (activeSockets.has(userId)) {
        try {
          activeSockets.get(userId)?.end(new Error('Re-initializing session'));
        } catch (e) {
          // ignore
        }
        activeSockets.delete(userId);
      }

      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['HafalanKu Web', 'Chrome', '1.0.0'],
      });

      activeSockets.set(userId, sock);

      sock.ev.on('creds.update', saveCreds);

      // Listen to incoming messages for auto-updating Murajaah status on keyword 'sudah'
      sock.ev.on('messages.upsert', async (m) => {
        if (m.type === 'notify') {
          for (const msg of m.messages) {
            if (!msg.key.fromMe && msg.message) {
              const text = (
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                msg.message.videoMessage?.caption ||
                ''
              ).trim().toLowerCase();

              const senderJid = msg.key.remoteJid || '';
              const senderDigits = senderJid.split('@')[0].replace(/[^0-9]/g, '');

              if (text.includes('sudah')) {
                console.log(`[WA Gateway] Received reply '${text}' from sender ${senderDigits} (JID: ${senderJid}) for user ${userId}. Auto-updating Murajaah status...`);
                try {
                  const { decrypt } = require('../../utils/encryption');
                  const normalizePhone = (p: string) => (p || '').replace(/[^0-9]/g, '').replace(/^(62|0)/, '');
                  const cleanSender = normalizePhone(senderDigits);

                  // Fetch current user organization context
                  const currentUser = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true, organizationId: true }
                  });

                  // Fetch all relevant santri (created by user, in user's class, or in user's organization)
                  const allSantri = await prisma.santri.findMany({
                    where: {
                      deletedAt: null,
                      OR: [
                        { userId },
                        { kelas: { userId } },
                        ...(currentUser?.organizationId ? [{ user: { organizationId: currentUser.organizationId } }] : [])
                      ]
                    }
                  });

                  let matchedSantri = null;
                  for (const s of allSantri) {
                    try {
                      const decryptedPhone = decrypt(s.parentPhone);
                      const cleanParent = normalizePhone(decryptedPhone);

                      if (cleanSender && cleanParent && (cleanSender === cleanParent || cleanSender.endsWith(cleanParent) || cleanParent.endsWith(cleanSender))) {
                        matchedSantri = s;
                        break;
                      }
                    } catch (e) {
                      // ignore decryption errors
                    }
                  }

                  if (matchedSantri) {
                    console.log(`[WA Gateway] Matched santri: ${matchedSantri.name} (ID: ${matchedSantri.id})`);
                    
                    const updateResult = await prisma.murajaahSchedule.updateMany({
                      where: { 
                        santriId: matchedSantri.id,
                      },
                      data: { 
                        isSelected: true, 
                        lastReviewDate: new Date(),
                        updatedAt: new Date(),
                      },
                    });

                    console.log(`[WA Gateway] Automatically marked Murajaah status for santri ${matchedSantri.name} as DONE (🟢 Sudah Dimurajaah)! Updated records: ${updateResult.count}`);
                  } else {
                    console.warn(`[WA Gateway] No matching santri found for sender ${senderDigits} under user ${userId}`);
                  }
                } catch (err) {
                  console.error('[WA Gateway] Failed auto-updating Murajaah status from reply:', err);
                }
              }
            }
          }
        }
      });

      // Listen to connection updates
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            console.log('[WA] QR received for user:', userId);
            const qrCodeBase64 = await QRCode.toDataURL(qr);
            activeQRCodes.set(userId, qrCodeBase64);

            await WhatsAppSession.findOneAndUpdate(
              { userId },
              {
                status: 'PAIRING',
                updatedAt: new Date(),
              },
              { upsert: true, new: true }
            );

            if (!resolved) {
              resolved = true;
              resolve({
                status: 'PAIRING',
                qrCode: qrCodeBase64,
                expiresInSeconds: 45,
              });
            }
          } catch (err) {
            if (!resolved) {
              resolved = true;
              reject(err);
            }
          }
        }

        if (connection === 'open') {
          console.log('[WA] Connection opened for user:', userId);
          reconnectAttempts.delete(userId);
          const userJid = sock.user?.id || '';
          const phoneNumber = userJid.split(':')[0] || userJid.split('@')[0];

          await WhatsAppSession.findOneAndUpdate(
            { userId },
            {
              status: 'CONNECTED',
              phoneNumber,
              lastConnectedAt: new Date(),
              updatedAt: new Date(),
            },
            { upsert: true, new: true }
          );

          activeQRCodes.delete(userId);

          if (!resolved) {
            resolved = true;
            resolve({
              status: 'CONNECTED',
              phoneNumber,
              lastConnectedAt: new Date().toISOString(),
              qrCode: null,
            });
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          if (statusCode === DisconnectReason.loggedOut) {
            console.log(`[WA] User ${userId} logged out from WhatsApp`);
            await WhatsAppSession.findOneAndUpdate(
              { userId },
              {
                status: 'DISCONNECTED',
                phoneNumber: null,
                updatedAt: new Date(),
              }
            );
            activeSockets.delete(userId);
            activeQRCodes.delete(userId);
            reconnectAttempts.delete(userId);

            if (fs.existsSync(sessionDir)) {
              try {
                fs.rmSync(sessionDir, { recursive: true, force: true });
              } catch (e) {
                // ignore
              }
            }

            if (!resolved) {
              resolved = true;
              reject(new AppError('WhatsApp session was logged out', 401));
            }
          } else if (shouldReconnect) {
            const currentAttempts = (reconnectAttempts.get(userId) || 0) + 1;
            reconnectAttempts.set(userId, currentAttempts);

            if (currentAttempts <= 3) {
              console.log(`[WA] Connection closed. Retrying connection for user ${userId} (Attempt ${currentAttempts}/3)...`);
              setTimeout(() => {
                this.initSession(userId).catch(err => console.error('[WA] Reconnect error:', err));
              }, 3000);
            } else {
              console.log(`[WA] Max reconnect attempts reached for user ${userId}`);
              await WhatsAppSession.findOneAndUpdate(
                { userId },
                {
                  status: 'DISCONNECTED',
                  updatedAt: new Date(),
                }
              );
              activeSockets.delete(userId);
              activeQRCodes.delete(userId);
              reconnectAttempts.delete(userId);
            }
          }
        }
      });

      // Timeout if QR is not generated within 45 seconds
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new AppError('Gagal terhubung ke server WhatsApp. Pastikan koneksi internet stabil dan coba lagi.', 504));
        }
      }, 45000);
    });
  }

  async autoRestoreSessions() {
    try {
      const connectedSessions = await WhatsAppSession.find({ status: 'CONNECTED' });
      for (const session of connectedSessions) {
        console.log(`[WA Gateway] Auto-restoring session for user ${session.userId}...`);
        this.initSession(session.userId).catch(err => console.error(`[WA Gateway] Restore error for user ${session.userId}:`, err));
      }
    } catch (err) {
      console.error('[WA Gateway] Error loading connected sessions:', err);
    }
  }

  async getStatus(userId: string) {
    const session = await WhatsAppSession.findOne({ userId });
    const currentQR = activeQRCodes.get(userId);

    if (!session) {
      return {
        status: 'DISCONNECTED',
        phoneNumber: null,
        lastConnectedAt: null,
        qrCode: currentQR || null,
      };
    }

    return {
      status: session.status,
      phoneNumber: session.phoneNumber,
      lastConnectedAt: session.lastConnectedAt,
      qrCode: currentQR || null,
    };
  }

  async getLatestQR(userId: string) {
    const session = await this.getStatus(userId);
    return {
      status: session.status,
      qrCode: session.qrCode,
      expiresInSeconds: 45,
    };
  }

  async disconnect(userId: string) {
    const sessionDir = path.resolve(process.cwd(), `./whatsapp_sessions/${userId}`);

    if (activeSockets.has(userId)) {
      try {
        const sock = activeSockets.get(userId);
        await sock?.logout();
      } catch (e) {
        // ignore
      }
      activeSockets.delete(userId);
    }
    activeQRCodes.delete(userId);
    reconnectAttempts.delete(userId);

    if (fs.existsSync(sessionDir)) {
      try {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      } catch (e) {
        // ignore
      }
    }

    await WhatsAppSession.findOneAndUpdate(
      { userId },
      {
        status: 'DISCONNECTED',
        phoneNumber: null,
        updatedAt: new Date(),
      }
    );

    return { success: true, message: 'Koneksi WhatsApp berhasil diputuskan' };
  }

  async sendMessage(userId: string, recipientPhone: string, message: string) {
    // Convert Indonesian local 08xxx prefix to international 628xxx format for WhatsApp JID
    let formattedPhone = recipientPhone.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('08')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('8')) {
      formattedPhone = '62' + formattedPhone;
    }
    const recipientJid = `${formattedPhone}@s.whatsapp.net`;

    let sock = activeSockets.get(userId);

    // Auto-restore active session from disk if socket instance was lost on container restart
    if (!sock) {
      const sessionDir = path.resolve(process.cwd(), `./whatsapp_sessions/${userId}`);
      if (fs.existsSync(sessionDir)) {
        try {
          console.log(`[WA] Restoring active WhatsApp socket from session disk for user ${userId}...`);
          await this.initSession(userId);
          sock = activeSockets.get(userId);
        } catch (e) {
          console.error('[WA] Failed restoring session from disk:', e);
        }
      }
    }

    if (sock) {
      try {
        const session = await WhatsAppSession.findOne({ userId });
        if (!session || session.status !== 'CONNECTED') {
           throw new Error('Sesi WhatsApp belum terhubung secara penuh.');
        }

        const [result] = await sock.onWhatsApp(recipientJid);
        if (!result || !result.exists) {
          return {
            success: false,
            messageId: `msg_${Date.now()}`,
            recipient: formattedPhone,
            message,
            sentAt: new Date().toISOString(),
            status: 'FAILED',
            error: 'Nomor WhatsApp tidak terdaftar atau tidak aktif.',
          };
        }

        await sock.sendMessage(recipientJid, { text: message });
        console.log(`[WA] Successfully sent WhatsApp message to ${recipientJid}`);
        return {
          success: true,
          messageId: `msg_${Date.now()}`,
          recipient: formattedPhone,
          message,
          sentAt: new Date().toISOString(),
          status: 'DELIVERED',
        };
      } catch (err: any) {
        console.error(`[WA] Failed sending message via Baileys socket to ${recipientJid}:`, err);
        return {
          success: false,
          messageId: `msg_${Date.now()}`,
          recipient: formattedPhone,
          message,
          sentAt: new Date().toISOString(),
          status: 'FAILED',
          error: err.message || 'Gagal mengirim pesan WhatsApp. Cek koneksi.',
        };
      }
    }

    return {
      success: false,
      messageId: `msg_${Date.now()}`,
      recipient: formattedPhone,
      message,
      sentAt: new Date().toISOString(),
      status: 'FAILED',
      error: 'WhatsApp socket tidak aktif. Silakan hubungkan ulang QR WhatsApp.',
    };
  }
}

export class WhatsAppService extends WhatsappService {}
