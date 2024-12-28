import { useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import { useNavigate } from 'react-router-dom'
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
  Fade
} from '@mui/material'
import { Controller, useForm, useFieldArray } from 'react-hook-form'
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

        if (res.data.claim.subject) setSubjectValue(res.data.claim.subject)
        if (res.data.claim.statement) setStatementValue(res.data.claim.statement)
        if (res.data.claim.amt) setAmtValue(res.data.claim.amt)
        if (res.data.claim.aspect) setAspectValue(res.data.claim.aspect)
        if (res.data.claim.confidence !== undefined) setConfidenceValue(res.data.claim.confidence)
        if (res.data.claim.source_name) setIssuerValue(res.data.claim.source_name)
        if (res.data.claim.source_thumbnail) setSourceThumbnail(res.data.claim.source_thumbnail)
        if (res.data.claim.howKnown) setHowKnownValue(res.data.claim.howKnown)

        if (res.data.effectiveDate) {
          const dayPart = res.data.effectiveDate.split('T')[0] || res.data.effectiveDate
          setEffectiveDateValue(dayPart)
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
  const watchHowKnown = watch('howKnown')

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

      console.log("In submit, payload is")
      console.log(payload)

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

  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [openTooltipIndex, setOpenTooltipIndex] = useState<number | null>(null)

  const inputOptions = {
    howKnown: [
      { value: FIRST_HAND, text: 'validate first hand' },
      { value: SECOND_HAND, text: 'validate second hand' },
      { value: WEB_DOCUMENT, text: 'validate from source' },

      // these are not valid to return to server, will be modified in handler
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

  const handleTooltipToggle = (index: number) => {
    setOpenTooltipIndex(prevIndex => (prevIndex === index ? null : index))
  }

  return (
    <>
      <Loader open={loading} />
      <MainContainer
        sx={{
          overflow: 'hidden',
          alignItems: 'center'
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
            <Box
              sx={{
                m: '15px',
                width: '100%',
                textWrap: 'wrap',
                wordBreak: 'break-word',
                display: 'flex'
              }}
            >
              <Typography variant='body1'>
                {`There’s a claim that`}
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
              <Box sx={{ display: isMediumScreen ? 'none' : 'flex', ml: 'clamp(140px, 31%, 670px)' }}>
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
                  top: '210px',
                  left: '212px',
                  borderRadius: '20px',
                  backgroundColor: theme.palette.cardBackground,
                  mt: 0
                }}
              >
                <Card
                  sx={{
                    backgroundColor: theme.palette.cardBackground,
                    padding: '30px',
                    width: '100%',
                    minHeight: isMediumScreen ? 'auto' : '870px',
                    backgroundImage: 'none',
                    height: 'auto',
                    borderRadius: '20px'
                  }}
                >
                  <Box sx={{ height: '545', width: '535' }}>
                    {issuerValue && (
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ width: '130px' }}>
                          <Typography variant='body2'>Issuer :</Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2'>{issuerValue}</Typography>
                        </Box>
                      </Box>
                    )}
                    {subjectValue && (
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ width: '130px' }}>
                          <Typography variant='body2'>Subject :</Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2'>{subjectValue}</Typography>
                        </Box>
                      </Box>
                    )}
                    {aspectValue && (
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ width: '130px' }}>
                          <Typography variant='body2'>Aspect :</Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2'>{aspectValue}</Typography>
                        </Box>
                      </Box>
                    )}
                    {confidenceValue !== null && (
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ width: '130px' }}>
                          <Typography variant='body2'>Confidence :</Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2'>{confidenceValue}</Typography>
                        </Box>
                      </Box>
                    )}
                    {amtValue && (
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ width: '130px' }}>
                          <Typography variant='body2'>Amount:</Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2'>{amtValue}</Typography>
                        </Box>
                      </Box>
                    )}
                    {effectiveDateValue && (
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ width: '130px' }}>
                          <Typography variant='body2'>Date :</Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2'>{effectiveDateValue}</Typography>
                        </Box>
                      </Box>
                    )}
                    {howKnownValue && (
                      <Box sx={{ display: 'flex' }}>
                        <Box sx={{ width: '130px' }}>
                          <Typography variant='body2'>How Known :</Typography>
                        </Box>
                        <Box>
                          <Typography variant='body2'>{howKnownValue}</Typography>
                        </Box>
                      </Box>
                    )}
                    {statementValue && (
                      <Typography
                        variant='body2'
                        component='span'
                        sx={{
                          padding: '5px 1 1 5px',
                          wordBreak: 'break-word',
                          color: theme.palette.texts
                        }}
                      >
                        Statement :
                        <Typography variant='body2'>
                          <Typography
                            variant='body2'
                            component='span'
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
                        </Typography>
                      </Typography>
                    )}
                  </Box>
                </Card>
              </Box>
              <Box
                sx={{
                  display: isMediumScreen ? 'flex' : 'none',
                  flexDirection: 'column',
                  width: '100%',
                  padding: '20px 0 0 20px',
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
                  width: isMediumScreen ? '95%' : '47.5%',
                  height: 'auto',
                  minHeight: isMediumScreen ? 'auto' : '870px',
                  borderRadius: '20px',
                  boxShadow: 'none',
                  backgroundColor: theme.palette.cardBackground
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

                    <Typography variant='body2'>How Known</Typography>
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
                        name="howKnown"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
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
                          >
                        {inputOptions.howKnown.map((option, index: number) => (
                          <MenuItem
                            key={option.value}
                            value={option.value}
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
                                <Box sx={{ flexGrow: 1 }}>{option.text}</Box>
                                {isMobile && (
                                  <Tooltip
                                    title={tooltips.howKnown[index]}
                                    placement='right'
                                    arrow
                                    TransitionComponent={Fade}
                                    open={openTooltipIndex === index}
                                    onClose={() => setOpenTooltipIndex(null)}
                                    disableFocusListener
                                    disableHoverListener
                                    disableTouchListener
                                  >
                                    <IconButton size='small' onClick={() => handleTooltipToggle(index)}>
                                      <HelpIcon sx={{ color: '#0ABAB5' }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      />
                    </FormControl>

                    {watchHowKnown === FIRST_HAND && (
                      <>
                        <Typography variant='body2'>Your Website</Typography>
                        <Controller
                          name="sourceURI"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <TextField
                              {...field}
                              sx={{
                                width: '100%',
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
                              margin='normal'
                            />
                          )}
                        />
                      </>
                    )}

                    {watchHowKnown === WEB_DOCUMENT && (
                      <>
                        <Typography variant='body2'>Source URL</Typography>
                        <Controller
                          name="sourceURI"
                          control={control}
                          defaultValue=""
                          render={({ field }) => (
                            <TextField
                              {...field}
                              sx={{
                                width: '100%',
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
                              margin='normal'
                            />
                          )}
                        />
                      </>
                    )}

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
                      variant='body2'
                      sx={{
                        p: '5px'
                      }}
                    >
                      Explain here
                    </Typography>
                    <Controller
                      name="statement"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField
                          {...field}
                          multiline
                          rows={4}
                          sx={{
                            width: '100%',
                            height: '179px',
                            backgroundColor: theme.palette.input,
                            border: 'none',
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
                        />
                      )}
                    />

                    <Typography
                      variant='body2'
                      sx={{
                        margin: '10px'
                      }}
                    >
                      Upload image
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
