export interface MurajaahSchedule {
  id: string;
  santriId: string;
  surahNumber: number;
  surahName: string;
  isSelected: boolean;
  lastReviewDate?: Date | null;
  priorityScore: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
