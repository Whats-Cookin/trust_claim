import React from 'react'
import { Box, Typography, Tooltip } from '@mui/material'
import { Link } from 'react-router-dom'

import fireIcon from '../../assets/images/fire.svg'
import medalIcon from '../../assets/images/medal.svg'
import cupIcon from '../../assets/images/cup.svg'
import arrowsIcon from '../../assets/images/arrows.svg'

const RightSidebar: React.FC = () => {
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  // Placeholder filter function
  const handlePlaceholderFilter = (filterType: string) => {
    console.log(`Filter function for "${filterType}" is under development.`)
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '25%',
        minWidth: '285px',
        maxWidth: '375px',
        zIndex: 106,
        color: '#212529',
        marginTop: !isAuthPage ? `calc(clamp(50px, 6.146vw, 118px) + 56px)` : '0',
        textWrap: 'nowrap',
        display: {
          xs: 'none',
          sm: 'none',
          md: 'none',
          lg: 'block'
        }
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: 220,
          position: 'relative',
          bgcolor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '8px 0px 0px 8px',
          boxShadow: '0 2px 14px 0 rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Trending Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            width: 196,
            height: 22,
            mt: '30px',
            ml: '30px'
          }}
        >
          <Box component='img' src={fireIcon} alt='Trending' sx={{ width: 20, height: 20 }} />
          <Typography
            variant='h6'
            sx={{
              fontFamily: 'Montserrat',
              fontSize: 18,
              fontWeight: 700,
              lineHeight: '22px',
              color: '#212529'
            }}
          >
            Trending Section
          </Typography>
        </Box>

        {/* Most Validated Credentials */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            width: 250,
            height: 20,
            mt: '31px',
            ml: '30px'
          }}
        >
          <Box component='img' src={medalIcon} alt='Credentials Icon' sx={{ width: 18, height: 18 }} />
          <Tooltip title='</> &nbsp; under developing'>
            <Typography
              sx={{
                fontFamily: 'Montserrat',
                fontSize: '16px !important',
                fontWeight: 400,
                lineHeight: '20px',
                textDecoration: 'underline',
                color: '#2d6a4f',
                cursor: 'pointer'
              }}
              onClick={() => handlePlaceholderFilter('Most Validated Credentials')}
            >
              Most Validated Credentials
            </Typography>
          </Tooltip>
        </Box>

        {/* Most Validated Claims */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            width: 213,
            height: 20,
            mt: '18px',
            ml: '30px'
          }}
        >
          <Box component='img' src={cupIcon} alt='Claims Icon' sx={{ width: 18, height: 18 }} />
          <Tooltip title='</> &nbsp; under developing'>
            <Typography
              sx={{
                fontFamily: 'Montserrat',
                fontSize: '16px !important',
                fontWeight: 500,
                lineHeight: '20px',
                textDecoration: 'underline',
                color: '#2d6a4f',
                cursor: 'pointer'
              }}
              onClick={() => handlePlaceholderFilter('Most Validated Claims')}
            >
              Most Validated Claims
            </Typography>
          </Tooltip>
        </Box>

        {/* Recent Activity */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            width: 155,
            height: 20,
            mt: '18px',
            ml: '30px'
          }}
        >
          <Box component='img' src={arrowsIcon} alt='Activity Icon' sx={{ width: 18, height: 18 }} />
          <Tooltip title='</> &nbsp; under developing'>
            <Typography
              sx={{
                fontFamily: 'Montserrat',
                fontSize: '16px !important',
                fontWeight: 500,
                lineHeight: '20px',
                textDecoration: 'underline',
                color: '#2d6a4f',
                cursor: 'pointer'
              }}
              onClick={() => handlePlaceholderFilter('Recent Activity')}
            >
              Recent Activity
            </Typography>
          </Tooltip>
        </Box>
      </Box>

      {/* Footer Links & Copyright */}
      <Typography
        sx={{
          position: 'relative',
          mt: '30px',
          ml: 'auto',
          mr: 'auto',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: '#212529 !important',
          fontFamily: 'Roboto',
          fontSize: '16px !important',
          fontWeight: 400,
          lineHeight: '19px'
        }}
      >
        <Link to='/terms' style={{ textDecoration: 'none', color: '#212529', marginRight: '5px' }}>
          Terms of Service
        </Link>{' '}
        <Link to='/privacy' style={{ textDecoration: 'none', color: '#212529', marginLeft: '5px' }}>
          Privacy Policy
        </Link>
        <br />© {new Date().getFullYear()}{' '}
        <a
          href='https://linkedtrust.us'
          target='_blank'
          rel='noopener noreferrer'
          style={{ textDecoration: 'none', color: '#212529' }}
        >
          LinkedTrust
        </a>{' '}
        {''}.
      </Typography>
    </Box>
  )
}

export default RightSidebar
