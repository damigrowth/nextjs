'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Pencil, Trash2, Plus, X, Check } from 'lucide-react';
import {
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from '@/actions/blog/manage-categories';

interface BlogCategoriesManagerProps {
  initialCategories: any[];
}

export function BlogCategoriesManager({
  initialCategories,
}: BlogCategoriesManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [newLabel, setNewLabel] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newOrder, setNewOrder] = useState('0');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOrder, setEditOrder] = useState('0');

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  function handleCreate() {
    if (!newLabel.trim() || !newSlug.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createBlogCategory({
        label: newLabel.trim(),
        slug: newSlug.trim(),
        description: newDescription.trim() || undefined,
        order: parseInt(newOrder) || 0,
      });
      if (result.success) {
        setNewLabel('');
        setNewSlug('');
        setNewDescription('');
        setNewOrder('0');
        router.refresh();
      } else {
        setError(result.error || 'Σφάλμα δημιουργίας');
      }
    });
  }

  function startEdit(cat: any) {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setEditSlug(cat.slug);
    setEditDescription(cat.description || '');
    setEditOrder(String(cat.order));
    setDeleteConfirmId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleUpdate() {
    if (!editingId || !editLabel.trim() || !editSlug.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await updateBlogCategory({
        id: editingId,
        label: editLabel.trim(),
        slug: editSlug.trim(),
        description: editDescription.trim() || undefined,
        order: parseInt(editOrder) || 0,
      });
      if (result.success) {
        setEditingId(null);
        router.refresh();
      } else {
        setError(result.error || 'Σφάλμα ενημέρωσης');
      }
    });
  }

  function handleDelete(id: string) {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteBlogCategory(id);
      if (result.success) {
        setDeleteConfirmId(null);
        router.refresh();
      } else {
        setError(result.error || 'Σφάλμα διαγραφής');
        setDeleteConfirmId(null);
      }
    });
  }

  return (
    <div className='space-y-6'>
      {error && (
        <div className='rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
          {error}
        </div>
      )}

      {/* Create form */}
      <div className='rounded-md border p-4 space-y-3'>
        <h3 className='text-sm font-medium'>Νέα Κατηγορία</h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <Input
            placeholder='Ετικέτα'
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
          <Input
            placeholder='Slug (π.χ. my-category)'
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
          />
          <Input
            placeholder='Περιγραφή (προαιρετικό)'
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <Input
            placeholder='Σειρά'
            type='number'
            value={newOrder}
            onChange={(e) => setNewOrder(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate} disabled={isPending} size='sm'>
          {isPending ? (
            <Loader2 className='h-4 w-4 animate-spin mr-2' />
          ) : (
            <Plus className='h-4 w-4 mr-2' />
          )}
          Δημιουργία
        </Button>
      </div>

      {/* Categories table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ετικέτα</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Περιγραφή</TableHead>
              <TableHead className='w-[80px]'>Σειρά</TableHead>
              <TableHead className='w-[80px]'>Άρθρα</TableHead>
              <TableHead className='text-right w-[120px]'>Ενέργειες</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center'>
                  <div className='text-muted-foreground'>
                    Δεν υπάρχουν κατηγορίες.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              initialCategories.map((cat: any) =>
                editingId === cat.id ? (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className='h-8'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        className='h-8'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className='h-8'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editOrder}
                        onChange={(e) => setEditOrder(e.target.value)}
                        type='number'
                        className='h-8 w-16'
                      />
                    </TableCell>
                    <TableCell>{cat._count?.articles ?? 0}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          onClick={handleUpdate}
                          disabled={isPending}
                        >
                          <Check className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          onClick={cancelEdit}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={cat.id}>
                    <TableCell className='font-medium'>{cat.label}</TableCell>
                    <TableCell className='text-muted-foreground'>
                      {cat.slug}
                    </TableCell>
                    <TableCell className='text-muted-foreground max-w-[200px] truncate'>
                      {cat.description || '-'}
                    </TableCell>
                    <TableCell>{cat.order}</TableCell>
                    <TableCell>{cat._count?.articles ?? 0}</TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          onClick={() => startEdit(cat)}
                        >
                          <Pencil className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-destructive'
                          onClick={() => handleDelete(cat.id)}
                          disabled={isPending}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                        {deleteConfirmId === cat.id && (
                          <span className='text-xs text-destructive ml-1'>
                            Πατήστε ξανά
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ),
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
