export type MessageType = 'HAFALAN' | 'MURAJAAH' | 'REGISTRASI';
export type NotificationStatus = 'SENT' | 'FAILED' | 'PENDING';

export interface NotificationLog {
  id?: string;
  userId: string;
  santriId: string;
  santriName: string;
  recipientPhone: string;
  messageType: MessageType;
  messageBody: string;
  status: NotificationStatus;
  errorMessage?: string | null;
  retryCount: number;
  sentAt?: Date | null;
  createdAt: Date;
}
