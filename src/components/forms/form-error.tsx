/**
 * FORM ERROR COMPONENT
 * Displays form validation errors consistently
 */

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface FormErrorProps {
  message?: string;
  messages?: string[];
  id?: string;
  className?: string;
  showIcon?: boolean;
}

export function FormError({ 
  message, 
  messages = [], 
  id, 
  className,
  showIcon = true 
}: FormErrorProps) {
  const errorMessages = message ? [message] : messages;
  
  if (!errorMessages.length) return null;

  return (
    <div 
      id={id}
      className={cn(
        'flex items-start space-x-2 text-sm text-red-600',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {showIcon && (
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1">
        {errorMessages.length === 1 ? (
          <p>{errorMessages[0]}</p>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {errorMessages.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/**
 * Form field error specifically for individual fields
 */
export function FieldError({ 
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
        'text-sm text-red-600 mt-1',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {message}
    </p>
  );
}

/**
 * General form error for form-level errors
 */
export function GeneralFormError({ 
  message, 
  messages = [], 
  className 
}: { 
  message?: string; 
  messages?: string[]; 
  className?: string; 
}) {
  const errorMessages = message ? [message] : messages;
  
  if (!errorMessages.length) return null;

  return (
    <div 
      className={cn(
        'rounded-md bg-red-50 border border-red-200 p-4',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {errorMessages.length === 1 ? 'Error' : 'Errors'}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            {errorMessages.length === 1 ? (
              <p>{errorMessages[0]}</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {errorMessages.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}