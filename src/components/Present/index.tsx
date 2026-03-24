import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Container,
  Tabs,
  Tab,
  TextField,
  Snackbar,
  useTheme,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  Alert
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import CodeIcon from '@mui/icons-material/Code'
import ShareIcon from '@mui/icons-material/Share'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import * as api from '../../api'
import Loader from '../Loader'
import BadgeSharePanel from '../BadgeSharePanel'
import { BACKEND_BASE_URL } from '../../utils/settings'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role='tabpanel' hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

const Present: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [claim, setClaim] = useState<any>(null)
  const [validations, setValidations] = useState<any[]>([])
  const [tabValue, setTabValue] = useState(0)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const claimUrl = `${window.location.origin}/certificate/${id}`
  const linkedInShareUrl = `${BACKEND_BASE_URL}/api/share/${id}`

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        setLoading(true)
        const claimRes = await api.getClaim(id)
        setClaim(claimRes.data.claim)

        // Try to get validations
        try {
          const reportRes = await api.getClaimReport(Number(id))
          if (reportRes.data?.validations) {
            setValidations(reportRes.data.validations)
          }
        } catch (e) {
          // No validations yet
        }
      } catch (error) {
        console.error('Failed to load claim:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setSnackbarMessage(`${label} copied to clipboard!`)
      setSnackbarOpen(true)
    } catch (err) {
      setSnackbarMessage('Failed to copy')
      setSnackbarOpen(true)
    }
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Generate request links (clean URLs)
  const requestEndorsementUrl = `${window.location.origin}/endorse/${id}?video=true`
  const requestValidationUrl = `${window.location.origin}/validate?subject=${BACKEND_BASE_URL}/claims/${id}`
  const requestRatingUrl = claim?.subject
    ? `${window.location.origin}/request-rating?about=${encodeURIComponent(
        typeof claim.subject === 'string' ? claim.subject : claim.subject.uri
      )}`
    : ''

  if (loading) {
    return <Loader open={loading} />
  }

  if (!claim) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error'>Claim not found</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
          Present This Credential
        </Typography>
        <Typography variant='body1' sx={{ color: theme.palette.text.secondary }}>
          Share this endorsement as a certificate, embed it on your website, or request more validations.
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button
          variant='contained'
          startIcon={<WorkspacePremiumOutlinedIcon />}
          onClick={() => navigate(`/certificate/${id}`)}
          sx={{ textTransform: 'none' }}
        >
          View as Certificate
        </Button>
        <Button
          variant='contained'
          startIcon={<CodeIcon />}
          onClick={() => navigate(`/badge/${id}`)}
          sx={{ textTransform: 'none' }}
        >
          View as Badge
        </Button>
        <Button
          variant='contained'
          startIcon={<LinkedInIcon />}
          onClick={() => {
            const text = encodeURIComponent(`Check out this credential on LinkedTrust!`)
            const url = encodeURIComponent(linkedInShareUrl)
            window.open(`https://www.linkedin.com/feed/?shareActive=true&shareUrl=${url}&text=${text}`, '_blank')
          }}
          sx={{ textTransform: 'none', backgroundColor: '#0077B5', '&:hover': { backgroundColor: '#005885' } }}
        >
          Share on LinkedIn
        </Button>
        <Button
          variant='outlined'
          startIcon={<ShareIcon />}
          onClick={() => handleCopy(claimUrl, 'Certificate link')}
          sx={{ textTransform: 'none' }}
        >
          Copy Share Link
        </Button>
        <Button
          variant='outlined'
          startIcon={<OpenInNewIcon />}
          component={Link}
          to={`/report/${id}`}
          sx={{ textTransform: 'none' }}
        >
          View Evidence
        </Button>
      </Box>

      {/* Claim Preview */}
      <Card sx={{ mb: 4, backgroundColor: theme.palette.background.paper }}>
        <CardContent>
          <Typography variant='subtitle2' sx={{ color: theme.palette.text.secondary, mb: 1 }}>
            Claim #{id}
          </Typography>
          <Typography variant='h6' sx={{ mb: 2 }}>
            {claim.statement || 'No statement'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {validations.length > 0 && (
              <Typography variant='body2' sx={{ color: 'success.main' }}>
                ✓ {validations.length} validation{validations.length > 1 ? 's' : ''}
              </Typography>
            )}
            {claim.effectiveDate && (
              <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
                {new Date(claim.effectiveDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ backgroundColor: theme.palette.background.paper }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label='Share & Embed' icon={<CodeIcon />} iconPosition='start' sx={{ textTransform: 'none' }} />
          <Tab label='Request Validation' icon={<ShareIcon />} iconPosition='start' sx={{ textTransform: 'none' }} />
        </Tabs>

        {/* Share & Embed Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <BadgeSharePanel claimId={Number(id)} />
          </Box>
        </TabPanel>

        {/* Request Validation Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Get More Endorsements
            </Typography>

            {/* Request Video Endorsement */}
            <Box sx={{ mb: 4 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                Request Video Endorsement (Recommended)
              </Typography>
              <Typography variant='body2' sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Send this link to request a video endorsement. Video testimonials are more compelling and help build
                trust with your audience.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  value={requestEndorsementUrl}
                  InputProps={{ readOnly: true, sx: { fontSize: '0.9rem' } }}
                />
                <Tooltip title='Copy link'>
                  <IconButton onClick={() => handleCopy(requestEndorsementUrl, 'Endorsement request link')}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Open in new tab'>
                  <IconButton onClick={() => window.open(requestEndorsementUrl, '_blank')}>
                    <OpenInNewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Request Validation */}
            <Box sx={{ mb: 4 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                Request Text Validation
              </Typography>
              <Typography variant='body2' sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Send this link to someone who can validate this claim with a text endorsement or upload an image.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  value={requestValidationUrl}
                  InputProps={{ readOnly: true, sx: { fontSize: '0.9rem' } }}
                />
                <Tooltip title='Copy link'>
                  <IconButton onClick={() => handleCopy(requestValidationUrl, 'Validation request link')}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Open in new tab'>
                  <IconButton onClick={() => window.open(requestValidationUrl, '_blank')}>
                    <OpenInNewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Request Rating About You */}
            {requestRatingUrl && (
              <Box>
                <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                  Request a Rating About You
                </Typography>
                <Typography variant='body2' sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                  Send this link to a client or colleague to request a testimonial rating about your work.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    value={requestRatingUrl}
                    InputProps={{ readOnly: true, sx: { fontSize: '0.9rem' } }}
                  />
                  <Tooltip title='Copy link'>
                    <IconButton onClick={() => handleCopy(requestRatingUrl, 'Rating request link')}>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Open in new tab'>
                    <IconButton onClick={() => window.open(requestRatingUrl, '_blank')}>
                      <OpenInNewIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  )
}

export default Present
