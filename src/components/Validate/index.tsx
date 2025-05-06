import { useState, useMemo } from 'react'
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
  Badge
} from '@mui/material'
import { Controller, useForm, useFieldArray, Control } from 'react-hook-form'
import IHomeProps from '../../containers/Form/types'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import { useQueryParams } from '../../hooks'
import Loader from '../Loader'
import axios from '../../axiosInstance'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import placeholderImage from '../../assets/images/imgplaceholder.svg'
import HelpIcon from '@mui/icons-material/Help'
import ImageUploader from '../Form/imageUploading'
import MainContainer from '../MainContainer'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ClaimBadge from '../../containers/feedOfClaim/Badge'
// Constants for How Known options
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
}

// Reusable URL Input Field Component
const URLInputField: React.FC<{
  control: Control<FormData>
  label: string
}> = ({ control, label }) => {
  const theme = useTheme()

  return (
    <>
      <Typography variant='body2'>{label}</Typography>
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
            sx={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#000000'
                },
                '&:hover fieldset': {
                  borderColor: '#000000'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#000000'
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
    </>
  )
}

const Validate = ({ toggleSnackbar, setSnackbarMessage }: IHomeProps) => {
  const [loading, setLoading] = useState(false)
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

  const subject = queryParams.get('subject')

  let number: string | undefined
  if (subject) {
    const parts = subject.split('/')
    number = parts[parts.length - 1]
  }

  useMemo(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/api/claim/${number}`)
        console.log('Fetched data:', res.data) // Debugging log

        if (res.data.claim.subject) setSubjectValue(res.data.claim.subject)
        if (res.data.claim.statement) setStatementValue(res.data.claim.statement)
        if (res.data.claim.amt) setAmtValue(res.data.claim.amt)
        if (res.data.claim.aspect) setAspectValue(res.data.claim.aspect)
        if (res.data.claim.confidence !== undefined) setConfidenceValue(res.data.claim.confidence)
        if (res.data.claim.sourceURI) setIssuerValue(res.data.claim.sourceURI)
        if (res.data.claim.source_thumbnail) setSourceThumbnail(res.data.claim.source_thumbnail)
        if (res.data.claim.howKnown) setHowKnownValue(res.data.claim.howKnown)
        if (res.data.claimData.name) setClaimName(res.data.claimData.name)
        if (res.data.claimData.issuer_name) setIssuerName(res.data.claimData.issuer_name)
        if (res.data.claimData.subject_name) setSubjectName(res.data.claimData.subject_name)
        if (res.data.claim.claim) setClaim(res.data.claim.claim)
        if (res.data.claim.claimAddress) setClaimAddress(res.data.claim.claimAddress)

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
      } finally {
        setLoading(false)
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

  const onSubmit = handleSubmit(async ({ subject, statement, howKnown, effectiveDate, amt, sourceURI, images }) => {
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
        console.log('Submission response:', { message, isSuccess }) // Debugging log

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
        console.error('Error during submission:', error) // Debugging log
        setLoading(false)
        setSnackbarMessage('An error occurred during submission.')
      }
    }
  })

  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return `${text.substring(0, length)}...`
  }

  const isStatementLong = statementValue.length > 300
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

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

  const getLinkUrl = () => {
    return claim === 'credential' ? claimAddress : subjectValue
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
                width: '100%',
                maxWidth: '1115px',
                margin: '0 auto',
                padding: '20px',
                backgroundColor: theme.palette.pageBackground,
                borderRadius: '12px',
                boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  width: '100%',
                  margin: '0',
                  gap: '20px'
                }}
              >
                <Typography variant='h6' sx={{  fontWeight: 'bold', width: '95%' }}>
                  Validate the Credential
                </Typography>
                <Box
                  sx={{
                    height: '1px',
                    backgroundColor: '#E0E0E0',
                    marginTop: '4px',
                    borderRadius: '2px',
                    width: '100%',
                    mb: '5px'
                  }}
                />
                <Box
                  sx={{
                    width: '95%',
                    height: 'auto',
                    borderRadius: '8px',
                    backgroundColor: theme.palette.cardBackground,
                    mt: 0,
                    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <Card
                    sx={{
                      backgroundColor: theme.palette.cardBackground,
                      padding: '30px',
                      width: '100%',
                      minHeight: 'auto',
                      backgroundImage: 'none',
                      height: 'auto',
                      borderRadius: '8px'
                    }}
                  >
                    <Box sx={{ display: 'block', position: 'relative', width: '100%' }}>
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: '95%',
                            gap: '10px',
                            justifyContent: 'space-between'
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              wordBreak: 'break-word',
                              overflowWrap: 'anywhere',
                              whiteSpace: 'normal'
                            }}
                          >
                            <Link
                              to={getLinkUrl()}
                              rel='noopener noreferrer'
                              target='_blank'
                              style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                fontSize: '18px !important',
                                alignItems: 'center'
                              }}
                            >
                              <Typography variant='body2' sx={{ color: theme.palette.texts, fontSize: '18px !important' }}>
                                {claimName && subject_name ? `${claimName} - ${subject_name}` : subjectValue}
                              </Typography>
                              <OpenInNewIcon fontSize='small' sx={{ color: theme.palette.texts ,paddingLeft: '5px'}} />
                            </Link>
                          </Box>
                          <ClaimBadge claim={claim} />
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
                          {`Created by: ${issuer_name}, ${effectiveDateValue}`}
                        </Typography>

                        {statementValue && (
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
                            {statementValue}
                          </Typography>
                        )}
                      </CardContent>

                      <Box
                        sx={{
                          height: '1px',
                          backgroundColor: '#E0E0E0',
                          marginTop: '4px',
                          borderRadius: '2px',
                          display: 'flex',
                          width: '100%',
                          mb: '10px',
                          mr: 'auto',
                          ml: 'auto'
                        }}
                      />

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-evenly',
                          gap: 2,
                          position: 'relative',
                          mt: '10px',
                          mb: '10px',
                          pl: '20px',
                          pr: '20px'
                        }}
                      >
                        {aspectValue && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant='body2' sx={{ color: theme.palette.texts, mr: 1 }}>
                              Aspect:
                            </Typography>
                            <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                              {aspectValue}
                            </Typography>
                          </Box>
                        )}
                        {confidenceValue !== null && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant='body2' sx={{ color: theme.palette.texts, mr: 1 }}>
                              Confidence:
                            </Typography>
                            <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                              {confidenceValue}
                            </Typography>
                          </Box>
                        )}
                        {amtValue && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant='body2' sx={{ color: theme.palette.texts, mr: 1 }}>
                              Amount:
                            </Typography>
                            <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                              {amtValue}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Card>
                </Box>

                <Box
                  sx={{
                    width: '95%',
                    height: 'fill',
                    borderRadius: '8px',
                    backgroundColor: theme.palette.cardBackground,
                    mt: 0,
                    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.2)'
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
                      
                      
                      {/* How Known Select Field */}
                      <Typography variant='body2'>How Known(Required)</Typography>
                      <FormControl
                        fullWidth
                        margin='normal'
                        sx={{
                          backgroundColor: '#FFFFFF',
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: '#000000'
                            },
                            '&:hover fieldset': {
                              borderColor: '#000000'
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#000000'
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
                                    border: '1px solid #000000'
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
                                      backgroundColor: '#FFFFFF',
                                      color: theme.palette.texts,
                                      fontSize: 16,
                                      '&:hover': {
                                        backgroundColor: '#FFFFFF'
                                      },
                                      '&.Mui-selected': {
                                        backgroundColor: '#FFFFFF',
                                        '&:hover': {
                                          backgroundColor: '#FFFFFF'
                                        }
                                      },
                                      '& .MuiInputBase-input': {
                                        color: theme.palette.texts,
                                        fontWeight: 400,
                                        fontSize: 16
                                      },
                                      '&:active': {
                                        backgroundColor: '#FFFFFF'
                                      },
                                      '::selection': {
                                        backgroundColor: '#FFFFFF'
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
                                      backgroundColor: '#FFFFFF',
                                      '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                          borderColor: '#000000'
                                        },
                                        '&:hover fieldset': {
                                          borderColor: '#000000'
                                        },
                                        '&.Mui-focused fieldset': {
                                          borderColor: '#000000'
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

                      {/* Statement Field */}
                      <Typography
                        variant='body2'
                        sx={{
                          p: '5px'
                        }}
                      >
                        Validation Statement (Required)
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
                            {...field}
                            multiline
                            rows={4}
                            sx={{
                              width: '100%',
                              height: '179px',
                              backgroundColor: '#FFFFFF',
                              border: 'none',
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: '#000000'
                                },
                                '&:hover fieldset': {
                                  borderColor: '#000000'
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#000000'
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

                      {/* Image Uploader */}
                      <Typography
                        variant='body2'
                        sx={{
                          margin: '10px'
                        }}
                      >
                        Upload supporting Evidence (Optional)
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
                  </Card>
                </Box>
              </Box>
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: '27px' }}>
              <Button
                onClick={onSubmit}
                variant='contained'
                size='large'
                sx={{
                  fontSize: '18px',
                  fontWeight: 400,
                  height: '48px',
                  width: '180px',
                  color: theme.palette.buttontext,
                  borderRadius: '24px',
                  bgcolor: theme.palette.buttons,
                  '&:hover': {
                    backgroundColor: theme.palette.buttonHover
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
