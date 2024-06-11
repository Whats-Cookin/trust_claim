import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
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
        style={{
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
        <Typography variant='body1' color='error'>
          {error || 'Report data is not available.'}
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth='md' sx={{ marginBlock: '8rem 3rem' }}>
      <Typography
        variant='h6'
        gutterBottom
        color='ffffff'
        style={{
          textAlign: 'center',
          fontWeight: 600,
          borderBottom: '3px solid #008a7cdc',
          marginInline: 'auto',
          width: 'fit-content',
          marginBottom: '2rem'
        }}
      >
        Report
      </Typography>
      <Card sx={{ mb: 2 }} style={{ backgroundColor: '#4C726F33' }}>
        <CardContent>
          <RenderClaimInfo claim={reportData.data.claim} />
        </CardContent>
      </Card>
      {/* Customize this section with additional information as needed */}
      {reportData.data.validations.length > 0 && (
        <>
          <Ribbon>Validations</Ribbon>
          <Grid container spacing={2}>
            {reportData.data.validations.map((attestation: any, index: number) => (
              <Grid item xs={12} key={index}>
                <Card style={{ backgroundColor: '#4C726F33' }}>
                  <CardContent color='ffffff'>
                    {/* Display Attestation Information */}
                    <RenderClaimInfo claim={attestation} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {reportData.data.attestations.length > 0 && (
        <>
          <Ribbon>Related Attestations</Ribbon>
          <Grid container spacing={2}>
            {reportData.data.attestations.map((attestation: any, index: number) => (
              <Grid item xs={12} key={index}>
                <Card style={{ backgroundColor: '#4C726F33' }}>
                  <CardContent color='ffffff'>
                    {/* Display Attestation Information */}
                    <RenderClaimInfo claim={attestation} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  )
}
export default DonationReport

const Ribbon = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'block',
  backgroundColor: '#4C726F33',
  width: 'fit-content',
  marginInline: 'auto',
  marginBlock: '2rem',
  color: 'ffffff',
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
