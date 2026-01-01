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
import * as api from '../../api'
import Loader from '../Loader'
import { BACKEND_BASE_URL, BASE_URL } from '../../utils/settings'

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
  const badgeUrl = `${window.location.origin}/badge-embed/${id}`

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

  // Generate embed codes
  const iframeEmbed = `<iframe
  src="${badgeUrl}"
  width="320"
  height="180"
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
  title="LinkedTrust Testimonial Badge"
></iframe>`

  const scriptEmbed = `<script src="${window.location.origin}/embed/linkedtrust-badge.js"></script>
<linkedtrust-badge claim-id="${id}"></linkedtrust-badge>`

  const htmlBadgeEmbed = `<a href="${claimUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
  <div style="
    background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    max-width: 300px;
  ">
    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">✓ Verified Testimonial</div>
    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">${
      claim?.statement?.substring(0, 80) || 'Endorsed'
    }${claim?.statement?.length > 80 ? '...' : ''}</div>
    <div style="font-size: 12px; opacity: 0.8; display: flex; align-items: center; gap: 4px;">
      <span>Verified on LinkedTrust</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
    </div>
  </div>
</a>`

  const markdownEmbed = `[![Verified on LinkedTrust](${window.location.origin}/api/badge/${id}/image)](${claimUrl})`

  // Generate request links
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
          Present Your Credential
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
          <Tab label='Embed Codes' icon={<CodeIcon />} iconPosition='start' sx={{ textTransform: 'none' }} />
          <Tab label='Request Validation' icon={<ShareIcon />} iconPosition='start' sx={{ textTransform: 'none' }} />
        </Tabs>

        {/* Embed Codes Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Embed on Your Website
            </Typography>

            {/* HTML Badge */}
            <Box sx={{ mb: 4 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                HTML Badge (Recommended)
              </Typography>
              <Typography variant='body2' sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Copy this HTML to add a styled badge to any website. Works with Hugo, Django, WordPress, etc.
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  multiline
                  rows={8}
                  fullWidth
                  value={htmlBadgeEmbed}
                  InputProps={{ readOnly: true, sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                />
                <IconButton
                  onClick={() => handleCopy(htmlBadgeEmbed, 'HTML badge')}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* iFrame Embed */}
            <Box sx={{ mb: 4 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                iFrame Embed
              </Typography>
              <Typography variant='body2' sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Embed an interactive badge that shows validations and links to evidence.
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  multiline
                  rows={5}
                  fullWidth
                  value={iframeEmbed}
                  InputProps={{ readOnly: true, sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                />
                <IconButton
                  onClick={() => handleCopy(iframeEmbed, 'iFrame embed')}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* JavaScript Widget */}
            <Box sx={{ mb: 4 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                JavaScript Widget
              </Typography>
              <Typography variant='body2' sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Dynamic widget with live data updates.
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  multiline
                  rows={2}
                  fullWidth
                  value={scriptEmbed}
                  InputProps={{ readOnly: true, sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                />
                <IconButton
                  onClick={() => handleCopy(scriptEmbed, 'Script embed')}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Markdown */}
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                Markdown (GitHub README, etc.)
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  value={markdownEmbed}
                  InputProps={{ readOnly: true, sx: { fontFamily: 'monospace', fontSize: '0.85rem' } }}
                />
                <IconButton
                  onClick={() => handleCopy(markdownEmbed, 'Markdown')}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        {/* Request Validation Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant='h6' sx={{ mb: 3 }}>
              Get More Endorsements
            </Typography>

            {/* Request Validation */}
            <Box sx={{ mb: 4 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                Request Validation of This Claim
              </Typography>
              <Typography variant='body2' sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                Send this link to someone who can validate this claim. They can add their endorsement with optional
                video testimony.
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
