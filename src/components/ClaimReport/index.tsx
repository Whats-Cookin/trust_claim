import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { styled, useTheme } from '@mui/material/styles'
import { Container, Typography, Card, CardContent, Grid, CircularProgress, Box } from '@mui/material'
import RenderClaimInfo from './RenderClaimInfo'
import { BACKEND_BASE_URL } from '../../utils/settings'

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

  const Ribbon = styled(Box)(() => ({
    position: 'relative',
    display: 'block',
    backgroundColor: theme.palette.smallButton,
    width: 'fit-content',
    marginInline: 'auto',
    marginBlock: '2rem',
    color: theme.palette.buttontext,
    padding: '0.3rem 2rem',
    textAlign: 'center',
    fontSize: '1rem',
    fontWeight: 'bold',
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      border: '1rem solid transparent',
      zIndex: 1
    },
    '&::before': {
      right: 0,
      borderRightColor: theme.palette.pageBackground
    },
    '&::after': {
      left: 0,
      borderLeftColor: theme.palette.pageBackground
    }
  }))

  const validValidations = reportData.data.validations.filter((validation: Claim) => validation.statement !== null)
  const validAttestations = reportData.data.attestations.filter((attestation: Claim) => attestation.statement !== null)

  return (
    <Container maxWidth='md' sx={{ marginBlock: '8rem 3rem' }}>
      <ExportComponent elementId='report-container' />
      <Box id='report-container'>
        <Card
          sx={{
            maxWidth: 'fit',
            height: 'fit',
            mt: '15px',
            borderRadius: '20px',
            backgroundColor: selectedIndex === -1 ? theme.palette.cardBackgroundBlur : theme.palette.cardBackground,
            backgroundImage: 'none',
            filter: selectedIndex === -1 ? 'blur(0.8px)' : 'none',
            color: theme.palette.texts
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
        {validValidations.length > 0 && (
          <>
            <Ribbon>Validations</Ribbon>
            <Grid container spacing={2}>
              {validValidations.map((validation: Claim, index: number) => (
                <Grid item xs={12} key={index}>
                  <Card
                    sx={{
                      maxWidth: 'fit',
                      height: 'fit',
                      mt: '15px',
                      borderRadius: '20px',
                      backgroundColor:
                        selectedIndex === index ? theme.palette.cardBackgroundBlur : theme.palette.cardBackground,
                      backgroundImage: 'none',
                      filter: selectedIndex === index ? 'blur(0.8px)' : 'none',
                      color: theme.palette.texts
                    }}
                  >
                    <CardContent sx={{ color: theme.palette.texts }}>
                      <RenderClaimInfo
                        claim={validation}
                        index={index}
                        setSelectedIndex={setSelectedIndex}
                        handleMenuClose={handleMenuClose}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {validAttestations.length > 0 && (
          <>
            <Ribbon>Related Attestations</Ribbon>
            <Grid container spacing={2}>
              {validAttestations.map((attestation: Claim, index: number) => (
                <Grid item xs={12} key={index}>
                  <Card
                    sx={{
                      maxWidth: 'fit',
                      height: 'fit',
                      mt: '15px',
                      borderRadius: '20px',
                      backgroundColor:
                        selectedIndex === index + validValidations.length
                          ? theme.palette.cardBackgroundBlur
                          : theme.palette.cardBackground,
                      backgroundImage: 'none',
                      filter: selectedIndex === index + validValidations.length ? 'blur(0.8px)' : 'none',
                      color: theme.palette.texts
                    }}
                  >
                    <CardContent sx={{ color: theme.palette.texts }}>
                      <RenderClaimInfo
                        claim={attestation}
                        index={index + validValidations.length}
                        setSelectedIndex={setSelectedIndex}
                        handleMenuClose={handleMenuClose}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Box>
    </Container>
  )
}

export default DonationReport
