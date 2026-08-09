import mongoose, { Schema, Document } from 'mongoose';

export interface IBackupLog extends Document {
  userId: string;
  filename: string;
  checksum: string;
  sizeBytes: number;
  status: 'SUCCESS' | 'FAILED' | 'RESTORED';
  telegramSent: boolean;
  notes?: string | null;
  createdAt: Date;
}

const BackupLogSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    checksum: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILED', 'RESTORED'], default: 'SUCCESS' },
    telegramSent: { type: Boolean, default: false },
    notes: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

export const BackupLog = mongoose.model<IBackupLog>('BackupLog', BackupLogSchema);
