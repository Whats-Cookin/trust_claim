import React,{useState} from 'react'
import PropTypes from 'prop-types'
import {Box, Button, Typography} from '@mui/material'
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined'
import useImageResize from '../hooks/useImageResize'
import {useSnackbar} from 'notistack'
import ReactCrop from 'react-image-crop'
import styled from '@emotion/styled'



const ImageWrap = styled.span`
  margin: 32px auto;
  box-sizing: content-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & > div {
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
    border-radius: 50%;
  }
`

export default function ThumbNail({radius , initialImage ,image, setImage}) {
  const imageResize = useImageResize()
  const {enqueueSnackbar} = useSnackbar()

  return (
    <>
      <Box alignItems="center">
        <Box>
          {(image || initialImage) && (
            <Box display="flex" justifyContent="center">
              {radius === 'circle' ? (
                <ImageWrap>
                  <img
                    width={302}
                    height={302}
                    src={image ? URL.createObjectURL(image) : initialImage}
                    style={{objectFit:"cover"}}
                    alt="preview of selected file"
                  />
                </ImageWrap>
              ) : (
                <img
                  width={150}
                  height={150}
                  src={image ? URL.createObjectURL(image) : initialImage}
                  style={{objectFit:"cover",margin: '1em'}}
                  alt="preview of selected file"
                />
              )}
            </Box>
          )}
        </Box>

        <Box display="flex" justifyContent="center">
          <input
            style={{display: 'none'}}
            accept="image/*"
            type="file"
            id="Image"
            onChange={async (event:any) => {
              if (event.currentTarget.files.length > 0) {
                const file = await imageResize(event.currentTarget.files[0])
                if (file === null) {
                  enqueueSnackbar("Couldn't open this file", {
                    variant: 'warning',
                  })
                }
                setImage(file)
              }
            }}
          />
          <label htmlFor="circleImage">
            <Button
              startIcon={<BackupOutlinedIcon />}
              variant="outlined"
              sx={{pr: '16px', mt: '5px'}}
              component="span">
              Choose Image
            </Button>
          </label>
        </Box>
        <Box>
          {!image && !initialImage && (
            <Typography style={{paddingLeft: '3px', paddingTop: '10px'}}>
              No file choosen
            </Typography>
          )}
        </Box>
      </Box>
    </>
  )
}
ThumbNail.propTypes = {
  radius: PropTypes.oneOf(['circle', 'square']),
  image: PropTypes.any,
  setImage: PropTypes.func,
  initialImage: PropTypes.string,
}
