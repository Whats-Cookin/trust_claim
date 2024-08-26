import { Box, Button, Typography, useTheme } from '@mui/material'
import bill from '../../assets/bell.png'

export default function SignInAlert() {
  const theme = useTheme()

  return (
    <Box
      position='fixed'
      top={0}
      left={0}
      width='100vw'
      height='100vh'
      display='flex'
      justifyContent='center'
      alignItems='center'
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(4px)'
      }}
    >
      <Box
        width='100%'
        maxWidth='500px'
        position='relative'
        sx={{
          bgcolor: theme.palette.menuBackground,
          width: { xs: '90%', sm: '80%' },
          height: { xs: '200px', lg: '350px' }
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
              fontWeight: '700',
              fontSize: '34px'
            }}
          >
            Ooops
          </Typography>

          <Typography
            variant='h5'
            sx={{
              color: theme.palette.texts,
              fontWeight: '500',
              fontSize: '20px'
            }}
          >
            please sign in to create a claim
          </Typography>

          <Button
            sx={{
              position: 'relative',
              bottom: '-25px',
              color: 'white',
              fontSize: { xs: '1rem', lg: '1.5rem' },
              fontWeight: '600',
              borderRadius: '50px',
              backgroundColor: theme.palette.buttons,
              px: { xs: '1.5rem', lg: '3rem' }
            }}
          >
            SIGN IN
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
