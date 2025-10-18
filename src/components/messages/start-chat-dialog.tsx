'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, MessageCircle, Plane, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getOrCreateChat, sendMessage } from '@/actions/messages';

interface StartChatDialogProps {
  recipientId: string;
  recipientName: string;
  currentUserId: string | null;
}

export function StartChatDialog({
  recipientId,
  recipientName,
  currentUserId,
}: StartChatDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is logged in
  const isLoggedIn = !!currentUserId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      toast.error('Πρέπει να συνδεθείτε πρώτα');
      return;
    }

    if (!message.trim()) {
      toast.error('Παρακαλώ γράψτε ένα μήνυμα');
      return;
    }

    setIsLoading(true);

    try {
      // Get or create chat with the recipient
      const { chatId } = await getOrCreateChat(currentUserId, recipientId);

      // Send the initial message
      await sendMessage(chatId, message.trim(), currentUserId);

      // Success! Close dialog and redirect to chat
      toast.success('Το μήνυμα στάλθηκε επιτυχώς');
      setOpen(false);
      setMessage('');

      // Redirect to messages page with the chat selected
      router.push(`/dashboard/messages?chatId=${chatId}`);
    } catch (error) {
      console.error('Start chat error:', error);
      toast.error('Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='w-full' size='lg' type='button'>
          Επικοινωνία
          <MessageCircle className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <MessageCircle className='h-5 w-5 text-primary' />
            {isLoggedIn ? `Νέο Μήνυμα προς ${recipientName}` : 'Επικοινωνία'}
          </DialogTitle>
        </DialogHeader>
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Textarea
                id='message'
                placeholder='Πληκτρολόγησε εδώ το μήνυμα...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                disabled={isLoading}
                className='resize-none'
              />
            </div>
            <div className='flex gap-2 justify-end'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Ακύρωση
              </Button>
              <Button type='submit' disabled={isLoading || !message.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Αποστολή...
                  </>
                ) : (
                  <>
                    Αποστολή
                    <Send className='h-4 w-4' />
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className='space-y-4'>
            <p className='text-sm text-muted-foreground text-center py-4'>
              Συνδέσου ή δημιούργησε λογαριασμό για να στείλεις μήνυμα
            </p>
            <div className='flex gap-2 justify-center'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setOpen(false);
                  router.push('/auth/login');
                }}
              >
                Σύνδεση
              </Button>
              <Button
                type='button'
                onClick={() => {
                  setOpen(false);
                  router.push('/auth/register');
                }}
              >
                Εγγραφή
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
