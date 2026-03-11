import React from 'react';
import Image from 'next/image';
import { NextLink } from '@/components';
import { Badge } from '@/components/ui/badge';

interface ProfileArticlesProps {
  articles: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    publishedAt: Date | null;
    category: {
      slug: string;
      label: string;
    };
  }[];
  profileUsername: string | null;
}

export default function ProfileArticles({
  articles,
}: ProfileArticlesProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className='py-5'>
      <h4 className='font-semibold text-lg text-foreground mb-5'>
        Άρθρα ({articles.length})
      </h4>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {articles.map((article) => (
          <NextLink
            key={article.id}
            href={`/articles/${article.category.slug}/${article.slug}`}
            className='group block border rounded-2xl overflow-hidden hover:shadow-md transition-shadow'
          >
            {article.coverImage && (
              <div className='relative aspect-[16/9] w-full'>
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, 50vw'
                />
              </div>
            )}
            <div className='p-4 space-y-2'>
              <div className='flex items-center gap-2'>
                <Badge variant='secondary'>{article.category.label}</Badge>
                {article.publishedAt && (
                  <span className='text-xs text-muted-foreground'>
                    {new Date(article.publishedAt).toLocaleDateString('el-GR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
              <h5 className='font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2'>
                {article.title}
              </h5>
              {article.excerpt && (
                <p className='text-sm text-muted-foreground line-clamp-2'>
                  {article.excerpt}
                </p>
              )}
            </div>
          </NextLink>
        ))}
      </div>
    </section>
  );
}
