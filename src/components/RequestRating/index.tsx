import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  MenuItem,
  Container,
  useTheme,
  Alert,
  FormControl,
  FormHelperText,
  CircularProgress
} from '@mui/material'
import type { Theme } from '@mui/material/styles'
import { Controller, useForm } from 'react-hook-form'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import StarIcon from '@mui/icons-material/Star'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import Loader from '../Loader'
import BadgeSharePanel from '../BadgeSharePanel'
import { checkAuth, AUTH_STATE_CHANGED_EVENT } from '../../utils/authUtils'
import { neutralColors } from '../../theme/colors'
import PlatformFeedbackCard from '../../containers/PlatformFeedback/PlatformFeedbackCard'
import PlatformFeedbackVideoSection from '../../containers/PlatformFeedback/PlatformFeedbackVideoSection'
import SignInDivider from '../../containers/PlatformFeedback/SignInDivider'
import QuickAuth from '../QuickAuth'
import { ratingAspectOptions } from '../../containers/PlatformFeedback/ratingAspectOptions'
import LegalConsentFooter from '../LegalConsentFooter'

const REQUEST_RATING_DRAFT_KEY = 'linkedtrust_request_rating_draft'
const FORM_ID = 'request-rating-form'

interface RequestRatingDraft {
  about: string
  statement: string
  aspect: string
  stars: number | null
  sourceURI: string
  effectiveDate: string
  videoUrl: string | null
}

interface FormData {
  subject: string
  statement: string
  aspect: string
  stars: number | null
  sourceURI: string
  effectiveDate: Date
}

const outlinedFieldSx = (theme: Theme) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: neutralColors.white,
    fontSize: '14px',
    '& fieldset': {
      borderColor: '#CAD5E2',
      borderWidth: '1px'
    },
    '&:hover fieldset': {
      borderColor: '#CAD5E2'
    },
    '&.Mui-focused fieldset': {
      borderWidth: '1px',
      borderColor: theme.palette.primary.main
    },
    '& .MuiInputBase-input': {
      fontSize: '14px',
      color: neutralColors.gray[900]
    },
    '& .MuiInputBase-input::placeholder': {
      color: 'rgba(15, 23, 43, 0.5)',
      opacity: 1
    }
  }
})

const labelSx = {
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '20px',
  color: '#314158',
  mb: 1,
  display: 'block'
} as const

const submitGradientSx = {
  borderRadius: '14px',
  minHeight: 48,
  py: 1.25,
  textTransform: 'none' as const,
  fontWeight: 600,
  fontSize: '16px',
  color: '#fff',
  background: 'linear-gradient(90deg, #11aae6 0%, #1fa3e7 20.19%, #3299e7 48.08%, #4290e8 71.64%, #5586e9 100%)',
  boxShadow: '0px 4px 6px rgba(0,0,0,0.1), 0px 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    background: 'linear-gradient(90deg, #0d9ad4 0%, #1892c9 20.19%, #2a87c9 48.08%, #387ecc 71.64%, #4874cd 100%)',
    boxShadow: '0px 6px 8px rgba(0,0,0,0.12), 0px 2px 4px rgba(0,0,0,0.1)'
  },
  '&.Mui-disabled': {
    background: 'linear-gradient(90deg, #94a3b8 0%, #64748b 100%)',
    color: '#fff'
  }
}

const unsignedSubmitSx = {
  borderRadius: '14px',
  minHeight: 48,
  py: 1.25,
  textTransform: 'none' as const,
  fontWeight: 600,
  fontSize: '16px',
  bgcolor: '#E2E8F0',
  color: '#90A1B9',
  '&:hover': {
    bgcolor: '#D8E0EA'
  }
}

