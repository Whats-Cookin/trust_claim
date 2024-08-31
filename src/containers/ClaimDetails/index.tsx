import React, { useEffect, useState, useCallback } from 'react'
import MainContainer from '../../components/MainContainer'
import { Box, Button, Card, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { BACKEND_BASE_URL } from '../../utils/settings'
import imageSvg from '../../assets/images/imgplaceholder.svg'
import imageSvgDark from '../../assets/images/imgplaceholderdark.svg'
import arrow from '../../assets/images/arrow.svg'
import arrowDark from '../../assets/images/arrowdark.svg'
import circle from '../../assets/images/circle.svg'
import dottedCircle from '../../assets/images/dotttedCircle.svg'
import RenderClaimDetails from './RenderClaimDetails'
import LoadingState from './LoadingState'
import ErrorState from './ErrorState'

interface Claim {
  statement: string | null
  subject: string
  id: string
  [key: string]: any
}

interface IHomeProps {
  isDarkMode: boolean
}

const ClaimDetails: React.FC<IHomeProps> = ({ isDarkMode }) => {
  const { claimId } = useParams<{ claimId: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [claimData, setClaimData] = useState<Claim | null>(null)
  const [error, setError] = useState<string>('')
  const claimImage = claimData?.image ?? null

  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))

  const fetchReportData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/api/claim/${claimId}`)
      setClaimData(response.data)
    } catch (err) {
      setError('Failed to fetch report data')
      console.error('Error fetching report data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [claimId])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  if (error || (!claimData && !isLoading)) return <ErrorState error={error} theme={theme} />
  if (isLoading) return <LoadingState />

  const handleBackButton = () => {
    window.history.back()
  }

  return (
    <MainContainer>
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
        <Typography
          variant='h6'
          component='div'
          sx={{
            color: theme.palette.texts,
            textAlign: 'center',
            marginLeft: isMediumScreen ? '0' : '1rem',
            fontSize: '23px',
            fontWeight: 'bold'
          }}
        >
          Claim Details
          <Box
            sx={{
              height: '4px',
              backgroundColor: theme.palette.maintext,
              marginTop: '4px',
              borderRadius: '2px',
              width: '80%'
            }}
          />
        </Typography>
      </Box>
      <Card
        sx={{
          maxWidth: 'fit',
          height: 'fit',
          borderRadius: '20px',
          display: isMediumScreen ? 'column' : 'row',
          backgroundColor: theme.palette.cardBackground,
          backgroundImage: 'none',
          color: theme.palette.texts
        }}
      >
        <Box
          sx={{
            border: '20px ',
            borderRadius: '20px',
            height: '364px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.palette.pageBackground,
            textWrap: 'wrap',
            marginY: '45px',
            marginX: { lg: '150px', md: '90px', sm: '90px', xs: '45px' }
          }}
        >
          <img
            src={claimImage || (isDarkMode ? imageSvgDark : imageSvg)}
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            alt='claim'
          />
        </Box>
        <Box
          sx={{
            width: { lg: '98%', md: '98%', sm: '98%', xs: '95%' },
            height: 376,
            m: '10px',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '15px'
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.pageBackground,
              borderRadius: '10px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.menuBackground,
              borderRadius: '10px'
            }
          }}
        >
          {claimData && <RenderClaimDetails claimData={claimData} theme={theme} />}
        </Box>
      </Card>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '15px', mb: '35px' }}>
        <Button
          variant='contained'
          onClick={handleBackButton}
          sx={{
            justifyContent: 'left',
            backgroundColor: '#4C726F',
            color: '#F2FAF9',
            borderRadius: '91px',
            fontWeight: '700',
            fontSize: isMediumScreen ? '12px' : '18px',
            width: '14vw',
            mb: '-35px',
            maxWidth: '192px',
            minWidth: '132px',
            fontFamily: 'Montserrat',
            textTransform: 'none',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              right: '11px',
              width: { lg: '36px', md: '30px', sm: '30px', xs: '30px' },
              height: { lg: '36px', md: '30px', sm: '30px', xs: '30px' },
              backgroundImage: `url(${dottedCircle})`,
              backgroundSize: 'cover',
              zIndex: 1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              right: '14px',
              width: { lg: '50px', md: '40px', sm: '36px', xs: '36px' },
              height: '28px',
              backgroundImage: `url(${arrow})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 1,
              transition: 'background-image 0.3s ease-in-out'
            },
            '&:hover::before': {
              backgroundImage: `url(${circle})`
            },
            '&:hover::after': {
              backgroundImage: `url(${isDarkMode ? arrow : arrowDark})`
            },
            '&:hover': {
              backgroundColor: `${isDarkMode ? '#0A1C1D' : '#F2FAF9'}`,
              color: `${isDarkMode ? '#F2FAF9' : '#0A1C1D'}`
            }
          }}
        >
          BACK
        </Button>
      </Box>
    </MainContainer>
  )
}

export default ClaimDetails
