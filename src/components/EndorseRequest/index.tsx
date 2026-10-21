// Open endorsement request (/e/:claimId).
//
// One link, shared with many people at once. Nobody was named, so there is no
// token, no expiry, and no reject option — every visitor is being asked the same
// friendly question: can you add your endorsement?
//
// The design is the invite page (components/Testimonial/Stable.tsx, /t/:token):
// standalone card, no app chrome, words first.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Button, CircularProgress, Link, Rating, TextField, Typography } from '@mui/material'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import axios from '../../axiosInstance'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import PlatformFeedbackVideoSection from '../../containers/PlatformFeedback/PlatformFeedbackVideoSection'
import QuickAuth from '../QuickAuth'
import { checkAuth, getIdentityHints, AUTH_STATE_CHANGED_EVENT } from '../../utils/authUtils'
import logo from '../../assets/logolinkedtrust.svg'

const ink = '#1B2430'
const muted = '#6B7684'
const rule = '#E6E9EE'
const ground = '#F5F7FA'
const serif = "'Literata', Georgia, serif"
const tint = '#FAFBFC'
const accent = '#00b2e5'

const hostOf = (uri: string) => uri.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

const EndorseRequest: React.FC = () => {
  const { claimId = '' } = useParams()

  const [subjectUri, setSubjectUri] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [askerName, setAskerName] = useState('')
  const [claimStatement, setClaimStatement] = useState('')
  const [claimImage, setClaimImage] = useState('')
  const [claimImageCaption, setClaimImageCaption] = useState('')
  const [claimDate, setClaimDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [gone, setGone] = useState(false)
  const [offline, setOffline] = useState(false)
  const [replacing, setReplacing] = useState(false)

  const draftKey = `endorsement_draft_${claimId}`
  const sentKey = `endorsement_sent_${claimId}`
  const draft = useMemo(() => {
    try {
      const raw = localStorage.getItem(draftKey)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }, [draftKey])

  const [statement, setStatement] = useState<string>(draft.statement ?? '')
  const [stars, setStars] = useState<number | null>(draft.stars ?? null)
  const [videoUrl, setVideoUrl] = useState<string | null>(draft.videoUrl ?? null)
  const [videoPending, setVideoPending] = useState(false)
  const [signedAs, setSignedAs] = useState('')
  const [profile, setProfile] = useState('')

  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [claimRef, setClaimRef] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAuthed, setIsAuthed] = useState(() => checkAuth())
  const [showSignIn, setShowSignIn] = useState(false)

  const { createClaim } = useCreateClaim()
  const syncAuth = useCallback(() => setIsAuthed(checkAuth()), [])
  const signInRef = useRef<HTMLDivElement | null>(null)

  // Signing in is optional here, so the panel is one place only — at the top,
  // where it is visible on arrival. The note by the Send button scrolls to it
  // rather than opening a second copy.
  const openSignIn = useCallback(() => {
    setShowSignIn(true)
    requestAnimationFrame(() => signInRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }, [])

  useEffect(() => {
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, syncAuth)
    return () => window.removeEventListener(AUTH_STATE_CHANGED_EVENT, syncAuth)
  }, [syncAuth])

  useEffect(() => {
    if (!isAuthed) return
    const hints = getIdentityHints()
    setSignedAs(prev => prev || hints.name)
    setProfile(prev => prev || hints.link)
  }, [isAuthed])

  useEffect(() => {
    if (!claimId) return
    let live = true
    axios
      .get(`/api/claims/${claimId}`)
      .then(res => {
        if (!live) return
        const c = res.data?.claim
        const subj = typeof c?.subject === 'string' ? c.subject : c?.subject?.uri
        if (!subj) return setGone(true)
        setSubjectUri(subj)
        setClaimStatement(c.statement ?? '')

        // Who is asking, and a readable name for the thing: both are in the
        // graph edges, the only place this API exposes names.
        const edges: any[] = Array.isArray(c.edges) ? c.edges : []
        setAskerName(edges.find(e => e?.label === 'source')?.endNode?.name?.trim() ?? '')
        setSubjectName(edges.find(e => e?.label === 'subject')?.endNode?.name?.trim() ?? '')

        const image = Array.isArray(res.data?.images) ? res.data.images[0] : null
        if (image?.url) {
          setClaimImage(image.url)
          setClaimImageCaption(image.metadata?.caption ?? '')
        }

        if (c.effectiveDate) {
          // The stored date is a UTC instant. Formatted in the visitor's zone it
          // reads a day early for everyone west of Greenwich.
          setClaimDate(
            new Date(c.effectiveDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC'
            })
          )
        }
      })
      .catch(err => {
        if (!live) return
        // No status at all means the request never landed. Telling them the link
        // is bad sends them off to ask for another that fails the same way.
        if ([404, 410].includes(err?.response?.status)) setGone(true)
        else setOffline(true)
      })
      .finally(() => live && setLoading(false))
    return () => {
      live = false
    }
  }, [claimId])

  // In-app browsers get killed mid-sentence. Keep the video with the words.
  useEffect(() => {
    if (!statement && !videoUrl && !stars) return
    try {
      localStorage.setItem(draftKey, JSON.stringify({ statement, videoUrl, stars }))
    } catch {
      /* private mode */
    }
  }, [statement, videoUrl, stars, draftKey])

  // Already endorsed from this browser: show that instead of a blank form, so
  // the same person doesn't publish twice by reopening the link.
  const alreadySent = useMemo(() => {
    try {
      return Number(localStorage.getItem(sentKey)) || null
    } catch {
      return null
    }
  }, [sentKey])

  const send = async () => {
    if (sending) return
    if (!statement.trim() && !videoUrl) return setError('Write a few words, or record a video.')
    if (videoPending) return setError('Your video is still uploading, one moment.')

    setError(null)
    setSending(true)
    try {
      const { isSuccess, message, claimId: newId } = await createClaim(
        {
          subject: subjectUri,
          // Stars make it a rating; without them it's a plain endorsement,
          // not a rating that happens to be blank.
          claim: stars && stars > 0 ? 'rated' : 'is_vouched_for',
          statement: statement.trim(),
          author: signedAs.trim() || undefined,
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
      if (newId) {
        setClaimRef(newId)
        try {
          localStorage.setItem(sentKey, String(newId))
          localStorage.removeItem(draftKey)
        } catch {
          /* private mode */
        }
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
          <Typography sx={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>LinkedTrust</Typography>
        </Box>

        {children}
      </Box>
    </Box>
  )

  if (loading) return shell(<CircularProgress size={24} sx={{ display: 'block', mx: 'auto' }} />)

  if (offline && !subjectUri) {
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

  if (gone || !subjectUri) {
    return shell(
      <>
        <Typography sx={{ fontSize: 22, fontWeight: 600, mb: 1 }}>This link isn’t working</Typography>
        <Typography sx={{ color: muted, fontSize: 16, lineHeight: 1.6 }}>
          Ask whoever sent it for a new one.
        </Typography>
      </>
    )
  }

  const subject = subjectName || hostOf(subjectUri)

  if (sent) {
    return shell(
      <>
        <Typography sx={{ fontSize: 34, mb: 1.5 }}>🌟</Typography>
        <Typography sx={{ fontSize: 24, fontWeight: 600, mb: 1 }}>
          Sent{signedAs.trim() ? `, thank you ${signedAs.trim()}` : ', thank you'}.
        </Typography>
        {statement.trim() && (
          <>
            <Typography sx={{ color: muted, fontSize: 15, lineHeight: 1.6, mb: 2.5 }}>Here’s what you wrote:</Typography>
            <Box sx={{ borderLeft: `3px solid ${rule}`, pl: 2.5 }}>
              <Typography sx={{ fontFamily: serif, fontSize: 16.5, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                {statement}
              </Typography>
            </Box>
          </>
        )}
        {videoUrl && (
          <Box
            component='video'
            src={videoUrl}
            controls
            sx={{ width: '100%', mt: 2.5, borderRadius: '12px', border: `1px solid ${rule}`, bgcolor: '#000' }}
          />
        )}
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
              To change or remove it, email <Link href='mailto:support@linkedtrust.us'>support@linkedtrust.us</Link>. No
              questions asked.
            </>
          )}
        </Typography>
      </>
    )
  }

  if (alreadySent && !replacing) {
    return shell(
      <>
        <Typography sx={{ fontSize: 24, fontWeight: 600, mb: 1 }}>You already endorsed this</Typography>
        <Typography sx={{ color: muted, fontSize: 15.5, lineHeight: 1.6, mb: 2.5 }}>
          Your words are in. Nothing more to do.
        </Typography>
        <Typography sx={{ fontSize: 15.5, mb: 2.5 }}>
          <Link href={`/claims/${alreadySent}`} target='_blank' rel='noopener noreferrer'>
            See what you wrote
          </Link>
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

  return shell(
    <>
      <Typography sx={{ fontSize: { xs: 22, sm: 25 }, fontWeight: 600, letterSpacing: '-0.01em' }}>
        Can you add your endorsement?
      </Typography>

      <Typography sx={{ color: muted, fontSize: 16, lineHeight: 1.5, mt: 1, overflowWrap: 'anywhere' }}>
        {askerName ? `${askerName} is asking people who were there to say what they saw.` : 'Here is what is being endorsed:'}
      </Typography>

      {claimStatement && (
        <Box sx={{ borderLeft: `3px solid ${accent}`, pl: 2, py: 0.25, mt: 2 }}>
          <Typography sx={{ fontFamily: serif, fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {claimStatement}
          </Typography>
          <Typography sx={{ color: muted, fontSize: 14, mt: 0.75, overflowWrap: 'anywhere' }}>
            {/* Clickable, but not underlined: this line is context, not the thing
                we want them doing instead of writing. */}
            <Link
              href={subjectUri}
              target='_blank'
              rel='noopener noreferrer'
              sx={{ color: muted, textDecoration: 'none' }}
            >
              {subject}
            </Link>
            {claimDate ? ` · ${claimDate}` : ''}
            {' · '}
            <Link
              href={`/claims/${claimId}`}
              target='_blank'
              rel='noopener noreferrer'
              sx={{ color: muted, textDecoration: 'none' }}
            >
              the claim
            </Link>
          </Typography>
        </Box>
      )}

      {claimImage && (
        <Box sx={{ mt: 2 }}>
          <Box
            component='img'
            src={claimImage}
            alt={claimImageCaption}
            sx={{
              width: '100%',
              maxHeight: 220,
              objectFit: 'cover',
              display: 'block',
              borderRadius: '12px',
              border: `1px solid ${rule}`
            }}
          />
          {claimImageCaption && (
            <Typography sx={{ color: muted, fontSize: 13, mt: 0.75 }}>{claimImageCaption}</Typography>
          )}
        </Box>
      )}

      <Typography sx={{ fontSize: 16, lineHeight: 1.5, mt: 3, mb: 1, overflowWrap: 'anywhere' }}>
        Could you write a few words about {subject}?
      </Typography>

      <TextField
        value={statement}
        onChange={e => setStatement(e.target.value)}
        fullWidth
        multiline
        minRows={4}
        placeholder='Two or three sentences is plenty. What you saw, and what it meant.'
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
        <Typography sx={{ fontSize: 15, color: muted }}>Stars too, if you want:</Typography>
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
        <Typography sx={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.5 }}>Signed</Typography>

        {!isAuthed && (
          <Typography sx={{ color: muted, fontSize: 13, mt: 0.5, lineHeight: 1.6 }}>
            <Link component='button' type='button' onClick={openSignIn} sx={{ fontSize: 13 }}>
              sign in
            </Link>{' '}
            to fill these in and to edit or delete this later — or just type them.
          </Typography>
        )}

        {!isAuthed && showSignIn && (
          <Box ref={signInRef} sx={{ mt: 1.5 }}>
            <QuickAuth mode='inline' onAuthenticated={syncAuth} inlineHideMetaMask />
          </Box>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1.5 }}>
          <TextField
            value={signedAs}
            onChange={e => setSignedAs(e.target.value)}
            size='small'
            label='Your name'
            placeholder='Leave blank to stay anonymous'
            sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: tint } }}
          />
          <TextField
            value={profile}
            onChange={e => setProfile(e.target.value)}
            size='small'
            label='Your link'
            placeholder='linkedin.com/in/you, optional'
            sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: tint } }}
          />
        </Box>
      </Box>

      <Typography sx={{ color: muted, fontSize: 13.5, lineHeight: 1.6, mb: 1.75 }}>
        This goes up publicly under your name. You can have it taken down any time:{' '}
        <Link href='mailto:support@linkedtrust.us'>support@linkedtrust.us</Link>.
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
        {sending ? 'Sending…' : 'Send endorsement'}
      </Button>

      {!isAuthed && (
        <Typography sx={{ color: muted, fontSize: 13, mt: 1.5, textAlign: 'center' }}>
          Sending works whether you sign in or not.
        </Typography>
      )}
    </>
  )
}

export default EndorseRequest
