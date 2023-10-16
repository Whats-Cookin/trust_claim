import { Box, Button, Typography, List, ListItem, ListItemText } from '@mui/material'
import axios from '../../axiosInstance'
import React, { useState } from 'react'
// import ILoginProps from '../../containers/Login/types'

function FileUpload({ passImageFormData }: any) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    setSelectedFiles(files)
  }

  const handleFileUpload = () => {
    if (!selectedFiles) {
      alert('Please select one or more files.')
      return
    }

    const formData = new FormData()

    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i])
    }

    // axios.post('/api/image-upload', formData).then(response => {
    //   console.log(response.data)
    // })
    passImageFormData(formData)
  }

  return (
    <>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-around', flexDirection: 'row', mb: '-15px' }}>
        <Box sx={{ mr: '30px' }}>
          <input type='file' onChange={handleFileChange} multiple style={{ display: 'none' }} id='file-upload' />
          <label htmlFor='file-upload'>
            <Button component='span'>Select Files</Button>
          </label>
        </Box>
        <Box>
          {selectedFiles && (
            <Box>
              <p>Selected Files:</p>
              <ul>
                {Array.from(selectedFiles).map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </Box>
          )}
          <Button variant='contained' component='span' onClick={handleFileUpload}>
            Upload{' '}
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default FileUpload
