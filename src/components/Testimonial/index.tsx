import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Button, Collapse, CircularProgress, Link, Rating, TextField, Typography } from '@mui/material'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import axios from '../../axiosInstance'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import PlatformFeedbackVideoSection from '../../containers/PlatformFeedback/PlatformFeedbackVideoSection'
import QuickAuth from '../QuickAuth'
import { checkAuth, AUTH_STATE_CHANGED_EVENT } from '../../utils/authUtils'
import logo from '../../assets/logolinkedtrust.svg'

interface Invite {
  expired?: boolean
  subjectUri: string
  subjectName?: string | null
  recipientName?: string | null
  recipientProfile?: string | null
  aspect?: string | null
  workSummary?: string | null
  suggestions?: string | null
  note?: string | null
  requesterName?: string | null
  responded?: boolean
  claimId?: number | null
}

declare global {
  interface Window {
    __TESTIMONIAL_INVITE__?: Invite | null
  }
}

const ink = '#1B2430'
const muted = '#6B7684'
const rule = '#E6E9EE'
const ground = '#F5F7FA'
const serif = "'Literata', Georgia, serif"
const tint = '#FAFBFC'
const accent = '#00b2e5'

const Testimonial: React.FC = () => {
  const { token = '' } = useParams()
  const preloaded = useMemo(() => window.__TESTIMONIAL_INVITE__ ?? null, [])

  const [invite, setInvite] = useState<Invite | null>(preloaded)
  const [loading, setLoading] = useState(!preloaded)
  const [gone, setGone] = useState(false)
  const [replacing, setReplacing] = useState(false)

  const draftKey = `testimonial_draft_${token}`
  const [statement, setStatement] = useState(() => localStorage.getItem(draftKey) ?? '')
  const [stars, setStars] = useState<number | null>(null)
  const [profile, setProfile] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoPending, setVideoPending] = useState(false)
  const [showExamples, setShowExamples] = useState(false)

  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [claimRef, setClaimRef] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAuthed, setIsAuthed] = useState(() => checkAuth())
  const [showSignIn, setShowSignIn] = useState(false)

  const { createClaim } = useCreateClaim()
  const syncAuth = useCallback(() => setIsAuthed(checkAuth()), [])

  useEffect(() => {
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, syncAuth)
    return () => window.removeEventListener(AUTH_STATE_CHANGED_EVENT, syncAuth)
  }, [syncAuth])

  useEffect(() => {
    if (preloaded || !token) return
    let live = true
    axios
      .get(`/api/testimonial-requests/${token}`)
      .then(res => live && setInvite(res.data))
      .catch(err => live && setGone([404, 410].includes(err?.response?.status)))
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [preloaded, token])

  useEffect(() => {
    if (invite?.recipientProfile) setProfile(invite.recipientProfile)
  }, [invite?.recipientProfile])

  // In-app browsers get killed mid-sentence; never lose what they typed.
  useEffect(() => {
    if (statement) localStorage.setItem(draftKey, statement)
  }, [statement, draftKey])

  const send = async () => {
    if (!invite || sending) return
    if (!statement.trim()) return setError('Please write a few words first.')
    if (videoPending) return setError('Your video is still uploading, one moment.')

    setError(null)
    setSending(true)
    try {
      const { isSuccess, message, claimId } = await createClaim(
        {
          subject: invite.subjectUri,
          // Stars make it a rating; without them it's a plain endorsement,
          // not a rating that happens to be blank.
          claim: stars && stars > 0 ? 'rated' : 'is_vouched_for',
          statement: statement.trim(),
          aspect: invite.aspect || undefined,
          howKnown: 'FIRST_HAND',
          effectiveDate: new Date().toISOString(),
          sourceURI: profile.trim() || undefined,
          stars: stars && stars > 0 ? stars : undefined,
          images: [] as [],
          ...(videoUrl && { videoUrl })
        },
        { skipWalletCheck: true }
      )
      if (!isSuccess) return setError(message || 'Couldn’t send. Your words are saved, please try again.')

      localStorage.removeItem(draftKey)
      setSent(true)
      if (claimId) setClaimRef(claimId)
      if (claimId) {
        axios.post(`/api/testimonial-requests/${token}/responded`, { claimId }).catch(() => undefined)
      }
    } catch {
      setError('Couldn’t send. Your words are saved, please try again.')
    } finally {
      setSending(false)
    }
  }

  const shell = (children: React.ReactNode) => (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: ground,
        color: ink,
        px: { xs: 1.5, sm: 3 },
        py: { xs: 2, sm: 5 },
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          maxWidth: 720,
          width: '100%',
          // Auto margins centre a tall card without making its top unreachable,
          // which is what align-items:center does once content exceeds the viewport.
          my: 'auto',
          bgcolor: '#fff',
          borderRadius: { xs: '14px', sm: '18px' },
          border: `1px solid ${rule}`,
          borderTop: `4px solid ${accent}`,
          boxShadow: '0 1px 2px rgba(16,24,40,0.04), 0 12px 32px rgba(16,24,40,0.06)',
          px: { xs: 2.5, sm: 5 },
          py: { xs: 3.5, sm: 4.5 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 3 }}>
          <Box component='img' src={logo} alt='' sx={{ width: 30, height: 30 }} />
          <Typography sx={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', overflowWrap: 'anywhere' }}>LinkedTrust</Typography>
        </Box>
        {children}
      </Box>
    </Box>
  )

  if (loading) return shell(<CircularProgress size={24} sx={{ display: 'block', mx: 'auto' }} />)

  if (gone || !invite || invite.expired) {
    return shell(
      <>
        <Typography sx={{ fontSize: 22, fontWeight: 600, mb: 1 }}>This link isn’t working</Typography>
        <Typography sx={{ color: muted, fontSize: 16, lineHeight: 1.6 }}>
          It may have expired. Ask whoever sent it for a new one.
        </Typography>
      </>
    )
  }

  const who = invite.requesterName?.trim() || 'them'
  const you = invite.recipientName?.trim()
  const subject = invite.subjectName?.trim() || invite.subjectUri.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

  if (invite.responded && !sent && !replacing) {
    return shell(
      <>
        <Typography sx={{ fontSize: 24, fontWeight: 600, mb: 1 }}>You already sent this</Typography>
        <Typography sx={{ color: muted, fontSize: 15.5, lineHeight: 1.6, mb: 2.5 }}>
          {who} has your words. Nothing more to do.
        </Typography>
        {invite.claimId && (
          <Typography sx={{ fontSize: 15.5, mb: 2.5 }}>
            <Link href={`/claims/${invite.claimId}`} target='_blank' rel='noopener noreferrer'>
              See what you wrote
            </Link>
          </Typography>
        )}
        <Typography sx={{ color: muted, fontSize: 14, lineHeight: 1.6 }}>
          Want to say something different?{' '}
          <Link component='button' type='button' onClick={() => setReplacing(true)} sx={{ fontSize: 14 }}>
            Write another
          </Link>
        </Typography>
      </>
    )
  }

  if (sent) {
    return shell(
      <>
        <Typography sx={{ fontSize: 34, mb: 1.5 }}>🌟</Typography>
        <Typography sx={{ fontSize: 24, fontWeight: 600, mb: 1 }}>Sent{you ? `, thank you ${you}` : ', thank you'}.</Typography>
        <Typography sx={{ color: muted, fontSize: 15, lineHeight: 1.6, mb: 2.5 }}>Here’s what you wrote:</Typography>
        <Box sx={{ borderLeft: `3px solid ${rule}`, pl: 2.5 }}>
          <Typography sx={{ fontFamily: serif, fontSize: 16.5, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
            {statement}
          </Typography>
        </Box>
        {claimRef && (
          <Typography sx={{ fontSize: 15, mt: 3 }}>
            <Link href={`/claims/${claimRef}`} target='_blank' rel='noopener noreferrer'>
              See it live
            </Link>
          </Typography>
        )}
        <Typography sx={{ color: muted, fontSize: 14, mt: 2, lineHeight: 1.6 }}>
          To change or remove it, email support@linkedtrust.us. No questions asked.
        </Typography>
      </>
    )
  }

  return shell(
    <>
      <Typography sx={{ fontSize: { xs: 22, sm: 25 }, fontWeight: 600, letterSpacing: '-0.01em' }}>
        Review requested for {subject}
      </Typography>

      {invite.note && (
        <Box sx={{ borderLeft: `3px solid ${accent}`, pl: 2, py: 0.25, mt: 1.5 }}>
          <Typography sx={{ fontFamily: serif, fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {invite.note}
          </Typography>
          <Typography sx={{ color: muted, fontSize: 14, mt: 0.5 }}>{who}</Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          mt: 3,
          pt: 3,
          borderTop: `1px solid ${rule}`
        }}
      >
        <Typography sx={{ fontSize: 16, overflowWrap: 'anywhere' }}>Rate {subject}:</Typography>
        <Rating
          value={stars}
          onChange={(_, v) => setStars(v && v > 0 ? v : null)}
          icon={<StarRoundedIcon fontSize='inherit' />}
          emptyIcon={<StarRoundedIcon fontSize='inherit' />}
          sx={{ fontSize: '2rem', '& .MuiRating-iconEmpty': { color: rule } }}
        />
      </Box>

      <Typography sx={{ fontSize: 16, lineHeight: 1.5, mt: 3, mb: 1, overflowWrap: 'anywhere' }}>
        Could you write a few words about {subject}?
        {invite.workSummary ? ` Some of the work we did for you involved ${invite.workSummary}.` : ''}
      </Typography>

      <TextField
        value={statement}
        onChange={e => setStatement(e.target.value)}
        fullWidth
        multiline
        minRows={5}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            bgcolor: tint,
            fontFamily: serif,
            fontSize: 16.5,
            lineHeight: 1.6,
            '& fieldset': { borderColor: rule },
            '&.Mui-focused': { bgcolor: '#fff' }
          }
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          columnGap: 2.5,
          rowGap: 1,
          alignItems: 'center',
          mt: 0.75,
          mb: 1.5
        }}
      >
        {invite.suggestions && (
          <Link
            component='button'
            type='button'
            onClick={() => setShowExamples(v => !v)}
            sx={{ fontSize: 13.5, color: muted }}
          >
            Not sure what to say?
          </Link>
        )}
      </Box>

      <Collapse in={showExamples && !!invite.suggestions}>
        <Box sx={{ pb: 1.5 }}>
          <Typography sx={{ fontFamily: serif, color: muted, fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {invite.suggestions}
          </Typography>
        </Box>
      </Collapse>

      <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${rule}` }}>
        <PlatformFeedbackVideoSection
          alwaysOpen
          autoOpenCamera={false}
          heading='Video is gold, the most meaningful way to attest if you are comfortable:'
          videoUrl={videoUrl}
          onVideoUploaded={url => {
            setVideoUrl(url)
            setVideoPending(false)
          }}
          onVideoRemoved={() => {
            setVideoUrl(null)
            setVideoPending(false)
          }}
          onPendingChange={setVideoPending}
        />
      </Box>


      <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${rule}`, mb: 2.5 }}>
        {editingProfile ? (
          <TextField
            value={profile}
            onChange={e => setProfile(e.target.value)}
            fullWidth
            size='small'
            autoFocus
            placeholder='https://www.linkedin.com/in/you, or leave blank'
            onBlur={() => setEditingProfile(false)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: tint } }}
          />
        ) : (
          <>
            <Typography sx={{ fontSize: 14.5, lineHeight: 1.5, overflowWrap: 'anywhere' }}>
              Signed {you || 'you'}
              {profile ? ` · ${profile.replace(/^https?:\/\/(www\.)?/, '')}` : ''}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
              <Link component='button' type='button' onClick={() => setEditingProfile(true)} sx={{ fontSize: 13, color: muted }}>
                edit
              </Link>
              {profile && (
                <Link component='button' type='button' onClick={() => setProfile('')} sx={{ fontSize: 13, color: muted }}>
                  remove link
                </Link>
              )}
            </Box>
          </>
        )}
      </Box>

      {error && <Typography sx={{ color: '#B3261E', fontSize: 14.5, mb: 1.5 }}>{error}</Typography>}

      <Button
        onClick={send}
        disabled={sending}
        fullWidth
        variant='contained'
        disableElevation
        sx={{
          textTransform: 'none',
          borderRadius: '12px',
          py: 1.4,
          fontSize: 16.5,
          fontWeight: 600,
          bgcolor: ink,
          '&:hover': { bgcolor: '#0F1720' }
        }}
      >
        {sending ? 'Sending…' : `Send to ${who}`}
      </Button>

      <Typography sx={{ color: muted, fontSize: 13, mt: 1.25, textAlign: 'center' }}>
        Posts publicly so {who} can share it.
        {isAuthed ? ' You can delete it any time from Mine.' : ''}
      </Typography>

      {!isAuthed && !showSignIn && (
        <Typography sx={{ color: muted, fontSize: 13, mt: 1.5, textAlign: 'center' }}>
          <Link component='button' type='button' onClick={() => setShowSignIn(true)} sx={{ fontSize: 13 }}>
            Sign in first
          </Link>{' '}
          to edit or delete this later. Optional.
        </Typography>
      )}

      {!isAuthed && showSignIn && (
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${rule}` }}>
          <QuickAuth mode='inline' onAuthenticated={syncAuth} inlineHideMetaMask />
        </Box>
      )}
    </>
  )
}

export default Testimonial
