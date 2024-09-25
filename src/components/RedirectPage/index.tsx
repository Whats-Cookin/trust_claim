import React from 'react'
import { Box, Typography, Button, useTheme } from '@mui/material'
import redirectIcon from '../../assets/images/redirect.svg'
import { Link } from 'react-router-dom'

interface RedirectionProps {
  externalLink: string
  onContinue: () => void
  onCancel: () => void
}

const Redirection: React.FC<RedirectionProps> = ({ externalLink, onContinue, onCancel }) => {
  const theme = useTheme()

  return (
    <Box
      position='fixed'
      zIndex={1160}
      top={0}
      left={0}
      width='100vw'
      height='100vh'
      display='flex'
      justifyContent='center'
      alignItems='center'
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}
    >
      <Box
        width='100%'
        maxWidth='500px'
        position='relative'
        sx={{
          bgcolor: theme.palette.menuBackground,
          width: { xs: '90%', sm: '80%' },
          height: { xs: '250px', lg: '270px' }
        }}
      >
        {/* redirectIcon Image */}
        <Box
          position='relative'
          top='5px'
          left='50%'
          width='fit-content'
          sx={{
            transform: 'translateX(-50%)',
            mb: '-50px',
            '& img': {
              width: '82px'
            }
          }}
        >
          <img src={redirectIcon} alt='redirectIcon' />
        </Box>

        {/* Content */}
        <Box
          position='relative'
          display='flex'
          sx={{ pt: '1rem', bottom: { xs: '-15px', md: '-60px', lg: '-70px' } }}
          flexDirection='column'
          justifyContent='center'
          alignItems='center'
        >
          <Typography
            variant='h5'
            sx={{
              color: theme.palette.texts,
              fontWeight: '500',
              fontSize: '20px',
              m: '10px',
              width: '95%'
            }}
          >
            Would you like to proceed to the external link :{' '}
            <Link to={externalLink} style={{ cursor: 'pointer', color: theme.palette.link, wordWrap: 'break-word' }}>
              {externalLink}
            </Link>
          </Typography>
          <Box sx={{ width: '90%', m: '15px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              sx={{
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '50px',
                color: theme.palette.link,
                textDecoration: 'underline',
                px: { xs: '1.5rem', lg: '3rem' }
              }}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              sx={{
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '50px',
                color: theme.palette.texts,
                backgroundColor: theme.palette.buttons,
                px: { xs: '1.5rem', lg: '3rem' }
              }}
              onClick={onContinue}
            >
              Continue
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Redirection
