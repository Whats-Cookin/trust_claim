import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import { Link, useNavigate } from 'react-router-dom'
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
  Skeleton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
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
import MainContainer from '../MainContainer'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

// Constants for How Known options
const FIRST_HAND = 'FIRST_HAND'
const SECOND_HAND = 'SECOND_HAND'
const WEB_DOCUMENT = 'WEB_DOCUMENT'
const FIRST_HAND_BENEFIT = 'FIRST_HAND_BENEFIT'
const FIRST_HAND_REJECTED = 'FIRST_HAND_REJECTED'
const WEB_DOCUMENT_REJECTED = 'WEB_DOCUMENT_REJECTED'
const NOT_RELEVANT = 'NOT_RELEVANT'
const OTHER_REJECT = 'OTHER_REJECT'

const CLAIM_RATED = 'rated'
const CLAIM_VALIDATED = 'validated'
const CLAIM_REJECTED = 'rejected'
const CLAIM_IMPACT = 'impact'

const HOW_KNOWN = {
  SecondHand: 'SECOND_HAND',
  FirstHand: 'FIRST_HAND',
  WebDocument: 'WEB_DOCUMENT',
  FirstHandBenefit: 'FIRST_HAND_BENEFIT',
  FirstHandRejected: 'FIRST_HAND_REJECTED',
  WebDocumentRejected: 'WEB_DOCUMENT_REJECTED',
  NotRelevant: 'NOT_RELEVANT',
  OtherReject: 'OTHER_REJECT'
} as const

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
  howKnown: string
  effectiveDate: Date
  images: ImageI[]
  decision: 'validate' | 'reject' | ''
  otherRejectReason: string
}

