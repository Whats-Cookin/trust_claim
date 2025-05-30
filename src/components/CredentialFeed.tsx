import React, { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Alert, ToggleButton, ToggleButtonGroup, Container } from '@mui/material'
import ViewListIcon from '@mui/icons-material/ViewList'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import { CredentialCard } from './CredentialCard'
import * as api from '../api'

interface CredentialFeedProps {
  subjectUri?: string
  limit?: number
}

export const CredentialFeed: React.FC<CredentialFeedProps> = ({ subjectUri, limit = 20 }) => {
  const [credentials, setCredentials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')

  useEffect(() => {
    fetchCredentials()
  }, [subjectUri])

  const fetchCredentials = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch claims based on subject or general feed
      let claims
      if (subjectUri) {
        const response = await api.getClaimsBySubject(subjectUri)
        claims = response.data.claims
      } else {
        const response = await api.getFeed()
        claims = response.data.entries // FeedResponse has entries, not claims
      }

      // Filter for credential claims and fetch credential details
      const credentialClaims = claims.filter(
        (claim: any) =>
          claim.claim === 'HAS' && (claim.object?.includes('credential') || claim.object?.startsWith('urn:credential:'))
      )

      // Fetch actual credential data for each claim
      const credentialPromises = credentialClaims.slice(0, limit).map(async (claim: any) => {
        try {
          const credResponse = await api.getCredential(claim.object)
          return credResponse.data.credential
        } catch (err) {
          console.error(`Failed to fetch credential ${claim.object}:`, err)
          return null
        }
      })

      const fetchedCredentials = await Promise.all(credentialPromises)
      setCredentials(fetchedCredentials.filter(Boolean))
    } catch (err) {
      console.error('Error fetching credentials:', err)
      setError('Failed to load credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: 'list' | 'grid' | null) => {
    if (newMode !== null) {
      setViewMode(newMode)
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  if (credentials.length === 0) {
    return (
      <Box textAlign='center' p={4}>
        <Typography variant='h6' color='text.secondary'>
          No credentials found
        </Typography>
      </Box>
    )
  }

  return (
    <Container maxWidth='lg'>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          mt: 2
        }}
      >
        <Typography variant='h5' fontWeight={600}>
          Credentials
        </Typography>
        <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewModeChange} size='small'>
          <ToggleButton value='list'>
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton value='grid'>
            <ViewModuleIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Credential List/Grid */}
      <Box
        sx={{
          display: viewMode === 'grid' ? 'grid' : 'block',
          gridTemplateColumns: viewMode === 'grid' ? { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } : '1fr',
          gap: viewMode === 'grid' ? 2 : 0
        }}
      >
        {credentials.map((credential, index) => (
          <CredentialCard key={credential.id || index} credential={credential} compact={viewMode === 'list'} />
        ))}
      </Box>
    </Container>
  )
}
