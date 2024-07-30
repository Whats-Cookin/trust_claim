import React, { ChangeEvent } from 'react'
import { Upload, X, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { UseFieldArrayReturn, Control, UseFormRegister, FieldValues, Path } from 'react-hook-form'

interface ImageI {
  url: string
  digestMultibase: string
  metadata: {
    description: string
    caption: string
  }
  effectiveDate: Date
  createdDate: Date
  owner: string
  signature: string
}

interface ImageUploaderProps<TFieldValues extends FieldValues> {
  fieldArray: UseFieldArrayReturn<TFieldValues>
  control: Control<TFieldValues>
  register: UseFormRegister<TFieldValues>
}

const ImageUploader = <TFieldValues extends FieldValues>({
  fieldArray,
  register
}: ImageUploaderProps<TFieldValues>) => {
  const { fields, append, remove } = fieldArray

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          append({
            url: file.name as string,
            digestMultibase: '',
            metadata: {
              description: '',
              caption: ''
            },
            effectiveDate: '',
            owner: '',
            signature: ''
          } as unknown as TFieldValues['images'][number])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  return (
    <div className='max-w-2xl mx-auto p-4 bg-transparent rounded-lg shadow'>
      <div className='mb-4'>
        <label
          htmlFor='image-upload'
          className='flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400 focus-within:border-gray-400'
        >
          <div className='flex flex-col items-center justify-center pt-5 pb-6'>
            <Upload className='w-10 h-10 mb-3 text-gray-400' />
            <p className='mb-2 text-sm text-gray-500'>
              <span className='font-semibold'>Click to upload</span> or drag and drop
            </p>
            <p className='text-xs text-gray-500'>SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
          </div>
          <input
            id='image-upload'
            type='file'
            className='hidden'
            onChange={handleFileChange}
            accept='image/*'
            multiple
          />
        </label>
      </div>

      {fields &&
        fields.map((field, index) => {
          const imageField = field as unknown as ImageI
          return imageField.url ? (
            <div key={field.id} className='mb-6 p-4 border border-gray-200 rounded-lg'>
              <div className='relative mb-4'>
                <img src={imageField.url} alt={`Preview ${index + 1}`} className='w-full h-auto rounded' />
                <button
                  type='button'
                  onClick={() => remove(index)}
                  className='absolute top-2 right-2 p-1 border bg-black text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>
              <div className='space-y-4'>
                <div>
                  <label
                    htmlFor={`images.${index}.metadata.caption`}
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Caption
                  </label>
                  <Input
                    {...register(`images.${index}.metadata.caption` as Path<TFieldValues>)}
                    id={`images.${index}.metadata.caption`}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`images.${index}.metadata.description`}
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Description
                  </label>
                  <Textarea
                    {...register(`images.${index}.metadata.description` as Path<TFieldValues>)}
                    id={`images.${index}.metadata.description`}
                    rows={3}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`images.${index}.effectiveDate`}
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Effective Date
                  </label>
                  <Input
                    {...register(`images.${index}.effectiveDate` as Path<TFieldValues>)}
                    id={`images.${index}.effectiveDate`}
                    type='date'
                  />
                </div>
              </div>
            </div>
          ) : null
        })}
    </div>
  )
}

export default ImageUploader
