import type { AnyFieldApi } from '@tanstack/react-form'
import { Field } from '@/components/ui/field'
import { ImageUploader } from '../image-uploader'

interface ImageInputProps {
  label: string
  field: AnyFieldApi
  alt?: string
}

export function ImageInput({ field, ...props }: ImageInputProps) {
  return (
    <Field>
      <ImageUploader value={field.state.value} onChange={val => field.handleChange(val)} {...props} />
      {field.state.meta.errors.length > 0 && <p className='text-xs text-red-500'>{field.state.meta.errors.map(err => err.message ?? err).join(', ')}</p>}
    </Field>
  )
}
