// Requested-endorsement page (/endorse-invite/:claimId).
//
// Someone asked this person, by name, for an endorsement. They are not here to
// judge the claim, so there is no validate/reject choice — the decision is
// fixed to 'validate' and the page only asks how they know and what they'd say.
// Deliberately a separate page from /endorse, which stays the neutral
// anyone-can-weigh-in surface with both options.
import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import {
  Button,
  MenuItem,
  FormControl,
  useTheme,
  Card,
  Select,
  TextField,
  useMediaQuery,
  IconButton,
  Link as MuiLink,
  Tooltip,
  Fade,
  FormHelperText,
  CardContent,
  Alert,
  Skeleton
} from '@mui/material'
import { Controller, useForm, useFieldArray, Control } from 'react-hook-form'
import IHomeProps from '../../containers/Form/types'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import { useQueryParams } from '../../hooks'
import Loader from '../Loader'
import * as api from '../../api'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import placeholderImage from '../../assets/images/imgplaceholder.svg'
import HelpIcon from '@mui/icons-material/Help'
import ImageUploader from '../Form/imageUploading'
import VideoRecorder from '../VideoRecorder'
import MainContainer from '../MainContainer'
import EndorsementShare from '../EndorsementShare'
import QuickAuth from '../QuickAuth'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import VideocamIcon from '@mui/icons-material/Videocam'

// Constants for How Known options (subset of backend enum)
const HOW_KNOWN = {
  FirstHand: 'FIRST_HAND',
  SecondHand: 'SECOND_HAND',
  WebDocument: 'WEB_DOCUMENT'
} as const

// Special internal UI values - NOT backend enum values
// These get mapped to proper backend values in onSubmit
const FIRST_HAND_BENEFIT = 'FIRST_HAND_BENEFIT_UI' // UI only: maps to FIRST_HAND + claim=impact
const NOT_RELEVANT = 'NOT_RELEVANT_UI' // UI only: maps to FIRST_HAND + claim=spam

const CLAIM_RATED = 'rated'
const CLAIM_VALIDATED = 'validated'
const CLAIM_REJECTED = 'rejected'
const CLAIM_IMPACT = 'impact'

type HowKnown = (typeof HOW_KNOWN)[keyof typeof HOW_KNOWN]

interface ImageI {
  url: string
  metadata: {
    description: string
    caption: string
  }
  effectiveDate: Date
  createdDate: Date
}

interface FormData {
  subject: string
  statement: string
  sourceURI: string
  amt: string
  basis: string
  effectiveDate: Date
  images: ImageI[]
  decision: 'validate' | 'reject' | ''
  otherRejectReason: string
}

// One label style for every field on this page: quiet, small, consistent.
const fieldLabelSx = {
  mb: 1,
  fontSize: '0.8125rem',
  fontWeight: 600,
  letterSpacing: '0.01em',
  color: 'text.secondary'
} as const

// Reusable URL Input Field Component
// A URL the source field accepts: http(s), or a bare www. host.
// Parsed rather than pattern-matched — the previous regex backtracked
// catastrophically on any URL containing '#', freezing the tab for a minute
// on every keystroke.
const isAcceptableUrl = (value: string): boolean => {
  try {
    const { protocol } = new URL(/^www\./i.test(value) ? `https://${value}` : value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

const URLInputField: React.FC<{
  control: Control<FormData>
  label: string
}> = ({ control, label }) => {
  const theme = useTheme()

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant='body2' sx={fieldLabelSx}>
        {label}
      </Typography>
      <Controller
        name='sourceURI'
        control={control}
        defaultValue=''
        rules={{
          required: 'This field is required',
          validate: value =>
            isAcceptableUrl(value) || 'Please enter a valid URL (e.g., http://example.com or www.example.com)'
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.95rem',
                '&:hover fieldset': {
                  borderColor: theme.palette.text.secondary
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }
              }
            }}
            error={Boolean(error)}
            helperText={error ? error.message : ''}
          />
        )}
      />
    </Box>
  )
}

