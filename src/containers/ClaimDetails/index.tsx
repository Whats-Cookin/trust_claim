import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, CircularProgress, Link, Typography, useTheme } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import * as api from '../../api'
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

interface IHomeProps {
  isDarkMode: boolean
}

const serif = "'Literata', Georgia, serif"

const label = (k: string) =>
  k
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, c => c.toUpperCase())
    .replace(/Uri$/i, 'URI')
    .replace(/Id$/i, 'ID')

const isUrl = (v: unknown) => typeof v === 'string' && /^https?:\/\//.test(v)

// Anything already shown by the badge itself, plus internals nobody reads.
const HIDDEN = new Set([
  'id',
  'claim_id',
  'statement',
  'stars',
  'score',
  'image',
  'images',
  'edges',
  'proof',
  'digestMultibase',
  'lastProcessedAt',
  'processedAt',
  'createdAt',
  'updatedAt'
])

const ClaimDetails: React.FC<IHomeProps> = ({ isDarkMode }) => {
  const { claimId } = useParams<{ claimId: string }>()
  const navigate = useNavigate()
  const theme = useTheme()

  const [claim, setClaim] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // The badge web component carries the visual style; reuse it rather than
  // rebuilding the card here.
  useEffect(() => {
    if (document.querySelector('script[data-badge-script]')) return
    const script = document.createElement('script')
    script.src = '/badge.js'
    script.defer = true
    script.setAttribute('data-badge-script', 'true')
    document.head.appendChild(script)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.getClaim(claimId!)
      setClaim(res.data.claim as any)
    } catch (err) {
      console.error('Error fetching claim:', err)
      setError('Could not load this claim.')
    } finally {
      setLoading(false)
    }
  }, [claimId])

  useEffect(() => {
    if (claimId) load()
  }, [claimId, load])

  const rows = Object.entries(claim || {})
    .filter(([k, v]) => !HIDDEN.has(k) && v !== null && v !== undefined && v !== '')
    .map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)] as [string, string])

  const line = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#E6E9EE'
  const muted = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : '#6B7684'

  return (
    <Box
      sx={{
        width: '100%',
        
        bgcolor: theme.palette.pageBackground,
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 5 }
      }}
    >
      <Box sx={{ maxWidth: 760, mx: 'auto' }}>
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'none', color: muted, mb: 2, pl: 0 }}
        >
          Back
        </Button>

        {loading && <CircularProgress size={26} sx={{ display: 'block', mx: 'auto', my: 6 }} />}

        {error && !loading && (
          <Typography sx={{ color: 'error.main', fontSize: 16 }}>{error}</Typography>
        )}

        {!loading && !error && claimId && (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                // The component caps a card at 480px; widen it here so the
                // detail page reads as a larger version of the same thing.
                '& linked-badge': { width: '100%' },
                '& linked-badge::part(badge)': { maxWidth: 'none' }
              }}
            >
              <linked-badge
                claim-id={claimId}
                theme={isDarkMode ? 'dark' : 'light'}
                api-base={BACKEND_BASE_URL}
              />
            </Box>

            {rows.length > 0 && (
              <Box
                sx={{
                  mt: 4,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
                  border: `1px solid ${line}`,
                  borderRadius: '14px',
                  overflow: 'hidden'
                }}
              >
                {rows.map(([k, v], i) => (
                  <Box
                    key={k}
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      px: { xs: 2, sm: 3 },
                      py: 1.75,
                      borderTop: i === 0 ? 'none' : `1px solid ${line}`
                    }}
                  >
                    <Typography sx={{ fontSize: 13.5, color: muted, minWidth: 150, flexShrink: 0 }}>
                      {label(k)}
                    </Typography>
                    {isUrl(v) ? (
                      <Link
                        href={v}
                        target='_blank'
                        rel='noopener noreferrer'
                        sx={{ fontSize: 14.5, wordBreak: 'break-all' }}
                      >
                        {v.replace(/^https?:\/\/(www\.)?/, '')}
                      </Link>
                    ) : (
                      <Typography sx={{ fontFamily: serif, fontSize: 14.5, wordBreak: 'break-word' }}>
                        {v}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 3, mt: 3, flexWrap: 'wrap' }}>
              <Link href={`/explore/${claimId}`} sx={{ fontSize: 14.5 }}>
                Explore the graph
              </Link>
              <Link href={`/report/${claimId}`} sx={{ fontSize: 14.5 }}>
                Full report
              </Link>
              <Link href={`/badge/${claimId}`} sx={{ fontSize: 14.5 }}>
                Embed this
              </Link>
            </Box>
          </>
        )}
      </Box>
    </Box>
  )
}

export default ClaimDetails
