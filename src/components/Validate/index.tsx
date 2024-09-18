import { useEffect, useState, useMemo } from 'react'
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
const WEB_DOCUMENT = 'WEB_DOCUMENT'
const FIRST_HAND_BENEFIT = 'FIRST_HAND_BENEFIT'
const FIRST_HAND_REJECTED = 'FIRST_HAND_REJECTED'
const WEB_DOCUMENT_REJECTED = 'WEB_DOCUMENT_REJECTED'

const CLAIM_RATED = 'rated'
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

  const { handleSubmit, reset, control, register } = useForm<FormData>({ defaultValues })

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

  const howKnownMapping: { [key: string]: string } = {
    first_hand: 'FIRST_HAND',
    second_hand: 'SECOND_HAND',
    website: 'WEB_DOCUMENT',
    physical_document: 'PHYSICAL_DOCUMENT'
  }

  // const displayHowKnownText = {
  //   first_hand: 'First Hand',
  //   second_hand: 'Second Hand',
  //   website: 'Website',
  //   physical_document: 'Physical Document'
  // } as any

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
        claim: CLAIM_RATED,
        images
      }

      if (howKnown === FIRST_HAND_BENEFIT) {
        payload.claim = CLAIM_IMPACT
        payload.amt = amt
        payload.howKnown = FIRST_HAND
      } else if (howKnown === FIRST_HAND_REJECTED) {
        payload.score = -1
        payload.howKnown = FIRST_HAND
      } else if (howKnown === WEB_DOCUMENT_REJECTED) {
        payload.score = -1
        payload.howKnown = WEB_DOCUMENT
      }

      setLoading(true)

      const { message, isSuccess } = await createClaim(payload)

      setLoading(false)
      toggleSnackbar(true)
      setSnackbarMessage(message)
      if (isSuccess) {
        setTimeout(() => {
          navigate('/feed')
        }, 3000)
        reset()
      } else {
        toggleSnackbar(true)
        setSnackbarMessage('Subject and Claims are required fields.')
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
    howKnown: ['first_hand', 'second_hand', 'website', 'physical_document']
  }

  const tooltips = {
    howKnown: [
      'The information is known directly from personal experience or firsthand knowledge.',
      'The information is known from someone else who has firsthand knowledge or experience.',
      'The information is known from a website as a source.',
      'The information is known from a physical document, such as a paper document or certificate.'
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
              <Typography
                sx={{
                  fontSize: '23px',
                  fontWeight: '700'
                }}
              >
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
                  sx={{
                    fontSize: '23px',
                    fontWeight: '700',
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
                  <Box
                    sx={{
                      border: '20px ',
                      borderRadius: '8px',
                      height: '328px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.palette.input,
                      textWrap: 'wrap',
                      p: '3',
                      marginBottom: '45px'
                    }}
                  >
                    <img
                      src={sourceThumbnail || placeholderImage}
                      alt='Source Thumbnail'
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                      onError={e => {
                        e.currentTarget.src = placeholderImage
                        e.currentTarget.style.objectFit = 'contain'
                      }}
                    />
                  </Box>
                  <Box sx={{ height: '545', width: '535' }}>
                    {issuerValue && (
                      <Typography sx={{ fontSize: '16px', fontWeight: '600', wordWrap: 'break-word' }}>
                        Issuer:&ensp;{issuerValue}
                      </Typography>
                    )}
                    {subjectValue && (
                      <Box sx={{ width: '350px', display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', wordWrap: 'break-word' }}>
                          Subject:
                        </Typography>
                        <Typography sx={{ fontSize: '16px', wordWrap: 'break-word' }}>{subjectValue}</Typography>
                      </Box>
                    )}
                    {aspectValue && (
                      <Box sx={{ width: '350px', display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', wordWrap: 'break-word' }}>
                          Aspect:
                        </Typography>
                        <Typography sx={{ fontSize: '16px', wordWrap: 'break-word' }}>{aspectValue}</Typography>
                      </Box>
                    )}
                    {confidenceValue !== null && (
                      <Box sx={{ width: '350px', display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', wordWrap: 'break-word' }}>
                          Confidence:
                        </Typography>
                        <Typography sx={{ fontSize: '16px', wordWrap: 'break-word' }}>{confidenceValue}</Typography>
                      </Box>
                    )}
                    {amtValue && (
                      <Box sx={{ width: '350px', display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', wordWrap: 'break-word' }}>
                          Amount:
                        </Typography>
                        <Typography sx={{ fontSize: '16px', wordWrap: 'break-word' }}>{amtValue}</Typography>
                      </Box>
                    )}
                    {effectiveDateValue && (
                      <Box sx={{ width: '350px', display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', wordWrap: 'break-word' }}>
                          Date:
                        </Typography>
                        <Typography sx={{ fontSize: '16px', wordWrap: 'break-word' }}>{effectiveDateValue}</Typography>
                      </Box>
                    )}
                    {howKnownValue && (
                      <Box sx={{ width: '350px', display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: '600', wordWrap: 'break-word' }}>
                          How Known:
                        </Typography>
                        <Typography sx={{ fontSize: '16px', wordWrap: 'break-word' }}>{howKnownValue}</Typography>
                      </Box>
                    )}
                    {statementValue && (
                      <Typography variant='body2'>
                        <Typography
                          variant='inherit'
                          component='span'
                          sx={{
                            padding: '5px 1 1 5px',
                            wordBreak: 'break-word',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: theme.palette.texts
                          }}
                        >
                          Statement:
                          <Typography sx={{ fontSize: '16px', wordWrap: 'break-word' }}>
                            <Typography
                              variant='inherit'
                              component='span'
                              sx={{
                                padding: '5px 1 1 5px',
                                wordBreak: 'break-word',
                                fontSize: '16px',
                                fontWeight: 500,
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
                <Typography sx={{ fontSize: '20px', fontWeight: '700' }}>
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
                    <Typography
                      sx={{
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
                      How Known
                    </Typography>
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
                            fontWeight: '600'
                          }
                        }
                      }}
                    >
                      <Select
                        sx={{
                          '& .MuiSelect-icon': {
                            color: '#0A1C1D'
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none'
                          },
                          '& .MuiInputBase-input': {
                            color: theme.palette.texts,
                            fontWeight: '500'
                          }
                        }}
                      >
                        {inputOptions.howKnown.map((howKnownText: string, index: number) => (
                          <MenuItem
                            key={howKnownText}
                            value={howKnownMapping[howKnownText]}
                            sx={{
                              backgroundColor: theme.palette.input,
                              color: theme.palette.texts,
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
                                fontWeight: '500'
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
                            <Box sx={{ flexGrow: 1 }}>{howKnownText}</Box>
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
                    </FormControl>
                    <Typography
                      sx={{
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
                      Effective Date
                    </Typography>
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
                                      fontWeight: '500'
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
                        fontSize: '16px',
                        fontWeight: '500',
                        p: '5px'
                      }}
                    >
                      Explain here
                    </Typography>
                    <TextField
                      multiline
                      rows={4}
                      sx={{
                        width: '100%',
                        hight: '179px',
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
                            fontWeight: '500'
                          }
                        }
                      }}
                      margin='normal'
                    />
                    <Typography
                      sx={{
                        fontSize: '16',
                        fontWeight: '500',
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
                  fontWeight: '600',
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
