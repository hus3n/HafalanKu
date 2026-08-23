import nodemailer from 'nodemailer';
import { env } from '../../config/env';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      try {
        this.transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_SECURE, // true for 465, false for other ports
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: env.NODE_ENV === 'production',
          },
        });
        console.log(`✅ [EmailService] SMTP Transporter connected to ${env.SMTP_HOST}:${env.SMTP_PORT}`);
      } catch (err) {
        console.error('❌ [EmailService] Failed to initialize SMTP transporter:', err);
        this.transporter = null;
      }
    } else {
      console.warn('⚠️ [EmailService] SMTP not configured. OTP will be printed to server logs.');
    }
  }

  /**
   * Mengirimkan kode OTP verifikasi pendaftaran akun baru
   */
  async sendOtpVerification(toEmail: string, name: string, otp: string): Promise<boolean> {
    const fromName = env.SMTP_FROM_NAME || 'HafalanKu';
    const fromEmail = env.SMTP_FROM_EMAIL || env.SMTP_USER || 'noreply@hafalanku.forapp.id';

    const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode Verifikasi Email - HafalanKu</title>
</head>
<body style="margin: 0; padding: 0; background-color: #071a1f; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #071a1f; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" max-width="560" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #0C313A; border: 1px solid rgba(14, 137, 145, 0.35); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 36px 40px 20px 40px; text-align: center; border-bottom: 1px solid rgba(14, 137, 145, 0.2);">
              <div style="font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                Hafalan<span style="color: #1bb2bd;">Ku</span>
              </div>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #8DB6BC; letter-spacing: 0.5px; text-transform: uppercase;">
                Sistem Manajemen Tahfidz Cerdas & Modern
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 40px 28px 40px; text-align: left;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #ffffff;">
                Assalamu’alaikum, ${name}!
              </h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                Terima kasih telah mendaftar di <strong>HafalanKu</strong>. Gunakan kode verifikasi (OTP) berikut untuk memverifikasi alamat email Anda dan mengaktifkan akun:
              </p>

              <!-- OTP Code Display Card -->
              <div style="text-align: center; margin: 30px 0; padding: 24px; background: rgba(14, 137, 145, 0.15); border: 2px dashed #0E8991; border-radius: 16px;">
                <div style="font-size: 12px; font-weight: 700; color: #1bb2bd; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                  Kode Verifikasi OTP Anda
                </div>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #ffffff; text-shadow: 0 0 12px rgba(27, 178, 189, 0.6);">
                  ${otp}
                </div>
                <div style="font-size: 12px; color: #EAA27C; margin-top: 10px; font-weight: 600;">
                  ⏱️ Berlaku selama 15 menit
                </div>
              </div>

              <p style="margin: 0 0 16px 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                ⚠️ <em>Penting: Jangan berikan kode OTP ini kepada siapa pun, termasuk pihak yang mengatasnamakan pengurus HafalanKu.</em>
              </p>

              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                Jika Anda tidak merasa melakukan pendaftaran di platform kami, silakan abaikan email ini.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: rgba(7, 26, 31, 0.6); text-align: center; border-top: 1px solid rgba(14, 137, 145, 0.2);">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                &copy; ${new Date().getFullYear()} HafalanKu. Seluruh hak cipta dilindungi.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Always log OTP to server console for easy testing/debugging
    console.log(`📧 [EmailService] OTP for ${toEmail}: [${otp}]`);

    if (!this.transporter) {
      console.warn(`[EmailService] Transporter not ready. Simulated email sent to ${toEmail} with OTP: ${otp}`);
      return true;
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        subject: `[${otp}] Kode Verifikasi Email HafalanKu`,
        html: htmlContent,
      });

      console.log(`✅ [EmailService] Email verification sent successfully to ${toEmail}. MessageId: ${info.messageId}`);
      return true;
    } catch (error: any) {
      console.error(`❌ [EmailService] Failed to send email to ${toEmail}:`, error?.message || error);
      // Return true in development so registration flow is not completely blocked if SMTP credentials are temporarily invalid
      return false;
    }
  }
}

export const emailService = new EmailService();
