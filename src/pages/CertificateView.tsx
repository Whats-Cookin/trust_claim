import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/material'
import Certificate from '../components/certificate'
import { BACKEND_BASE_URL } from '../utils/settings'

interface Validation {
  author: string
  statement: string
  date?: string
  confidence?: number
  howKnown?: string
  sourceURI?: string
  image?: string
  mediaUrl?: string
}

interface ClaimData {
  curator: string
  subject: string
  statement?: string
  effectiveDate?: string
  sourceURI?: string
  validations: Validation[]
}

const CertificateView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [claimData, setClaimData] = useState<ClaimData | null>(null)

  useEffect(() => {
    const fetchClaimData = async () => {
      try {
        // First, fetch the claim details
        const claimResponse = await fetch(`${BACKEND_BASE_URL}/claims/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!claimResponse.ok) {
          const errorData = await claimResponse.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to fetch claim data')
        }

        const claimData = await claimResponse.json()
        console.log('Fetched claim data:', claimData)

        // Then, fetch the validations for this claim
        const validationsResponse = await fetch(`${BACKEND_BASE_URL}/validations?claimId=${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (!validationsResponse.ok) {
          const errorData = await validationsResponse.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to fetch validations')
        }

        const validationsData = await validationsResponse.json()
        console.log('Fetched validations:', validationsData)

        // Transform the data to match the Certificate component's expected format
        const transformedData: ClaimData = {
          curator: claimData.curator || claimData.author || 'Unknown Curator',
          subject: claimData.subject || 'Unknown Subject',
          statement: claimData.statement || '',
          effectiveDate: claimData.effectiveDate || new Date().toISOString(),
          sourceURI: claimData.sourceURI || '',
          validations: (validationsData || []).map((validation: any) => ({
            author: validation.author || 'Unknown Author',
            statement: validation.statement || '',
            date: validation.effectiveDate || validation.date,
            confidence: validation.confidence,
            howKnown: validation.howKnown,
            sourceURI: validation.sourceURI,
            image: validation.image,
            mediaUrl: validation.mediaUrl
          }))
        }
        
        console.log('Transformed data:', transformedData)
        setClaimData(transformedData)
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  if (!claimData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>No claim data found</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Certificate
        curator={claimData.curator}
        subject={claimData.subject}
        statement={claimData.statement}
        effectiveDate={claimData.effectiveDate}
        sourceURI={claimData.sourceURI}
        validations={claimData.validations}
      />
    </Box>
  )
}

export default CertificateView 