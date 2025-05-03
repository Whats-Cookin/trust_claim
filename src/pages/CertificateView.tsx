import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/material'
import Certificate from '../components/certificate'
import { BACKEND_BASE_URL } from '../utils/settings'

const CertificateView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const location = useLocation()

  useEffect(() => {
    if (location.state && location.state.claimData) {
      setData(location.state.claimData)
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        let reportUrl = `${BACKEND_BASE_URL}/api/report/${id}`

        console.log(`Fetching certificate data from: ${reportUrl}`)
        const response = await fetch(reportUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) {
          console.error('Response not OK:', response.status, response.statusText)
          throw new Error(`Failed to fetch certificate: ${response.statusText}`)
        }
        const responseData = await response.json()
        console.log('Received certificate data:', responseData)

        setData(responseData.data)
      } catch (err) {
        console.error('Error fetching certificate data:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, location.state])

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <Typography color='error'>{error}</Typography>
      </Box>
    )
  }

  if (!data || !data.claim || !data.claim.claim) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <Typography>No certificate data found. Please try again.</Typography>
      </Box>
    )
  }

  const claim = data.claim.claim

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Certificate
        subject_name={data.claim.claimData?.subject_name || ''}
        issuer_name={data.claim.claimData?.issuer_name || ''}
        subject={claim.subject || ''}
        statement={claim.statement || ''}
        effectiveDate={claim.effectiveDate}
        sourceURI={claim.sourceURI}
        validations={data.validations || []}
        claimId={id}
        image={data.claim.claimData?.image || data.claim.image}
        name={data.claim.claimData?.name || ''}
        claim={data.claim}
      />
    </Box>
  )
}

export default CertificateView