// Reusable URL Input Field Component
const URLInputField: React.FC<{
  control: Control<FormData>
  label: string
}> = ({ control, label }) => {
  const theme = useTheme()

  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Typography variant='body2' sx={{ mb: 1, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
        {label}
      </Typography>
      <Controller
        name='sourceURI'
        control={control}
        defaultValue=''
        rules={{
          required: 'This field is required',
          pattern: {
            value: /^(https?:\/\/|www\.)[\w\-\.]+(\.[a-z]{2,})([\/\w \-\.\?\=\&\%]*)*\/?$/,
            message: 'Please enter a valid URL (e.g., http://example.com or www.example.com)'
          }
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            fullWidth
            sx={{
              backgroundColor: '#FFFFFF',
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '0.9rem', sm: '1rem' },
                '& fieldset': {
                  borderColor: '#E0E0E0'
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main
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

const Validate = ({ toggleSnackbar, setSnackbarMessage }: IHomeProps) => {
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const queryParams = useQueryParams()
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

  const subject = queryParams.get('subject')
  const theme = useTheme()
  const navigate = useNavigate()

  // Enhanced responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  const isTouchDevice = useMediaQuery('(hover: none)')
  const [openTooltipIndex, setOpenTooltipIndex] = useState<number | null>(null)

  let number: string | undefined
  if (subject) {
    const parts = subject.split('/')
    number = parts[parts.length - 1]
  }

  // Fixed: Using useEffect instead of useMemo for side effects
  useEffect(() => {
    const fetchData = async () => {
      if (!number) {
        setError('No claim ID provided')
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
    howKnown: '',
    effectiveDate: new Date(),
    images: [],
    decision: '' as 'validate' | 'reject' | '',
    otherRejectReason: ''
  }

  const { handleSubmit, reset, control, register, watch } = useForm<FormData>({ defaultValues })
  const watchHowKnown = watch('howKnown') as HowKnown
  const watchDecision = watch('decision')
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

  const onSubmit = handleSubmit(
    async ({ subject, statement, howKnown, effectiveDate, amt, sourceURI, images, decision, otherRejectReason }) => {
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
      }

      const payload: PayloadType = {
        subject,
        statement,
        sourceURI,
        howKnown,
        effectiveDate: effectiveDateAsString,
        claim: CLAIM_VALIDATED,
        images
      }

      if (howKnown === FIRST_HAND_BENEFIT) {
        payload.claim = CLAIM_IMPACT
        payload.amt = amt
        payload.howKnown = FIRST_HAND
      } else if (howKnown === FIRST_HAND_REJECTED || howKnown === WEB_DOCUMENT_REJECTED || howKnown === NOT_RELEVANT) {
        payload.claim = CLAIM_REJECTED
        payload.score = -1
        // Map the rejection reasons to appropriate howKnown values
        if (howKnown === FIRST_HAND_REJECTED) {
          payload.howKnown = FIRST_HAND
        } else if (howKnown === WEB_DOCUMENT_REJECTED || howKnown === NOT_RELEVANT) {
          payload.howKnown = WEB_DOCUMENT
        }
      }

      setLoading(true)

      try {
        const { message, isSuccess } = await createClaim(payload)

        setLoading(false)
        toggleSnackbar(true)
        if (isSuccess) {
          setSnackbarMessage('Success! ' + message)
          setTimeout(() => {
            navigate('/feed')
          }, 3000)
          reset()
        } else {
          setSnackbarMessage('An error occurred: ' + message)
        }
      } catch (error) {
        console.error('Error during submission:', error)
        setLoading(false)
        setSnackbarMessage('An error occurred during submission.')
        toggleSnackbar(true)
      }
    }
  )

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return `${text.substring(0, length)}...`
  }

  const isStatementLong = statementValue.length > (isMobile ? 200 : 300)

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  // Options for the dropdowns based on decision
  const validateOptions = [
    { value: FIRST_HAND, text: 'First-hand (I saw it / did it myself)' },
    { value: SECOND_HAND, text: 'Second-hand (Someone told me)' },
    { value: WEB_DOCUMENT, text: 'From source (I read about it)' },
    { value: FIRST_HAND_BENEFIT, text: 'Direct benefit (I personally benefited)' }
  ]

  const rejectOptions = [
    { value: FIRST_HAND_REJECTED, text: 'I know this is false' },
    { value: WEB_DOCUMENT_REJECTED, text: 'Contradicts what I know' },
    { value: NOT_RELEVANT, text: 'Not relevant / spam' }
  ]

  const tooltips = {
    validate: [
      'I can validate this claim from personal experience or firsthand knowledge.',
      'Validate this claim based on information from someone else who has firsthand knowledge or experience.',
      'Validate this claim based on information known from a website or other source.',
      'I personally benefited directly from the claim described'
    ],
    reject: [
      'I do NOT validate this claim, I reject it based on personal experience or firsthand knowledge.',
      'I do NOT validate this claim, I reject it based on information from a website or source.',
      'This claim is not relevant to the topic or appears to be spam.'
    ]
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

  // Loading state
  if (dataLoading) {
    return (
      <MainContainer
        sx={{
          width: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
          maxWidth: '1200px',
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
          maxWidth: '1200px',
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
          width: { xs: '95%', sm: '90%', md: '85%', lg: '80%' },
          maxWidth: '1200px',
          mx: 'auto',
          p: { xs: 1, sm: 2, md: 3, lg: 4 }
        }}
      >
        <form onSubmit={onSubmit} style={{ width: '100%' }}>
          <Box sx={{ width: '100%' }}>
            {/* Main Content Container */}
            <Box
              sx={{
                width: '100%',
                mx: 'auto',
                p: { xs: 2, sm: 3, md: 4 },
                backgroundColor: theme.palette.background.paper,
                borderRadius: { xs: 2, sm: 3 },
                boxShadow: { xs: 1, sm: 2, md: 3 }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3, md: 4 } }}>
                {/* Header */}
                <Box>
                  <Typography
                    variant={isMobile ? 'h6' : 'h5'}
                    sx={{
                      fontWeight: 700,
                      textAlign: 'center',
                      color: theme.palette.text.primary,
                      mb: { xs: 1, sm: 2 }
                    }}
                  >
                    {claim === 'credential' ? 'Validate the Credential' : 'Validate the Claim'}
                  </Typography>
                  <Box
                    sx={{
                      height: '2px',
                      backgroundColor: theme.palette.divider,
                      borderRadius: 1,
                      width: '100%'
                    }}
                  />
                </Box>

                {/* Claim Display Card */}
                <Card
                  sx={{
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: { xs: 2, sm: 3 },
                    boxShadow: { xs: 1, sm: 2 },
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                    {/* Claim Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: { xs: 2, sm: 3 },
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
                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
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

                    {/* Claim Metadata */}
                    <Typography
                      variant='body2'
                      sx={{
                        mb: { xs: 2, sm: 3 },
                        color: theme.palette.text.secondary,
                        fontSize: { xs: '0.85rem', sm: '0.9rem' }
                      }}
                    >
                      {`Created by: ${issuer_name || issuerValue}${
                        effectiveDateValue ? `, ${effectiveDateValue}` : ''
                      }`}
                    </Typography>

                    {/* Statement */}
                    {statementValue && (
                      <Box
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          backgroundColor: theme.palette.action.hover,
                          borderRadius: { xs: 1.5, sm: 2 },
                          borderLeft: `4px solid ${theme.palette.primary.main}`,
                          mb: { xs: 2, sm: 3 }
                        }}
                      >
                        <Typography
                          variant='body1'
                          sx={{
                            color: theme.palette.text.primary,
                            fontSize: { xs: '0.95rem', sm: '1rem' },
                            lineHeight: 1.6,
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
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                textDecoration: 'none',
                                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              {isExpanded ? 'Show Less' : 'Show More'}
                            </MuiLink>
                          )}
                        </Typography>
                      </Box>
                    )}

                    {/* Claim Details */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: { xs: 1, sm: 2 },
                        pt: { xs: 1, sm: 2 },
                        borderTop: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      {howKnownValue && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant='body2' sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            How Known:
                          </Typography>
                          <Typography variant='body2' sx={{ color: theme.palette.text.primary }}>
                            {howKnownValue
                              .replace(/_/g, ' ')
                              .toLowerCase()
                              .replace(/\b\w/g, l => l.toUpperCase())}
                          </Typography>
                        </Box>
                      )}
                      {aspectValue && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant='body2' sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            Aspect:
                          </Typography>
                          <Typography variant='body2' sx={{ color: theme.palette.text.primary }}>
                            {aspectValue}
                          </Typography>
                        </Box>
                      )}
                      {confidenceValue !== null && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant='body2' sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            Confidence:
                          </Typography>
                          <Typography variant='body2' sx={{ color: theme.palette.text.primary }}>
                            {confidenceValue}
                          </Typography>
                        </Box>
                      )}
                      {amtValue && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant='body2' sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                            Amount:
                          </Typography>
                          <Typography variant='body2' sx={{ color: theme.palette.text.primary }}>
                            {amtValue}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3, md: 4 } }}>
                  {/* Header */}
                  <Box>
                    <Typography
                      variant={isMobile ? 'h6' : 'h5'}
                      sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        color: theme.palette.text.primary,
                        mb: { xs: 1, sm: 2 }
                      }}
                    >
                      What do you have to say about this claim?
                    </Typography>
                    <Box
                      sx={{
                        height: '2px',
                        backgroundColor: theme.palette.divider,
                        borderRadius: 1,
                        width: '100%'
                      }}
                    />
                  </Box>
                  {/* Validation Form Card */}
                  <Card
                    sx={{
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: { xs: 2, sm: 3 },
                      boxShadow: { xs: 1, sm: 2 },
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                      <Box sx={{ width: '100%' }}>
                        {/* Decision Radio Buttons */}
                        <FormControl component='fieldset' sx={{ mb: 3 }}>
                          <Controller
                            name='decision'
                            control={control}
                            defaultValue=''
                            rules={{
                              required: 'Please select either Validate or Reject'
                            }}
                            render={({ field, fieldState: { error } }) => (
                              <>
                                <FormLabel
                                  component='legend'
                                  sx={{
                                    mb: 2,
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                    '&.Mui-focused': {
                                      color: theme.palette.text.primary
                                    }
                                  }}
                                >
                                  What is your decision? *
                                </FormLabel>
                                <RadioGroup
                                  {...field}
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: { xs: 2, sm: 4 },
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FormControlLabel
                                    value='validate'
                                    control={
                                      <Radio
                                        sx={{
                                          '&.Mui-checked': {
                                            color: theme.palette.success.main
                                          }
                                        }}
                                      />
                                    }
                                    label={
                                      <Typography sx={{ fontSize: { xs: '0.95rem', sm: '1rem' }, fontWeight: 500 }}>
                                        Validate
                                      </Typography>
                                    }
                                  />
                                  <FormControlLabel
                                    value='reject'
                                    control={
                                      <Radio
                                        sx={{
                                          '&.Mui-checked': {
                                            color: theme.palette.error.main
                                          }
                                        }}
                                      />
                                    }
                                    label={
                                      <Typography sx={{ fontSize: { xs: '0.95rem', sm: '1rem' }, fontWeight: 500 }}>
                                        Reject
                                      </Typography>
                                    }
                                  />
                                </RadioGroup>
                                {error && (
                                  <FormHelperText sx={{ textAlign: 'center', mt: 1 }} error>
                                    {error.message}
                                  </FormHelperText>
                                )}
                              </>
                            )}
                          />
                        </FormControl>

                        {/* How Known Dropdown - only shown when decision is made */}
                        {watchDecision && (
                          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                            <Typography
                              variant='body2'
                              sx={{
                                mb: 1,
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                fontWeight: 600,
                                color: theme.palette.text.primary
                              }}
                            >
                              {watchDecision === 'validate' ? 'How do you know?' : 'Why do you reject?'} *
                            </Typography>
                            <FormControl fullWidth>
                              <Controller
                                name='howKnown'
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
                                      sx={{
                                        backgroundColor: '#FFFFFF',
                                        fontSize: { xs: '0.9rem', sm: '1rem' },
                                        '& .MuiSelect-icon': {
                                          color: theme.palette.text.secondary
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                          borderColor: theme.palette.divider
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                          borderColor: theme.palette.primary.main
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                          borderColor: theme.palette.primary.main
                                        }
                                      }}
                                      error={Boolean(error)}
                                    >
                                      <MenuItem value='' disabled>
                                        <Typography sx={{ color: theme.palette.text.secondary }}>
                                          Select a reason...
                                        </Typography>
                                      </MenuItem>
                                      {(watchDecision === 'validate' ? validateOptions : rejectOptions).map(
                                        (option, index: number) => (
                                          <MenuItem
                                            key={option.value}
                                            value={option.value}
                                            onClick={handleItemSelect}
                                            sx={{
                                              fontSize: { xs: '0.9rem', sm: '1rem' },
                                              py: { xs: 1, sm: 1.5 },
                                              display: 'flex',
                                              justifyContent: 'space-between',
                                              alignItems: 'center'
                                            }}
                                          >
                                            <Tooltip
                                              title={
                                                watchDecision === 'validate'
                                                  ? tooltips.validate[index]
                                                  : tooltips.reject[index]
                                              }
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
                                        )
                                      )}
                                    </Select>
                                    {error && <FormHelperText error>{error.message}</FormHelperText>}
                                  </>
                                )}
                              />
                            </FormControl>
                          </Box>
                        )}

                        {/* URL Input Field */}
                        {(watchHowKnown === FIRST_HAND ||
                          watchHowKnown === SECOND_HAND ||
                          watchHowKnown === FIRST_HAND_BENEFIT ||
                          watchHowKnown === FIRST_HAND_REJECTED) && (
                          <URLInputField control={control} label='Your Website (Required)' />
                        )}
                        {(watchHowKnown === WEB_DOCUMENT ||
                          watchHowKnown === WEB_DOCUMENT_REJECTED ||
                          watchHowKnown === NOT_RELEVANT) && (
                          <URLInputField control={control} label='Source URL (Required)' />
                        )}

                        {/* Effective Date Field */}
                        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                          <Typography
                            variant='body2'
                            sx={{
                              mb: 1,
                              fontWeight: 600,
                              fontSize: { xs: '0.85rem', sm: '0.875rem' }
                            }}
                          >
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
                                    <TextField
                                      {...params}
                                      fullWidth
                                      size={isMobile ? 'small' : 'medium'}
                                      sx={{
                                        backgroundColor: '#FFFFFF',
                                        '& .MuiOutlinedInput-root': {
                                          fontSize: { xs: '0.9rem', sm: '1rem' },
                                          '& fieldset': {
                                            borderColor: theme.palette.divider
                                          },
                                          '&:hover fieldset': {
                                            borderColor: theme.palette.primary.main
                                          },
                                          '&.Mui-focused fieldset': {
                                            borderColor: theme.palette.primary.main
                                          }
                                        }
                                      }}
                                    />
                                  )}
                                />
                              </LocalizationProvider>
                            )}
                          />
                        </Box>

                        {/* Statement Field */}
                        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                          <Typography
                            variant='body2'
                            sx={{
                              mb: 1,
                              fontWeight: 600,
                              fontSize: { xs: '0.85rem', sm: '0.875rem' }
                            }}
                          >
                            Validation Statement (Required)
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
                                size={isMobile ? 'small' : 'medium'}
                                sx={{
                                  backgroundColor: '#FFFFFF',
                                  '& .MuiOutlinedInput-root': {
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                    '& fieldset': {
                                      borderColor: theme.palette.divider
                                    },
                                    '&:hover fieldset': {
                                      borderColor: theme.palette.primary.main
                                    },
                                    '&.Mui-focused fieldset': {
                                      borderColor: theme.palette.primary.main
                                    }
                                  }
                                }}
                                error={Boolean(error)}
                                helperText={error ? error.message : ''}
                              />
                            )}
                          />
                        </Box>

                        {/* Image Uploader */}
                        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                          <Typography
                            variant='body2'
                            sx={{
                              mb: 2,
                              fontWeight: 600,
                              fontSize: { xs: '0.85rem', sm: '0.875rem' }
                            }}
                          >
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
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 2, sm: 3 } }}>
                    <Button
                      onClick={onSubmit}
                      variant='contained'
                      size={isMobile ? 'medium' : 'large'}
                      disabled={loading}
                      sx={{
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        fontWeight: 600,
                        minHeight: { xs: 44, sm: 48 },
                        minWidth: { xs: 140, sm: 180 },
                        px: { xs: 3, sm: 4 },
                        borderRadius: { xs: 2, sm: 3 },
                        textTransform: 'none',
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4
                        },
                        '&:disabled': {
                          opacity: 0.6
                        }
                      }}
                    >
                      {loading ? 'Submitting...' : 'Submit Validation'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </form>
      </MainContainer>
    </>
  )
}

export default Validate
