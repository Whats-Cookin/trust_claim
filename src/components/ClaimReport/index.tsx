import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { Container, Typography, Card, CardContent, Grid, CircularProgress, Box } from '@mui/material'
import RenderClaimInfo from './RenderClaimInfo'
import { BACKEND_BASE_URL } from '../../utils/settings'
import { useTheme, useMediaQuery } from '@mui/material'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

interface Claim {
  statement: string | null
  subject: string
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
        console.log('Fetched report data:', response.data)
      } catch (err) {
        setError('Failed to fetch report data')
        console.error('Error fetching report data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReportData()
  }, [claimId])

  const handleMenuClose = () => {
    setSelectedIndex(null)
  }

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

  const validValidations = reportData.data.validations.filter((validation: Claim) => validation.statement !== null)
  const validAttestations = reportData.data.attestations.filter((attestation: Claim) => attestation.statement !== null)

  const settings = (itemsLength: number) => ({
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    arrows: itemsLength > 1
  })

  return (
    <Container sx={{ marginBlock: '2rem' }}>
      <Box
        id='report-container'
        sx={{
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          mt: '5vh',
          width: isMediumScreen ? '97%' : '95%',
          flexDirection: 'column',
          backgroundColor: theme.palette.menuBackground,
          borderRadius: '20px',
          padding: '20px'
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '40px' }}>
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
            Claim Report
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
            minHeight: '200px',
            width: '100%',
            borderRadius: '20px',
            backgroundColor: theme.palette.cardBackground,
            backgroundImage: 'none',
            color: theme.palette.texts,
            marginBottom: '2rem'
          }}
        >
          <CardContent>
            <RenderClaimInfo
              claim={reportData.data.claim}
              index={-1}
              setSelectedIndex={setSelectedIndex}
              handleMenuClose={handleMenuClose}
            />
          </CardContent>
        </Card>
        <Grid container spacing={isLargeScreen ? 4 : 2}>
          <Grid item xs={12} md={6}>
            {validValidations.length > 0 && (
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  justifyContent: 'left',
                  mb: '40px'
                }}
              >
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
                  Validations
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
            )}
            {validValidations.length > 0 && (
              <Card
                sx={{
                  borderRadius: '20px',
                  backgroundColor: theme.palette.cardBackground,
                  backgroundImage: 'none',
                  color: theme.palette.texts,
                  marginBottom: '1rem',
                  overflow: 'visible'
                }}
              >
                <CardContent>
                  <Slider {...settings(validValidations.length)}>
                    {validValidations.map((validation: Claim, index: number) => (
                      <Box key={index} sx={{ height: '100%' }}>
                        <RenderClaimInfo
                          claim={validation}
                          index={index}
                          setSelectedIndex={setSelectedIndex}
                          handleMenuClose={handleMenuClose}
                        />
                      </Box>
                    ))}
                  </Slider>
                </CardContent>
              </Card>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            {validAttestations.length > 0 && (
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  justifyContent: 'left',
                  mb: '40px'
                }}
              >
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
                  Related Attestations
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
            )}
            {validAttestations.length > 0 && (
              <Card
                sx={{
                  borderRadius: '20px',
                  backgroundColor: theme.palette.cardBackground,
                  backgroundImage: 'none',
                  color: theme.palette.texts,
                  marginBottom: '1rem',
                  overflow: 'visible'
                }}
              >
                <CardContent>
                  <Slider {...settings(validAttestations.length)}>
                    {validAttestations.map((attestation: Claim, index: number) => (
                      <Box key={index} sx={{ height: '100%', minHeight: '200px' }}>
                        <RenderClaimInfo
                          claim={attestation}
                          index={index + validValidations.length}
                          setSelectedIndex={setSelectedIndex}
                          handleMenuClose={handleMenuClose}
                        />
                      </Box>
                    ))}
                  </Slider>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default DonationReport
