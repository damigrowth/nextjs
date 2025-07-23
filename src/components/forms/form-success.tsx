/**
 * FORM SUCCESS COMPONENT
 * Displays success messages consistently
 */

import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FormSuccessProps {
  message?: string;
  messages?: string[];
  id?: string;
  className?: string;
  showIcon?: boolean;
  title?: string;
}

export function FormSuccess({ 
  message, 
  messages = [], 
  id, 
  className,
  showIcon = true,
  title = 'Success'
}: FormSuccessProps) {
  const successMessages = message ? [message] : messages;
  
  if (!successMessages.length) return null;

  return (
    <div 
      id={id}
      className={cn(
        'rounded-md bg-green-50 border border-green-200 p-4',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex">
        {showIcon && (
          <CheckCircle className="h-5 w-5 text-green-400" />
        )}
        <div className={cn('flex-1', showIcon && 'ml-3')}>
          {title && (
            <h3 className="text-sm font-medium text-green-800">
              {title}
            </h3>
          )}
          <div className={cn('text-sm text-green-700', title && 'mt-2')}>
            {successMessages.length === 1 ? (
              <p>{successMessages[0]}</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {successMessages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple success message for inline use
 */
export function SimpleSuccess({ 
  message, 
  className 
}: { 
  message?: string; 
  className?: string; 
}) {
  if (!message) return null;

  return (
    <p 
      className={cn(
        'text-sm text-green-600 flex items-center space-x-2',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <CheckCircle className="h-4 w-4" />
      <span>{message}</span>
    </p>
  );
}

/**
 * Success banner for form completion
 */
export function SuccessBanner({ 
  message, 
  onClose, 
  className 
}: { 
  message: string; 
  onClose?: () => void;
  className?: string; 
}) {
  return (
    <div 
      className={cn(
        'rounded-lg bg-green-50 border border-green-200 p-4',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex justify-between items-start">
        <div className="flex">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              {message}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            className="text-green-400 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md p-1"
            onClick={onClose}
            aria-label="Dismiss success message"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}