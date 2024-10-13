// components/SmartDollarInput.tsx
import React, { useState, useEffect, useRef } from 'react'

interface SmartDollarInputProps {
  initialValue?: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

export const SmartDollarInput: React.FC<SmartDollarInputProps> = ({
  initialValue = 0,
  onChange,
  min = 0,
  max = 1000000,
  step = 1,
  className = '',
}) => {
  const [value, setValue] = useState<string>(initialValue.toFixed(2))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    onChange(parseFloat(value) || 0)
  }, [value, onChange])

  const formatValue = (val: string): string => {
    const numericValue = val.replace(/[^\d.]/g, '')
    const parts = numericValue.split('.')
    if (parts.length > 2) {
      parts.pop()
    }
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2)
    }
    return parts.join('.')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatValue(e.target.value)
    setValue(formatted)
  }

  const handleBlur = () => {
    const numericValue = parseFloat(value)
    if (isNaN(numericValue)) {
      setValue('0.00')
    } else {
      const clampedValue = Math.min(Math.max(numericValue, min), max)
      setValue(clampedValue.toFixed(2))
    }
  }

  const adjustValue = (direction: 'up' | 'down') => {
    const currentValue = parseFloat(value) || 0
    const newValue =
      direction === 'up' ? currentValue + step : currentValue - step
    const clampedValue = Math.min(Math.max(newValue, min), max)
    setValue(clampedValue.toFixed(2))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      adjustValue('up')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      adjustValue('down')
    }
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="text-gray-500">$</span>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="block w-full rounded-md border-gray-300 py-2 pl-7 pr-12 text-xl focus:border-indigo-500 focus:ring-indigo-500 dark:text-black"
        placeholder="0.00"
      />
      <div className="absolute inset-y-0 right-0 flex flex-col py-1">
        <button
          type="button"
          onClick={() => adjustValue('up')}
          className="flex-1 rounded-tr-md bg-gray-100 px-2 text-gray-500 hover:bg-gray-200 focus:outline-none"
        >
          {/* <IconCurrencyDollar /> */}
        </button>
        <button
          type="button"
          onClick={() => adjustValue('down')}
          className="flex-1 rounded-br-md bg-gray-100 px-2 text-gray-500 hover:bg-gray-200 focus:outline-none"
        >
          {/* <IconCurrencyDollar /> */}
        </button>
      </div>
    </div>
  )
}