const RequestRating: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [newClaimId, setNewClaimId] = useState<number | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isAuthed, setIsAuthed] = useState(() => checkAuth())

  const aboutUri = searchParams.get('about') || ''

  const syncAuth = useCallback(() => {
    setIsAuthed(checkAuth())
  }, [])

  useEffect(() => {
    syncAuth()
  }, [location.key, syncAuth])

  useEffect(() => {
    const handler = () => syncAuth()
    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handler)
    return () => window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handler)
  }, [syncAuth])

  const extractDisplayName = (uri: string): string => {
    try {
      const url = new URL(uri)
      if (url.hostname.includes('linkedin.com')) {
        const parts = url.pathname.split('/').filter(Boolean)
        const name = parts[parts.length - 1]
        return name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
      if (url.hostname.includes('github.com')) {
        return url.pathname.split('/').filter(Boolean)[0] || uri
      }
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts.length > 0) {
        return parts[parts.length - 1].replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
      return url.hostname
    } catch {
      return uri
    }
  }

  const subjectName = extractDisplayName(aboutUri)

  const { handleSubmit, control, watch, reset } = useForm<FormData>({
    defaultValues: {
      subject: aboutUri,
      statement: '',
      aspect: '',
      stars: null,
      sourceURI: '',
      effectiveDate: new Date()
    }
  })

  const { createClaim } = useCreateClaim()

  useEffect(() => {
    if (!aboutUri) return
    const raw = sessionStorage.getItem(REQUEST_RATING_DRAFT_KEY)
    if (!raw) return
    try {
      const draft = JSON.parse(raw) as RequestRatingDraft
      if (draft.about !== aboutUri) return
      reset({
        subject: draft.about,
        statement: draft.statement ?? '',
        aspect: draft.aspect ?? '',
        stars: draft.stars,
        sourceURI: draft.sourceURI ?? '',
        effectiveDate: draft.effectiveDate ? new Date(draft.effectiveDate) : new Date()
      })
      if (draft.videoUrl) setVideoUrl(draft.videoUrl)
      sessionStorage.removeItem(REQUEST_RATING_DRAFT_KEY)
    } catch {
      sessionStorage.removeItem(REQUEST_RATING_DRAFT_KEY)
    }
  }, [aboutUri, reset])

  const runCreate = async (data: FormData) => {
    if (!data.subject) return

    setLoading(true)
    try {
      sessionStorage.removeItem(REQUEST_RATING_DRAFT_KEY)
      const payload = {
        subject: data.subject,
        claim: 'rated',
        statement: data.statement.trim(),
        aspect: data.aspect,
        howKnown: 'FIRST_HAND',
        effectiveDate: data.effectiveDate.toISOString(),
        stars: data.stars ?? undefined,
        sourceURI: data.sourceURI?.trim() || undefined,
        images: [] as [],
        ...(videoUrl && { videoUrl })
      }

      const { message, isSuccess, claimId } = await createClaim(payload, { skipWalletCheck: true })

      if (isSuccess) {
        setSubmitted(true)
        if (claimId) setNewClaimId(claimId)
      } else {
        console.error('Failed to create rating:', message)
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = handleSubmit(async data => {
    if (!data.subject) return

    if (!checkAuth()) {
      const draft: RequestRatingDraft = {
        about: data.subject,
        statement: data.statement,
        aspect: data.aspect,
        stars: data.stars,
        sourceURI: data.sourceURI,
        effectiveDate: data.effectiveDate.toISOString(),
        videoUrl
      }
      sessionStorage.setItem(REQUEST_RATING_DRAFT_KEY, JSON.stringify(draft))
      navigate('/login', { state: { from: location } })
      return
    }

    await runCreate(data)
  })

  const watchStars = watch('stars')

  const cardSubtitle = (
    <Typography component='p' sx={{ fontSize: '16px', lineHeight: '20px', color: '#62748E', m: 0 }}>
      Share your testimonial about{' '}
      <Typography
        component='a'
        href={aboutUri}
        target='_blank'
        rel='noopener noreferrer'
        sx={{ color: '#155DFC', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
      >
        {subjectName}
      </Typography>
    </Typography>
  )

  if (!aboutUri) {
    return (
      <Box
        sx={{
          width: '100%',
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 4 },
          pb: { xs: 8, sm: 6 },
          bgcolor: neutralColors.gray[50],
          minHeight: { xs: 'calc(100vh - 120px)', sm: 'auto' }
        }}
      >
        <Container maxWidth='sm' sx={{ py: 2 }}>
          <Alert severity='error'>
            {
              'No subject specified. This link should include an "about" query parameter with the subject profile or page URL.'
            }
          </Alert>
        </Container>
      </Box>
    )
  }

  if (submitted) {
    return (
      <Box
        sx={{
          width: '100%',
          px: { xs: 2, sm: 3 },
          py: 4,
          bgcolor: neutralColors.gray[50],
          minHeight: { xs: 'calc(100vh - 120px)', sm: 'auto' }
        }}
      >
        <Box
          sx={{
            maxWidth: 576,
            mx: 'auto',
            bgcolor: '#fff',
            borderRadius: '16px',
            boxShadow: '0px 20px 25px rgba(0,0,0,0.1), 0px 8px 10px rgba(0,0,0,0.1)',
            p: 4,
            textAlign: 'center'
          }}
        >
          <StarIcon sx={{ fontSize: 48, color: theme.palette.warning.main }} />
          <Typography variant='h5' sx={{ fontWeight: 700, mt: 2 }}>
            Thank you for your rating!
          </Typography>
          <Typography variant='body2' sx={{ color: theme.palette.text.secondary, mt: 1 }}>
            Your testimonial has been submitted and will be visible on LinkedTrust.
          </Typography>
          {newClaimId != null ? (
            <Button
              variant='contained'
              onClick={() => navigate(`/claims/${newClaimId}`)}
              sx={{ textTransform: 'none', mt: 2 }}
            >
              View your submission
            </Button>
          ) : null}
          {newClaimId != null ? (
            <Box sx={{ mt: 3, textAlign: 'left' }}>
              <BadgeSharePanel claimId={newClaimId} />
            </Box>
          ) : null}
          {newClaimId == null ? (
            <Button variant='contained' onClick={() => navigate('/feed')} sx={{ textTransform: 'none', mt: 3 }}>
              Browse feed
            </Button>
          ) : null}
        </Box>
      </Box>
    )
  }

  const primarySubmitLabel = isAuthed ? 'Submit rating' : 'Sign in to Submit'

  return (
    <>
      <Loader open={loading} />
      <Box
        sx={{
          width: '100%',
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 4 },
          pb: { xs: 8, sm: 6 },
          bgcolor: neutralColors.gray[50],
          minHeight: { xs: 'calc(100vh - 120px)', sm: 'auto' }
        }}
      >
        <PlatformFeedbackCard mode='rating' title='Rate Your Experience' subtitle={cardSubtitle}>
          <form id={FORM_ID} onSubmit={onSubmit} noValidate>
            <Box sx={{ mb: 2.5 }}>
              <Typography component='label' sx={labelSx}>
                Your Rating *
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Controller
                  name='stars'
                  control={control}
                  rules={{
                    required: 'Please select a rating',
                    validate: v => (v != null && v > 0) || 'Please select a rating'
                  }}
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <FormControl error={!!error}>
                      <Rating
                        name='stars'
                        value={value ?? 0}
                        onChange={(_, newValue) => onChange(newValue)}
                        size='large'
                        sx={{
                          fontSize: '2.25rem',
                          '& .MuiRating-iconFilled': { color: theme.palette.warning.main }
                        }}
                      />
                      {error && <FormHelperText sx={{ textAlign: 'center' }}>{error.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Box>
              {watchStars != null && watchStars > 0 && (
                <Typography variant='body2' sx={{ textAlign: 'center', mt: 0.5, color: '#62748E', fontSize: '13px' }}>
                  {watchStars === 5 && 'Excellent!'}
                  {watchStars === 4 && 'Very good'}
                  {watchStars === 3 && 'Good'}
                  {watchStars === 2 && 'Fair'}
                  {watchStars === 1 && 'Poor'}
                </Typography>
              )}
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography component='label' sx={labelSx} htmlFor='rr-aspect'>
                What aspect are you rating? *
              </Typography>
              <Controller
                name='aspect'
                control={control}
                rules={{ required: 'Please select an aspect' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    id='rr-aspect'
                    select
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    sx={outlinedFieldSx(theme)}
                  >
                    <MenuItem value=''>Select an aspect…</MenuItem>
                    {ratingAspectOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography component='label' sx={labelSx} htmlFor='rr-statement'>
                Your Testimonial *
              </Typography>
              <Controller
                name='statement'
                control={control}
                rules={{ required: 'This field is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    id='rr-statement'
                    fullWidth
                    multiline
                    minRows={4}
                    placeholder='Share your experience...'
                    error={!!error}
                    helperText={error?.message}
                    sx={outlinedFieldSx(theme)}
                  />
                )}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography component='label' sx={labelSx} htmlFor='rr-source'>
                Your profile URL
              </Typography>
              <Typography variant='body2' sx={{ color: '#62748E', mb: 1, fontSize: '13px' }}>
                Optional: link to your LinkedIn, website, or other profile
              </Typography>
              <Controller
                name='sourceURI'
                control={control}
                rules={{
                  validate: v =>
                    !v?.trim() ||
                    /^https?:\/\//.test(v.trim()) ||
                    'Please enter a valid URL starting with http:// or https://'
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    id='rr-source'
                    fullWidth
                    placeholder='https://linkedin.com/in/yourprofile'
                    error={!!error}
                    helperText={error?.message}
                    sx={outlinedFieldSx(theme)}
                  />
                )}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography component='label' sx={labelSx}>
                When did you interact with them?
              </Typography>
              <Typography variant='body2' sx={{ color: '#62748E', mb: 1, fontSize: '13px' }}>
                Optional context for when this experience took place
              </Typography>
              <Controller
                name='effectiveDate'
                control={control}
                render={({ field }) => (
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={field.value}
                      onChange={date => field.onChange(date)}
                      renderInput={params => <TextField {...params} fullWidth sx={outlinedFieldSx(theme)} />}
                    />
                  </LocalizationProvider>
                )}
              />
            </Box>

            <PlatformFeedbackVideoSection
              videoUrl={videoUrl}
              onVideoUploaded={setVideoUrl}
              onVideoRemoved={() => setVideoUrl(null)}
            />
          </form>

          {!isAuthed && (
            <>
              <SignInDivider />
              <QuickAuth mode='inline' onAuthenticated={syncAuth} inlineHideMetaMask />
            </>
          )}

          <Button
            form={FORM_ID}
            type='submit'
            fullWidth
            disabled={loading}
            sx={{
              ...(isAuthed ? submitGradientSx : unsignedSubmitSx),
              mt: 2
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                <CircularProgress size={18} sx={{ color: 'inherit' }} />
                <span>Submitting...</span>
              </Box>
            ) : (
              primarySubmitLabel
            )}
          </Button>

          <LegalConsentFooter variant='rating' />
        </PlatformFeedbackCard>
      </Box>
    </>
  )
}

export default RequestRating
