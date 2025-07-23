/**
 * REVIEW TYPE DEFINITIONS
 * Review and rating system types
 */

import type { User } from './user';
import type { Profile } from './profile';
import type { Service } from './service';

// Main review interface
export interface Review {
  id: string;
  rating: number;
  comment?: string;
  
  // Relations
  authorId: string;
  profileId?: string; // Profile being reviewed
  serviceId?: string; // Service being reviewed
  orderId?: string;   // Order that generated the review
  
  // Review type
  type: ReviewType;
  
  // Status and moderation
  published: boolean;
  flagged: boolean;
  approved: boolean;
  moderationStatus: ModerationStatus;
  moderationNotes?: string;
  
  // Engagement metrics
  helpfulCount: number;
  unhelpfulCount: number;
  replyCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  moderatedAt?: Date;
  
  // Relations
  author?: User;
  profile?: Profile;
  service?: Service;
  reactions?: ReviewReaction[];
  replies?: ReviewReply[];
  reports?: ReviewReport[];
}

// Review types
export type ReviewType = 'profile' | 'service' | 'order';

// Moderation status
export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged' | 'auto_approved';

// Review reactions
export interface ReviewReaction {
  id: string;
  reviewId: string;
  userId: string;
  type: ReactionType;
  createdAt: Date;
  review?: Review;
  user?: User;
}

export type ReactionType = 'helpful' | 'unhelpful' | 'like' | 'dislike';

// Review replies
export interface ReviewReply {
  id: string;
  reviewId: string;
  authorId: string;
  content: string;
  published: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  review?: Review;
  author?: User;
}

// Review reports
export interface ReviewReport {
  id: string;
  reviewId: string;
  reporterId: string;
  reason: ReviewReportReason;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
  reviewedAt?: Date;
  review?: Review;
  reporter?: User;
}

export type ReviewReportReason = 
  | 'spam'
  | 'inappropriate_content'
  | 'fake_review'
  | 'off_topic'
  | 'harassment'
  | 'copyright_violation'
  | 'other';

// Review statistics
export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentReviews: Review[];
  trends: {
    period: 'week' | 'month' | 'year';
    data: {
      date: Date;
      count: number;
      averageRating: number;
    }[];
  };
}

// Review search and filtering
export interface ReviewFilters {
  type?: ReviewType;
  rating?: number | number[];
  minRating?: number;
  maxRating?: number;
  published?: boolean;
  flagged?: boolean;
  approved?: boolean;
  moderationStatus?: ModerationStatus;
  hasComment?: boolean;
  authorId?: string;
  profileId?: string;
  serviceId?: string;
  orderId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface ReviewSort {
  field: 'createdAt' | 'updatedAt' | 'rating' | 'helpfulCount' | 'unhelpfulCount';
  order: 'asc' | 'desc';
}

export interface ReviewSearchParams {
  query?: string;
  filters?: ReviewFilters;
  sort?: ReviewSort;
  page?: number;
  limit?: number;
}

export interface ReviewSearchResult {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  stats?: ReviewStats;
}

// Review creation types
export interface CreateReviewData {
  rating: number;
  comment?: string;
  type: ReviewType;
  profileId?: string;
  serviceId?: string;
  orderId?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
  published?: boolean;
}

// Review moderation types
export interface ReviewModerationAction {
  reviewId: string;
  action: 'approve' | 'reject' | 'flag' | 'unflag';
  reason?: string;
  notes?: string;
  moderatorId: string;
}

export interface BulkReviewModerationAction {
  reviewIds: string[];
  action: 'approve' | 'reject' | 'flag' | 'unflag' | 'delete';
  reason?: string;
  notes?: string;
  moderatorId: string;
}

// Review analytics
export interface ReviewAnalytics {
  profileId?: string;
  serviceId?: string;
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    totalReviews: number;
    averageRating: number;
    ratingChange: number;
    engagementRate: number;
    responseRate: number;
  };
  trends: {
    date: Date;
    count: number;
    averageRating: number;
    engagementRate: number;
  }[];
  topKeywords: {
    word: string;
    count: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
}

// Review notification types
export interface ReviewNotification {
  id: string;
  userId: string;
  reviewId: string;
  type: 'new_review' | 'review_reply' | 'review_reaction' | 'review_flagged' | 'review_approved';
  read: boolean;
  data?: Record<string, any>;
  createdAt: Date;
  user?: User;
  review?: Review;
}

// Review export types
export interface ReviewExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  filters?: ReviewFilters;
  fields?: string[];
  includeReplies?: boolean;
  includeReactions?: boolean;
}

export interface ReviewExportData {
  reviews: Review[];
  metadata: {
    exportedAt: Date;
    totalCount: number;
    filters: ReviewFilters;
  };
}

// Review sentiment analysis
export interface ReviewSentiment {
  reviewId: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keywords: {
    word: string;
    weight: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
  aspects: {
    aspect: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    mentions: number;
  }[];
  processedAt: Date;
}

// Review quality score
export interface ReviewQuality {
  reviewId: string;
  qualityScore: number; // 0-100
  factors: {
    length: number;
    detail: number;
    helpfulness: number;
    authenticity: number;
  };
  calculatedAt: Date;
}