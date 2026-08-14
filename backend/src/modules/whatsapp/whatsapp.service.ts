import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { WhatsAppSession, WhatsAppAuthKey } from './whatsapp.model';
import { AppError } from '../../utils/AppError';
import { prisma } from '../../config/database';

// In-memory sockets & state tracking per userId
const activeSockets = new Map<string, any>();
const activeQRCodes = new Map<string, string>();
const reconnectAttempts = new Map<string, number>();

// Helper to restore auth files from MongoDB to disk if disk is empty after deploy/restart
async function restoreAuthFromMongo(userId: string, sessionDir: string): Promise<boolean> {
  try {
    const credsPath = path.join(sessionDir, 'creds.json');
    if (!fs.existsSync(credsPath)) {
      const keys = await WhatsAppAuthKey.find({ userId });
      if (keys && keys.length > 0) {
        console.log(`[WA Gateway] Restoring ${keys.length} session auth keys from MongoDB to disk for user ${userId}...`);
        if (!fs.existsSync(sessionDir)) {
          fs.mkdirSync(sessionDir, { recursive: true });
        }
        for (const k of keys) {
          fs.writeFileSync(path.join(sessionDir, k.keyId), k.data, 'utf-8');
        }
        return true;
      }
    }
  } catch (err) {
    console.error(`[WA Gateway] Failed restoring auth keys from MongoDB for user ${userId}:`, err);
  }
  return false;
}

// Helper to sync all disk auth files to MongoDB
async function syncAuthToMongo(userId: string, sessionDir: string): Promise<void> {
  try {
    if (!fs.existsSync(sessionDir)) return;
    const files = fs.readdirSync(sessionDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(sessionDir, file);
        const data = fs.readFileSync(filePath, 'utf-8');
        await WhatsAppAuthKey.findOneAndUpdate(
          { userId, keyId: file },
          { data, updatedAt: new Date() },
          { upsert: true, new: true }
        );
      }
    }
  } catch (err) {
    console.error(`[WA Gateway] Failed syncing auth keys to MongoDB for user ${userId}:`, err);
  }
}

