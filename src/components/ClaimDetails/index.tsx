import React, { useEffect, useState, useCallback } from 'react'
import MainContainer from '../MainContainer'
import { Box, CircularProgress, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { BACKEND_BASE_URL } from '../../utils/settings'
import { camelCaseToSimpleString } from '../../utils/string.utils'

interface Claim {
  statement: string | null
  subject: string
  id: string
  [key: string]: any
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

const ClaimDetails: React.FC = () => {
  const { claimId } = useParams<{ claimId: string }>()
  const [isLoading, setIsLoading] = useState(false)
  const [claimData, setClaimData] = useState<Claim | null>(null)
  const [error, setError] = useState<string>('')
  const [showFullText, setShowFullText] = useState(false)

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
    <Container maxWidth='sm' sx={{ mt: 50 }}>
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
        <Typography sx={{ fontWeight: 'bold', fontSize: 'clamp(10px, 5vw, 28px)' }}>
          {camelCaseToSimpleString(key)}:
        </Typography>
        <Typography
          component='p'
          sx={{
            overflowWrap: 'break-word',
            width: '80%',
            fontSize: 'clamp(10px, 5vw, 26px)'
          }}
        >
          {displayText}
          {console.log(displayText)}
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

  if (isLoading) return renderLoadingState()
  if (error || !claimData) return renderErrorState()

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
      {claimData && Object.entries(claimData).map(([key, value]) => renderClaimDetail(key, value))}
    </MainContainer>
  )
}

export default ClaimDetails
