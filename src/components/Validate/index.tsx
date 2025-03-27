import { useState, useMemo, useRef, MouseEvent } from 'react'
import Box from '@mui/material/Box'
import { Link, useNavigate } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import {
  Button,
  MenuItem,
  FormControl,
  useTheme,
  Select,
  TextField,
  useMediaQuery,
  IconButton,
  Tooltip,
  Fade,
  FormHelperText
} from '@mui/material'
import { Controller, useForm, useFieldArray } from 'react-hook-form'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import { useQueryParams } from '../../hooks'
import Loader from '../Loader'
import axios from '../../axiosInstance'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import HelpIcon from '@mui/icons-material/Help'
import ImageUploader from '../Form/imageUploading'
import MainContainer from '../MainContainer'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { BACKEND_BASE_URL } from '../../utils/settings'
import { CircleCheck, Medal, ShieldCheck } from 'lucide-react'
import FeedClaim from '../../containers/feedOfClaim'

// Constants
const FIRST_HAND = 'FIRST_HAND'
const SECOND_HAND = 'SECOND_HAND'
const WEB_DOCUMENT = 'WEB_DOCUMENT'
const FIRST_HAND_BENEFIT = 'FIRST_HAND_BENEFIT'
const FIRST_HAND_REJECTED = 'FIRST_HAND_REJECTED'
const WEB_DOCUMENT_REJECTED = 'WEB_DOCUMENT_REJECTED'

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
  WebDocumentRejected: 'WEB_DOCUMENT_REJECTED'
} as const

type HowKnown = (typeof HOW_KNOWN)[keyof typeof HOW_KNOWN]

// Interfaces
interface LocalClaim {
  claim: any
  effective_date: string | number | Date
  name: string
  source_link: string
  link: string
  author: string
  curator: string
}

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
  title: string
  webTitle: string
  statement: string
  sourceURI: string
  amt: string
  howKnown: string
  effectiveDate: Date
  images: ImageI[]
}

interface IHomeProps {
  toggleSnackbar: (value: boolean) => void
  setSnackbarMessage: (message: string) => void
}

// Utility Functions
const extractSourceName = (url: string) => {
  const regex = /linkedin\.com\/(?:in|company)\/([^\\/]+)(?:\/.*)?/
  const match = regex.exec(url)
  return match ? match[1].replace(/\./g, ' ') : url
}

const extractProfileName = (url: string): string | null => {
  const capitalizeFirstLetter = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)

  try {
    const formattedUri = url.startsWith('http') ? url : `https://${url}`
    const parsedUrl = new URL(formattedUri)
    const domain = parsedUrl.hostname.replace(/^www\./, '')

    const pathParts = parsedUrl.pathname.split('/').filter(Boolean)

    const socialMediaPatterns: { [key: string]: number } = {
      'linkedin.com': 1,
      'twitter.com': 0,
      'x.com': 0,
      'instagram.com': 0,
      'facebook.com': 0,
      'tiktok.com': 1,
      'github.com': 0,
      'youtube.com': 1,
      'medium.com': 0,
      'reddit.com': 1
    }

    const usernameIndex = socialMediaPatterns[domain]
    if (usernameIndex !== undefined && pathParts.length > usernameIndex) {
      return capitalizeFirstLetter(pathParts[usernameIndex].replace('@', ''))
    }

    return capitalizeFirstLetter(domain.replace('.com', ''))
  } catch (error) {
    console.error('Failed to parse URL:', error)
    return null
  }
}

// Components
const Badge = (claim: any) => {
  const bgColor = claim.claim === 'credential' ? '#cce6ff' : claim.claim === 'validated' ? '#f8e8cc' : '#c0efd7'
  const icon =
    claim.claim === 'credential' ? (
      <Medal size={22} style={{ marginBottom: -6, paddingRight: 5 }} />
    ) : claim.claim === 'validated' ? (
      <ShieldCheck size={22} style={{ marginBottom: -6, paddingRight: 5 }} />
    ) : (
      <CircleCheck size={22} style={{ marginBottom: -6, paddingRight: 5 }} />
    )
  const color = claim.claim === 'credential' ? '#0052e0' : claim.claim === 'validated' ? '#e08a00' : '#2d6a4f'

  return (
    <Box
      sx={{
        display: 'inline-block',
        alignItems: 'center',
        backgroundColor: bgColor,
        borderRadius: '12px',
        padding: '2px 8px',
        marginBottom: '10px',
        marginLeft: '10px',
        height: 'fit-content',
        color: color,
        overflow: 'hidden'
      }}
    >
      {icon}
      <Typography variant='caption' sx={{ color: color, fontWeight: '600', fontSize: '12px' }}>
        {claim.claim === 'validated'
          ? 'Validation'
          : claim.claim.charAt(0).toUpperCase() + claim.claim.slice(1) || 'Claim'}
      </Typography>
    </Box>
  )
}

