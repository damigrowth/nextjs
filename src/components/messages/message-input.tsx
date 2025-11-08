'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  EmojiPicker,
  EmojiPickerSearch,
  EmojiPickerContent,
  EmojiPickerFooter,
} from '@/components/ui/emoji-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Smile, Send, X } from 'lucide-react';
import { useMessageOptimistic } from '@/lib/hooks/chat/use-message-optimistic';
import { MessageReplyPreview } from './message-reply-preview';
import { editMessage } from '@/actions/messages';
import { toast } from 'sonner';

export interface ReplyToMessage {
  id: string;
  content: string;
  authorName: string;
  isOwn: boolean;
}

export interface EditingMessage {
  id: string;
  content: string;
}

interface MessageInputProps {
  chatId: string;
  currentUserId: string;
  replyTo: ReplyToMessage | null;
  onCancelReply: () => void;
  editingMessage: EditingMessage | null;
  onCancelEdit: () => void;
}

export function MessageInput({
  chatId,
  currentUserId,
  replyTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use optimistic hook for instant feedback
  const { sendOptimisticMessage } = useMessageOptimistic({
    chatId,
    currentUserId,
  });

  // Load editing message content into input
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  // Focus input when replying
  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  const handleSend = async () => {
    if (!message.trim()) return;

    if (editingMessage) {
      // Handle edit
      try {
        await editMessage(editingMessage.id, message, currentUserId);
        setMessage('');
        onCancelEdit();
        toast.success('Το μήνυμα ενημερώθηκε');
      } catch (error) {
        console.error('Failed to edit message:', error);
        toast.error('Αποτυχία ενημέρωσης μηνύματος');
      }
    } else {
      // Handle new message
      const messageToSend = message;
      const replyToId = replyTo?.id;

      setMessage(''); // Clear input immediately
      onCancelReply(); // Clear reply state

      await sendOptimisticMessage(messageToSend, replyToId); // Send with optimistic UI
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = ({ emoji }: { emoji: string }) => {
    setMessage((prev) => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  const handleCancel = () => {
    if (editingMessage) {
      setMessage('');
      onCancelEdit();
    } else if (replyTo) {
      onCancelReply();
    }
  };

  return (
    <div className='py-0'>
      {replyTo && !editingMessage && (
        <MessageReplyPreview
          authorName={replyTo.authorName}
          content={replyTo.content}
          isOwn={replyTo.isOwn}
          onCancel={onCancelReply}
        />
      )}
      {editingMessage && (
        <div className='px-4 py-2 bg-muted/50 border-b flex items-center justify-between'>
          <div className='flex-1'>
            <p className='text-sm font-medium'>Επεξεργασία μηνύματος</p>
            <p className='text-xs text-muted-foreground line-clamp-1'>
              {editingMessage.content}
            </p>
          </div>
          <Button
            size='icon'
            variant='ghost'
            className='size-8'
            onClick={handleCancel}
          >
            <X className='size-4' />
          </Button>
        </div>
      )}
      <div className='px-4'>
        <div className='relative'>
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              editingMessage
                ? 'Επεξεργαστείτε το μήνυμά σας...'
                : replyTo
                ? 'Πληκτρολογήστε την απάντησή σας...'
                : 'Εισάγετε μήνυμα...'
            }
            className='pr-24 pl-4 h-14'
          />
        <div className='absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2'>
          <div className='relative'>
            <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
              <Tooltip>
                <PopoverTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      size='icon'
                      variant='ghost'
                      className='size-9 rounded-full opacity-60 hover:opacity-100'
                    >
                      <Smile className='size-6' />
                    </Button>
                  </TooltipTrigger>
                </PopoverTrigger>
                <TooltipContent>
                  <p>Emoji</p>
                </TooltipContent>
              </Tooltip>
              <PopoverContent
                className='w-fit p-0'
                align='end'
                side='top'
                sideOffset={8}
              >
                <EmojiPicker
                  className='h-[342px]'
                  onEmojiSelect={handleEmojiSelect}
                >
                  <EmojiPickerSearch />
                  <EmojiPickerContent />
                  <EmojiPickerFooter />
                </EmojiPicker>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            onClick={handleSend}
            size='icon'
            variant='black'
            className='size-9 rounded-xl'
            disabled={!message.trim()}
          >
            <Send className='size-6' />
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
