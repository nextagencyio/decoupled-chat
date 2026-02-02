'use client'

import { Search, X, Loader2 } from 'lucide-react'
import { useRef, useEffect } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  isLoading: boolean
  placeholder?: string
  autoFocus?: boolean
}

export default function SearchInput({
  value,
  onChange,
  onClear,
  isLoading,
  placeholder = 'Search for anything...',
  autoFocus = true,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
        ) : (
          <Search className="w-5 h-5 text-slate-400" />
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-input w-full pl-12 pr-12 py-4 text-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 transition-shadow"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-4 flex items-center"
        >
          <X className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" />
        </button>
      )}
    </div>
  )
}
