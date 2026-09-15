import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Link, Rating, Typography, useTheme } from '@mui/material'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import * as api from '../../api'
import { checkAuth } from '../../utils/authUtils'

const serif = "'Literata', Georgia, serif"

interface MyClaim {
  id: number
  claim: string
  statement?: string | null
  subject: string
  stars?: number | null
  aspect?: string | null
  effectiveDate?: string | null
  videoUrl?: string | null
}

/** Everything this person has said about others, and the ability to take it back. */
const MyClaims: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [claims, setClaims] = useState<MyClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState<MyClaim | null>(null)
  const [deleting, setDeleting] = useState(false)

  const line = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#E6E9EE'
  const muted = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : '#6B7684'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.getMyClaims()
      setClaims(res.data.claims || [])
    } catch {
      setError('Could not load your claims.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!checkAuth()) {
      navigate('/login', { state: { from: { pathname: '/mine' } } })
      return
    }
    load()
  }, [load, navigate])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await api.deleteClaim(pendingDelete.id)
      setClaims(prev => prev.filter(c => c.id !== pendingDelete.id))
      setPendingDelete(null)
    } catch {
      setError('That could not be deleted. It may have been issued by someone else.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box sx={{ width: '100%', px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 5 } }}>
      <Box sx={{ maxWidth: 760, mx: 'auto' }}>
        <Typography sx={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em', mb: 0.5 }}>
          Your recommendations
        </Typography>
        <Typography sx={{ color: muted, fontSize: 15.5, mb: 4 }}>
          Everything you have said about others. Delete any of it at any time.
        </Typography>

        {loading && <CircularProgress size={26} sx={{ display: 'block', mx: 'auto', my: 6 }} />}
        {error && <Typography sx={{ color: 'error.main', fontSize: 15, mb: 2 }}>{error}</Typography>}

        {!loading && !claims.length && !error && (
          <Typography sx={{ color: muted, fontSize: 15.5 }}>Nothing yet.</Typography>
        )}

        {claims.map(c => (
          <Box key={c.id} sx={{ border: `1px solid ${line}`, borderRadius: '14px', p: { xs: 2.5, sm: 3 }, mb: 2 }}>
            {c.videoUrl && (
              <Box
                component='video'
                src={c.videoUrl}
                controls
                playsInline
                sx={{ width: '100%', borderRadius: '10px', bgcolor: '#000', mb: 2 }}
              />
            )}

            {c.stars ? (
              <Rating
                value={c.stars}
                readOnly
                icon={<StarRoundedIcon fontSize='inherit' />}
                emptyIcon={<StarRoundedIcon fontSize='inherit' />}
                sx={{ fontSize: '1.4rem', mb: 1, '& .MuiRating-iconEmpty': { color: line } }}
              />
            ) : null}

            {c.statement && (
              <Typography sx={{ fontFamily: serif, fontSize: 16.5, lineHeight: 1.6, mb: 1.5 }}>
                {c.statement}
              </Typography>
            )}

            <Typography sx={{ color: muted, fontSize: 13.5, mb: 2 }}>
              About {c.subject.replace(/^https?:\/\/(www\.)?/, '')}
              {c.effectiveDate ? ` · ${new Date(c.effectiveDate).toLocaleDateString()}` : ''}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
              <Link href={`/claims/${c.id}`} sx={{ fontSize: 14 }}>
                View
              </Link>
              <Link href={`/badge/${c.id}`} sx={{ fontSize: 14 }}>
                Embed
              </Link>
              <Link
                component='button'
                type='button'
                onClick={() => setPendingDelete(c)}
                sx={{ fontSize: 14, color: '#B3261E' }}
              >
                Delete
              </Link>
            </Box>
          </Box>
        ))}
      </Box>

      <Dialog open={!!pendingDelete} onClose={() => setPendingDelete(null)}>
        <DialogTitle sx={{ fontSize: 19 }}>Delete this permanently?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 15, color: muted }}>
            It will be removed from anywhere it is displayed. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingDelete(null)} sx={{ textTransform: 'none' }}>
            Keep it
          </Button>
          <Button onClick={confirmDelete} disabled={deleting} sx={{ textTransform: 'none', color: '#B3261E' }}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MyClaims
