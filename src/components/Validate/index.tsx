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
  FormHelperText,
  Fab,
  Card,
  Grow,
  CardContent,
  Menu,
  Collapse
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
import MoreVertIcon from '@mui/icons-material/MoreVert'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import StarIcon from '@mui/icons-material/Star'
import ArrowUpward from '@mui/icons-material/ArrowUpward'
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
  stars?: number
  how_known?: string
  aspect?: string
  confidence?: number
  score?: number
  amt?: string | number
  statement?: string
  claim_id?: string
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

// Added missing SourceLink component
const SourceLink = ({ claim, searchTerm = '' }: { claim: LocalClaim; searchTerm?: string }) => {
  const theme = useTheme()
  const sourceName = extractSourceName(claim.source_link)

  const highlightedName = searchTerm.trim()
    ? sourceName.replace(
        new RegExp(`(${searchTerm})`, 'gi'),
        (match: string) => `<span style="background-color:${theme.palette.searchBarBackground};">${match}</span>`
      )
    : sourceName

  return <span dangerouslySetInnerHTML={{ __html: `Source: ${highlightedName}` }} />
}

const Validate = ({ toggleSnackbar, setSnackbarMessage }: IHomeProps) => {
  const [loading, setLoading] = useState(false)
  const queryParams = useQueryParams()
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [claims, setClaims] = useState<LocalClaim[]>([])
  const [expandedStatements, setExpandedStatements] = useState<{ [key: string]: boolean }>({})

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

        // For demo purposes, create a sample claims array
        setClaims([
          {
            ...fetchedClaim,
            link: fetchedClaim.link || '',
            effective_date: effectiveDate,
            claim_id: '1'
          }
        ])

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

  // Added missing event handlers
  const handleValidation = (claimId: string) => {
    console.log('Validating claim:', claimId)
    // Implementation would go here
  }

  const handleSchema = (claim: LocalClaim) => {
    console.log('Showing graph for:', claim)
    // Implementation would go here
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(event.currentTarget)
    setSelectedIndex(index)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setSelectedIndex(null)
  }

  const toggleStatement = (claimId: string) => {
    setExpandedStatements(prev => ({
      ...prev,
      [claimId]: !prev[claimId]
    }))
  }

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
          marginLeft: 'auto',
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)'
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
          <Typography
            sx={{
              color: theme.palette.texts,
              textAlign: 'center',
              marginLeft: isMediumScreen ? '0' : '1rem',
              marginTop: isMediumScreen ? '0' : '1rem',
              fontSize: '20px',
              fontWeight: '700'
            }}
          >
            Validate the Credential
          </Typography>
        </Box>
        <Box
          sx={{
            height: '1px',
            backgroundColor: '#E0E0E0',
            marginTop: '4px',
            borderRadius: '2px',
            width: '100%',
            mb: '40px'
          }}
        />
        <Box
          sx={{
            width: '100%',
            height: '100%',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
            borderRadius: '8px',
            p: '1.9rem',
            mr: '10px',
            mt: '10px',
            mb: '3rem'
          }}
        >
          {claims.map((claim: any, index: number) => (
            <Grow in={true} timeout={1000} key={claim.claim_id}>
              <Box sx={{ marginBottom: '15px' }}>
                <Box>
                  <Box sx={{ display: 'block', position: 'relative', width: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          width: '95%',
                          gap: '10px'
                        }}
                      >
                        <Tooltip
                          title='View the original credential'
                          arrow
                          placement='left'
                          componentsProps={{
                            tooltip: {
                              sx: {
                                bgcolor: '#222222',
                                color: '#FFFFFF',
                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                                padding: '8px 16px',
                                fontSize: '14px',
                                borderRadius: '4px'
                              }
                            }
                          }}
                        >
                          <Box
                            sx={{
                              display: 'block',
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              whiteSpace: 'normal'
                            }}
                          >
                            <Link
                              to={claim.link}
                              onClick={e => handleLinkClick(e, claim.link)}
                              target='_blank'
                              rel='noopener noreferrer'
                              style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                fontSize: '18px !important',
                                alignItems: 'center'
                              }}
                            >
                              <ClaimName claim={claim} searchTerm={searchTerm} />
                            </Link>
                          </Box>
                        </Tooltip>

                        <Badge claim={claim.claim} />
                      </Box>
                      <Typography
                        variant='body1'
                        sx={{
                          marginBottom: '10px',
                          color: theme.palette.text1,
                          fontSize: '14px !important',
                          fontFamily: 'Roboto'
                        }}
                      >
                        {`Created by: ${claim.author ? claim.author : extractProfileName(claim.link)}, ${new Date(
                          claim.effective_date
                        ).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}`}
                      </Typography>

                      {claim.statement && (
                        <>
                          {expandedStatements[claim.claim_id || ''] ? (
                            <Box>
                              <Typography
                                variant='body1'
                                sx={{
                                  padding: '5px 1 1 5px',
                                  wordBreak: 'break-word',
                                  fontSize: '16px !important',
                                  fontWeight: 500,
                                  marginBottom: '1px',
                                  color: theme.palette.claimtext
                                }}
                              >
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: searchTerm
                                      ? claim.statement.replace(
                                          new RegExp(`(${searchTerm})`, 'gi'),
                                          (match: any) =>
                                            `<span style="background-color:${theme.palette.searchBarBackground};">${match}</span>`
                                        )
                                      : claim.statement
                                  }}
                                />
                              </Typography>
                            </Box>
                          ) : (
                            <Button
                              sx={{
                                color: '#2D6A4F',
                                textTransform: 'none',
                                padding: '0 5px',
                                margin: '5px 0',
                                fontSize: '14px',
                                fontWeight: 500,
                                '&:hover': {
                                  backgroundColor: 'transparent',
                                  textDecoration: 'underline'
                                }
                              }}
                              onClick={() => toggleStatement(claim.claim_id || '')}
                            >
                              See the full details
                            </Button>
                          )}
                        </>
                      )}
                    </CardContent>
                    {/* moka work here  */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', m: '20px' }}>
                      {claim.stars && (
                        <Box
                          sx={{
                            display: 'flex',
                            p: '4px',
                            flexWrap: 'wrap',
                            justifyContent: 'flex-end'
                          }}
                        >
                          {Array.from({ length: claim.stars }).map((_, index) => (
                            <StarIcon
                              key={index}
                              sx={{
                                color: '#FFC107',
                                width: '3vw',
                                height: '3vw',
                                fontSize: '3vw',
                                maxWidth: '24px',
                                maxHeight: '24px'
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>

                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        color: theme.palette.texts,
                        cursor: 'pointer'
                      }}
                      onClick={event => handleMenuClick(event, index)}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',

                          color: theme.palette.smallButton
                        }}
                      >
                        <MoreVertIcon />
                      </Box>
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl && selectedIndex === index)}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                      }}
                      TransitionComponent={Grow}
                      transitionDuration={250}
                      sx={{
                        '& .MuiPaper-root': {
                          backgroundColor: theme.palette.menuBackground,
                          color: theme.palette.texts
                        }
                      }}
                    >
                      {claim.source_link && (
                        <MenuItem onClick={() => window.open(claim.source_link, '_blank')}>
                          <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                            Aspect: {claim.aspect}
                          </Typography>
                        </MenuItem>
                      )}
                      {claim.confidence !== 0 && (
                        <MenuItem>
                          <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                            Confidence: {claim.confidence}
                          </Typography>
                        </MenuItem>
                      )}
                      {claim.stars && (
                        <MenuItem>
                          <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                            Rating as Stars: {claim.stars}
                          </Typography>
                        </MenuItem>
                      )}
                      {claim.score && (
                        <MenuItem>
                          <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                            Rating as Score: {claim.score}
                          </Typography>
                        </MenuItem>
                      )}
                      {claim.amt && (
                        <MenuItem>
                          <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                            Amount of claim: $ {claim.amt}
                          </Typography>
                        </MenuItem>
                      )}
                    </Menu>
                  </Box>
                </Box>
              </Box>
            </Grow>
          ))}
          {showScrollButton && (
            <Fab
              size='small'
              sx={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                backgroundColor: '#2D6A4F',
                '&:hover': {
                  backgroundColor: '#1A5336'
                }
              }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ArrowUpward sx={{ color: '#FFFFFF' }} />
            </Fab>
          )}
        </Box>
        {/* Rest of the form remains the same as in the previous implementation */}
        <form
          onSubmit={onSubmit}
          style={{
            display: 'flex',
            flexDirection: isMediumScreen ? 'column' : 'row',
            width: '100%'
          }}
        >
          <Box
            sx={{
              width: '100%',
              boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
              borderRadius: '8px',
              p: '1.9rem',
              mr: '10px',
              mt: '10px',
              mb: '3rem'
            }}
          >
            {/* Form Content */}
            <Typography
              sx={{
                color: theme.palette.texts,
                marginTop: '10px',
                mb: '30px',
                fontSize: '20px',
                fontWeight: '700'
              }}
            >
              Validator Information
            </Typography>
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
              Website (Required):
            </Typography>
            <Controller
              name='webTitle'
              control={control}
              defaultValue=''
              rules={{
                required: 'This field is required'
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  placeholder='Add your website '
                  {...field}
                  multiline
                  rows={4}
                  sx={{
                    width: '100%',
                    height: '55px',

                    mb: '20px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #A3A3A3',
                    borderRadius: '8px',

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
                  margin='normal'
                  error={Boolean(error)}
                  helperText={error ? error.message : ''}
                />
              )}
            />
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
              Title (Required):
            </Typography>
            <Controller
              name='title'
              control={control}
              defaultValue=''
              rules={{
                required: 'This field is required'
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  placeholder='Add your title/role'
                  {...field}
                  multiline
                  rows={4}
                  sx={{
                    width: '100%',
                    height: '55px',

                    mb: '20px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #A3A3A3',
                    borderRadius: '8px',

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
                  margin='normal'
                  error={Boolean(error)}
                  helperText={error ? error.message : ''}
                />
              )}
            />
            <Typography
              sx={{
                color: theme.palette.texts,

                marginTop: '10px',
                mb: '30px',
                fontSize: '20px',
                fontWeight: '700'
              }}
            >
              Credential Validation Details
            </Typography>
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
              How Known (Required):
            </Typography>
            <FormControl
              margin='normal'
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #A3A3A3',
                borderRadius: '8px',
                width: '100%',

                mb: '30px',
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
                      displayEmpty
                      {...field}
                      sx={{
                        '& .MuiSelect-icon': {
                          color: '#0A1C1D'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none'
                        },
                        '& .MuiInputBase-input': {
                          fontWeight: 400,
                          fontSize: 16,
                          color: '#A3A3A3'
                        }
                      }}
                      error={Boolean(error)} // Pass the error state to the Select component
                    >
                      <MenuItem value='' disabled>
                        Explain why you are validating or rejecting this credential{' '}
                      </MenuItem>
                      {inputOptions.howKnown.map((option, index: number) => (
                        <MenuItem
                          key={option.value}
                          value={option.value}
                          onClick={() => handleItemSelect()}
                          sx={{
                            backgroundColor: '#ffffff',
                            color: theme.palette.texts,
                            fontSize: 16,
                            '&:hover': {
                              backgroundColor: '#2D6A4F'
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
                    {error && <FormHelperText error>{error.message}</FormHelperText>}
                  </>
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
              Validation Statement (Required):
            </Typography>
            <Controller
              name='statement'
              control={control}
              defaultValue=''
              rules={{
                required: 'This field is required'
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  placeholder='Explain why you are validating or rejecting this credential'
                  {...field}
                  multiline
                  rows={4}
                  sx={{
                    width: '100%',
                    height: '179px',
                    mb: '30px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #A3A3A3',
                    borderRadius: '8px',

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
                  margin='normal'
                  error={Boolean(error)}
                  helperText={error ? error.message : ''}
                />
              )}
            />

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
              Effective Date (Required):
            </Typography>

            <FormControl sx={{ mb: '30px', width: '100%', mr: 'auto' }}>
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
                            backgroundColor: '#ffffff',
                            border: '1px solid #A3A3A3',
                            borderRadius: '8px',
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
