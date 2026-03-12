'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Globe,
  FileText,
  Clock,
  Star,
  ExternalLink,
  Edit,
} from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { AdminDataTable, ColumnDef } from './admin-data-table';
import { NextLink } from '@/components';
import { getBlogCategoryBySlug } from '@/constants/datasets/blog-categories';

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  categorySlug: string | null;
  status: string;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
  authors: {
    profile: {
      id: string;
      displayName: string | null;
      image: string | null;
    };
  }[];
}

function ArticleStatusBadges({
  status,
  featured,
}: {
  status: string;
  featured: boolean;
}) {
  return (
    <div className='flex items-center gap-2'>
      {status === 'published' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Globe className='h-5 w-5 text-green-600 cursor-pointer' />
          </TooltipTrigger>
          <TooltipContent>
            <p>Δημοσιευμένο</p>
          </TooltipContent>
        </Tooltip>
      )}
      {status === 'draft' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <FileText className='h-5 w-5 text-gray-500 cursor-pointer' />
          </TooltipTrigger>
          <TooltipContent>
            <p>Πρόχειρο</p>
          </TooltipContent>
        </Tooltip>
      )}
      {status === 'pending' && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Clock className='h-5 w-5 text-yellow-600 cursor-pointer' />
          </TooltipTrigger>
          <TooltipContent>
            <p>Σε αναμονή</p>
          </TooltipContent>
        </Tooltip>
      )}
      {featured && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Star className='h-5 w-5 text-yellow-500 fill-yellow-500 cursor-pointer' />
          </TooltipTrigger>
          <TooltipContent>
            <p>Featured</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

interface AdminArticlesDataTableProps {
  data: ArticleRow[];
  loading?: boolean;
  basePath?: string;
}

export function AdminArticlesDataTable({
  data,
  loading = false,
  basePath = '/admin/articles',
}: AdminArticlesDataTableProps) {
  const columns: ColumnDef<ArticleRow>[] = [
    {
      key: 'title',
      header: 'Τίτλος',
      className: 'max-w-[400px]',
      render: (article) => (
        <div className='flex-1 min-w-0'>
          <NextLink
            href={`${basePath}/${article.id}`}
            className='min-w-0'
          >
            <h3 className='text-sm font-medium text-gray-900 truncate hover:text-primary hover:underline cursor-pointer transition-colors'>
              {article.title}
            </h3>
          </NextLink>
          {article.authors?.length > 0 && (
            <p className='text-xs text-muted-foreground'>
              {article.authors
                .map((a) => a.profile?.displayName)
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'categorySlug',
      header: 'Κατηγορία',
      render: (article) => {
        const category = article.categorySlug
          ? getBlogCategoryBySlug(article.categorySlug)
          : null;
        return category ? (
          <Badge variant='outline' className='text-xs w-fit'>
            {category.label}
          </Badge>
        ) : (
          <span className='text-muted-foreground'>-</span>
        );
      },
    },
    {
      key: 'status',
      header: 'Κατάσταση',
      render: (article) => (
        <ArticleStatusBadges
          status={article.status}
          featured={article.featured}
        />
      ),
    },
    {
      key: 'createdAt',
      header: 'Ημ/νία Δημιουργίας',
      sortable: true,
      render: (article) => (
        <div className='text-sm text-muted-foreground'>
          {formatDate(new Date(article.createdAt))}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (article) => (
        <div className='flex items-center justify-end gap-1'>
          {article.status === 'published' && article.slug && article.categorySlug && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
                  <NextLink
                    href={`/articles/${article.categorySlug}/${article.slug}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <ExternalLink className='w-4 h-4' />
                  </NextLink>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Προβολή Άρθρου</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='ghost' size='icon' className='h-8 w-8' asChild>
                <NextLink href={`${basePath}/${article.id}`}>
                  <Edit className='w-4 h-4' />
                </NextLink>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Επεξεργασία Άρθρου</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      data={data}
      columns={columns}
      loading={loading}
      basePath={basePath}
      emptyMessage='Δεν βρέθηκαν άρθρα.'
      skeletonRows={5}
    />
  );
}
