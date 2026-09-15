// FROZEN COPY — this is what is serving live invite links that are already in
// people's hands (/t/:token). Do not edit it to try out ideas: iterate in
// index.tsx, which serves /t2/:token, then copy it over here once it is proven.
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

const TestimonialStable: React.FC = () => {
  const { token = '' } = useParams()
  const preloaded = useMemo(() => window.__TESTIMONIAL_INVITE__ ?? null, [])

  const [invite, setInvite] = useState<Invite | null>(preloaded)
  const [loading, setLoading] = useState(!preloaded)
  const [gone, setGone] = useState(false)
  const [offline, setOffline] = useState(false)
  const [replacing, setReplacing] = useState(false)

  const draftKey = `testimonial_draft_${token}`
  const draft = useMemo(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      if (!raw) return {}
      // Older drafts were the bare statement, before the video was kept too.
      return raw.startsWith('{') ? JSON.parse(raw) : { statement: raw }
    } catch {
      return {}
    }
  }, [draftKey])

  const [statement, setStatement] = useState<string>(draft.statement ?? '')
  const [stars, setStars] = useState<number | null>(draft.stars ?? null)
  const [profile, setProfile] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)
  const [signedAs, setSignedAs] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(draft.videoUrl ?? null)
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
      .catch(err => {
        if (!live) return
        // No status at all means the request never landed — a timeout, a dead
        // connection, the API down. Saying "expired" there sends them back to
        // ask for a new link that will fail exactly the same way.
        if ([404, 410].includes(err?.response?.status)) setGone(true)
        else setOffline(true)
      })
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [preloaded, token])

  useEffect(() => {
    if (invite?.recipientProfile) setProfile(invite.recipientProfile)
  }, [invite?.recipientProfile])

  // In-app browsers get killed mid-sentence. Keep the video with the words:
  // footage uploaded and then orphaned is worse than no footage at all.
  useEffect(() => {
    if (!statement && !videoUrl && !stars) return
    try {
      localStorage.setItem(draftKey, JSON.stringify({ statement, videoUrl, stars }))
    } catch {
      /* private mode */
    }
  }, [statement, videoUrl, stars, draftKey])

  const send = async () => {
    if (!invite || sending) return
    if (!statement.trim() && !videoUrl) return setError('Write a few words, or record a video.')
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
          // Without this the words publish under nobody, which is the whole
          // reason a named person was asked.
          author: (signedAs ?? invite.recipientName ?? '').trim() || undefined,
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

      setSent(true)
      if (claimId) {
        setClaimRef(claimId)
        // If this never lands the invite still looks unanswered, and reopening
        // the link offers a blank form — so the same person publishes twice.
        // Keep it locally and the next open closes the loop instead.
        try {
          localStorage.setItem(`testimonial_sent_${token}`, String(claimId))
        } catch {
          /* private mode */
        }
        markResponded(claimId)
      }
    } catch {
      setError('Couldn’t send. Your words are saved, please try again.')
    } finally {
      setSending(false)
    }
  }

  const markResponded = useCallback(
    async (claimId: number, attempt = 0) => {
      try {
        await axios.post(`/api/testimonial-requests/${token}/responded`, { claimId })
        localStorage.removeItem(`testimonial_sent_${token}`)
        localStorage.removeItem(draftKey)
      } catch (err: any) {
        // A rejection is final; a dropped connection is not.
        if (err?.response || attempt >= 3) return
        setTimeout(() => markResponded(claimId, attempt + 1), 2000 * (attempt + 1))
      }
    },
    [token]
  )

  // A send that got through but never got recorded: finish it on the next open,
  // and show them what they sent rather than an empty page.
  useEffect(() => {
    if (!invite || invite.responded) return
    const pending = Number(localStorage.getItem(`testimonial_sent_${token}`))
    if (!pending) return
    setClaimRef(pending)
    setSent(true)
    markResponded(pending)
  }, [invite, token, markResponded])

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

  if (offline && !invite) {
    return shell(
      <>
        <Typography sx={{ fontSize: 22, fontWeight: 600, mb: 1 }}>We couldn’t load this</Typography>
        <Typography sx={{ color: muted, fontSize: 16, lineHeight: 1.6, mb: 2.5 }}>
          The link is fine. Something between here and us isn’t. Try again in a moment.
        </Typography>
        <Link component='button' type='button' onClick={() => window.location.reload()} sx={{ fontSize: 15.5 }}>
          Try again
        </Link>
      </>
    )
  }

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

  const who = invite.requesterName?.trim() || ''
  const asker = who || 'whoever asked you'
  const you = (signedAs ?? invite.recipientName?.trim() ?? '').trim()
  const subject = invite.subjectName?.trim() || invite.subjectUri.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

  if (invite.responded && !sent && !replacing) {
    return shell(
      <>
        <Typography sx={{ fontSize: 24, fontWeight: 600, mb: 1 }}>You already sent this</Typography>
        <Typography sx={{ color: muted, fontSize: 15.5, lineHeight: 1.6, mb: 2.5 }}>
          {who ? `${who} has your words.` : 'Your words are in.'} Nothing more to do.
        </Typography>
        {invite.claimId && (
          <Typography sx={{ fontSize: 15.5, mb: 2.5 }}>
            <Link href={`/claims/${invite.claimId}`} target='_blank' rel='noopener noreferrer'>
              See what you wrote
            </Link>
          </Typography>
        )}
        <Typography sx={{ color: muted, fontSize: 14, lineHeight: 1.6, mb: 1.5 }}>
          To change or take it down,{' '}
          {isAuthed ? (
            <>
              use <Link href='/mine'>your list</Link>, or email{' '}
            </>
          ) : (
            'email '
          )}
          <Link href='mailto:support@linkedtrust.us'>support@linkedtrust.us</Link>.
        </Typography>
        <Typography sx={{ color: muted, fontSize: 14, lineHeight: 1.6 }}>
          Want to add something?{' '}
          <Link component='button' type='button' onClick={() => setReplacing(true)} sx={{ fontSize: 14 }}>
            Write another
          </Link>{' '}
          — the first one stays up too.
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
          {isAuthed ? (
            <>
              Take it down any time from <Link href='/mine'>your list</Link>, or email{' '}
              <Link href='mailto:support@linkedtrust.us'>support@linkedtrust.us</Link>.
            </>
          ) : (
            <>
              To change or remove it, email{' '}
              <Link href='mailto:support@linkedtrust.us'>support@linkedtrust.us</Link>. No questions asked.
            </>
          )}
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

      <Typography sx={{ fontSize: 16, lineHeight: 1.5, mt: 3, mb: 1, overflowWrap: 'anywhere' }}>
        Could you write a few words about {subject}?
        {invite.workSummary ? ` They mentioned ${invite.workSummary}.` : ''}
      </Typography>

      <TextField
        value={statement}
        onChange={e => setStatement(e.target.value)}
        fullWidth
        multiline
        minRows={4}
        placeholder={`Two or three sentences is plenty. What you saw them do, and what it meant.`}
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

      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mt: 2.5 }}>
        <Typography sx={{ fontSize: 15, color: muted, overflowWrap: 'anywhere' }}>
          Stars too, if you want:
        </Typography>
        <Rating
          value={stars}
          onChange={(_, v) => setStars(v && v > 0 ? v : null)}
          icon={<StarRoundedIcon fontSize='inherit' />}
          emptyIcon={<StarRoundedIcon fontSize='inherit' />}
          sx={{ fontSize: '1.6rem', '& .MuiRating-iconEmpty': { color: rule } }}
        />
        {stars ? (
          <Link component='button' type='button' onClick={() => setStars(null)} sx={{ fontSize: 13, color: muted }}>
            clear
          </Link>
        ) : null}
      </Box>

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
          compact
          autoOpenCamera={false}
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
        {editingName ? (
          <TextField
            value={you}
            onChange={e => {
              // A link gets forwarded. Whoever is writing now should not be
              // signing under the profile of the person it was sent to.
              if (invite.recipientProfile && profile === invite.recipientProfile) setProfile('')
              setSignedAs(e.target.value)
            }}
            fullWidth
            size='small'
            autoFocus
            label='Sign as'
            placeholder='Leave blank to stay anonymous'
            onBlur={() => setEditingName(false)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: tint } }}
          />
        ) : editingProfile ? (
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
              <Link component='button' type='button' onClick={() => setEditingName(true)} sx={{ fontSize: 13, color: muted }}>
                change name
              </Link>
              <Link component='button' type='button' onClick={() => setEditingProfile(true)} sx={{ fontSize: 13, color: muted }}>
                {profile ? 'edit link' : 'add a link'}
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

      <Typography sx={{ color: muted, fontSize: 13.5, lineHeight: 1.6, mb: 1.75 }}>
        This goes up publicly under your name, for {asker} to share. You can have it taken
        down any time: <Link href='mailto:support@linkedtrust.us'>support@linkedtrust.us</Link>.
      </Typography>

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
        {sending ? 'Sending…' : who ? `Send to ${who}` : 'Send'}
      </Button>

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

export default TestimonialStable