const EndorseInvite = ({
  toggleSnackbar,
  setSnackbarMessage,
  isAuthenticated
}: IHomeProps & { isAuthenticated?: boolean }) => {
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const queryParams = useQueryParams()
  const [searchParams] = useSearchParams()
  const [subjectValue, setSubjectValue] = useState('')
  const [statementValue, setStatementValue] = useState('')
  const [amtValue, setAmtValue] = useState('')
  const [effectiveDateValue, setEffectiveDateValue] = useState('')
  const [aspectValue, setAspectValue] = useState('')
  const [confidenceValue, setConfidenceValue] = useState<number | null>(null)
  const [issuerValue, setIssuerValue] = useState('')
  const [sourceThumbnail, setSourceThumbnail] = useState('')
  const [howKnownValue, setHowKnownValue] = useState('')
  const [claimName, setClaimName] = useState('')
  const [issuer_name, setIssuerName] = useState('')
  const [subject_name, setSubjectName] = useState('')
  const [claim, setClaim] = useState('')
  const [claimAddress, setClaimAddress] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [submittedClaimId, setSubmittedClaimId] = useState<number | null>(null)
  const [submittedStatement, setSubmittedStatement] = useState('')
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)

  // Check if video is suggested via URL param
  const suggestVideo = searchParams.get('video') === 'true'

  // Support clean URL /endorse/:claimId and legacy query params
  const { claimId: pathClaimId } = useParams<{ claimId: string }>()
  const subject = queryParams.get('subject') || searchParams.get('claim')
  const theme = useTheme()
  const navigate = useNavigate()

  // Enhanced responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const isTouchDevice = useMediaQuery('(hover: none)')
  const [openTooltipIndex, setOpenTooltipIndex] = useState<number | null>(null)

  // Resolve claim ID: path param takes priority, then parse from query string
  let number: string | undefined = pathClaimId
  if (!number && subject) {
    const parts = subject.split('/')
    number = parts[parts.length - 1]
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!number) {
        setError('No claim provided')
        setDataLoading(false)
        return
      }

      try {
        setDataLoading(true)
        setError(null)
        const res = await api.getClaim(number)

        if (res.data.claim.subject) {
          const subject =
            typeof res.data.claim.subject === 'string' ? res.data.claim.subject : res.data.claim.subject.uri
          setSubjectValue(subject)
        }
        if (res.data.claim.statement) setStatementValue(res.data.claim.statement)
        if (res.data.claim.amt) setAmtValue(res.data.claim.amt.toString())
        if (res.data.claim.aspect) setAspectValue(res.data.claim.aspect)
        if (res.data.claim.confidence !== undefined) setConfidenceValue(res.data.claim.confidence)
        if ((res.data.claim as any).source_name) setIssuerValue((res.data.claim as any).source_name)
        if ((res.data.claim as any).source_thumbnail) setSourceThumbnail((res.data.claim as any).source_thumbnail)
        if (res.data.claim.howKnown) setHowKnownValue(res.data.claim.howKnown)

        // Additional fields for enhanced UI
        if ((res.data as any).claimData?.name) setClaimName((res.data as any).claimData.name)
        if ((res.data as any).claimData?.issuer_name) setIssuerName((res.data as any).claimData.issuer_name)
        if ((res.data as any).claimData?.subject_name) setSubjectName((res.data as any).claimData.subject_name)
        if (res.data.claim.claim) setClaim(res.data.claim.claim)
        if ((res.data.claim as any).claimAddress) setClaimAddress((res.data.claim as any).claimAddress)

        if (res.data.claim.effectiveDate) {
          const date = new Date(res.data.claim.effectiveDate)
          const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          setEffectiveDateValue(formattedDate)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load claim data. Please try again.')
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [number])

  const defaultValues = {
    subject: subject ?? '',
    statement: '',
    sourceURI: '',
    amt: '',
    basis: '',
    effectiveDate: new Date(),
    images: [],
    decision: 'validate' as 'validate' | 'reject' | '',
    otherRejectReason: ''
  }

  const { handleSubmit, reset, control, register, watch, setValue } = useForm<FormData>({ defaultValues })
  const watchBasis = watch('basis')
  const watchOtherRejectReason = watch('otherRejectReason')

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
    swap,
    move,
    insert,
    prepend,
    update,
    replace
  } = useFieldArray({
    control,
    name: 'images'
  })

  const { createClaim } = useCreateClaim()

  // Clean URLs (/endorse/:claimId) have no ?subject= query, so the form's subject
  // field starts empty. Sync the loaded claim's subject into the form once it loads,
  // otherwise submit bails with "Subject is required".
  useEffect(() => {
    if (subjectValue) setValue('subject', subjectValue)
  }, [subjectValue, setValue])

  const doSubmit = async ({
    subject,
    statement,
    basis,
    effectiveDate,
    amt,
    sourceURI,
    images,
    decision,
    otherRejectReason
  }: FormData) => {
    if (!subject) {
      setSnackbarMessage('Subject is required')
      toggleSnackbar(true)
      return
    }

    const effectiveDateAsString = effectiveDate.toISOString()

    type PayloadType = {
      subject: string
      statement: string
      sourceURI: string
      howKnown: string
      effectiveDate: string
      claim: string
      amt?: string | number
      score?: number
      images?: ImageI[]
      videoUrl?: string
    }

    const payload: PayloadType = {
      subject,
      statement,
      sourceURI,
      howKnown: basis,
      effectiveDate: effectiveDateAsString,
      claim: CLAIM_VALIDATED,
      images,
      ...(videoUrl && { videoUrl })
    }

    // Handle special cases
    if (basis === FIRST_HAND_BENEFIT) {
      payload.claim = CLAIM_IMPACT
      payload.howKnown = HOW_KNOWN.FirstHand
    } else if (decision === 'reject') {
      if (basis === NOT_RELEVANT) {
        payload.claim = 'spam'
        payload.howKnown = HOW_KNOWN.FirstHand
      } else {
        payload.claim = CLAIM_REJECTED
        payload.score = -1
        payload.howKnown = basis
      }
    } else {
      payload.howKnown = basis
    }

    setLoading(true)

    try {
      const { message, isSuccess, claimId } = await createClaim(payload)

      setLoading(false)
      if (isSuccess && claimId) {
        setSubmittedStatement(statement)
        setSubmittedClaimId(claimId)
        reset()
      } else if (isSuccess) {
        setSnackbarMessage('Thank you for your endorsement! ' + message)
        toggleSnackbar(true)
        setTimeout(() => {
          navigate('/feed')
        }, 3000)
        reset()
      } else {
        setSnackbarMessage('An error occurred: ' + message)
        toggleSnackbar(true)
      }
    } catch (error) {
      console.error('Error during submission:', error)
      setLoading(false)
      setSnackbarMessage('An error occurred during submission.')
      toggleSnackbar(true)
    }
  }

  const onSubmit = handleSubmit(async data => {
    if (!isAuthenticated) {
      // Not logged in — show auth dialog, hold the form data
      setPendingSubmit(true)
      setShowAuthDialog(true)
      return
    }
    await doSubmit(data)
  })

  // Called when user authenticates via QuickAuth dialog, then submit
  const handleAuthThenSubmit = () => {
    setShowAuthDialog(false)
    setPendingSubmit(false)
    // Re-trigger form submit now that user is authenticated
    handleSubmit(doSubmit)()
  }

  // Called when user chooses to submit without signing in
  const handleSubmitAnonymous = () => {
    setShowAuthDialog(false)
    setPendingSubmit(false)
    handleSubmit(doSubmit)()
  }

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return `${text.substring(0, length)}...`
  }

  const isStatementLong = statementValue.length > (isMobile ? 200 : 300)

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  const validateOptions = [
    { value: HOW_KNOWN.FirstHand, text: 'First-hand (I saw it / did it myself)' },
    { value: HOW_KNOWN.SecondHand, text: 'Second-hand (Someone told me)' },
    { value: HOW_KNOWN.WebDocument, text: 'From source (I read about it)' },
    { value: FIRST_HAND_BENEFIT, text: 'Direct benefit (I personally benefited)' }
  ]

  const tooltips = {
    validate: [
      'I can validate this claim from personal experience or firsthand knowledge.',
      'Validate this claim based on information from someone else who has firsthand knowledge or experience.',
      'Validate this claim based on information known from a website or other source.',
      'I personally benefited directly from the claim described'
    ],
    reject: [] as string[]
  }

  const handleTooltipToggle = useCallback(
    (index: number) => {
      if (isTouchDevice) {
        setOpenTooltipIndex(prevIndex => (prevIndex === index ? null : index))
      }
    },
    [isTouchDevice]
  )

  const handleItemSelect = useCallback(() => {
    setOpenTooltipIndex(null)
  }, [])

  const getLinkUrl = () => {
    return claim === 'credential' ? claimAddress : subjectValue
  }

  // Show share page after successful endorsement
  if (submittedClaimId) {
    return (
      <EndorsementShare
        claimId={submittedClaimId}
        subjectName={subject_name || claimName || subjectValue}
        statement={submittedStatement}
        videoUrl={videoUrl}
      />
    )
  }

  // Loading state
  if (dataLoading) {
    return (
      <MainContainer
        sx={{
          width: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
          maxWidth: '100%',
          mx: 'auto',
          p: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Skeleton variant='rectangular' height={200} sx={{ mb: 2, borderRadius: 2 }} />
          <Skeleton variant='rectangular' height={400} sx={{ borderRadius: 2 }} />
        </Box>
      </MainContainer>
    )
  }

  // Error state
  if (error) {
    return (
      <MainContainer
        sx={{
          width: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
          maxWidth: '100%',
          mx: 'auto',
          p: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Alert
          severity='error'
          sx={{
            mb: 2,
            fontSize: { xs: '0.9rem', sm: '1rem' }
          }}
          action={
            <Button color='inherit' size='small' onClick={() => navigate('/feed')} sx={{ fontWeight: 600 }}>
              Return to Feed
            </Button>
          }
        >
          {error}
        </Alert>
      </MainContainer>
    )
  }

  return (
    <>
      <Loader open={loading} />
      <MainContainer
        sx={{
          width: '100%',
          maxWidth: 1600,
          mx: 'auto',
          px: { xs: 2, sm: 4, lg: 6 },
          py: { xs: 3, sm: 5 }
        }}
      >
        <form onSubmit={onSubmit} style={{ width: '100%' }}>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 4, lg: 5 } }}>
                {/* Header - Friendlier for endorsements */}
                <Box>
                  <Typography
                    component='h1'
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '1.75rem' },
                      fontWeight: 600,
                      lineHeight: 1.25,
                      letterSpacing: '-0.015em',
                      color: theme.palette.text.primary,
                      mb: 1
                    }}
                  >
                    {issuer_name ? `${issuer_name} asked you for an endorsement` : 'You were asked for an endorsement'}
                  </Typography>
                  <Typography variant='body2' sx={{ color: theme.palette.text.secondary, fontSize: '0.9375rem' }}>
                    Say what you experienced, in your own words.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1.15fr)' },
                    gap: { xs: 4, lg: 7 },
                    alignItems: 'start'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      position: { lg: 'sticky' },
                      top: { lg: 32 }
                    }}
                  >
                    {/* Auth banner for anonymous users */}
                    {!isAuthenticated && (
                      <QuickAuth
                        mode='banner'
                        onAuthenticated={() => {
                          // Auth state change event will update isAuthenticated via App.tsx
                        }}
                      />
                    )}

                    {/* Video Suggestion Alert */}
                    {suggestVideo && (
                      <Alert
                        severity='info'
                        icon={<VideocamIcon />}
                        sx={{
                          '& .MuiAlert-message': {
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                          }
                        }}
                      >
                        <strong>A video endorsement would be especially valuable!</strong> It helps build trust and
                        makes your testimonial more compelling.
                      </Alert>
                    )}

                    {/* Claim Display Card */}
                    <Card
                      elevation={0}
                      sx={{
                        backgroundColor: theme.palette.cardBackground,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.borderColor}`
                      }}
                    >
                      <CardContent sx={{ p: { xs: 3, sm: 4 }, '&:last-child': { pb: { xs: 3, sm: 4 } } }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 0.5,
                            gap: 1,
                            flexWrap: 'wrap'
                          }}
                        >
                          <Link
                            to={getLinkUrl()}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{
                              textDecoration: 'none',
                              color: 'inherit',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              wordBreak: 'break-word',
                              flex: 1
                            }}
                          >
                            <Typography
                              variant='body1'
                              sx={{
                                color: theme.palette.text.primary,
                                fontSize: '1.0625rem',
                                fontWeight: 600,
                                lineHeight: 1.4
                              }}
                            >
                              {claimName && subject_name ? `${claimName} - ${subject_name}` : subjectValue}
                            </Typography>
                            <OpenInNewIcon
                              fontSize='small'
                              sx={{
                                color: theme.palette.text.secondary,
                                flexShrink: 0
                              }}
                            />
                          </Link>
                        </Box>

                        <Typography
                          variant='body2'
                          sx={{
                            mb: 2.5,
                            color: theme.palette.text.secondary,
                            fontSize: '0.8125rem'
                          }}
                        >
                          {`Created by: ${issuer_name || issuerValue}${
                            effectiveDateValue ? `, ${effectiveDateValue}` : ''
                          }`}
                        </Typography>

                        {statementValue && (
                          <Box sx={{ mb: 3 }}>
                            <Typography
                              variant='body1'
                              sx={{
                                color: theme.palette.text.primary,
                                fontSize: '1.0625rem',
                                lineHeight: 1.65,
                                wordBreak: 'break-word'
                              }}
                            >
                              {isExpanded || !isStatementLong
                                ? statementValue
                                : truncateText(statementValue, isMobile ? 200 : 300)}
                              {isStatementLong && (
                                <MuiLink
                                  onClick={handleToggleExpand}
                                  sx={{
                                    cursor: 'pointer',
                                    ml: 1,
                                    color: theme.palette.text.secondary,
                                    fontWeight: 500,
                                    textDecoration: 'underline',
                                    fontSize: '0.9375rem'
                                  }}
                                >
                                  {isExpanded ? 'Show Less' : 'Show More'}
                                </MuiLink>
                              )}
                            </Typography>
                          </Box>
                        )}

                        {(aspectValue || amtValue) && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              rowGap: 0.5,
                              columnGap: 3,
                              pt: 2.5,
                              borderTop: `1px solid ${theme.palette.borderColor}`
                            }}
                          >
                            {aspectValue && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography
                                  variant='body2'
                                  sx={{ color: theme.palette.text.secondary, fontSize: '0.8125rem' }}
                                >
                                  Aspect:
                                </Typography>
                                <Typography
                                  variant='body2'
                                  sx={{ color: theme.palette.text.primary, fontSize: '0.8125rem' }}
                                >
                                  {aspectValue}
                                </Typography>
                              </Box>
                            )}
                            {amtValue && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography
                                  variant='body2'
                                  sx={{ color: theme.palette.text.secondary, fontSize: '0.8125rem' }}
                                >
                                  Amount:
                                </Typography>
                                <Typography
                                  variant='body2'
                                  sx={{ color: theme.palette.text.primary, fontSize: '0.8125rem' }}
                                >
                                  {amtValue}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Typography
                        component='h2'
                        sx={{
                          fontSize: '1.125rem',
                          fontWeight: 600,
                          letterSpacing: '-0.01em',
                          color: theme.palette.text.primary
                        }}
                      >
                        Your Endorsement
                      </Typography>
                    </Box>

                    <Card elevation={0} sx={{ backgroundColor: 'transparent', border: 'none', borderRadius: 0 }}>
                      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant='body2' sx={fieldLabelSx}>
                              How do you know?
                            </Typography>
                            <FormControl fullWidth>
                              <Controller
                                name='basis'
                                control={control}
                                defaultValue=''
                                rules={{
                                  required: 'This field is required'
                                }}
                                render={({ field, fieldState: { error } }) => (
                                  <>
                                    <Select
                                      {...field}
                                      size={isMobile ? 'small' : 'medium'}
                                      displayEmpty
                                      sx={{ fontSize: '0.95rem' }}
                                      error={Boolean(error)}
                                    >
                                      <MenuItem value='' disabled>
                                        <Typography sx={{ color: theme.palette.text.secondary }}>
                                          Select a reason...
                                        </Typography>
                                      </MenuItem>
                                      {validateOptions.map((option, index: number) => (
                                        <MenuItem
                                          key={option.value}
                                          value={option.value}
                                          onClick={handleItemSelect}
                                          sx={{ fontSize: '0.95rem', py: 1.25 }}
                                        >
                                          <Tooltip
                                            title={tooltips.validate[index]}
                                            placement={isTouchDevice ? 'top' : 'right'}
                                            arrow
                                            TransitionComponent={Fade}
                                            open={isTouchDevice ? openTooltipIndex === index : undefined}
                                            onClose={() => setOpenTooltipIndex(null)}
                                            disableFocusListener={isTouchDevice}
                                            disableHoverListener={isTouchDevice}
                                            disableTouchListener={isTouchDevice}
                                          >
                                            <Box
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                width: '100%',
                                                justifyContent: 'space-between'
                                              }}
                                            >
                                              <span>{option.text}</span>
                                              {isTouchDevice && (
                                                <IconButton
                                                  size='small'
                                                  onClick={e => {
                                                    e.stopPropagation()
                                                    handleTooltipToggle(index)
                                                  }}
                                                  sx={{ ml: 1 }}
                                                >
                                                  <HelpIcon
                                                    sx={{ color: theme.palette.primary.main, fontSize: '1rem' }}
                                                  />
                                                </IconButton>
                                              )}
                                            </Box>
                                          </Tooltip>
                                        </MenuItem>
                                      ))}
                                    </Select>
                                    {error && <FormHelperText error>{error.message}</FormHelperText>}
                                  </>
                                )}
                              />
                            </FormControl>
                          </Box>

                          {(watchBasis === HOW_KNOWN.FirstHand ||
                            watchBasis === HOW_KNOWN.SecondHand ||
                            watchBasis === FIRST_HAND_BENEFIT) && (
                            <URLInputField control={control} label='Your Website (Required)' />
                          )}
                          {watchBasis === HOW_KNOWN.WebDocument && (
                            <URLInputField control={control} label='Source URL (Required)' />
                          )}

                          <Box sx={{ mb: 3 }}>
                            <Typography variant='body2' sx={fieldLabelSx}>
                              Effective Date
                            </Typography>
                            <Controller
                              name='effectiveDate'
                              control={control}
                              render={({ field }) => (
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                  <DatePicker
                                    value={field.value}
                                    onChange={date => field.onChange(date)}
                                    renderInput={params => (
                                      <TextField {...params} fullWidth size={isMobile ? 'small' : 'medium'} />
                                    )}
                                  />
                                </LocalizationProvider>
                              )}
                            />
                          </Box>

                          <Box sx={{ mb: 3 }}>
                            <Typography variant='body2' sx={fieldLabelSx}>
                              Your Testimonial (Required)
                            </Typography>
                            <Controller
                              name='statement'
                              control={control}
                              defaultValue=''
                              rules={{ required: 'This field is required' }}
                              render={({ field, fieldState: { error } }) => (
                                <TextField
                                  {...field}
                                  multiline
                                  rows={isMobile ? 3 : 4}
                                  fullWidth
                                  placeholder='Share your experience...'
                                  size={isMobile ? 'small' : 'medium'}
                                  error={Boolean(error)}
                                  helperText={error ? error.message : ''}
                                />
                              )}
                            />
                          </Box>

                          {/* Video Testimonial */}
                          <Box sx={{ mb: 3 }}>
                            <VideoRecorder
                              onVideoUploaded={url => {
                                setVideoUrl(url)
                              }}
                              onVideoRemoved={() => {
                                setVideoUrl(null)
                              }}
                              maxDuration={60}
                            />
                          </Box>

                          {/* Image Uploader */}
                          <Box sx={{ mb: 3 }}>
                            <Typography variant='body2' sx={fieldLabelSx}>
                              Upload Supporting Evidence (Optional)
                            </Typography>
                            <ImageUploader
                              fieldArray={{
                                fields: imageFields,
                                append: appendImage,
                                remove: removeImage,
                                swap,
                                move,
                                insert,
                                prepend,
                                update,
                                replace
                              }}
                              control={control}
                              register={register}
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <Box sx={{ display: 'flex', mt: 1 }}>
                      <Button
                        onClick={onSubmit}
                        variant='contained'
                        disableElevation
                        disabled={loading}
                        sx={{
                          fontSize: '0.9375rem',
                          fontWeight: 600,
                          minHeight: 44,
                          px: 3.5,
                          width: { xs: '100%', sm: 'auto' },
                          borderRadius: 1.5,
                          textTransform: 'none'
                        }}
                      >
                        {loading ? 'Sending…' : 'Send Endorsement'}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </form>
      </MainContainer>

      {/* Auth dialog shown on submit when not authenticated */}
      {showAuthDialog && (
        <QuickAuth
          mode='dialog'
          onAuthenticated={handleAuthThenSubmit}
          onDismiss={() => {
            setShowAuthDialog(false)
            setPendingSubmit(false)
          }}
          onSubmitAnonymous={handleSubmitAnonymous}
        />
      )}
    </>
  )
}

export default EndorseInvite
