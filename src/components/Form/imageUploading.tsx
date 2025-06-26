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

export interface MediaI {
  file: File
  url: string
  metadata: {
    caption: string | null
    description: string | null
  }
  effectiveDate: Date
  type: 'image' | 'video'
}

interface MediaUploaderProps<TFieldValues extends FieldValues> {
  fieldArray: UseFieldArrayReturn<TFieldValues>
  control: Control<TFieldValues>
  register: UseFormRegister<TFieldValues>
}

const MediaUploader = <TFieldValues extends FieldValues>({
  fieldArray,
  register
}: MediaUploaderProps<TFieldValues>) => {
  const { fields, append, remove } = fieldArray

  const [open, setOpen] = useState(false)
  const [currentMedia, setCurrentMedia] = useState<MediaI | null>(null)
  const [hiddenMedia, setHiddenMedia] = useState<MediaI[]>([])
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isCompressing, setIsCompressing] = useState<boolean>(false)

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
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/') || file.type.startsWith('video/')
    )
    readFiles(files)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || !files?.length) return
    readFiles(files)
  }

  const readFiles = (files: FileList | File[]) => {
    Array.from(files).forEach(file => {
      // Check file size (limit to 2MB)
      const maxSize = 2 * 1024 * 1024 // 2MB in bytes
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Please choose an image smaller than 2MB.`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        // Compress image if it's too large
        if (file.type.startsWith('image/') && file.size > 500 * 1024) {
          // 500KB threshold
          setIsCompressing(true)
          console.log(`📸 Compressing large image: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

          compressImage(file, reader.result as string, (compressedFile, compressedUrl) => {
            setIsCompressing(false)
            const newMedia: MediaI = {
              file: compressedFile,
              url: compressedUrl,
              metadata: {
                caption: null,
                description: null
              },
              effectiveDate: new Date(),
              type: file.type.startsWith('image/') ? 'image' : 'video'
            }
            setCurrentMedia(newMedia)
            setOpen(true)
          })
        } else {
          const newMedia: MediaI = {
            file: file,
            url: reader.result as string,
            metadata: {
              caption: null,
              description: null
            },
            effectiveDate: new Date(),
            type: file.type.startsWith('image/') ? 'image' : 'video'
          }
          setCurrentMedia(newMedia)
          setOpen(true)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const compressImage = (
    originalFile: File,
    originalDataUrl: string,
    callback: (compressedFile: File, compressedUrl: string) => void
  ) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      try {
        // Calculate new dimensions (max 1200px width/height)
        const maxDimension = 1200
        let { width, height } = img

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width
            width = maxDimension
          } else {
            width = (width * maxDimension) / height
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          blob => {
            if (blob) {
              const compressedFile = new File([blob], originalFile.name, {
                type: originalFile.type,
                lastModified: Date.now()
              })

              const reader = new FileReader()
              reader.onload = () => {
                console.log(
                  `📸 Image compressed: ${(originalFile.size / 1024 / 1024).toFixed(2)}MB → ${(
                    compressedFile.size /
                    1024 /
                    1024
                  ).toFixed(2)}MB`
                )
                callback(compressedFile, reader.result as string)
              }
              reader.onerror = () => {
                console.error('Failed to read compressed image, using original')
                setIsCompressing(false)
                callback(originalFile, originalDataUrl)
              }
              reader.readAsDataURL(compressedFile)
            } else {
              console.error('Failed to compress image, using original')
              setIsCompressing(false)
              callback(originalFile, originalDataUrl)
            }
          },
          originalFile.type,
          0.8 // 80% quality
        )
      } catch (error) {
        console.error('Error during image compression:', error)
        setIsCompressing(false)
        callback(originalFile, originalDataUrl)
      }
    }

    img.onerror = () => {
      console.error('Failed to load image for compression, using original')
      setIsCompressing(false)
      callback(originalFile, originalDataUrl)
    }

    img.src = originalDataUrl
  }

  const handleSaveMedia = () => {
    if (currentMedia && currentMedia.url && currentMedia.url.trim() !== '') {
      append(currentMedia as unknown as TFieldValues['media'][number])
      setHiddenMedia([...hiddenMedia, currentMedia])
      setCurrentMedia(null)
      setOpen(false)
    } else {
      setCurrentMedia(null)
      setOpen(false)
    }
  }

  const handleEffectiveDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (currentMedia) {
      const newEffectiveDate = new Date(e.target.value)
      setCurrentMedia({ ...currentMedia, effectiveDate: newEffectiveDate })
    }
  }

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box sx={{ mx: 'auto', p: '10px', bgcolor: 'transparent', borderRadius: 2, width: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <label htmlFor='media-upload'>
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
              opacity: isCompressing ? 0.6 : 1,
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
              {isCompressing ? <strong>Compressing image...</strong> : <strong>Click to upload</strong>}
              {!isCompressing && ' or drag and drop'}
            </Typography>
            <Typography variant='caption' color='textSecondary' sx={{ textAlign: 'center' }}>
              {isCompressing ? 'Please wait while we optimize your image' : 'SVG, PNG, JPG, GIF, or MP4 (MAX. 2MB)'}
            </Typography>
          </Box>
          <input
            id='media-upload'
            type='file'
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept='image/*, video/*'
            multiple
            disabled={isCompressing}
          />
        </label>
      </Box>

      {fields.map((field, index) => {
        const mediaField = field as unknown as MediaI
        if (hiddenMedia.some(hiddenMedia => hiddenMedia.url === mediaField.url)) {
          return null
        }
        return mediaField.url ? (
          <Card key={field.id} sx={{ mb: 6, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
            {mediaField.type === 'image' ? (
              <CardMedia
                component='img'
                image={mediaField.url}
                alt={`Preview ${index + 1}`}
                sx={{ width: '100%', height: 'auto', borderRadius: 1 }}
              />
            ) : (
              <CardMedia
                component='video'
                src={mediaField.url}
                controls
                sx={{ width: '100%', height: 'auto', borderRadius: 1 }}
              />
            )}
            <CardContent sx={{ position: 'relative' }}>
              <IconButton onClick={() => remove(index)} sx={{ position: 'absolute', top: 8, right: 8 }} color='error'>
                <X />
              </IconButton>
              <Box sx={{ mt: 2 }}>
                <TextField
                  {...register(`media.${index}.metadata.caption` as Path<TFieldValues>)}
                  id={`media.${index}.metadata.caption`}
                  label='Caption'
                  fullWidth
                  variant='outlined'
                  size='small'
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <TextField
                  {...register(`media.${index}.metadata.description` as Path<TFieldValues>)}
                  id={`media.${index}.metadata.description`}
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
                  {...register(`media.${index}.effectiveDate` as Path<TFieldValues>)}
                  id={`media.${index}.effectiveDate`}
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
        <DialogTitle>Media Details</DialogTitle>
        <DialogContent>
          {currentMedia && (
            <>
              {currentMedia.type === 'image' ? (
                <CardMedia
                  component='img'
                  image={currentMedia.url}
                  alt='Image Preview'
                  sx={{ width: '100%', height: 'auto', mb: 2 }}
                />
              ) : (
                <CardMedia
                  component='video'
                  src={currentMedia.url}
                  controls
                  sx={{ width: '100%', height: 'auto', mb: 2 }}
                />
              )}
              <TextField
                label='Caption'
                fullWidth
                variant='outlined'
                size='small'
                sx={{ mb: 2 }}
                value={currentMedia.metadata.caption}
                onChange={e =>
                  setCurrentMedia({
                    ...currentMedia,
                    metadata: { ...currentMedia.metadata, caption: e.target.value }
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
                value={currentMedia.metadata.description}
                onChange={e =>
                  setCurrentMedia({
                    ...currentMedia,
                    metadata: { ...currentMedia.metadata, description: e.target.value }
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
                value={currentMedia.effectiveDate.toISOString().slice(0, 10)}
                onChange={handleEffectiveDateChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveMedia} color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MediaUploader
