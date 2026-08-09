import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationLog extends Document {
  userId: string;
  santriId?: string | null;
  recipientPhone: string;
  recipientName: string;
  type: 'HAFALAN_NEW' | 'MURAJAAH_SCHEDULE' | 'SYSTEM_ALERT' | 'REGISTRATION';
  message: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  errorMessage?: string | null;
  retryCount: number;
  createdAt: Date;
}

const NotificationLogSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    santriId: { type: String, default: null, index: true },
    recipientPhone: { type: String, required: true },
    recipientName: { type: String, required: true },
    type: {
      type: String,
      enum: ['HAFALAN_NEW', 'MURAJAAH_SCHEDULE', 'SYSTEM_ALERT', 'REGISTRATION'],
      required: true,
    },
    message: { type: String, required: true },
    status: { type: String, enum: ['SENT', 'FAILED', 'PENDING'], default: 'PENDING' },
    errorMessage: { type: String, default: null },
    retryCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, expires: 90 * 24 * 60 * 60 }, // 90 days TTL
  },
  {
    timestamps: false,
  }
);

export const NotificationLog = mongoose.model<INotificationLog>('NotificationLog', NotificationLogSchema);
