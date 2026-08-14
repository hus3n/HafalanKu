import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppSession extends Document {
  userId: string;
  sessionData?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'PAIRING';
  phoneNumber?: string;
  lastConnectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppSessionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    sessionData: { type: String, required: false },
    status: { type: String, enum: ['CONNECTED', 'DISCONNECTED', 'PAIRING'], default: 'DISCONNECTED' },
    phoneNumber: { type: String, default: null },
    lastConnectedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export const WhatsAppSession = mongoose.model<IWhatsAppSession>('WhatsAppSession', WhatsAppSessionSchema);

export interface IWhatsAppAuthKey extends Document {
  userId: string;
  keyId: string;
  data: string;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppAuthKeySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    keyId: { type: String, required: true },
    data: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

WhatsAppAuthKeySchema.index({ userId: 1, keyId: 1 }, { unique: true });

export const WhatsAppAuthKey = mongoose.model<IWhatsAppAuthKey>('WhatsAppAuthKey', WhatsAppAuthKeySchema);
