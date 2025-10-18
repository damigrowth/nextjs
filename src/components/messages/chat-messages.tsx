/**
 * Client Component: Chat Messages Display
 * Pure presentation - interactive parts moved to MessageActions client component
 */

'use client';

import { RefObject } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import { MessageActions } from './message-actions';
import { ChatMessageItem } from '@/lib/types/messages';
import { formatMessageTime, formatChatDateDivider } from '@/lib/utils/messages';

interface ChatMessagesProps {
  messages: ChatMessageItem[];
  scrollRef?: RefObject<HTMLDivElement>;
}

export function ChatMessages({ messages, scrollRef }: ChatMessagesProps) {
  const shouldShowDateDivider = (index: number) => {
    if (index === 0) return true;
    const currentMessage = messages[index];
    const prevMessage = messages[index - 1];
    const currentDate = currentMessage.createdAt.toISOString().split('T')[0];
    const prevDate = prevMessage.createdAt.toISOString().split('T')[0];
    return currentDate !== prevDate;
  };

  const getMessageSpacing = (index: number) => {
    const currentMessage = messages[index];
    const prevMessage = index > 0 ? messages[index - 1] : null;

    if (!prevMessage) return '';

    // If date changed, no margin (divider handles spacing)
    const currentDate = currentMessage.createdAt.toISOString().split('T')[0];
    const prevDate = prevMessage.createdAt.toISOString().split('T')[0];
    if (currentDate !== prevDate) {
      return '';
    }

    // If sender changed, add more spacing
    if (prevMessage.isOwn !== currentMessage.isOwn) {
      return 'mt-4';
    }

    // Same sender, keep tight spacing
    return 'mt-1.5';
  };

  const getMessageRadius = (index: number) => {
    const currentMessage = messages[index];
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage =
      index < messages.length - 1 ? messages[index + 1] : null;

    const isFirstInGroup =
      !prevMessage || prevMessage.isOwn !== currentMessage.isOwn;
    const isLastInGroup =
      !nextMessage || nextMessage.isOwn !== currentMessage.isOwn;

    const groupPosition = `${isFirstInGroup ? 'first' : ''}${isLastInGroup ? 'last' : ''}` || 'middle';

    switch (groupPosition) {
      case 'firstlast':
        // Single message
        return currentMessage.isOwn ? 'rounded-bubble-right' : 'rounded-bubble-left';

      case 'first':
        // First in group
        return currentMessage.isOwn
          ? 'rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br'
          : 'rounded-tl-2xl rounded-tr-2xl rounded-bl rounded-br-2xl';

      case 'last':
        // Last in group
        return currentMessage.isOwn
          ? 'rounded-tl-2xl rounded-tr rounded-bl-2xl rounded-br-2xl'
          : 'rounded-tl rounded-tr-2xl rounded-bl-2xl rounded-br-2xl';

      case 'middle':
      default:
        // Middle of group
        return currentMessage.isOwn
          ? 'rounded-tl-2xl rounded-tr rounded-bl-2xl rounded-br'
          : 'rounded-tl rounded-tr-2xl rounded-bl rounded-br-2xl';
    }
  };

  return (
    <ScrollArea className='flex-1 p-4' ref={scrollRef}>
      <div>
        {messages.map((message, index) => (
          <div key={message.id}>
            {shouldShowDateDivider(index) && (
              <div className='flex items-center justify-center my-4'>
                <div className='bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full'>
                  {formatChatDateDivider(message.createdAt)}
                </div>
              </div>
            )}
            <div
              className={cn(
                'flex gap-2 group items-center',
                message.isOwn && 'justify-end',
                getMessageSpacing(index),
              )}
            >
              {message.isOwn && (
                <MessageActions
                  messageId={message.id}
                  isOwn={true}
                  align='end'
                />
              )}

              <div
                className={cn(
                  'relative max-w-[40%] px-4 py-2',
                  message.isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10',
                  getMessageRadius(index),
                )}
              >
                {message.deleted ? (
                  <p className='text-sm leading-relaxed italic opacity-60'>
                    This message was deleted
                  </p>
                ) : (
                  <>
                    <p
                      className={cn(
                        'text-sm leading-relaxed',
                        message.isOwn && 'text-primary-foreground',
                      )}
                    >
                      {message.content}
                      {message.edited && (
                        <span className='text-xs opacity-60 ml-1'>(edited)</span>
                      )}
                    </p>
                  </>
                )}
                <div
                  className={cn(
                    'mt-1 flex items-center gap-1',
                    message.isOwn ? 'justify-end' : 'justify-start',
                  )}
                >
                  <span className='text-xs opacity-70'>
                    {formatMessageTime(
                      message.createdAt instanceof Date
                        ? message.createdAt.toISOString()
                        : message.createdAt
                    )}
                  </span>
                  {message.isOwn && !message.deleted && (
                    <>
                      {message.isRead ? (
                        <CheckCheck className='h-3 w-3 opacity-70' />
                      ) : (
                        <Check className='h-3 w-3 opacity-70' />
                      )}
                    </>
                  )}
                </div>
              </div>

              {!message.isOwn && (
                <MessageActions
                  messageId={message.id}
                  isOwn={false}
                  align='start'
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
