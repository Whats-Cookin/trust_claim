import { useState, useEffect } from 'react'
import { Box, Button, Typography, Tooltip, Collapse, Divider, Link } from '@mui/material'
import LinkIcon from '@mui/icons-material/Link'
import CodeIcon from '@mui/icons-material/Code'
import EmailIcon from '@mui/icons-material/Email'
import CheckIcon from '@mui/icons-material/Check'
import { BACKEND_BASE_URL } from '../../utils/settings'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'linked-badge': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'claim-id': number | string
        layout?: string
        theme?: string
        'api-base'?: string
      }
    }
  }
}

interface BadgeSharePanelProps {
  claimId: number
}

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://live.linkedtrust.us'

export default function BadgeSharePanel({ claimId }: BadgeSharePanelProps) {
  const [copied, setCopied] = useState<'link' | 'embed' | 'iframe' | 'imgurl' | null>(null)
  const [emailOpen, setEmailOpen] = useState(false)

  const badgeUrl = `${BASE_URL}/badge/${claimId}`
  const embedUrl = `${BASE_URL}/embed/${claimId}`
  const imageUrl = `${BASE_URL}/api/badge-image/${claimId}`
  const presentUrl = `${BASE_URL}/present/${claimId}`

  // The <linked-badge> web component, the same one linkedtrust.us uses. Wrapped in a
  // max-width:42rem stack so the row layout gets the ~600px it needs and does not squash
  // when pasted into a narrow column — the layout linkedtrust.us's own wall uses.
  const embedCode = `<script src="${BASE_URL}/badge.js" defer></script>\n<div style="max-width:42rem">\n  <linked-badge claim-id="${claimId}" layout="row"></linked-badge>\n</div>`
  // For sites that do not allow scripts.
  const iframeCode = `<iframe src="${embedUrl}" width="600" height="180" frameborder="0" style="border:none;max-width:100%"></iframe>`

  // Load badge.js once
  useEffect(() => {
    if (document.querySelector('script[data-badge-script]')) return
    const script = document.createElement('script')
    script.src = '/badge.js'
    script.defer = true
    script.setAttribute('data-badge-script', 'true')
    document.head.appendChild(script)
  }, [])

  const copy = (text: string, key: 'link' | 'embed' | 'iframe' | 'imgurl') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <Box>
      {/* The badge — natural row size, centered */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <linked-badge claim-id={claimId} layout='row' api-base={BACKEND_BASE_URL} />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Share options */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Copy link */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant='outlined'
            size='small'
            startIcon={copied === 'link' ? <CheckIcon /> : <LinkIcon />}
            onClick={() => copy(badgeUrl, 'link')}
            sx={{ textTransform: 'none', minWidth: 140, flexShrink: 0 }}
            color={copied === 'link' ? 'success' : 'primary'}
          >
            {copied === 'link' ? 'Copied!' : 'Copy link'}
          </Button>
          <Typography variant='caption' color='text.secondary'>
            Share anywhere — messages, social media, email
          </Typography>
        </Box>

        {/* Embed code */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Button
            variant='outlined'
            size='small'
            startIcon={copied === 'embed' ? <CheckIcon /> : <CodeIcon />}
            onClick={() => copy(embedCode, 'embed')}
            sx={{ textTransform: 'none', minWidth: 140, flexShrink: 0 }}
            color={copied === 'embed' ? 'success' : 'primary'}
          >
            {copied === 'embed' ? 'Copied!' : 'Copy embed code'}
          </Button>
          <Typography variant='caption' color='text.secondary'>
            Paste into any website or portfolio.{' '}
            <Link
              component='button'
              variant='caption'
              onClick={() => copy(iframeCode, 'iframe')}
              sx={{ verticalAlign: 'baseline' }}
            >
              {copied === 'iframe' ? 'Copied!' : 'Site blocks scripts? Copy iframe code'}
            </Link>
          </Typography>
        </Box>

        {/* Email image */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant='outlined'
              size='small'
              startIcon={<EmailIcon />}
              onClick={() => setEmailOpen(v => !v)}
              sx={{ textTransform: 'none', minWidth: 140, flexShrink: 0 }}
            >
              Use in email
            </Button>
            <Typography variant='caption' color='text.secondary'>
              Embed the badge image directly in your email body
            </Typography>
          </Box>

          <Collapse in={emailOpen}>
            <Box sx={{ mt: 2, pl: 0 }}>
              <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 1 }}>
                Right-click the image below and save or copy it, then paste it into your email. Clicking the image will
                open the full badge page.
              </Typography>
              <Box
                sx={{
                  display: 'inline-block',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                  mb: 1
                }}
              >
                <a href={badgeUrl} target='_blank' rel='noopener noreferrer'>
                  <img src={imageUrl} alt='LinkedTrust badge' style={{ display: 'block', maxWidth: '100%' }} />
                </a>
              </Box>
              <Box>
                <Button
                  variant='text'
                  size='small'
                  startIcon={copied === 'imgurl' ? <CheckIcon /> : <LinkIcon />}
                  onClick={() => copy(imageUrl, 'imgurl')}
                  sx={{ textTransform: 'none', pl: 0 }}
                  color={copied === 'imgurl' ? 'success' : 'primary'}
                >
                  {copied === 'imgurl' ? 'Copied!' : 'Copy image URL'}
                </Button>
                <Typography variant='caption' color='text.secondary' sx={{ ml: 1 }}>
                  (for "Insert image from URL" in Gmail, Outlook etc.)
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Link href={presentUrl} target='_blank' rel='noopener noreferrer' variant='caption' color='text.disabled'>
          See full details →
        </Link>
      </Box>
    </Box>
  )
}
