import TelegramBot from 'node-telegram-bot-api';

let bot: TelegramBot | null = null;
let lastToken: string | null = null;

const DEFAULT_DUMMY_TOKEN = '123456789:ABCdefGHIjklMNOpqrsTUVwxyz';

/**
 * Mendapatkan instance singleton TelegramBot secara dinamis.
 * Jika token berubah pada runtime (melalui settings), instance akan di-recreate otomatis.
 */
export function getTelegramBot(): TelegramBot | null {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();

  if (!token || token === DEFAULT_DUMMY_TOKEN) {
    bot = null;
    lastToken = null;
    return null;
  }

  // Jika token berbeda dari token sebelumnya atau bot belum dibuat
  if (!bot || lastToken !== token) {
    try {
      bot = new TelegramBot(token, { polling: false });
      lastToken = token;
      console.log('[Telegram] Bot instance initialized successfully with updated token');
    } catch (err) {
      console.error('[Telegram] Failed to initialize bot instance:', err);
      bot = null;
      lastToken = null;
      return null;
    }
  }

  return bot;
}

/**
 * Reset dan reload instance bot Telegram
 */
export function reloadTelegramBot(): TelegramBot | null {
  bot = null;
  lastToken = null;
  return getTelegramBot();
}

/**
 * Mendapatkan Telegram Chat ID yang sedang aktif di process.env
 */
export function getTelegramChatId(): string {
  const chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();
  if (chatId === '-1001234567890') return '';
  return chatId;
}

/**
 * Menguji koneksi token Telegram ke API BotFather (getMe)
 */
export async function testTelegramConnection(customToken?: string): Promise<{
  success: boolean;
  botInfo?: {
    id: number;
    username?: string;
    firstName?: string;
    canJoinGroups?: boolean;
  };
  error?: string;
}> {
  const token = (customToken || process.env.TELEGRAM_BOT_TOKEN || '').trim();

  if (!token || token === DEFAULT_DUMMY_TOKEN) {
    return {
      success: false,
      error: 'Token bot belum diisi atau masih berupa nilai bawaan.',
    };
  }

  try {
    const testBot = new TelegramBot(token, { polling: false });
    const me = await testBot.getMe();
    return {
      success: true,
      botInfo: {
        id: me.id,
        username: me.username,
        firstName: me.first_name,
        canJoinGroups: me.can_join_groups,
      },
    };
  } catch (err: any) {
    console.error('[Telegram Test] Connection test error:', err);
    let message = err?.message || 'Gagal terhubung ke Telegram API';
    if (message.includes('401') || message.includes('Unauthorized')) {
      message = 'Token bot tidak valid (401 Unauthorized). Silakan periksa kembali token dari @BotFather.';
    } else if (message.includes('EFATAL') || message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT')) {
      message = 'Koneksi ke server Telegram timeout atau jaringan terblokir.';
    }
    return { success: false, error: message };
  }
}

/**
 * Mengirim pesan tes ke Chat ID yang ditentukan
 */
export async function sendTelegramTestMessage(customChatId?: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const botInstance = getTelegramBot();
  const chatId = (customChatId || getTelegramChatId()).trim();

  if (!botInstance) {
    return {
      success: false,
      error: 'Bot Telegram belum dikonfigurasi dengan token yang valid. Simpan token terlebih dahulu.',
    };
  }

  if (!chatId) {
    return {
      success: false,
      error: 'Telegram Chat ID belum diisi. Silakan isi Chat ID tujuan.',
    };
  }

  try {
    const timeStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const testText =
      `🤖 *Tes Notifikasi Bot Telegram - HafalanKu*\n\n` +
      `✅ *Status Koneksi:* BERHASIL TERHUBUNG\n` +
      `🕒 *Waktu Uji:* ${timeStr} WIB\n` +
      `📦 *Layanan:* Cloud Auto-Backup & Notifikasi Sistem\n` +
      `🆔 *Target Chat ID:* \`${chatId}\`\n\n` +
      `_Pesan ini mengonfirmasi bahwa integrasi bot Telegram HafalanKu telah aktif dan siap mencadangkan data Anda secara aman._`;

    await botInstance.sendMessage(chatId, testText, { parse_mode: 'Markdown' });
    return {
      success: true,
      message: `Pesan pengujian berhasil dikirim ke Chat ID (${chatId})!`,
    };
  } catch (err: any) {
    console.error('[Telegram Test] Send message error:', err);
    let errorMsg = err?.message || 'Gagal mengirim pesan tes ke Telegram';
    if (errorMsg.includes('chat not found') || errorMsg.includes('400')) {
      errorMsg = 'Chat ID tidak ditemukan (400 Bad Request). Pastikan Anda sudah membuka bot dan menekan tombol /start, atau bot sudah dimasukkan ke grup.';
    } else if (errorMsg.includes('bot was blocked') || errorMsg.includes('403')) {
      errorMsg = 'Bot diblokir oleh user (403 Forbidden). Buka blokir bot di Telegram dan klik /start.';
    } else if (errorMsg.includes('bot is not a member') || errorMsg.includes('channel')) {
      errorMsg = 'Bot belum ditambahkan sebagai anggota/admin grup atau channel target.';
    }
    return { success: false, error: errorMsg };
  }
}
