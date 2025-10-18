'use client';

import { useState } from 'react';
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
import { Smile, Send } from 'lucide-react';
import { useMessageOptimistic } from '@/lib/hooks/chat/use-message-optimistic';

interface MessageInputProps {
  chatId: string;
  currentUserId: string;
}

export function MessageInput({
  chatId,
  currentUserId,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Use optimistic hook for instant feedback
  const { sendOptimisticMessage } = useMessageOptimistic({
    chatId,
    currentUserId,
  });

  const handleSend = async () => {
    if (message.trim()) {
      const messageToSend = message;
      setMessage(''); // Clear input immediately
      await sendOptimisticMessage(messageToSend); // Send with optimistic UI
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

  return (
    <div className='px-4 py-0'>
      <div className='relative'>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Enter message...'
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
  );
}
