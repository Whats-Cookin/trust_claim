import { ChangeEvent, useState, DragEvent } from 'react'
import { X } from 'lucide-react'
import {
  TextField,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  useMediaQuery
} from '@mui/material'
import { Control, UseFieldArrayReturn, UseFormRegister, FieldValues, Path } from 'react-hook-form'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

export interface ImageI {
  file: File
  url: string
  metadata: {
    captian: string | null
    description: string | null
  }
  effectiveDate: Date
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

  const [open, setOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState<ImageI | null>(null)
  const [hiddenImages, setHiddenImages] = useState<ImageI[]>([])

  const [isDragging, setIsDragging] = useState<boolean>(false)

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (): void => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    readFiles(files)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !files?.length) return
    readFiles(files)
  }

  const readFiles = (files: FileList | File[]) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newImage: ImageI = {
          file: file,
          url: reader.result as string,
          metadata: {
            captian: null as string | null,
            description: null as string | null
          },
          effectiveDate: new Date()
        }
        setCurrentImage(newImage)
        setOpen(true)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSaveImage = () => {
    if (currentImage && currentImage.url && currentImage.url.trim() !== '') {
      append(currentImage as unknown as TFieldValues['images'][number])
      setHiddenImages([...hiddenImages, currentImage])
      setCurrentImage(null)
      setOpen(false)
    } else {
      setCurrentImage(null)
      setOpen(false)
    }
  }
  const handleEffectiveDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (currentImage) {
      const newEffectiveDate = new Date(e.target.value)
      setCurrentImage({ ...currentImage, effectiveDate: newEffectiveDate })
    }
  }

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box sx={{ mx: 'auto', p: '10px', bgcolor: 'transparent', borderRadius: 2, width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <label htmlFor='image-upload'>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: isMobile ? '326px' : '400px',
              margin: isMobile ? '0 ' : 'auto',
              height: 180,
              border: `5px dashed ${theme.palette.input}`,
              borderRadius: 2,

              cursor: 'pointer',
              transition: 'border-color 0.3s',
              '&:hover': {
                borderColor: theme.palette.borderColor
              }
            }}
            style={{ borderColor: isDragging ? theme.palette.borderColor : theme.palette.input }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role='presentation'
          >
            <CloudUploadIcon style={{ width: 40, height: 40, marginBottom: 10, color: theme.palette.input }} />
            <Typography variant='body2' color='textSecondary' sx={{ textAlign: 'center' }}>
              <strong>Click to upload</strong> or drag and drop
            </Typography>
            <Typography variant='caption' color='textSecondary' sx={{ textAlign: 'center' }}>
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
        if (hiddenImages.some(hiddenImage => hiddenImage.url === imageField.url)) {
          return null
        }
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Image Details</DialogTitle>
        <DialogContent>
          {currentImage && (
            <>
              <CardMedia
                component='img'
                image={currentImage.url}
                alt='Image Preview'
                sx={{ width: '100%', height: 'auto', mb: 2 }}
              />
              <TextField
                label='Caption'
                fullWidth
                variant='outlined'
                size='small'
                sx={{ mb: 2 }}
                value={currentImage.metadata.captian}
                onChange={e =>
                  setCurrentImage({
                    ...currentImage,
                    metadata: { ...currentImage.metadata, captian: e.target.value }
                  })
                }
              />
              <TextField
                label='Description'
                multiline
                rows={3}
                fullWidth
                variant='outlined'
                size='small'
                sx={{ mb: 2 }}
                value={currentImage.metadata.description}
                onChange={e =>
                  setCurrentImage({
                    ...currentImage,
                    metadata: { ...currentImage.metadata, description: e.target.value }
                  })
                }
              />
              <TextField
                label='Effective Date'
                type='date'
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant='outlined'
                size='small'
                sx={{ mb: 2 }}
                value={currentImage.effectiveDate.toISOString().slice(0, 10)}
                onChange={handleEffectiveDateChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveImage} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ImageUploader
