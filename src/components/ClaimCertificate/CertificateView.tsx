import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/material'
import Certificate from '.'
import { BACKEND_BASE_URL } from '../../utils/settings'

const CertificateView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const location = useLocation()

  useEffect(() => {
    if (location.state && (location.state as any).claimData) {
      setData((location.state as any).claimData)
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        // Try new API endpoint first
        let reportUrl = `${BACKEND_BASE_URL}/api/reports/claim/${id}`

        console.log(`Fetching certificate data from: ${reportUrl}`)
        let response = await fetch(reportUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        // If new endpoint fails, try old endpoint for backward compatibility
        if (!response.ok && response.status === 404) {
          console.log('New endpoint failed, trying old endpoint...')
          reportUrl = `${BACKEND_BASE_URL}/api/report/${id}`
          console.log(`Fetching certificate data from: ${reportUrl}`)
          response = await fetch(reportUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
        }

        if (!response.ok) {
          console.error('Response not OK:', response.status, response.statusText)
          throw new Error(`Failed to fetch certificate: ${response.statusText}`)
        }
        const responseData = await response.json()
        console.log('Received certificate data:', responseData)

        // Handle both old and new API response formats
        const certificateData = responseData.data || responseData
        setData(certificateData)
      } catch (err) {
        console.error('Error fetching certificate data:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, location.state])

  // Credentials issued with a certify template have a dedicated presentation
  // page — redirect there instead of rendering the generic certificate.
  useEffect(() => {
    const c = data?.claim
    if (!c || c.claim !== 'HAS' || typeof c.object !== 'string' || !c.object.startsWith('urn:uuid:')) return
    fetch(`${BACKEND_BASE_URL}/api/credentials/${encodeURIComponent(c.object)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(res => {
        if (res?.credential?.sameAs?.templateId) {
          window.location.replace(`/certs/cert/${c.object.slice('urn:uuid:'.length)}`)
        }
      })
      .catch(() => {})
  }, [data])

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

  if (!data || !data.claim) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='100vh'>
        <Typography>No certificate data found. Please try again.</Typography>
      </Box>
    )
  }

  const claim = data.claim

  // Backend provides subjectNode directly with the correct name
  const personName = data.subjectNode?.name || ''

  // Find issuer from edges - the source edge endNode is the issuer
  const sourceEdge = data.claim?.edges?.find((e: any) => e.label === 'source')
  const issuerName = sourceEdge?.endNode?.name || ''

  // Separate videos from images
  const allMedia = data.images || []
  const videos = allMedia.filter(
    (m: any) => m.metadata?.type === 'video' || m.url?.includes('.webm') || m.url?.includes('.mp4')
  )
  const images = allMedia.filter(
    (m: any) =>
      !m.metadata?.type || m.metadata?.type === 'image' || (!m.url?.includes('.webm') && !m.url?.includes('.mp4'))
  )

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, maxWidth: '100%', width: '100%', boxSizing: 'border-box', mx: 'auto' }}>
      <Certificate
        subject={claim.subject || ''} // keep the URL as-is (string)
        subject_name={personName} // Use subject node name
        issuer_name={issuerName} // Use source node name
        subjectType={data.subjectNode?.entType} // Pass node type for certificate inference
        statement={claim.statement || ''}
        effectiveDate={claim.effectiveDate}
        sourceURI={claim.sourceURI}
        validations={data.validations || []}
        claimId={id}
        image={(images && images[0]) || claim.image}
        videos={videos}
        name={data.claim?.claimData?.name || ''}
        claim={data.claim}
      />
    </Box>
  )
}

export default CertificateView
