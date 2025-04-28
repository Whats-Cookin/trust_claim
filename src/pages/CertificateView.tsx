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
    // If we have data from navigation state, use it
    if (location.state && location.state.claimData) {
      setData(location.state.claimData)
      setLoading(false)
      return
    }

    // Otherwise fetch the data from the same endpoint as the report page
    const fetchData = async () => {
      try {
        // Use the exact same URL as the report page
        const reportUrl = `${BACKEND_BASE_URL}/api/report/${id}`
        console.log(`Fetching from: ${reportUrl}`)

        const response = await fetch(reportUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!response.ok) {
          console.error('Response not OK:', response.status, response.statusText)
          throw new Error(`Failed to fetch claim: ${response.statusText}`)
        }

        const responseData = await response.json()
        console.log('Received report data:', responseData)

        // Set data directly from the report endpoint
        setData(responseData)
      } catch (err) {
        console.error('Error fetching data:', err)
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

  // Destructure the data
  const claim = data.claim.claim

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Certificate
        curator={claim.curator}
        subject={claim.subject}
        statement={claim.statement}
        effectiveDate={claim.effectiveDate}
        sourceURI={claim.sourceURI}
        validations={data.validations || []}
        claimId={id}
        image={data.claim.image}
        name={data.claim.claimData.name}
      />
    </Box>
  )
}

export default CertificateView
