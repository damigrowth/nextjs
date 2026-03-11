'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { submitArticleSchema } from '@/lib/validations/blog';
import type { SubmitArticleInput } from '@/lib/validations/blog';
import {
  submitArticle,
  updateMyArticle,
  deleteMyArticle,
} from '@/actions/blog/submit-article';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Trash2 } from 'lucide-react';

interface SubmitArticleFormProps {
  article?: any;
  categories: any[];
}

export function SubmitArticleForm({
  article,
  categories,
}: SubmitArticleFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!article;

  const form = useForm<SubmitArticleInput>({
    resolver: zodResolver(submitArticleSchema),
    defaultValues: {
      title: article?.title || '',
      excerpt: article?.excerpt || '',
      content: article?.content || '',
      coverImage: article?.coverImage || '',
      categoryId: article?.categoryId || '',
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
  const categoryId = watch('categoryId');

  function onSubmit(data: SubmitArticleInput) {
    setError(null);
    startTransition(async () => {
      try {
        let result;
        if (isEditing) {
          result = await updateMyArticle({ id: article.id, ...data });
        } else {
          result = await submitArticle(data);
        }

        if (result.success) {
          router.push('/dashboard/articles');
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
      const result = await deleteMyArticle(article.id);
      if (result.success) {
        router.push('/dashboard/articles');
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
          onChange={(html) =>
            setValue('content', html, { shouldValidate: true })
          }
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

      {/* Actions */}
      <div className='flex items-center gap-3 pt-4 border-t'>
        <Button type='submit' disabled={isPending}>
          {isPending && <Loader2 className='h-4 w-4 animate-spin mr-2' />}
          {isEditing ? 'Αποθήκευση' : 'Υποβολή'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.push('/dashboard/articles')}
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
