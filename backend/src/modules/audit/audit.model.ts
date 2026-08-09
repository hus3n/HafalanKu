import { Schema, model } from 'mongoose';

const auditTrailSchema = new Schema({
  userId:     { type: String, required: true, index: true },
  userName:   { type: String, required: true },
  action:     { type: String, enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'BACKUP', 'RESTORE'], required: true },
  entity:     { type: String, required: true }, 
  entityId:   { type: String },
  oldData:    { type: Schema.Types.Mixed },
  newData:    { type: Schema.Types.Mixed },
  ipAddress:  { type: String },
  userAgent:  { type: String },
  createdAt:  { type: Date, default: Date.now },
});

auditTrailSchema.index({ userId: 1, createdAt: -1 });
auditTrailSchema.index({ entity: 1, entityId: 1 });

export const AuditTrail = model('AuditTrail', auditTrailSchema);
