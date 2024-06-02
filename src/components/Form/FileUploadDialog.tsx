import React, { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import { BACKEND_BASE_URL } from '../../utils/settings'
import UploadImage from '../../assets/UploadImage.svg'

interface FileUploadDialogProps {
  open: boolean
  onClose: () => void
  claimId: string
  onUploadSuccess: (imagePaths: string[]) => void
  onUploadError: (message: string) => void
}

interface ErrorResponse {
  message: string
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  open,
  onClose,
  claimId,
  onUploadSuccess,
  onUploadError
}) => {
  const theme = useTheme()
  const [isUploading, setIsUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneDragActive
  } = useDropzone({
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles)
      setIsDragActive(false)
    },
    maxSize: 26214400, // 25MB
    multiple: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  })

  const handleFileUpload = async () => {
    if (files.length === 0) {
      onUploadError('No file selected')
      return
    }

    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })
    formData.append('claimId', claimId)

    setIsUploading(true)

    try {
      const response = await axios.post(`${BACKEND_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      onUploadSuccess(response.data.imagePaths)
      setFiles([])
      onClose()
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const message = (error.response?.data as ErrorResponse)?.message || 'Failed to upload image'
        onUploadError(message)
      } else {
        onUploadError('An unknown error occurred')
      }
    } finally {
      setIsUploading(false)
      setIsDragActive(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.palette.formBackground,
          color: theme.palette.texts
        }
      }}
    >
      <DialogTitle>Upload Image</DialogTitle>
      <DialogContent>
        <Box
          {...getRootProps()}
          sx={{
            border: `${isDragActive || dropzoneDragActive ? '2px' : '1px'} dashed ${
              isDragActive || dropzoneDragActive ? theme.palette.buttons : theme.palette.buttonHover
            }`,
            padding: 4,
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: theme.palette.formBackground
          }}
        >
          <input {...getInputProps()} />
          <img src={UploadImage} alt='Upload Icon' style={{ marginBottom: '1rem' }} />
          <Typography sx={{ color: theme.palette.texts }}>
            Drop your files here or <span style={{ color: theme.palette.link, cursor: 'pointer' }}>browse</span>
          </Typography>
          <Typography variant='body2' sx={{ color: theme.palette.texts }}>
            Maximum size: 25MB per file
          </Typography>
        </Box>
        {files.length > 0 && (
          <Box mt={2}>
            <Typography variant='body1' sx={{ color: theme.palette.texts }}>
              Selected files:
            </Typography>
            {files.map((file, index) => (
              <Typography key={index} variant='body2' sx={{ color: theme.palette.maintext }}>
                {file.name}
              </Typography>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            color: theme.palette.buttontext,
            '&:hover': { backgroundColor: theme.palette.buttonHover },
            backgroundColor: 'transparent'
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleFileUpload}
          variant='contained'
          sx={{
            color: theme.palette.buttontext,
            backgroundColor: theme.palette.buttons,
            '&:hover': {
              backgroundColor: theme.palette.buttonHover
            }
          }}
          disabled={isUploading}
        >
          {isUploading ? <CircularProgress size={24} sx={{ color: theme.palette.smallButton }} /> : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FileUploadDialog
