import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import Link from '@mui/material/Link'
import { Container, Typography, Card, CardContent, Grid, CircularProgress } from '@mui/material'
import { renderClaimInfo } from './ReenderClaimInfo'
import { ceramic } from '../../composedb'
import { BACKEND_BASE_URL, CERAMIC_URL } from '../../utils/settings'

const DonationReport = () => {
  const { claimId } = useParams()
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const url = BACKEND_BASE_URL + '/api/report/' + claimId

  useEffect(() => {
    const fetchReportData = async () => {
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
      <Typography variant='h4' gutterBottom>
        Report for{' '}
        <Typography variant='inherit' component='span' color='primary.main'>
          {reportData.data.claim.subject}
        </Typography>
      </Typography>
      <Card sx={{ mb: 2, border: 'solid 2px #008a7cdc' }}>
        <CardContent>
          {/* Display Claim Information */}
          <>{renderClaimInfo(reportData.data.claim)}</>
          <Typography variant='body1'>
            <Typography variant='inherit' component='span' sx={{ color: 'primary.main' }}>
              Link:{' '}
            </Typography>
            <Link href={`https://linkedtrust.us/claims/${claimId}`} sx={{ color: '#1976d2' }}>
              https://linkedtrust.us/claims/{claimId}
            </Link>
          </Typography>
        </CardContent>
      </Card>
      {/* Placeholder for additional data section */}
      <Typography variant='h6' gutterBottom sx={{ mt: 4 }}>
        Validations:
      </Typography>
      {/* Customize this section with additional information as needed */}
      {reportData.data.validations.length > 0 ? (
        <Grid container spacing={2}>
          {reportData.data.validations.map((attestation: any, index: number) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  {/* Display Attestation Information */}
                  {renderClaimInfo(attestation)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No Validations found.</Typography>
      )}
      <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
        Attestations:
      </Typography>
      {reportData.data.attestations.length > 0 ? (
        <Grid container spacing={2}>
          {reportData.data.attestations.map((attestation: any, index: number) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  {/* Display Attestation Information */}
                  {renderClaimInfo(attestation)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography>No attestaions found.</Typography>
      )}
    </Container>
  )
}
export default DonationReport