export class WhatsappService {
  async initSession(userId: string) {
    const sessionDir = path.resolve(process.cwd(), `./whatsapp_sessions/${userId}`);

    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // 1. Attempt restoring credentials from MongoDB if container or disk was recreated
    await restoreAuthFromMongo(userId, sessionDir);

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

      // Persistent saveCreds: saves to disk and immediately syncs to MongoDB
      const persistentSaveCreds = async () => {
        try {
          await saveCreds();
          await syncAuthToMongo(userId, sessionDir);
        } catch (err) {
          console.error(`[WA Gateway] Error during persistentSaveCreds for user ${userId}:`, err);
        }
      };

      sock.ev.on('creds.update', persistentSaveCreds);

      // Listen to incoming messages for auto-updating Murajaah status on keyword 'sudah'
      sock.ev.on('messages.upsert', async (m) => {
        if (m.type === 'notify') {
          for (const msg of m.messages) {
            if (!msg.key.fromMe && msg.message) {
              const mObj = msg.message;
              const text = (
                mObj.conversation ||
                mObj.extendedTextMessage?.text ||
                mObj.imageMessage?.caption ||
                mObj.videoMessage?.caption ||
                mObj.ephemeralMessage?.message?.conversation ||
                mObj.ephemeralMessage?.message?.extendedTextMessage?.text ||
                mObj.viewOnceMessage?.message?.conversation ||
                mObj.viewOnceMessage?.message?.extendedTextMessage?.text ||
                mObj.viewOnceMessageV2?.message?.conversation ||
                mObj.viewOnceMessageV2?.message?.extendedTextMessage?.text ||
                mObj.buttonsResponseMessage?.selectedButtonId ||
                mObj.listResponseMessage?.singleSelectReply?.selectedRowId ||
                ''
              ).trim().toLowerCase();

              const senderJid = msg.key.remoteJid || '';
              const participantJid = (msg.key as any).participant || '';
              const altJid = (msg.key as any).remoteJidAlt || '';

              // Gather candidate numbers from incoming message
              const candidateJids = [senderJid, participantJid, altJid].filter(Boolean);
              const candidateNumbers: string[] = [];

              for (const jid of candidateJids) {
                const raw = jid.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
                if (raw) candidateNumbers.push(raw);
              }

              console.log(`[WA Gateway] Incoming reply from sender [${candidateNumbers.join(', ')}]: "${text}" (Session User: ${userId})`);

              if (text.includes('sudah') || text.includes('sdh')) {
                console.log(`[WA Gateway] Keyword 'sudah' detected in reply from [${candidateNumbers.join(', ')}] for user ${userId}. Auto-updating Murajaah status...`);
                try {
                  const { decrypt } = require('../../utils/encryption');
                  const normalizePhone = (p: string) => {
                    let cleaned = (p || '').replace(/[^0-9]/g, '');
                    if (cleaned.startsWith('62')) cleaned = cleaned.slice(2);
                    if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
                    return cleaned;
                  };

                  const cleanCandidateSenders = candidateNumbers.map(normalizePhone).filter(Boolean);

                  // Fetch current user organization context & role
                  const currentUser = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true, organizationId: true, role: true }
                  });

                  // Absolute binding: strictly limit to user's own assigned santri / classes
                  let santriScopeWhere: any = {};
                  if (currentUser?.role === 'SUPERADMIN') {
                    santriScopeWhere = {};
                  } else if (currentUser?.role === 'ADMIN' && currentUser.organizationId) {
                    santriScopeWhere = {
                      user: { organizationId: currentUser.organizationId }
                    };
                  } else {
                    // Role USER (Ustadz) - Absolute binding: ONLY santri assigned directly to this ustadz or this ustadz's classes
                    santriScopeWhere = {
                      OR: [
                        { userId },
                        { kelas: { userId } }
                      ]
                    };
                  }

                  const allSantri = await prisma.santri.findMany({
                    where: {
                      deletedAt: null,
                      ...santriScopeWhere
                    }
                  });

                  const matchedSantris = [];
                  for (const s of allSantri) {
                    try {
                      const decryptedPhone = decrypt(s.parentPhone);
                      const cleanParent = normalizePhone(decryptedPhone);

                      for (const cleanSender of cleanCandidateSenders) {
                        if (cleanSender && cleanParent && (cleanSender === cleanParent || cleanSender.endsWith(cleanParent) || cleanParent.endsWith(cleanSender))) {
                          matchedSantris.push(s);
                          break;
                        }
                      }
                    } catch (e) {
                      // ignore decryption errors
                    }
                  }

                  if (matchedSantris.length > 0) {
                    const matchedIds = matchedSantris.map((s) => s.id);
                    console.log(`[WA Gateway] Matched santri: [${matchedSantris.map(s => s.name).join(', ')}] (IDs: ${matchedIds.join(', ')})`);
                    
                    const updateResult = await prisma.murajaahSchedule.updateMany({
                      where: { 
                        santriId: { in: matchedIds },
                      },
                      data: { 
                        isSelected: true, 
                        lastReviewDate: new Date(),
                        updatedAt: new Date(),
                      },
                    });

                    console.log(`[WA Gateway] Automatically marked Murajaah status for santri [${matchedSantris.map(s => s.name).join(', ')}] as DONE (🟢 Sudah Dimurajaah)! Updated records: ${updateResult.count}`);
                  } else {
                    console.warn(`[WA Gateway] No matching santri found for sender candidate numbers [${cleanCandidateSenders.join(', ')}] under user ${userId}. Total checked santri: ${allSantri.length}`);
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

          // Persist all generated auth credentials to MongoDB
          await syncAuthToMongo(userId, sessionDir);

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
            await WhatsAppAuthKey.deleteMany({ userId });
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

            if (currentAttempts <= 5) {
              console.log(`[WA] Connection closed. Retrying connection for user ${userId} (Attempt ${currentAttempts}/5)...`);
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
      const distinctKeyUsers = await WhatsAppAuthKey.distinct('userId');
      const connectedSessions = await WhatsAppSession.find({ status: 'CONNECTED' });
      const allTargetUserIds = Array.from(new Set([...connectedSessions.map(s => s.userId), ...distinctKeyUsers]));

      for (const uid of allTargetUserIds) {
        console.log(`[WA Gateway] Auto-restoring persistent WhatsApp session for user ${uid}...`);
        this.initSession(uid).catch(err => console.error(`[WA Gateway] Persistent restore error for user ${uid}:`, err));
      }
    } catch (err) {
      console.error('[WA Gateway] Error auto-restoring persistent sessions:', err);
    }
  }

  async getStatus(userId: string) {
    const session = await WhatsAppSession.findOne({ userId });
    const currentQR = activeQRCodes.get(userId);

    // If session was marked CONNECTED in DB but in-memory socket was dropped (e.g. backend restarted), auto-restore socket in background
    if (session?.status === 'CONNECTED' && !activeSockets.has(userId)) {
      console.log(`[WA Gateway] Restoring socket for user ${userId} on getStatus...`);
      this.initSession(userId).catch((err) => console.error('[WA Gateway] Restore error on getStatus:', err));
    }

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

    await WhatsAppAuthKey.deleteMany({ userId });

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

    // Auto-restore active session from disk or MongoDB if socket instance was lost on container restart
    if (!sock) {
      const sessionDir = path.resolve(process.cwd(), `./whatsapp_sessions/${userId}`);
      const hasDiskAuth = fs.existsSync(path.join(sessionDir, 'creds.json'));
      const hasMongoAuth = await WhatsAppAuthKey.exists({ userId });

      if (hasDiskAuth || hasMongoAuth) {
        try {
          console.log(`[WA] Restoring active WhatsApp socket from persistent storage for user ${userId}...`);
          await this.initSession(userId);
          sock = activeSockets.get(userId);
        } catch (e) {
          console.error('[WA] Failed restoring session from persistent storage:', e);
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
