import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import LinkIcon from '@mui/icons-material/Link'
import CodeIcon from '@mui/icons-material/Code'
import DownloadIcon from '@mui/icons-material/Download'
import CheckIcon from '@mui/icons-material/Check'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import VideocamIcon from '@mui/icons-material/Videocam'
import MainContainer from '../MainContainer'
import { BACKEND_BASE_URL } from '../../utils/settings'

interface EndorsementShareProps {
  claimId: number
  subjectName: string
  statement: string
  videoUrl?: string | null
}

const EndorsementShare = ({ claimId, subjectName, statement, videoUrl }: EndorsementShareProps) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const baseUrl = window.location.origin
  const endorsementUrl = `${baseUrl}/present/${claimId}`
  // LinkedIn share URL goes through backend so LinkedIn gets og:tags, then redirects humans to SPA
  const shareUrl = `${BACKEND_BASE_URL}/api/share/${claimId}`
  const embedCode = `<iframe src="${baseUrl}/embed/${claimId}" width="600" height="180" frameborder="0" style="border:none;max-width:100%"></iframe>`

  const handleCopy = (text: string, key: 'link' | 'embed') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setSnackbarMessage(key === 'link' ? 'Link copied!' : 'Embed code copied!')
      setSnackbarOpen(true)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const handleLinkedInShare = () => {
    const text = encodeURIComponent(
      `I just endorsed ${subjectName} on LinkedTrust!\n\n"${statement.length > 120 ? statement.substring(0, 120) + '...' : statement}"\n\nSee the full endorsement:`
    )
    const url = encodeURIComponent(shareUrl)
    window.open(
      `https://www.linkedin.com/feed/?shareActive=true&shareUrl=${url}&text=${text}`,
      '_blank'
    )
  }

  const handleDownloadVideo = () => {
    if (!videoUrl) return
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `endorsement-${claimId}.webm`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <MainContainer
      sx={{
        width: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
        maxWidth: '100%',
        mx: 'auto',
        p: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}
        >
          You endorsed {subjectName || 'someone'}!
        </Typography>
        <Typography variant='body1' sx={{ color: theme.palette.text.secondary }}>
          Your endorsement is live. Share it so others can see it too.
        </Typography>
      </Box>

      {/* What you said */}
      <Card sx={{ mb: { xs: 3, sm: 4 }, backgroundColor: theme.palette.background.paper }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant='subtitle2' sx={{ color: theme.palette.text.secondary, mb: 1 }}>
            Your endorsement
          </Typography>
          <Box
            sx={{
              p: 2,
              backgroundColor: theme.palette.action.hover,
              borderRadius: 2,
              borderLeft: `4px solid ${theme.palette.primary.main}`
            }}
          >
            <Typography
              variant='body1'
              sx={{
                color: theme.palette.text.primary,
                lineHeight: 1.6,
                wordBreak: 'break-word'
              }}
            >
              {statement.length > 300 ? statement.substring(0, 300) + '...' : statement}
            </Typography>
          </Box>
          {videoUrl && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <VideocamIcon sx={{ color: theme.palette.success.main, fontSize: '1.2rem' }} />
              <Typography variant='body2' sx={{ color: theme.palette.success.main, fontWeight: 600 }}>
                Video endorsement included
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Share options */}
      <Card sx={{ mb: { xs: 3, sm: 4 }, backgroundColor: theme.palette.background.paper }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant='h6'
            sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 2 }}
          >
            Share your endorsement
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* LinkedIn */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant='contained'
                startIcon={<LinkedInIcon />}
                onClick={handleLinkedInShare}
                sx={{
                  textTransform: 'none',
                  minWidth: { xs: '100%', sm: 180 },
                  backgroundColor: '#0077B5',
                  '&:hover': { backgroundColor: '#005885' }
                }}
              >
                Share on LinkedIn
              </Button>
              <Typography variant='caption' sx={{ color: theme.palette.text.secondary }}>
                Post your endorsement to your network
              </Typography>
            </Box>

            <Divider />

            {/* Copy link */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant='outlined'
                startIcon={copied === 'link' ? <CheckIcon /> : <LinkIcon />}
                onClick={() => handleCopy(endorsementUrl, 'link')}
                color={copied === 'link' ? 'success' : 'primary'}
                sx={{ textTransform: 'none', minWidth: { xs: '100%', sm: 180 } }}
              >
                {copied === 'link' ? 'Copied!' : 'Copy link'}
              </Button>
              <Typography variant='caption' sx={{ color: theme.palette.text.secondary }}>
                Share anywhere — email, messages, social media
              </Typography>
            </Box>

            <Divider />

            {/* Embed code */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant='outlined'
                startIcon={copied === 'embed' ? <CheckIcon /> : <CodeIcon />}
                onClick={() => handleCopy(embedCode, 'embed')}
                color={copied === 'embed' ? 'success' : 'primary'}
                sx={{ textTransform: 'none', minWidth: { xs: '100%', sm: 180 } }}
              >
                {copied === 'embed' ? 'Copied!' : 'Copy embed code'}
              </Button>
              <Typography variant='caption' sx={{ color: theme.palette.text.secondary }}>
                Add to any website or portfolio
              </Typography>
            </Box>

            {/* Download video */}
            {videoUrl && (
              <>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant='outlined'
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadVideo}
                    sx={{ textTransform: 'none', minWidth: { xs: '100%', sm: 180 } }}
                  >
                    Download video
                  </Button>
                  <Typography variant='caption' sx={{ color: theme.palette.text.secondary }}>
                    Save your video to upload to LinkedIn, YouTube, etc.
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Continue to feed */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant='text'
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/feed')}
          sx={{ textTransform: 'none', fontSize: '1rem' }}
        >
          Continue to feed
        </Button>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </MainContainer>
  )
}

export default EndorsementShare
