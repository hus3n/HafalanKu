import mongoose, { Schema, Document } from 'mongoose';

export type WhatsAppQueueJobStatus = 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED' | 'CANCELLED';

export interface IWhatsAppQueueJob extends Document {
  batchId: string;
  userId: string;
  santriId: string;
  santriName: string;
  parentName: string;
  parentPhone: string;
  kelasName?: string;
  message: string;
  status: WhatsAppQueueJobStatus;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string | null;
  scheduledAt: Date;
  processedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppQueueJobSchema: Schema = new Schema(
  {
    batchId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    santriId: { type: String, required: true, index: true },
    santriName: { type: String, required: true },
    parentName: { type: String, required: true },
    parentPhone: { type: String, required: true },
    kelasName: { type: String, default: '' },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    errorMessage: { type: String, default: null },
    scheduledAt: { type: Date, default: Date.now, index: true },
    processedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

WhatsAppQueueJobSchema.index({ userId: 1, status: 1, scheduledAt: 1 });
WhatsAppQueueJobSchema.index({ batchId: 1, status: 1 });

export const WhatsAppQueueJob = mongoose.model<IWhatsAppQueueJob>('WhatsAppQueueJob', WhatsAppQueueJobSchema);

export interface IWhatsAppBatchSummary extends Document {
  batchId: string;
  userId: string;
  type: 'MURAJAAH_BATCH' | 'CUSTOM_BATCH';
  total: number;
  sent: number;
  failed: number;
  pending: number;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  delayStrategy: string;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppBatchSummarySchema: Schema = new Schema(
  {
    batchId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, default: 'MURAJAAH_BATCH' },
    total: { type: Number, required: true },
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['QUEUED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'QUEUED',
      index: true,
    },
    delayStrategy: { type: String, default: 'random' },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export const WhatsAppBatchSummary = mongoose.model<IWhatsAppBatchSummary>(
  'WhatsAppBatchSummary',
  WhatsAppBatchSummarySchema
);
