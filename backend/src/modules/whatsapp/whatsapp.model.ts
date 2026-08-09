import mongoose, { Schema, Document } from 'mongoose';

export interface IWhatsAppSession extends Document {
  userId: string;
  sessionData?: string; // Encrypted JSON string of session credentials (opsional karena session tersimpan di disk)
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
