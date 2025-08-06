import * as React from "react"
import { InputWithSuffix } from "./input-with-suffix"

export interface CurrencyProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  /** Currency symbol or text to display */
  currency?: string
  /** Position of the currency symbol */
  position?: 'left' | 'right'
  /** Callback when value changes - returns the numeric value */
  onValueChange?: (value: number | null) => void
  /** Current numeric value */
  value?: number | null
  /** Allow decimal places */
  allowDecimals?: boolean
  /** Maximum number of decimal places (default: 2) */
  decimalPlaces?: number
  /** Minimum value allowed */
  min?: number
  /** Maximum value allowed */
  max?: number
}

const Currency = React.forwardRef<HTMLInputElement, CurrencyProps>(
  ({ 
    className, 
    currency = "€", 
    position = "right", 
    onValueChange,
    value,
    allowDecimals = true,
    decimalPlaces = 2,
    min,
    max,
    ...props 
  }, ref) => {
    // Internal state for the display value
    const [displayValue, setDisplayValue] = React.useState<string>(() => {
      if (value === null || value === undefined) return ''
      return allowDecimals ? value.toFixed(decimalPlaces) : value.toString()
    })

    // Update display value when external value changes
    React.useEffect(() => {
      if (value === null || value === undefined) {
        setDisplayValue('')
      } else {
        setDisplayValue(allowDecimals ? value.toFixed(decimalPlaces) : value.toString())
      }
    }, [value, allowDecimals, decimalPlaces])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      // Allow empty string
      if (inputValue === '') {
        setDisplayValue('')
        onValueChange?.(null)
        return
      }

      // Create regex based on decimal settings
      const decimalRegex = allowDecimals 
        ? new RegExp(`^\\d*\\.?\\d{0,${decimalPlaces}}$`)
        : /^\d*$/

      // Validate input format
      if (decimalRegex.test(inputValue)) {
        setDisplayValue(inputValue)
        
        // Convert to number
        const numericValue = allowDecimals ? parseFloat(inputValue) : parseInt(inputValue, 10)
        
        // Check if it's a valid number
        if (!isNaN(numericValue)) {
          // Apply min/max constraints
          let constrainedValue = numericValue
          if (min !== undefined && constrainedValue < min) {
            constrainedValue = min
          }
          if (max !== undefined && constrainedValue > max) {
            constrainedValue = max
          }
          
          onValueChange?.(constrainedValue)
        }
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Format the display value on blur if we have a valid number
      if (displayValue && !isNaN(parseFloat(displayValue))) {
        const numValue = parseFloat(displayValue)
        if (allowDecimals) {
          setDisplayValue(numValue.toFixed(decimalPlaces))
        }
      }
      
      // Call original onBlur if provided
      props.onBlur?.(e)
    }

    return (
      <InputWithSuffix
        type="text"
        inputMode="decimal"
        suffix={currency}
        position={position}
        className={className}
        ref={ref}
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        {...props}
      />
    )
  }
)

Currency.displayName = "Currency"

export { Currency }