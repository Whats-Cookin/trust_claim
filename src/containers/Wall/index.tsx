import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import * as api from '../../api'
import { Claim } from '../../api/types'

// TypeScript declaration for the web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'linked-badge': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'claim-id': number | string
        layout?: string
        theme?: string
      }
    }
  }
}

type Filter = 'all' | 'video' | 'image'

const Wall = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const subject = searchParams.get('subject') || ''
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subjectName, setSubjectName] = useState<string>('')
  const [filter, setFilter] = useState<Filter>('all')

  // Load the badge web component script once
  useEffect(() => {
    if (document.querySelector('script[data-badge-script]')) return
    const script = document.createElement('script')
    script.src = '/badge.js'
    script.defer = true
    script.setAttribute('data-badge-script', 'true')
    document.head.appendChild(script)
  }, [])

  const friendlyLabel = (uri: string) => {
    try {
      const u = new URL(uri)
      return u.hostname + (u.pathname !== '/' ? u.pathname : '')
    } catch {
      return uri
    }
  }

  useEffect(() => {
    if (!subject) {
      setLoading(false)
      setError('No subject specified. Add ?subject=https://... to the URL.')
      return
    }

    api.getEntityReport(subject)
      .then(res => {
        const name = (res.data as any)?.entity?.name || (res.data as any)?.name
        setSubjectName(name || friendlyLabel(subject))
      })
      .catch(() => setSubjectName(friendlyLabel(subject)))

    setLoading(true)
    api.getClaimsBySubject(subject)
      .then(res => {
        setClaims(res.data.claims || [])
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load endorsements: ' + (err?.message || 'Unknown error'))
        setLoading(false)
      })
  }, [subject])

  const handleEndorse = () => {
    navigate(`/request-rating?about=${encodeURIComponent(subject)}`)
  }

  const hasVideo = (claim: Claim) =>
    !!(claim as any).images?.some(
      (img: any) => img.type === 'video' || img.contentType?.startsWith('video/')
    )
  const hasImage = (claim: Claim) =>
    !!(claim as any).images?.some(
      (img: any) => img.type !== 'video' && !img.contentType?.startsWith('video/')
    )

  const filtered = claims.filter(c => {
    if (filter === 'video') return hasVideo(c)
    if (filter === 'image') return hasImage(c)
    return true
  })

  if (!subject) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity='warning'>No subject specified. Add ?subject=https://... to the URL.</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant='caption'
            sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Endorsements for
          </Typography>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            sx={{ fontWeight: 700, color: 'text.primary', wordBreak: 'break-word', lineHeight: 1.2, mt: 0.5 }}
          >
            {subjectName || friendlyLabel(subject)}
          </Typography>
          <Typography
            variant='caption'
            sx={{ color: 'text.disabled', wordBreak: 'break-all', display: 'block', mt: 0.5 }}
          >
            {subject}
          </Typography>
        </Box>

        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleEndorse}
          sx={{ flexShrink: 0, textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3 }}
        >
          Add Endorsement
        </Button>
      </Box>

      {/* Filter chips + count */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
        {(['all', 'video', 'image'] as Filter[]).map(f => (
          <Chip
            key={f}
            label={f.charAt(0).toUpperCase() + f.slice(1)}
            variant={filter === f ? 'filled' : 'outlined'}
            color={filter === f ? 'primary' : 'default'}
            onClick={() => setFilter(f)}
            size='small'
            sx={{ cursor: 'pointer' }}
          />
        ))}
        {!loading && (
          <Typography variant='caption' sx={{ color: 'text.secondary', ml: 1 }}>
            {filtered.length} of {claims.length} endorsement{claims.length !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>

      {/* Content */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant='h6' sx={{ color: 'text.secondary', mb: 1 }}>
            {claims.length === 0 ? 'No endorsements yet' : `No ${filter} endorsements`}
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.disabled', mb: 3 }}>
            {claims.length === 0 ? 'Be the first to endorse this.' : 'Try a different filter.'}
          </Typography>
          {claims.length === 0 && (
            <Button variant='outlined' startIcon={<AddIcon />} onClick={handleEndorse} sx={{ textTransform: 'none' }}>
              Add Endorsement
            </Button>
          )}
        </Box>
      )}

      {!loading && !error && filtered.length > 0 && (
        <Grid container spacing={2}>
          {filtered.map(claim => (
            <Grid item xs={12} md={6} key={claim.id}>
              <linked-badge
                claim-id={claim.id}
                layout='row'
                theme={theme.palette.mode}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default Wall
