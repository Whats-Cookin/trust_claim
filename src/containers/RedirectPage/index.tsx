import React, { useEffect, useState } from 'react'
import { Box, Typography, Button, useTheme } from '@mui/material'
import bill from '../../assets/bell.png'
import { Link, useNavigate } from 'react-router-dom'

const Redirection: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [externalLink, setExternalLink] = useState<string>('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const stateParam = urlParams.get('state')
    if (stateParam) {
      try {
        const state = JSON.parse(decodeURIComponent(stateParam))
        if (state?.externalLink) {
          setExternalLink(state.externalLink)
        }
      } catch (error) {
        console.error('Failed to parse state:', error)
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }, [navigate])

  const handleContinue = () => {
    window.location.href = externalLink
  }

  const handleCancel = () => {
    window.close()
  }

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
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <Box
        width='100%'
        maxWidth='700px'
        position='relative'
        sx={{
          bgcolor: theme.palette.menuBackground,
          width: { xs: '90%', sm: '80%' },
          height: { xs: '250px', lg: '350px' }
        }}
      >
        {/* Dashed Circles */}
        <Box
          width='100%'
          height='100%'
          position='absolute'
          overflow='hidden'
          top='0'
          left='0'
          sx={{
            display: { xs: 'none', sm: 'block' }
          }}
        >
          <Box
            width='95px'
            height='95px'
            position='absolute'
            left='-20px'
            top='-30px'
            border='1px dashed'
            borderRadius='50%'
            sx={{
              borderColor: theme.palette.buttons
            }}
          />

          <Box
            width='95px'
            position='absolute'
            height='95px'
            right='-20px'
            top='-30px'
            border='1px dashed'
            borderRadius='50%'
            sx={{
              borderColor: theme.palette.buttons
            }}
          />
        </Box>

        {/* Bill Image */}
        <Box
          position='relative'
          top='-100px'
          left='50%'
          width='fit-content'
          sx={{
            transform: 'translateX(-50%)',
            mb: '-50px',
            '& img': {
              width: {
                xs: '200px',
                lg: '300px'
              }
            }
          }}
        >
          <img src={bill} alt='bill' />
        </Box>

        {/* Content */}
        <Box
          position='relative'
          bottom='20px'
          display='flex'
          sx={{ bgcolor: theme.palette.cardBackground, pt: '1rem' }}
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
            This link is taking you to another site:{' '}
            <Link
              to={externalLink}
              style={{ cursor: 'pointer', color: theme.palette.link, textDecoration: 'none', wordWrap: 'break-word' }}
            >
              {externalLink}
            </Link>
            . Are you sure you want to continue?
          </Typography>
          <Box sx={{ width: '90%', m: '15px', display: 'flex', justifyContent: 'space-between' }}>
            <Button
              sx={{
                fontSize: '1rem',
                fontWeight: '600',
                borderRadius: '50px',
                color: theme.palette.texts,
                backgroundColor: theme.palette.profileButton,
                px: { xs: '1.5rem', lg: '3rem' }
              }}
              onClick={handleCancel}
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
              onClick={handleContinue}
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
