/**
 * FORM FIELD COMPONENT
 * Reusable form field with label, input, and error display
 */

import { forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils/cn';
import { FormError } from './form-error';

interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string | number | boolean;
  defaultValue?: string | number | boolean;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  description?: string;
  className?: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: any) => void;
  onBlur?: () => void;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  required = false,
  disabled = false,
  error,
  description,
  className,
  options = [],
  rows = 3,
  min,
  max,
  step,
  onChange,
  onBlur,
  ...props
}, ref) => {
  const hasError = !!error;
  const fieldId = `field-${name}`;
  const errorId = `error-${name}`;
  const descriptionId = `description-${name}`;

  const renderInput = () => {
    const commonProps = {
      id: fieldId,
      name,
      disabled,
      'aria-invalid': hasError,
      'aria-describedby': [
        error ? errorId : '',
        description ? descriptionId : ''
      ].filter(Boolean).join(' ') || undefined,
      onChange: (e: any) => {
        const newValue = type === 'checkbox' ? e.target.checked : e.target.value;
        onChange?.(newValue);
      },
      onBlur,
      className: cn(
        hasError && 'border-red-500 focus:ring-red-500',
        className
      ),
    };

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            placeholder={placeholder}
            value={value as string}
            defaultValue={defaultValue as string}
            rows={rows}
          />
        );

      case 'select':
        return (
          <Select
            name={name}
            value={value as string}
            defaultValue={defaultValue as string}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger 
              id={fieldId}
              className={cn(hasError && 'border-red-500')}
              aria-invalid={hasError}
              aria-describedby={[
                error ? errorId : '',
                description ? descriptionId : ''
              ].filter(Boolean).join(' ') || undefined}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              {...commonProps}
              checked={value as boolean}
              defaultChecked={defaultValue as boolean}
            />
            <Label 
              htmlFor={fieldId}
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                hasError && 'text-red-700'
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            ref={ref}
            type="number"
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            min={min}
            max={max}
            step={step}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            ref={ref}
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
          />
        );
    }
  };

  if (type === 'checkbox') {
    return (
      <div className={cn('space-y-2', className)}>
        {renderInput()}
        {description && (
          <p 
            id={descriptionId}
            className="text-sm text-gray-600"
          >
            {description}
          </p>
        )}
        {error && <FormError id={errorId} message={error} />}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label 
        htmlFor={fieldId}
        className={cn(
          'text-sm font-medium leading-none',
          hasError && 'text-red-700',
          disabled && 'opacity-50'
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {renderInput()}
      
      {description && (
        <p 
          id={descriptionId}
          className="text-sm text-gray-600"
        >
          {description}
        </p>
      )}
      
      {error && <FormError id={errorId} message={error} />}
    </div>
  );
});

FormField.displayName = 'FormField';