export interface ReviewItem {
  id: string;
  name: string;
  roleOrTitle?: string | null;
  rating: number;
  comment: string;
  imageUrl?: string | null;
  userAvatarUrl?: string | null;
  createdAt: string;
}

export interface CreateReviewInput {
  name: string;
  roleOrTitle?: string;
  rating: number;
  comment: string;
  imageUrl?: string;
  userAvatarUrl?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}