const ClaimName = ({ claim, searchTerm = '' }: { claim: LocalClaim; searchTerm?: string }) => {
  const theme = useTheme()
  let displayName = claim.name
  if (claim.curator) {
    displayName = `${claim.curator} - ${claim.name}`
  } else if (extractProfileName(claim.link)) {
    displayName = `${extractProfileName(claim.link)} - ${claim.name}`
  }

  const highlightedName = searchTerm.trim()
    ? displayName.replace(
        new RegExp(`(${searchTerm})`, 'gi'),
        (match: string) => `<span style="background-color:${theme.palette.searchBarBackground};">${match}</span>`
      )
    : displayName

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant='body1' sx={{ marginBottom: '10px', color: theme.palette.texts }}>
        <span dangerouslySetInnerHTML={{ __html: highlightedName }} />
        <OpenInNewIcon sx={{ marginLeft: '10px', color: theme.palette.texts, fontSize: '1rem' }} />
      </Typography>
    </Box>
  )
}

const Validate = ({ toggleSnackbar, setSnackbarMessage }: IHomeProps) => {
  const [loading, setLoading] = useState(false)
  const queryParams = useQueryParams()
  const [isLoading, setIsLoading] = useState(true)

  const subject = queryParams.get('subject')
  let number: string | undefined
  if (subject) {
    const parts = subject.split('/')
    number = parts[parts.length - 1]
  }

  const [claim, setClaim] = useState<LocalClaim | null>(null)

  useMemo(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/api/claim/${number}`)

        // Log the entire response to see the exact structure
        console.log('Full claim response:', res.data)

        // Add null checks and default values
        const fetchedClaim = res.data.claim || res.data

        // Validate link
        if (!fetchedClaim.link) {
          console.warn('Claim link is undefined', fetchedClaim)
        }

        // Validate effective date
        const effectiveDate = fetchedClaim.effective_date ? new Date(fetchedClaim.effective_date) : new Date()

        if (isNaN(effectiveDate.getTime())) {
          console.warn('Invalid date', fetchedClaim.effective_date)
        }

        setClaim({
          ...fetchedClaim,
          link: fetchedClaim.link || '', // Provide a default empty string
          effective_date: effectiveDate
        })

        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setIsLoading(false)
      } finally {
        setLoading(false)
      }
    }

    if (number) {
      fetchData()
    }
  }, [number])

  const defaultValues = {
    subject: subject ?? '',
    title: '',
    webTitle: '',
    statement: '',
    sourceURI: '',
    amt: '',
    howKnown: '',
    effectiveDate: new Date(),
    images: []
  }

  const { handleSubmit, reset, control, register, watch } = useForm<FormData>({ defaultValues })
  const watchHowKnown = watch('howKnown') as HowKnown

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
  const navigate = useNavigate()

  const onSubmit = handleSubmit(
    async ({ title, webTitle, statement, howKnown, effectiveDate, amt, sourceURI, images }) => {
      if (subject) {
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
        } else if (howKnown === FIRST_HAND_REJECTED) {
          payload.claim = CLAIM_REJECTED
          payload.score = -1
          payload.howKnown = FIRST_HAND
        } else if (howKnown === WEB_DOCUMENT_REJECTED) {
          payload.claim = CLAIM_REJECTED
          payload.score = -1
          payload.howKnown = WEB_DOCUMENT
        }

        setLoading(true)

        try {
          const { message, isSuccess } = await createClaim(payload)
          console.log('Submission response:', { message, isSuccess })

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
        }
      }
    }
  )

  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))

  const inputOptions = {
    howKnown: [
      { value: FIRST_HAND, text: 'validate first hand' },
      { value: SECOND_HAND, text: 'validate second hand' },
      { value: WEB_DOCUMENT, text: 'validate from source' },
      { value: FIRST_HAND_BENEFIT, text: 'received direct benefit' },
      { value: FIRST_HAND_REJECTED, text: 'reject first hand' },
      { value: WEB_DOCUMENT_REJECTED, text: 'reject from source' }
    ]
  }

  const tooltips = {
    howKnown: [
      'I can validate this claim from personal experience or firsthand knowledge.',
      'Validate this claim based on information from someone else who has firsthand knowledge or experience.',
      'Validate this claim based on information known from a website or other source.',
      'I personally benefited directly from the claim described',
      'I do NOT validate this claim, I reject it based on personal experience or firsthand knowledge.',
      'I do NOT validate this claim, I reject it based on information from a website or source'
    ]
  }

  const isTouchDevice = useMediaQuery('(hover: none)')
  const [openTooltipIndex, setOpenTooltipIndex] = useState<number | null>(null)

  const handleTooltipToggle = (index: number) => {
    if (isTouchDevice) {
      setOpenTooltipIndex(prevIndex => (prevIndex === index ? null : index))
    }
  }

  const handleItemSelect = () => {
    setOpenTooltipIndex(null)
  }

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>, link: string) => {
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  if (isLoading || !claim) {
    return <Loader open={true} />
  }

  return (
    <>
      <Loader open={loading} />
      <MainContainer
        sx={{
          width: {
            xs: '97%',
            md: 'calc(100% - 4.2vw)',
            lg: 'calc(100% - 4.2vw)'
          },
          // marginLeft: '4.2vw',
          // width: '100%',
          maxWidth: '1115px',
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <form
          onSubmit={onSubmit}
          style={{
            display: 'flex',
            flexDirection: isMediumScreen ? 'column' : 'row',
            width: '100%'
          }}
        >
          <Box sx={{ width: '100%', p: '0' }}>
            {/* Form Content */}
            <Box
              sx={{
                m: {
                  xs: '15px 15px 15px 0px',
                  md: '15px'
                },
                width: '100%',
                textWrap: 'wrap',
                wordBreak: 'break-word',
                display: 'flex'
              }}
            >
              <Typography variant='body1'>
                {`Validate that claim:`}
                <Box
                  sx={{
                    height: '5px',
                    backgroundColor: theme.palette.maintext,
                    marginTop: '4px',
                    borderRadius: '2px',
                    width: '185px'
                  }}
                />
              </Typography>
              <Box
                sx={{
                  display: isMediumScreen ? 'none' : 'flex',
                  ml: {
                    md: 'clamp(111px, 25%, 226px)',
                    lg: 'clamp(140px, 31%, 670px)'
                  }
                }}
              >
                <Typography
                  variant='body1'
                  sx={{
                    textWrap: 'wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {`Do you know anything about that?`}
                  <Box
                    sx={{
                      height: '5px',
                      backgroundColor: theme.palette.maintext,
                      marginTop: '4px',
                      borderRadius: '2px',
                      width: '70%'
                    }}
                  />
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: isMediumScreen ? 'column' : 'row',
                justifyContent: 'space-around',
                alignItems: 'flex-start',
                width: '100%',
                margin: '0'
              }}
            >
              <Box
                sx={{
                  width: isMediumScreen ? '95%' : '45%',
                  height: 'auto',
                  borderRadius: '20px',
                  backgroundColor: theme.palette.cardBackground,
                  mt: 0,
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' // Add shadow for depth
                }}
              >
                <Card
                  sx={{
                    backgroundColor: theme.palette.cardBackground,
                    padding: '30px',
                    width: '100%',
                    minHeight: {
                      xs: 'auto',
                      sm: 'auto',
                      md: '938px',
                      lg: '938px'
                    },
                    backgroundImage: 'none',
                    height: 'auto',
                    borderRadius: '20px'
                  }}
                >
                  {/* Issuer, Subject, Aspect, Confidence, Amount, Date, How Known, Statement */}
                  <Box sx={{ height: '545', width: '535' }}>
                    <Box sx={{ height: '545', width: '535' }}>
                      {subjectValue && (
                        <Box sx={{ display: 'flex', mt: 5, mb: 4, alignItems: 'center' }}>
                          <Box sx={{ width: '130px' }}>
                            <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                              Subject:
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'block',
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              whiteSpace: 'normal',
                              fontSize: '18px !important',
                              justifyContent: 'center'
                            }}
                          >
                            <Link
                              to={subjectValue}
                              rel='noopener noreferrer'
                              target='_blank'
                              style={{ textDecoration: 'none', color: 'inherit' }} // Inherit text color and remove underline
                            >
                              <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                                {subjectValue}
                              </Typography>
                              <OpenInNewIcon fontSize='small' sx={{ color: theme.palette.texts }} />
                            </Link>
                          </Box>
                        </Box>
                      )}
                    </Box>
                    {issuerValue && (
                      <Box sx={{ display: 'flex', mb: 4 }}>
                        <Box sx={{ width: '130px' }}>
                          <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                            Issuer:
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                            {issuerValue}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {aspectValue && (
                      <Box sx={{ display: 'flex', mb: 4 }}>
                        <Box sx={{ width: '130px' }}>
                          <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                            Aspect:
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                            {aspectValue}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {confidenceValue !== null && (
                      <Box sx={{ display: 'flex', mb: 4 }}>
                        <Box sx={{ width: '130px' }}>
                          <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                            Confidence:
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                            {confidenceValue}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {amtValue && (
                      <Box sx={{ display: 'flex', mb: 4 }}>
                        <Box sx={{ width: '130px' }}>
                          <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                            Amount:
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                            {amtValue}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {effectiveDateValue && (
                      <Box sx={{ display: 'flex', mb: 4 }}>
                        <Box sx={{ width: '130px' }}>
                          <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                            Date:
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                            {effectiveDateValue}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {howKnownValue && (
                      <Box sx={{ display: 'flex', mb: 4 }}>
                        <Box sx={{ width: '130px' }}>
                          <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
                            How Known:
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                            {howKnownValue}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    {statementValue && (
                      <Box sx={{ display: 'flex', mb: 5, mt: 4 }}>
                        <Typography variant='body2' sx={{ fontWeight: 'bold', mr: 4 }}>
                          Statement:
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{
                            padding: '5px 1 1 5px',
                            wordBreak: 'break-word',
                            color: theme.palette.texts
                          }}
                        >
                          {isExpanded || !isStatementLong ? statementValue : truncateText(statementValue, 300)}
                          {isStatementLong && (
                            <MuiLink
                              onClick={handleToggleExpand}
                              sx={{
                                cursor: 'pointer',
                                marginLeft: '5px',
                                color: theme.palette.link,
                                textDecoration: 'none'
                              }}
                            >
                              {isExpanded ? 'Show Less' : 'See More'}
                            </MuiLink>
                          )}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Box>
              <Box
                sx={{
                  display: isMediumScreen ? 'flex' : 'none',
                  flexDirection: 'column',
                  width: '100%',
                  padding: '20px 0 0 0px',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  marginBottom: isMediumScreen ? '12px' : '36px',
                  position: 'relative',
                  textWrap: 'wrap',
                  wordBreak: 'break-word'
                }}
              >
                <Typography variant='body1'>
                  {`Do you know anything about that?`}
                  <Box
                    sx={{
                      height: '5px',
                      backgroundColor: theme.palette.maintext,
                      marginTop: '4px',
                      borderRadius: '2px',
                      width: '70%'
                    }}
                  />
                </Typography>
              </Box>
              <Box
                sx={{
                  width: isMediumScreen ? '95%' : '45%',
                  height: 'fill',
                  borderRadius: '20px',
                  backgroundColor: theme.palette.cardBackground,
                  mt: 0,
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' // Add shadow for depth
                }}
              >
                <Card
                  sx={{
                    backgroundColor: theme.palette.cardBackground,
                    backgroundImage: 'none',
                    overflow: 'visible',
                    boxShadow: 'none',
                    padding: '30px',
                    width: '100%',
                    height: 'auto',
                    borderRadius: '20px'
                  }}
                >
                  <Box sx={{ height: '544', width: '100%' }}>
                    <Typography variant='h6' sx={{ mt: 2, mb: 4, fontWeight: 'bold' }}>
                      {`Validator Information`}
                    </Typography>
                    {/* How Known Select Field */}
                    <Typography variant='body2'>How Known(Required)</Typography>
                    <FormControl
                      fullWidth
                      margin='normal'
                      sx={{
                        backgroundColor: theme.palette.input,
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'transparent'
                          },
                          '&:hover fieldset': {
                            borderColor: 'transparent'
                          },
                          '& .MuiInputBase-input': {
                            color: theme.palette.texts,
                            fontWeight: 400,
                            fontSize: 16
                          }
                        }
                      }}
                    >
                      <Controller
                        name='howKnown'
                        control={control}
                        defaultValue=''
                        rules={{
                          required: 'This field is required' // This makes the field required
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <Select
                              {...field}
                              sx={{
                                '& .MuiSelect-icon': {
                                  color: '#0A1C1D'
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                  border: 'none'
                                },
                                '& .MuiInputBase-input': {
                                  color: theme.palette.texts,
                                  fontWeight: 400,
                                  fontSize: 16
                                }
                              }}
                              error={Boolean(error)} // Pass the error state to the Select component
                            >
                              {inputOptions.howKnown.map((option, index: number) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                  onClick={() => handleItemSelect()}
                                  sx={{
                                    backgroundColor: theme.palette.input,
                                    color: theme.palette.texts,
                                    fontSize: 16,
                                    '&:hover': {
                                      backgroundColor: theme.palette.input
                                    },
                                    '&.Mui-selected': {
                                      backgroundColor: theme.palette.input,
                                      '&:hover': {
                                        backgroundColor: theme.palette.input
                                      }
                                    },
                                    '& .MuiInputBase-input': {
                                      color: theme.palette.texts,
                                      fontWeight: 400,
                                      fontSize: 16
                                    },
                                    '&:active': {
                                      backgroundColor: theme.palette.input
                                    },
                                    '::selection': {
                                      backgroundColor: theme.palette.input
                                    },
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}
                                >
                                  <Tooltip
                                    title={tooltips.howKnown[index]}
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
                                        >
                                          <HelpIcon sx={{ color: '#0ABAB5' }} />
                                        </IconButton>
                                      )}
                                    </Box>
                                  </Tooltip>
                                </MenuItem>
                              ))}
                            </Select>
                            {error && (
                              <FormHelperText error>{error.message}</FormHelperText> // Display error message
                            )}
                          </>
                        )}
                      />
                    </FormControl>

                    {/* URL Input Field */}
                    {(watchHowKnown === FIRST_HAND ||
                      watchHowKnown === SECOND_HAND ||
                      watchHowKnown === FIRST_HAND_BENEFIT ||
                      watchHowKnown === FIRST_HAND_REJECTED) && (
                      <URLInputField control={control} label='Your Website (Required)' />
                    )}
                    {(watchHowKnown === WEB_DOCUMENT || watchHowKnown === WEB_DOCUMENT_REJECTED) && (
                      <URLInputField control={control} label='Source URL (Required)' />
                    )}
                    <Typography variant='h6' sx={{ mt: 2, mb: 4, fontWeight: 'bold' }}>
                      {`Claim Validation Details `}
                    </Typography>
                    {/* Effective Date Field */}
                    <Typography variant='body2'>Effective Date</Typography>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                      <Controller
                        name='effectiveDate'
                        control={control}
                        render={({ field }) => (
                          <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                              {...field}
                              renderInput={params => (
                                <TextField
                                  {...params}
                                  sx={{
                                    backgroundColor: theme.palette.input,
                                    '& .MuiOutlinedInput-root': {
                                      '& fieldset': {
                                        borderColor: 'transparent'
                                      },
                                      '&:hover fieldset': {
                                        borderColor: 'transparent'
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: 'transparent'
                                      }
                                    },
                                    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                                      color: '#0A1C1D'
                                    },
                                    '& .MuiInputBase-input': {
                                      color: theme.palette.texts,
                                      fontSize: 16,
                                      fontWeight: 400
                                    }
                                  }}
                                  margin='normal'
                                  InputProps={{
                                    ...params.InputProps,
                                    sx: {
                                      '&:before': {
                                        borderBottom: 'none'
                                      },
                                      '&:hover:not(.Mui-disabled):before': {
                                        borderBottom: 'none'
                                      },
                                      '&.Mui-focused:after': {
                                        borderBottom: 'none'
                                      }
                                    }
                                  }}
                                />
                              )}
                              value={field.value}
                              onChange={date => field.onChange(date)}
                            />
                          </LocalizationProvider>
                        )}
                      />
                    </FormControl>

            <Typography
              sx={{
                mb: '5px',
                fontFamily: 'Montserrat',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '100%',
                letterSpacing: '0%'
              }}
            >
              Upload supporting Evidence (Optional):
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

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: '27px' }}>
              <Button
                onClick={onSubmit}
                variant='contained'
                size='large'
                sx={{
                  height: '48px',
                  width: '180px',
                  color: '#ffffff',
                  borderRadius: '24px',
                  bgcolor: '#2D6A4F',
                  fontFamily: 'Roboto',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  '&:hover': {
                    backgroundColor: '#2D6A4F'
                  }
                }}
              >
                Submit
              </Button>
            </Box>
          </Box>
        </form>
      </MainContainer>
    </>
  )
}

export default Validate
