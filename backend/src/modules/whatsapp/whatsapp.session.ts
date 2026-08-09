import { Schema, model } from 'mongoose';

const waSessionSchema = new Schema({
  userId:      { type: String, required: true, unique: true, index: true },
  sessionData: { type: Buffer, required: true },  // Encrypted AES-256-GCM buffer
  isConnected: { type: Boolean, default: false },
  lastActive:  { type: Date, default: Date.now },
  phoneNumber: { type: String },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
});

export const WaSession = model('WaSession', waSessionSchema);
