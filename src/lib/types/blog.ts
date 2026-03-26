/**
 * Blog Article Types
 *
 * Derived from Prisma schema to stay in sync with the database.
 * Uses Prisma.XGetPayload<> to match the exact select/include used in each query.
 */

import type { Prisma } from '@prisma/client';

// =============================================================================
// PUBLIC PAGE TYPES
// =============================================================================

/** Article card data for archive/listing pages (matches ARTICLE_CARD_SELECT) */
export type BlogArticleCard = Prisma.BlogArticleGetPayload<{
  select: {
    id: true;
    slug: true;
    title: true;
    excerpt: true;
    coverImage: true;
    categorySlug: true;
    featured: true;
    publishedAt: true;
    createdAt: true;
    authors: {
      select: {
        order: true;
        profile: {
          select: {
            id: true;
            username: true;
            displayName: true;
            image: true;
          };
        };
      };
    };
  };
}>;

/** Full article data for detail page (matches getArticle include) */
export type BlogArticleDetail = Prisma.BlogArticleGetPayload<{
  include: {
    authors: {
      select: {
        order: true;
        profile: {
          select: {
            id: true;
            username: true;
            displayName: true;
            image: true;
            authorBio: true;
          };
        };
      };
    };
  };
}>;

/** Author shape from detail page (with bio) - for AuthorBox component */
export type BlogArticleDetailAuthor = BlogArticleDetail['authors'][number];

// =============================================================================
// ADMIN TYPES
// =============================================================================

/** Article data for admin editing (matches getArticleAdmin include) */
export type BlogArticleAdmin = Prisma.BlogArticleGetPayload<{
  include: {
    authors: {
      select: {
        profileId: true;
        order: true;
        profile: {
          select: {
            id: true;
            displayName: true;
            image: true;
            username: true;
          };
        };
      };
    };
  };
}>;

// =============================================================================
// PAGINATED RESPONSE
// =============================================================================

export interface BlogArticlesResponse {
  articles: BlogArticleCard[];
  total: number;
  totalPages: number;
  hasMore: boolean;
}
