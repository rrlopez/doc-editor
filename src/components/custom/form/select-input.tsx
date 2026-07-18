import type { AnyFieldApi } from '@tanstack/react-form'
import { ChevronsUpDown, Loader2, X } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger } from '@/components/ui/combobox'
import { Field } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Option {
  label: string
  value: string
}

interface SelectInputProps<T> extends Omit<SelectProps<T>, 'value' | 'onChange'> {
  label?: string
  field: AnyFieldApi
  showError?: boolean
}

export function SelectInput<T>({ label, field, options, showError, ...props }: SelectInputProps<T>) {
  return (
    <Field>
      <Label className='empty:hidden'>{label}</Label>
      <Select<T> options={options} value={field.state.value} onChange={field.handleChange} {...props} />
      {showError && field.state.meta.errors.length > 0 && (
        <p className='text-xs font-medium text-red-500'>{field.state.meta.errors.map(err => (err as any)?.message ?? err).join(', ')}</p>
      )}
    </Field>
  )
}

interface SelectProps<T> {
  options: { value: string; label: string; data?: T }[]
  value: string | string[] | undefined
  onChange: (value: string | string[]) => void
  onCreate?: (inputValue: string) => Promise<Option | undefined>
  placeholder?: string
  multiple?: boolean
  clearable?: boolean
  creatable?: boolean
  disabled?: boolean
  className?: string
}

export function Select<T>({
  options: initialOptions,
  value,
  onChange,
  onCreate,
  placeholder = 'Select option...',
  multiple = false,
  clearable = false,
  creatable = false,
  disabled,
  className,
}: SelectProps<T>) {
  const [options, setOptions] = React.useState<any[]>(initialOptions)
  const [searchValue, setSearchValue] = React.useState('')
  const [isCreating, setIsCreating] = React.useState(false)

  React.useEffect(() => {
    setOptions(initialOptions)
  }, [initialOptions])

  const currentItems = React.useMemo(() => options, [options])

  const comboboxValue = React.useMemo(() => {
    if (value === undefined || value === null) return multiple ? [] : ''
    return value
  }, [value, multiple])

  const handleValueChange = (newValue: any) => {
    if (!newValue) {
      onChange(multiple ? [] : '')
    } else {
      onChange(newValue)
    }
  }

  const handleCreate = async () => {
    const trimmedInput = searchValue.trim()
    if (!creatable || !trimmedInput || isCreating) return

    if (options.some(o => o.label.toLowerCase() === trimmedInput.toLowerCase())) return

    setIsCreating(true)
    try {
      if (onCreate) {
        const newOpt = await onCreate(trimmedInput)
        if (newOpt) {
          setOptions(prev => [...prev, newOpt])
          handleValueChange(multiple ? [...(Array.isArray(comboboxValue) ? comboboxValue : []), newOpt.value] : newOpt.value)
        }
      } else {
        const generatedId = trimmedInput.toLowerCase().replace(/\s+/g, '-')
        const newOpt = { label: trimmedInput, value: generatedId }
        setOptions(prev => [...prev, newOpt])
        handleValueChange(multiple ? [...(Array.isArray(comboboxValue) ? comboboxValue : []), generatedId] : generatedId)
      }
      setSearchValue('')
    } catch (e) {
      console.error(e)
    } finally {
      setIsCreating(false)
    }
  }

  const hasSelection = multiple ? Array.isArray(comboboxValue) && comboboxValue.length > 0 : !!comboboxValue

  const showCreateRow = React.useMemo(() => {
    const cleanSearch = searchValue.trim()
    if (!creatable || !cleanSearch) return false
    return !options.some(o => o.label.toLowerCase() === cleanSearch.toLowerCase())
  }, [creatable, searchValue, options])

  const renderValuePreview = () => {
    if (!hasSelection) return <span className='text-muted-foreground'>{placeholder}</span>

    if (multiple && Array.isArray(comboboxValue)) {
      const activeLabels = comboboxValue.map(val => options.find(o => o.value === val)?.label || val).join(', ')
      return <span className='truncate'>{activeLabels}</span>
    }

    const singleLabel = options.find(o => o.value === comboboxValue)?.label || comboboxValue
    return <span className='truncate'>{singleLabel as string}</span>
  }

  return (
    <Combobox multiple={multiple} disabled={disabled} items={currentItems} value={comboboxValue} onValueChange={handleValueChange}>
      <ComboboxTrigger
        render={
          <Button variant='outline' className={cn('w-full justify-between font-normal text-left gap-2', className)}>
            {renderValuePreview()}

            <div className='flex items-center gap-1 shrink-0 ml-auto'>
              {clearable && hasSelection && (
                <button
                  type='button'
                  tabIndex={0}
                  aria-label='Clear selection'
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleValueChange(multiple ? [] : '')
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      e.stopPropagation()
                      handleValueChange(multiple ? [] : '')
                    }
                  }}
                  className='p-0.5 rounded-sm opacity-50 hover:opacity-100 transition-opacity cursor-pointer text-muted-foreground hover:text-foreground'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              )}
              <ChevronsUpDown className='h-4 w-4 opacity-50' />
            </div>
          </Button>
        }
      />

      <ComboboxContent>
        <ComboboxInput
          showTrigger={false}
          placeholder='Search...'
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && showCreateRow) {
              e.preventDefault()
              handleCreate()
            }
          }}
        />
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: any) => (
            <ComboboxItem key={item.value} value={item.value}>
              <div>
                {item.label}
                <div className='text-gray-400 dark:text-gray-600 empty:hidden'>{item.description}</div>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>

        {showCreateRow && (
          <ComboboxItem
            value={searchValue}
            onSelect={handleCreate}
            className='text-primary font-medium cursor-pointer flex items-center gap-2 border-t border-border mt-1'
          >
            {isCreating ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin text-muted-foreground' />
                <span className='text-muted-foreground'>Creating "{searchValue}"...</span>
              </>
            ) : (
              <span>Create "{searchValue}"</span>
            )}
          </ComboboxItem>
        )}
      </ComboboxContent>
    </Combobox>
  )
}
