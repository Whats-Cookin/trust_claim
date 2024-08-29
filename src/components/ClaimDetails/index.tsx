import React, { useEffect, useState, useCallback } from 'react'
import MainContainer from '../MainContainer'
import { Box, Button, Card, CircularProgress, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { BACKEND_BASE_URL } from '../../utils/settings'
import { camelCaseToSimpleString } from '../../utils/string.utils'
import imageSvg from '../../assets/images/imgplaceholder.svg'
import imageSvgDark from '../../assets/images/imgplaceholderdark.svg'
import arrow from '../../assets/images/arrow.svg'
import arrowDark from '../../assets/images/arrowdark.svg'
import circle from '../../assets/images/circle.svg'
import dottedCircle from '../../assets/images/dotttedCircle.svg'

interface Claim {
  statement: string | null
  subject: string
  id: string
  [key: string]: any
}

interface IHomeProps {
  isDarkMode: boolean
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

const EXCLUDED_FIELDS = ['id', 'userId', 'issuerId', 'issuerIdType', 'createdAt', 'lastUpdatedAt']

const ClaimDetails: React.FC<IHomeProps> = ({ isDarkMode }) => {
  const { claimId } = useParams<{ claimId: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [claimData, setClaimData] = useState<Claim | null>(null)
  const [error, setError] = useState<string>('')
  const [showFullText, setShowFullText] = useState(false)
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

  const renderLoadingState = () => (
    <Container
      maxWidth='sm'
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}
    >
      <CircularProgress />
    </Container>
  )

  const renderErrorState = () => (
    <Container maxWidth='sm' sx={{ textAlign: 'center' }}>
      <Typography variant='body1' sx={{ color: theme.palette.texts }}>
        {error || 'Report data is not available.'}
      </Typography>
    </Container>
  )

  const renderClaimDetail = (key: string, value: any) => {
    if (EXCLUDED_FIELDS.includes(key) || value == null || value === '') return null
    if (key === 'effectiveDate') value = formatDate(value) // Format the date

    const displayText = key === 'statement' && !showFullText ? truncateText(value, 60) : value

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          padding: '5px 10px',
          flexGrow: 1
        }}
        key={key}
      >
        <Typography sx={{ fontSize: 'clamp(10px, 5vw, 28px)' }}>{camelCaseToSimpleString(key)}:</Typography>
        <Typography
          component='p'
          sx={{
            overflowWrap: 'break-word',
            width: '80%',
            fontSize: 'clamp(10px, 5vw, 26px)'
          }}
        >
          {displayText}
          {key === 'statement' && value.length > 60 && (
            <Typography
              component='span'
              onClick={() => setShowFullText(!showFullText)}
              sx={{ color: theme.palette.maintext, cursor: 'pointer', fontSize: 'clamp(10px, 5vw, 26px)' }}
            >
              {showFullText ? ' See less' : ' See more'}
            </Typography>
          )}
        </Typography>
      </Box>
    )
  }

  if (error || (!claimData && !isLoading)) return renderErrorState()
  if (isLoading) return renderLoadingState()

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
          {claimData && Object.entries(claimData).map(([key, value]) => renderClaimDetail(key, value))}
        </Box>
      </Card>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: '15px', mb: '35px' }}>
        <Button
          variant='contained'
          onClick={handleBackButton}
          sx={{
            justifyContent: 'left',
            backgroundColor: theme.palette.pageBackground,
            color: theme.palette.texts,
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
              backgroundImage: `url(${circle})`,
              backgroundSize: 'cover',
              zIndex: 1
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              right: '14px',
              width: { lg: '50px', md: '40px', sm: '36px', xs: '36px' },
              height: '28px',
              backgroundImage: `url(${isDarkMode ? arrowDark : arrow})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 1,
              transition: 'background-image 0.3s ease-in-out'
            },
            '&:hover::before': {
              backgroundImage: `url(${dottedCircle})`
            },
            '&:hover': {
              backgroundColor: theme.palette.smallButton
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
