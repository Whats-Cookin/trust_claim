import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Paper
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import VerifiedIcon from '@mui/icons-material/Verified'
import SchoolIcon from '@mui/icons-material/School'
import WorkIcon from '@mui/icons-material/Work'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import StarIcon from '@mui/icons-material/Star'
import { getCredential, createClaim } from '../../api'
import { checkAuth } from '../../utils/authUtils'
import MainContainer from '../../components/MainContainer'
import { generateCredentialStatement, getClaimDescription } from '../../lib/credentialStatements'

export const ClaimCredential: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const theme = useTheme()

  const credentialUri = searchParams.get('uri')
  const credentialSchema = searchParams.get('schema')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [credential, setCredential] = useState<any>(null)
  const [statement, setStatement] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Check authentication and handle redirect
  useEffect(() => {
    if (!checkAuth()) {
      // Store the intended destination
      const redirectUrl = `/claim-credential?uri=${encodeURIComponent(credentialUri || '')}${
        credentialSchema ? `&schema=${encodeURIComponent(credentialSchema)}` : ''
      }`
      navigate(`/login`, { state: { from: redirectUrl } })
    }
  }, [navigate, credentialUri, credentialSchema])

  // Fetch credential details
  useEffect(() => {
    if (!credentialUri) {
      setError('No credential URI provided')
      setLoading(false)
      return
    }

    const fetchCredential = async () => {
      try {
        const response = await getCredential(credentialUri)
        setCredential(response.data.credential)
        // Use schema from URL or detect from credential
        const schema = credentialSchema || response.data.credential.credentialSchema
        setStatement(generateCredentialStatement(response.data.credential, schema))
        setLoading(false)
      } catch (err) {
        console.error('Error fetching credential:', err)
        setError('Failed to load credential details')
        setLoading(false)
      }
    }

    fetchCredential()
  }, [credentialUri])

  // Get achievement type icon and color
  const getAchievementStyle = () => {
    if (!credential) return { icon: <EmojiEventsIcon />, color: '#2D6A4F', bgColor: '#cce6ff' }

    const achievement = credential.credentialSubject?.achievement?.[0] || credential.credentialSubject?.achievement
    const type = achievement?.type?.[0] || credential.credentialSchema || ''

    if (type.includes('Education') || type.includes('education')) {
      return { icon: <SchoolIcon />, color: '#c1467b', bgColor: '#ffd4e5' }
    }
    if (type.includes('Professional') || type.includes('professional')) {
      return { icon: <WorkIcon />, color: '#4676c1', bgColor: '#d4e5ff' }
    }
    if (type.includes('OpenBadges') || type.includes('achievement')) {
      return { icon: <StarIcon />, color: '#6b46c1', bgColor: '#e3d4ff' }
    }
    return { icon: <EmojiEventsIcon />, color: '#2D6A4F', bgColor: '#cce6ff' }
  }

  const handleClaim = async () => {
    if (!credentialUri || !statement.trim()) return

    setSubmitting(true)
    try {
      // Get user URI from auth
      const authData = JSON.parse(localStorage.getItem('authToken') || '{}')
      let userUri = ''

      if (authData.metamaskAddress) {
        userUri = `did:pkh:eip155:1:${authData.metamaskAddress}`
      } else if (authData.googleId) {
        userUri = `${window.location.origin}/userids/google/${authData.googleId}`
      } else if (authData.userId || authData.id) {
        userUri = `${window.location.origin}/users/${authData.userId || authData.id}`
      } else {
        throw new Error('Unable to determine user identity')
      }

      const claimData = {
        subject: userUri,
        claim: 'HAS',
        object: credentialUri,
        statement: statement.trim(),
        howKnown: 'VERIFIED_LOGIN',
        confidence: 1.0
      }

      await createClaim(claimData)
      setSuccess(true)

      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate('/feed')
      }, 2000)
    } catch (err) {
      console.error('Error creating claim:', err)
      setError('Failed to claim credential. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && !credential) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mx: 'auto', mt: 4 }}>
        <Alert severity='error' sx={{ maxWidth: 600 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  if (success) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mx: 'auto', mt: 4 }}>
        <Alert severity='success' sx={{ maxWidth: 600 }}>
          Credential claimed successfully! Redirecting to your profile...
        </Alert>
      </Box>
    )
  }

  const style = getAchievementStyle()
  const achievement = credential?.credentialSubject?.achievement?.[0] || credential?.credentialSubject?.achievement
  const issuer = credential?.issuer
  const skills = credential?.credentialSubject?.skills || achievement?.tag || []

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mx: 'auto', mt: 4, px: 2 }}>
      <MainContainer sx={{ maxWidth: 800, width: '100%' }}>
        <Typography variant='h4' gutterBottom align='center' sx={{ mb: 4 }}>
          Claim Credential
        </Typography>

        {/* Credential Preview */}
        {credential && (
          <Card sx={{ mb: 4, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: style.bgColor,
                    color: style.color,
                    width: 80,
                    height: 80,
                    mr: 3
                  }}
                >
                  {achievement?.image ? (
                    <Box
                      component='img'
                      src={achievement.image.id || achievement.image}
                      alt='Badge'
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    style.icon
                  )}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant='h5' gutterBottom>
                    {achievement?.name || credential.name || 'Achievement'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <VerifiedIcon sx={{ fontSize: 20, color: '#2D6A4F' }} />
                    <Typography variant='body1' color='text.secondary'>
                      Issued by {typeof issuer === 'string' ? issuer : issuer?.name}
                    </Typography>
                  </Box>
                  {credential.issuanceDate && (
                    <Typography variant='body2' color='text.secondary'>
                      {new Date(credential.issuanceDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  )}
                </Box>
              </Box>

              {achievement?.description && (
                <Typography variant='body1' paragraph>
                  {achievement.description}
                </Typography>
              )}

              {skills.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {skills.map((skill: any, index: number) => (
                    <Chip
                      key={index}
                      label={typeof skill === 'string' ? skill : skill.value || skill.name}
                      sx={{
                        backgroundColor: style.bgColor,
                        color: style.color
                      }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Claim Form */}
        <Paper sx={{ p: 4 }}>
          <Typography variant='h6' gutterBottom>
            Create Your Claim
          </Typography>
          <Typography variant='body2' color='text.secondary' paragraph>
            {getClaimDescription(credentialSchema || credential?.credentialSchema)}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            value={statement}
            onChange={e => setStatement(e.target.value)}
            placeholder='Add your statement about this credential...'
            sx={{ mb: 3 }}
          />

          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant='outlined' onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant='contained' onClick={handleClaim} disabled={submitting || !statement.trim()}>
              {submitting ? 'Claiming...' : 'Create Claim'}
            </Button>
          </Box>
        </Paper>
      </MainContainer>
    </Box>
  )
}
