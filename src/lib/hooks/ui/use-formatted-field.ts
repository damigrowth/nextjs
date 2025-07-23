import { useCallback } from 'react';
import { UseFormSetValue, FieldPath, FieldValues } from 'react-hook-form';
import { formatInput } from 'oldcode/utils/InputFormats/formats';

interface FormatOptions {
  formatNumbers?: boolean;
  formatSymbols?: boolean;
  formatSpaces?: boolean;
  capitalize?: boolean;
  lowerCase?: boolean;
  englishOnly?: boolean;
  usernameFormat?: boolean;
  type?: string;
  min?: number;
  max?: number;
  maxLength?: number;
  minLength?: number;
}

/**
 * Custom hook to create formatted field handlers for React Hook Form
 * Integrates your existing formatInput utility with RHF
 */
export function useFormattedField<T extends FieldValues>(
  setValue: UseFormSetValue<T>,
  name: FieldPath<T>,
  formatOptions: FormatOptions = {},
) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const rawValue = event.target.value;
      const formattedValue = formatInput({
        value: rawValue,
        ...formatOptions,
      });

      setValue(name, formattedValue as any, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue, name, formatOptions],
  );

  const handleValueChange = useCallback(
    (value: any) => {
      if (typeof value === 'string') {
        const formattedValue = formatInput({
          value,
          ...formatOptions,
        });
        setValue(name, formattedValue as any, {
          shouldDirty: true,
          shouldValidate: true,
        });
      } else {
        setValue(name, value, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    },
    [setValue, name, formatOptions],
  );

  return {
    handleChange,
    handleValueChange,
  };
}

/**
 * Simplified version for common use cases
 */
export function useFormattedInput<T extends FieldValues>(
  setValue: UseFormSetValue<T>,
  name: FieldPath<T>,
  formatOptions: FormatOptions = {},
) {
  const { handleChange } = useFormattedField(setValue, name, formatOptions);

  return {
    onChange: handleChange,
  };
}
