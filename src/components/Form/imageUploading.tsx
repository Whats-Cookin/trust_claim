import React, { ChangeEvent } from 'react'
import { Upload, X } from 'lucide-react'
import { TextField, IconButton, Card, CardContent, CardMedia, Typography, Box, useTheme } from '@mui/material'
import { useFieldArray, Control, UseFieldArrayReturn, UseFormRegister, FieldValues, Path } from 'react-hook-form'

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
            url: reader.result as string,
            digestMultibase: '',
            metadata: {
              description: '',
              caption: ''
            },
            effectiveDate: new Date(),
            createdDate: new Date(),
            owner: '',
            signature: ''
          } as unknown as TFieldValues['images'][number])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const theme = useTheme()

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4, bgcolor: 'transparent', borderRadius: 2 }}>
      <Box sx={{ mb: 4 }}>
        <label htmlFor='image-upload'>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: 150,
              border: '2px dashed grey',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'border-color 0.3s',
              '&:hover': {
                borderColor: theme.palette.borderColor
              }
            }}
          >
            <Upload style={{ width: 40, height: 40, marginBottom: 10, color: 'grey' }} />
            <Typography variant='body2' color='textSecondary'>
              <strong>Click to upload</strong> or drag and drop
            </Typography>
            <Typography variant='caption' color='textSecondary'>
              SVG, PNG, JPG or GIF (MAX. 800x400px)
            </Typography>
          </Box>
          <input
            id='image-upload'
            type='file'
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept='image/*'
            multiple
          />
        </label>
      </Box>

      {fields.map((field, index) => {
        const imageField = field as unknown as ImageI
        return imageField.url ? (
          <Card key={field.id} sx={{ mb: 6, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
            <CardMedia
              component='img'
              image={imageField.url}
              alt={`Preview ${index + 1}`}
              sx={{ width: '100%', height: 'auto', borderRadius: 1 }}
            />
            <CardContent sx={{ position: 'relative' }}>
              <IconButton onClick={() => remove(index)} sx={{ position: 'absolute', top: 8, right: 8 }} color='error'>
                <X />
              </IconButton>
              <Box sx={{ mt: 2 }}>
                <TextField
                  {...register(`images.${index}.metadata.caption` as Path<TFieldValues>)}
                  id={`images.${index}.metadata.caption`}
                  label='Caption'
                  fullWidth
                  variant='outlined'
                  size='small'
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <TextField
                  {...register(`images.${index}.metadata.description` as Path<TFieldValues>)}
                  id={`images.${index}.metadata.description`}
                  label='Description'
                  multiline
                  rows={3}
                  fullWidth
                  variant='outlined'
                  size='small'
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <TextField
                  {...register(`images.${index}.effectiveDate` as Path<TFieldValues>)}
                  id={`images.${index}.effectiveDate`}
                  label='Effective Date'
                  type='date'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  variant='outlined'
                  size='small'
                />
              </Box>
            </CardContent>
          </Card>
        ) : null
      })}
    </Box>
  )
}

export default ImageUploader
