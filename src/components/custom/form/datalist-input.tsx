import type { AnyFieldApi } from '@tanstack/react-form'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DatalistInputProps extends React.DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  label?: string | ReactNode
  field: AnyFieldApi
  options: string[]
  listId: string
}

export function DatalistInput({ label, field, placeholder, options, listId, ...props }: DatalistInputProps) {
  return (
    <Field>
      <Label className='empty:hidden'>{label}</Label>
      <Input
        {...props}
        list={listId}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.value)}
        placeholder={placeholder}
      />

      <datalist id={listId}>
        {options.map(option => (
          <option key={option} value={option} />
        ))}
      </datalist>

      {field.state.meta.errors.length > 0 && <p className='text-xs text-red-500'>{field.state.meta.errors.map(err => err.message ?? err).join(', ')}</p>}
    </Field>
  )
}
