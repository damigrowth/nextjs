'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createArticleSchema,
  updateArticleSchema,
} from '@/lib/validations/blog';
import {
  createArticle,
  updateArticle,
  deleteArticle,
} from '@/actions/blog/manage-articles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Trash2 } from 'lucide-react';

type CreateInput = z.input<typeof createArticleSchema>;

interface ArticleFormProps {
  article?: any;
  categories: any[];
}

export function ArticleForm({ article, categories }: ArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!article;

  const form = useForm<CreateInput>({
    resolver: zodResolver(createArticleSchema),
    defaultValues: {
      title: article?.title || '',
      excerpt: article?.excerpt || '',
      content: article?.content || '',
      coverImage: article?.coverImage || '',
      categoryId: article?.categoryId || '',
      authorProfileIds: article?.authors?.map((a: any) => a.profileId) || [],
      status: article?.status || 'draft',
      featured: article?.featured || false,
      tags: article?.tags || [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const content = watch('content');
  const status = watch('status');
  const featured = watch('featured');
  const categoryId = watch('categoryId');

  function onSubmit(data: CreateInput) {
    setError(null);
    startTransition(async () => {
      try {
        let result;
        if (isEditing) {
          result = await updateArticle({ id: article.id, ...data });
        } else {
          result = await createArticle({
            ...data,
            status: data.status ?? 'draft',
            featured: data.featured ?? false,
          });
        }

        if (result.success) {
          router.push('/admin/articles');
          router.refresh();
        } else {
          setError(result.error || 'Σφάλμα αποθήκευσης');
        }
      } catch (e) {
        setError('Unexpected error');
      }
    });
  }

  function handleDelete() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteArticle(article.id);
      if (result.success) {
        router.push('/admin/articles');
        router.refresh();
      } else {
        setError(result.error || 'Σφάλμα διαγραφής');
        setDeleteConfirm(false);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {error && (
        <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
          {error}
        </div>
      )}

      {/* Title */}
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Τίτλος *</label>
        <Input {...register('title')} placeholder='Τίτλος άρθρου' />
        {errors.title && (
          <p className='text-sm text-destructive'>{errors.title.message}</p>
        )}
      </div>

      {/* Excerpt */}
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Περίληψη</label>
        <Textarea
          {...register('excerpt')}
          placeholder='Σύντομη περιγραφή του άρθρου'
          rows={3}
        />
        {errors.excerpt && (
          <p className='text-sm text-destructive'>{errors.excerpt.message}</p>
        )}
      </div>

      {/* Content (Rich Text) */}
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Περιεχόμενο *</label>
        <RichTextEditor
          value={content}
          onChange={(html) => setValue('content', html, { shouldValidate: true })}
          placeholder='Γράψτε το περιεχόμενο του άρθρου...'
          minHeight='300px'
        />
        {errors.content && (
          <p className='text-sm text-destructive'>{errors.content.message}</p>
        )}
      </div>

      {/* Cover Image URL */}
      <div className='space-y-2'>
        <label className='text-sm font-medium'>URL Εικόνας Εξωφύλλου</label>
        <Input
          {...register('coverImage')}
          placeholder='https://...'
          type='url'
        />
        {errors.coverImage && (
          <p className='text-sm text-destructive'>
            {errors.coverImage.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div className='space-y-2'>
        <label className='text-sm font-medium'>Κατηγορία *</label>
        <Select
          value={categoryId}
          onValueChange={(val) =>
            setValue('categoryId', val, { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder='Επιλέξτε κατηγορία' />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat: any) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className='text-sm text-destructive'>
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* Author Profile IDs */}
      <div className='space-y-2'>
        <label className='text-sm font-medium'>
          ID Προφίλ Συγγραφέων * (χωρισμένα με κόμμα)
        </label>
        <Input
          defaultValue={
            article?.authors?.map((a: any) => a.profileId).join(', ') || ''
          }
          placeholder='profile-id-1, profile-id-2'
          onChange={(e) => {
            const ids = e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            setValue('authorProfileIds', ids, { shouldValidate: true });
          }}
        />
        {errors.authorProfileIds && (
          <p className='text-sm text-destructive'>
            {errors.authorProfileIds.message}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className='space-y-2'>
        <label className='text-sm font-medium'>
          Tags (χωρισμένα με κόμμα)
        </label>
        <Input
          defaultValue={article?.tags?.join(', ') || ''}
          placeholder='tag1, tag2, tag3'
          onChange={(e) => {
            const tags = e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
            setValue('tags', tags);
          }}
        />
      </div>

      {/* Status + Featured row */}
      <div className='flex flex-wrap gap-6'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Κατάσταση</label>
          <Select
            value={status}
            onValueChange={(val: 'draft' | 'pending' | 'published') =>
              setValue('status', val)
            }
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='draft'>Πρόχειρο</SelectItem>
              <SelectItem value='pending'>Σε αναμονή</SelectItem>
              <SelectItem value='published'>Δημοσιευμένο</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Featured</label>
          <div className='flex items-center gap-2 pt-1'>
            <Switch
              checked={featured}
              onCheckedChange={(checked) => setValue('featured', checked)}
            />
            <span className='text-sm text-muted-foreground'>
              {featured ? 'Ναι' : 'Όχι'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className='flex items-center gap-3 pt-4 border-t'>
        <Button type='submit' disabled={isPending}>
          {isPending && <Loader2 className='h-4 w-4 animate-spin mr-2' />}
          {isEditing ? 'Αποθήκευση' : 'Δημιουργία'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.push('/admin/articles')}
        >
          Ακύρωση
        </Button>
        {isEditing && (
          <Button
            type='button'
            variant='destructive'
            onClick={handleDelete}
            disabled={isPending}
            className='ml-auto'
          >
            <Trash2 className='h-4 w-4 mr-2' />
            {deleteConfirm ? 'Επιβεβαίωση Διαγραφής' : 'Διαγραφή'}
          </Button>
        )}
      </div>
    </form>
  );
}
