'use client';

import { useEffect, useActionState, useState } from 'react';
import { updateUserImageAction } from '@/actions/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Upload, X, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { populateFormData } from '@/lib/utils/form';

interface EditUserImageFormProps {
  user: {
    id: string;
    image?: string | null;
  };
}

export function EditUserImageForm({ user }: EditUserImageFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateUserImageAction, null);
  const [currentImage, setCurrentImage] = useState<string | null>(user.image || null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (state?.success) {
      const message = state.data?.image ? 'Profile image updated successfully' : 'Profile image removed successfully';
      toast.success(message);
      router.refresh();
      if (state.data?.image) {
        setCurrentImage(state.data.image as string);
        setImageUrl('');
      } else {
        setCurrentImage(null);
      }
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const handleImageUpdate = () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    const newFormData = new FormData();
    const payload = {
      userId: user.id,
      image: imageUrl.trim(),
    };

    populateFormData(newFormData, payload, {
      stringFields: ['userId', 'image'],
    });

    formAction(newFormData);
  };

  const handleRemoveImage = () => {
    const newFormData = new FormData();
    const payload = {
      userId: user.id,
      image: '',
    };

    populateFormData(newFormData, payload, {
      stringFields: ['userId', 'image'],
    });

    formAction(newFormData);
  };

  return (
    <div className='space-y-6'>
      {/* Current Image Preview */}
      {currentImage && (
        <div className='space-y-2'>
          <Label>Current Image</Label>
          <div className='relative w-32 h-32 rounded-lg overflow-hidden border'>
            <Image
              src={currentImage}
              alt='User profile'
              fill
              className='object-cover'
            />
          </div>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => window.open(currentImage, '_blank')}
            >
              <ExternalLink className='mr-2 h-4 w-4' />
              View Full Size
            </Button>
            <Button
              type='button'
              variant='destructive'
              size='sm'
              onClick={handleRemoveImage}
              disabled={isPending}
            >
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              <X className='mr-2 h-4 w-4' />
              Remove
            </Button>
          </div>
        </div>
      )}

      {!currentImage && (
        <div className='space-y-2'>
          <div className='w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center'>
            <Upload className='h-8 w-8 text-muted-foreground' />
          </div>
          <p className='text-sm text-muted-foreground'>No profile image set</p>
        </div>
      )}

      {/* Update Image Form */}
      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='imageUrl'>Image URL</Label>
          <Input
            id='imageUrl'
            type='url'
            placeholder='https://example.com/image.jpg'
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isPending}
          />
          <p className='text-xs text-muted-foreground'>
            Enter a direct URL to an image (must be publicly accessible)
          </p>
        </div>

        <Button
          type='button'
          onClick={handleImageUpdate}
          disabled={isPending || !imageUrl.trim()}
        >
          {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
          <Upload className='mr-2 h-4 w-4' />
          {currentImage ? 'Update Image' : 'Set Image'}
        </Button>
      </div>

      <div className='rounded-lg bg-muted/50 p-4'>
        <p className='text-sm text-muted-foreground'>
          <strong>Tip:</strong> You can use Cloudinary, Imgur, or any other image hosting service.
          Make sure the URL points directly to an image file and is publicly accessible.
        </p>
      </div>
    </div>
  );
}
