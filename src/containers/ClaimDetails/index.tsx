import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, CircularProgress, Link, Paper, Typography, useTheme } from '@mui/material'
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

  return (
    <Box sx={{ width: '100%', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: theme.breakpoints.values.md, mx: 'auto' }}>
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          sx={{ color: theme.palette.text.secondary, mb: 2, pl: 0 }}
        >
          Back
        </Button>

        {loading && <CircularProgress size={26} sx={{ display: 'block', mx: 'auto', my: 6 }} />}

        {error && !loading && <Typography color='error'>{error}</Typography>}

        {!loading && !error && claimId && (
          <>
            {/* The badge web component carries the visual style; it caps its own width. */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <linked-badge
                claim-id={claimId}
                theme={isDarkMode ? 'dark' : 'light'}
                api-base={BACKEND_BASE_URL}
              />
            </Box>

            {rows.length > 0 && (
              <Paper variant='outlined' sx={{ mt: 3, overflow: 'hidden' }}>
                {rows.map(([k, v], i) => (
                  <Box
                    key={k}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 0.5, sm: 2 },
                      px: 2,
                      py: 1.5,
                      borderTop: i === 0 ? 'none' : `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Typography variant='body2' sx={{ color: theme.palette.text.secondary, width: { sm: 160 }, flexShrink: 0 }}>
                      {label(k)}
                    </Typography>
                    {isUrl(v) ? (
                      <Link href={v} target='_blank' rel='noopener noreferrer' variant='body2' sx={{ wordBreak: 'break-all' }}>
                        {v.replace(/^https?:\/\/(www\.)?/, '')}
                      </Link>
                    ) : (
                      <Typography variant='body2' sx={{ wordBreak: 'break-word' }}>
                        {v}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Paper>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
              <Link href={`/explore/${claimId}`} variant='body2'>
                Explore the graph
              </Link>
              <Link href={`/report/${claimId}`} variant='body2'>
                Full report
              </Link>
              <Link href={`/badge/${claimId}`} variant='body2'>
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
