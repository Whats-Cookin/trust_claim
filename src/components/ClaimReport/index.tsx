import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import {
  Container,
  Typography,
  Card,
  CircularProgress,
  Box,
  useTheme,
  useMediaQuery,
  Button,
  Stack
} from '@mui/material'
import { BACKEND_BASE_URL } from '../../utils/settings'
import backSvg from '../../assets/images/back.svg'
import ClaimDetails from './ClaimDetails'
import MainContainer from '../MainContainer'

interface Claim {
  statement: string | null
  subject: string
  id: string
  [key: string]: any
}

interface ReportData {
  data: {
    claim: Claim
    validations: Claim[]
    attestations: Claim[]
  }
}

const DonationReport: React.FC = () => {
  const theme = useTheme()
  const { claimId } = useParams<{ claimId: string }>()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null)
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'))

  const url = `${BACKEND_BASE_URL}/api/report/${claimId}`

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(url)
        setReportData(response.data)
      } catch (err) {
        setError('Failed to fetch report data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchReportData()
  }, [claimId])

  if (isLoading) {
    return (
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
  }

  if (error || !reportData) {
    return (
      <Container maxWidth='sm' sx={{ mt: 50 }}>
        <Typography variant='body1' sx={{ color: theme.palette.texts }}>
          {error || 'Report data is not available.'}
        </Typography>
      </Container>
    )
  }

  return (
    <MainContainer>
      <Box
        id='report-container'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          padding: '25px',
          width: '100%'
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
          <Typography
            variant='body1'
            sx={{
              color: theme.palette.texts,
              textAlign: 'center',
              marginLeft: isMediumScreen ? '0' : '1rem'
            }}
          >
            Claim Report
          </Typography>
        </Box>
        <Box sx={{ width: '100%', height: '1px', backgroundColor: theme.palette.divider, mb: '30px' }} />

        <ClaimDetails theme={theme} data={reportData.data} />

        {reportData.data.validations.some((validation: Claim) => validation.statement !== null) && (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
              <Typography
                variant='body1'
                sx={{
                  color: theme.palette.texts,
                  textAlign: 'center',
                  marginLeft: isMediumScreen ? '0' : '1rem'
                }}
              >
                Validations
              </Typography>
            </Box>
            <Box sx={{ width: '100%', height: '1px', backgroundColor: theme.palette.divider, mb: '30px' }} />

            {reportData.data.validations.map(
              (validation: Claim) =>
                validation.statement && (
                  <MyCard
                    key={validation.id}
                    data={validation}
                    img={validation.image}
                    theme={theme}
                    isLargeScreen={isLargeScreen}
                    setSelectedIndex={setSelectedIndex}
                    handleMenuClose={() => setSelectedIndex(null)}
                  />
                )
            )}
          </>
        )}

        {reportData.data.attestations.length > 0 && (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
              <Typography
                variant='body1'
                sx={{
                  color: theme.palette.texts,
                  textAlign: 'center',
                  marginLeft: isMediumScreen ? '0' : '1rem'
                }}
              >
                Related Attestations
              </Typography>
            </Box>
            <Box sx={{ width: '100%', height: '1px', backgroundColor: theme.palette.divider, mb: '30px' }} />

            {reportData.data.attestations.map(
              (attestation: Claim) =>
                attestation.statement && (
                  <MyCard
                    key={attestation.id}
                    data={attestation}
                    img={attestation.image}
                    theme={theme}
                    isLargeScreen={isLargeScreen}
                    setSelectedIndex={setSelectedIndex}
                    handleMenuClose={() => setSelectedIndex(null)}
                  />
                )
            )}
          </>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '15px' }}>
          <Button
            component={Link}
            to='/feed'
            sx={{
              color: theme.palette.link,
              fontWeight: 400,
              borderRadius: '24px',
              fontSize: 'clamp(0.875rem, 2.5vw, 1.1rem)',
              px: '2rem'
            }}
          >
            <img src={backSvg} alt='arrow' style={{ width: '10px', marginRight: '10px' }} />
            BACK
          </Button>
        </Box>
      </Box>
    </MainContainer>
  )
}

function MyCard({
  data,
  img,
  theme,
  setSelectedIndex,
  handleMenuClose,
  isLargeScreen
}: Readonly<{
  data: any
  img: any
  theme: any
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>
  handleMenuClose: () => void
  isLargeScreen: any
}>) {
  console.log(data)
  return (
    <Card
      sx={{
        width: '100%',
        height: 'fit-content',
        borderRadius: '20px',
        backgroundColor: theme.palette.cardBackground,
        backgroundImage: 'none',
        color: theme.palette.texts,
        boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.2)',
        mb: '10px'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            p: '20px'
          }}
        >
          {img && (
            <Box
              sx={{
                width: '300px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flexShrink: 0
              }}
            >
              {img.includes('.mp4') ? (
                <video
                  controls
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                >
                  <source src={img} type='video/mp4' />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={img}
                  alt={data.subject}
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }}
                />
              )}
            </Box>
          )}

          <Box sx={{ flex: 1 }}>
            <Typography
              variant='body2'
              sx={{
                padding: '5px 1 1 5px',
                wordBreak: 'break-word',
                marginBottom: '1px',
                color: theme.palette.claimtext
              }}
            >
              {data.statement}
            </Typography>
            <Stack spacing={2}>
              <Stack direction='row' spacing={2}>
                <Typography variant='body2' sx={{ width: 120 }}>
                  Issued on:
                </Typography>
                <Typography variant='body2' sx={{ marginBottom: '10px', color: theme.palette.text1 }}>
                  {`${new Date(data.effectiveDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}`}
                </Typography>
              </Stack>
              <Stack direction='row' spacing={2}>
                <Typography variant='body2' sx={{ width: 120 }}>
                  Sourse Link:
                </Typography>
                <Typography variant='body2'>{data.source_link}</Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

export default DonationReport
