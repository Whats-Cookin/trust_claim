import { useTheme } from '@mui/material/styles'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import Link from '@mui/material/Link'
import { Container, Typography, Card, CardContent, Grid, CircularProgress, Box } from '@mui/material'
import RenderClaimInfo from './RenderClaimInfo'
import { BACKEND_BASE_URL } from '../../utils/settings'
import ExportComponent from './ExportComponent'

interface Claim {
  subject: string
  [key: string]: any
}

interface ReportData {
  claim: Claim
  validations: Claim[]
  attestations: Claim[]
}

const DonationReport: React.FC = () => {
  const theme = useTheme()
  const { claimId } = useParams<{ claimId: string }>()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const url = `${BACKEND_BASE_URL}/api/report/${claimId}`

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(url)
        setReportData(response.data.data)
        console.log(response.data)
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
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Container>
    )
  }

  if (error || !reportData) {
    return (
      <Container maxWidth='sm' sx={{ mt: 50 }}>
        <Typography variant='body1' color='error'>
          {error || 'Report data is not available.'}
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth='md' sx={{ marginBlock: '8rem 3rem' }}>
      <ExportComponent elementId='report-container' />
      <Box id='report-container'>
        <Typography variant='h4' gutterBottom color={theme.palette.texts}>
        Report for{' '}
        <Typography variant='inherit' component='span' color={theme.palette.maintext}>
            {reportData.claim.subject}
          </Typography>
        </Typography>
        <Card sx={{ mb: 2, border: `solid 2px ${theme.palette.divider}` }}>
          <CardContent>
            {/* Display Claim Information */}
            <RenderClaimInfo claim={reportData.claim} />
            <Typography variant='body1'>
            <Typography variant='inherit' component='span' sx={{ color: theme.palette.maintext }}>
                Link:{' '}
              </Typography>
            <Link href={`https://live.linkedtrust.us/claims/${claimId}`} sx={{ color: theme.palette.link }}>
                https://live.linkedtrust.us/claims/{claimId}
              </Link>
            </Typography>
          </CardContent>
        </Card>
        {/* Placeholder for additional data section */}
        <Typography variant='h6' gutterBottom sx={{ mt: 4 }} color={theme.palette.texts}>
          Validations:
        </Typography>
        {/* Customize this section with additional information as needed */}
        {reportData.data.validations.length > 0 ? (
        <Grid container spacing={2}>
          {reportData.data.validations.map((attestation: any, index: number) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent sx={{ color: theme.palette.texts }}>
                    {/* Display Attestation Information */}
                    <RenderClaimInfo claim={attestation} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color={theme.palette.texts}>No Validations found.</Typography>
        )}
        <Typography variant='h6' gutterBottom sx={{ mt: 2 }} color={theme.palette.texts}>
          Related Attestations:
        </Typography>
        {reportData.attestations.length > 0 ? (
          <Grid container spacing={2}>
            {reportData.attestations.map((attestation: Claim, index: number) => (
              <Grid item xs={12} key={index}>
                <Card sx={{ mb: 2, border: `solid 2px ${theme.palette.divider}` }}>
                  <CardContent>
                    {/* Display Attestation Information */}
                    <RenderClaimInfo claim={attestation} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color={theme.palette.texts}>No independent related attestations found.</Typography>
        )}
      </Box>
    </Container>
  )
}

export default DonationReport
