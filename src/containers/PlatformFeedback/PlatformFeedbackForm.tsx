import { useState, type ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useTheme, CircularProgress } from '@mui/material'
import type { Theme } from '@mui/material/styles'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import IHomeProps from '../Form/types'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import Loader from '../../components/Loader'
import QuickAuth from '../../components/QuickAuth'
import BadgeSharePanel from '../../components/BadgeSharePanel'
import { neutralColors } from '../../theme/colors'
import PlatformFeedbackCard from './PlatformFeedbackCard'
import SignInDivider from './SignInDivider'
import PlatformFeedbackVideoSection from './PlatformFeedbackVideoSection'
import { PLATFORM_FEEDBACK_SUBJECT } from './constants'
import LegalConsentFooter from '../../components/LegalConsentFooter'

const FORM_ID = 'platform-feedback-form'

interface PlatformFeedbackFormProps extends IHomeProps {
  isAuthenticated?: boolean
}

interface FormValues {
  aspect: string
  statement: string
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

const PlatformFeedbackForm = ({
  isAuthenticated,
  toggleSnackbar,
  setSnackbarMessage,
  setLoading: setAppLoading
}: PlatformFeedbackFormProps) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [newClaimId, setNewClaimId] = useState<number | null>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [submitStarted, setSubmitStarted] = useState(false)

  const { handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      aspect: '',
      statement: ''
    }
  })

  const { createClaim } = useCreateClaim()

  const runCreate = async (data: FormValues) => {
    setLoading(true)
    setAppLoading(true)
    try {
      const statementCombined = data.aspect.trim()
        ? `${data.aspect.trim()}\n\n${data.statement.trim()}`
        : data.statement.trim()
      const payload = {
        subject: PLATFORM_FEEDBACK_SUBJECT,
        statement: statementCombined,
        sourceURI: PLATFORM_FEEDBACK_SUBJECT,
        howKnown: 'FIRST_HAND' as const,
        effectiveDate: new Date().toISOString(),
        claim: 'validated' as const,
        images: [] as [],
        ...(videoUrl && { videoUrl })
      }
      const { message, isSuccess, claimId } = await createClaim(payload, { skipWalletCheck: true })
      if (isSuccess) {
        setSubmitted(true)
        if (claimId) setNewClaimId(claimId)
        setSnackbarMessage('Endorsement submitted successfully.')
        toggleSnackbar(true)
      } else {
        setSnackbarMessage(message || 'Could not submit your endorsement.')
        toggleSnackbar(true)
      }
    } catch (e) {
      console.error(e)
      setSnackbarMessage('Something went wrong. Please try again.')
      toggleSnackbar(true)
    } finally {
      setLoading(false)
      setAppLoading(false)
    }
  }

  const onValid = async (data: FormValues) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true)
      return
    }
    setSubmitStarted(true)
    await runCreate(data)
  }

  const onFormSubmit = handleSubmit(onValid)

  const resumeSubmitAfterAuthDialog = () => {
    setShowAuthDialog(false)
    setSubmitStarted(true)
    handleSubmit(runCreate)()
  }

  if (submitted) {
    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: 576,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          py: 4,
          bgcolor: neutralColors.gray[50],
          minHeight: { xs: 'calc(100vh - 120px)', sm: 'auto' }
        }}
      >
        <Box
          sx={{
            bgcolor: '#fff',
            borderRadius: '16px',
            boxShadow: '0px 20px 25px rgba(0,0,0,0.1), 0px 8px 10px rgba(0,0,0,0.1)',
            p: 4,
            textAlign: 'center'
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 48, color: theme.palette.success.main }} />
          <Typography variant='h5' sx={{ fontWeight: 700, mt: 2 }}>
            Thank you for your endorsement!
          </Typography>
          <Typography variant='body2' sx={{ color: theme.palette.text.secondary, mt: 1 }}>
            Your feedback will be visible on LinkedTrust.
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

  const primarySubmitLabel = isAuthenticated === true ? 'Submit endorsement' : 'Sign in to Submit'

  let submitButtonContent: ReactNode
  if (loading) {
    submitButtonContent = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={18} sx={{ color: 'inherit' }} />
        <span>Submitting...</span>
      </Box>
    )
  } else if (submitStarted) {
    submitButtonContent = 'Submit endorsement'
  } else {
    submitButtonContent = primarySubmitLabel
  }

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
        <PlatformFeedbackCard mode='endorsement' title='Write an Endorsement'>
          <form id={FORM_ID} onSubmit={onFormSubmit} noValidate>
            <Box sx={{ mb: 2.5 }}>
              <Typography component='label' sx={labelSx} htmlFor='pf-aspect'>
                What aspect are you endorsing? *
              </Typography>
              <Controller
                name='aspect'
                control={control}
                rules={{ required: 'Please describe what you are endorsing' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    id='pf-aspect'
                    fullWidth
                    placeholder='e.g. Product quality, support, trustworthiness'
                    error={!!error}
                    helperText={error?.message}
                    sx={outlinedFieldSx(theme)}
                  />
                )}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography component='label' sx={labelSx} htmlFor='pf-statement'>
                Your Endorsement *
              </Typography>
              <Controller
                name='statement'
                control={control}
                rules={{ required: 'This field is required' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    id='pf-statement'
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

            <PlatformFeedbackVideoSection
              videoUrl={videoUrl}
              onVideoUploaded={setVideoUrl}
              onVideoRemoved={() => setVideoUrl(null)}
            />
          </form>

          {isAuthenticated !== true && (
            <>
              <SignInDivider />
              <QuickAuth mode='inline' onAuthenticated={() => undefined} inlineHideMetaMask />
            </>
          )}

          <Button
            form={FORM_ID}
            type='submit'
            fullWidth
            disabled={loading}
            sx={{
              ...(isAuthenticated ? submitGradientSx : unsignedSubmitSx),
              mt: 2
            }}
          >
            {submitButtonContent}
          </Button>

          <LegalConsentFooter variant='endorsement' />
        </PlatformFeedbackCard>
      </Box>

      {showAuthDialog && (
        <QuickAuth
          mode='dialog'
          onAuthenticated={resumeSubmitAfterAuthDialog}
          onDismiss={() => setShowAuthDialog(false)}
          onSubmitAnonymous={resumeSubmitAfterAuthDialog}
          dialogTitle='Sign in to submit'
          dialogDescription='Sign in to publish your feedback on LinkedTrust. You can also submit without signing in.'
          dialogHideMetaMask
        />
      )}
    </>
  )
}

export default PlatformFeedbackForm
