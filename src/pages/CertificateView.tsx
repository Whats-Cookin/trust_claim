import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/material'
import Certificate from '../components/certificate'
import { BACKEND_BASE_URL } from '../utils/settings'

const CertificateView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchClaimData = async () => {
      try {
        // Fetch the claim details
        const claimResponse = await fetch(`${BACKEND_BASE_URL}/claims/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!claimResponse.ok) {
          if (claimResponse.status === 404) {
            setError('Certificate not found. The requested certificate does not exist.')
            return
          }
          const errorData = await claimResponse.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to fetch claim data')
        }

        const claimData = await claimResponse.json()
        console.log('Fetched claim data:', claimData)

        // Fetch the validations for this claim
        const validationsResponse = await fetch(`${BACKEND_BASE_URL}/validations?claimId=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!validationsResponse.ok) {
          const errorData = await validationsResponse.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to fetch validations')
        }

        const validationsData = await validationsResponse.json()
        console.log('Fetched validations:', validationsData)

        // Structure the data similar to how it's structured in ClaimDetails
        setData({
          claim: claimData,
          validations: validationsData || []
        })
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching the claim data')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchClaimData()
    }
  }, [id])

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
        <Typography>No claim data found</Typography>
      </Box>
    )
  }

  const claim = data.claim.claim;

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
        image={claim.image}
      />
    </Box>
  )
}

export default CertificateView