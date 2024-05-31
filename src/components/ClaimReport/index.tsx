import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import Link from '@mui/material/Link'
import { Container, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material'
import RenderClaimInfo from './RenderClaimInfo'
import { BACKEND_BASE_URL } from '../../utils/settings'

const DonationReport = () => {
  const { claimId } = useParams()
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const url = BACKEND_BASE_URL + '/api/report/' + claimId

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(url)
        setReportData(response.data)
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
      <Typography variant='h4' gutterBottom color={'white'}>
        Report for{' '}
        <Typography variant='inherit' component='span' color='primary.main'>
          {reportData.data.claim.subject}
        </Typography>
      </Typography>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          {/* Display Claim Information */}
          <RenderClaimInfo claim={reportData.data.claim} />
          <Typography variant='body1'>
            <Typography variant='inherit' component='span' sx={{ color: 'primary.main' }}>
              Link:{' '}
            </Typography>
            <Link href={`https://live.linkedtrust.us/claims/${claimId}`} sx={{ color: '#1976d2' }}>
              https://live.linkedtrust.us/claims/{claimId}
            </Link>
          </Typography>
        </CardContent>
      </Card>
      {/* Placeholder for additional data section */}
      <Typography variant='h6' gutterBottom sx={{ mt: 4 }} color={'white'}>
        Validations:
      </Typography>
      {/* Customize this section with additional information as needed */}
      {reportData.data.validations.length > 0 ? (
        <Grid container spacing={2}>
          {reportData.data.validations.map((attestation: any, index: number) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent color={'white'}>
                  {/* Display Attestation Information */}
                  <RenderClaimInfo claim={attestation} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color={'white'}>No Validations found.</Typography>
      )}
      <Typography variant='h6' gutterBottom sx={{ mt: 2 }} color={'white'}>
        Related Attestations:
      </Typography>
      {reportData.data.attestations.length > 0 ? (
        <Grid container spacing={2}>
          {reportData.data.attestations.map((attestation: any, index: number) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent color={'white'}>
                  {/* Display Attestation Information */}
                  <RenderClaimInfo claim={attestation} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color={'white'}>No independent related attestations found.</Typography>
      )}
    </Container>
  )
}
export default DonationReport
