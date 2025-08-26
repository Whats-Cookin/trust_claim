import React from 'react'
import { Box } from '@mui/material'
import { useTheme, useMediaQuery } from '@mui/material'
import { isVideoUrl } from '../../constants/certificateStyles'

interface CertificateMediaProps {
  image?: string
}

const CertificateMedia: React.FC<CertificateMediaProps> = ({ image }) => {
  const theme = useTheme()
  const isXl = useMediaQuery(theme.breakpoints.up('xl'))
  const isLg = useMediaQuery(theme.breakpoints.up('lg'))
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'))
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'))

  if (!image) return null

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: isXl ? '900px' : isLg ? '800px' : isMd ? '700px' : '100%',
        margin: '0 auto',
        marginTop: { xs: 2, sm: 3 },
        marginBottom: { xs: 2, sm: 3 },
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      {isVideoUrl(image) ? (
        <video
          controls
          style={{
            width: '100%',
            maxHeight: isXl ? '600px' : isLg ? '500px' : isMd ? '450px' : isSm ? '400px' : '350px',
            objectFit: 'contain'
          }}
        >
          <source src={image} type='video/mp4' />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={image}
          alt='Certificate media content'
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: isXl ? '600px' : isLg ? '500px' : isMd ? '450px' : isSm ? '400px' : '350px',
            objectFit: 'contain'
          }}
          loading='lazy'
        />
      )}
    </Box>
  )
}

export default CertificateMedia