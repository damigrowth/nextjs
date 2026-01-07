'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MessageCircle, Send } from 'lucide-react';
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
import { toast } from 'sonner';
import { getOrCreateChat, sendMessage } from '@/actions/messages';
import { useSession } from '@/lib/auth/client';

interface StartChatDialogProps {
  recipientId: string;
  recipientName: string;
  initialMessage?: string;
  customTrigger?: string;
  currentUserId?: string; // Optional: can be passed from server component
  className?: string;
}

export function StartChatDialog({
  recipientId,
  recipientName,
  initialMessage,
  customTrigger,
  currentUserId: propCurrentUserId,
  className,
}: StartChatDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load initial message when dialog opens
  useEffect(() => {
    if (open && initialMessage) {
      setMessage(initialMessage);
    }
  }, [open, initialMessage]);

  // Get session from better-auth client
  const { data: session, isPending } = useSession();

  // Use prop if provided, otherwise get from session
  const currentUserId = propCurrentUserId || session?.user?.id;

  // Check if user is logged in
  const isLoggedIn = !!currentUserId;

  // Don't show button if viewing own profile
  if (currentUserId === recipientId) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double-check that we have currentUserId
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

  // Show loading state if session is still loading and no prop provided
  // Ensure disabled is always boolean to prevent hydration mismatch
  const isButtonLoading = Boolean(!propCurrentUserId && isPending);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={className || 'w-full'}
          size='lg'
          type='button'
          disabled={isButtonLoading}
        >
          {customTrigger || 'Επικοινωνία'}
          {!customTrigger && <MessageCircle className='h-4 w-4' />}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-base'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {isLoggedIn ? (
              <MessageCircle className='h-5 w-5 text-primary' />
            ) : null}
            {isLoggedIn
              ? `Νέο Μήνυμα προς ${recipientName}`
              : 'Για να επικοινωνήσεις πρέπει να έχεις λογαριασμό'}
          </DialogTitle>
          <DialogDescription className='sr-only'>
            {isLoggedIn
              ? `Στείλτε μήνυμα στον χρήστη ${recipientName}`
              : 'Συνδεθείτε ή εγγραφείτε για να στείλετε μήνυμα'}
          </DialogDescription>
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
            <div className='flex gap-2 justify-center'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setOpen(false);
                  router.push('/login');
                }}
                className='rounded-full'
              >
                Σύνδεση
              </Button>
              <Button
                type='button'
                onClick={() => {
                  setOpen(false);
                  router.push('/register');
                }}
                className='rounded-full'
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
