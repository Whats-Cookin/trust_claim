import React, { useEffect, useState } from 'react'
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
  Link as MuiLink
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import IHomeProps from '../../containers/Form/types'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import { useQueryParams } from '../../hooks'
import Loader from '../Loader'
import axios from '../../axiosInstance'
import { CloudUpload } from '@mui/icons-material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import placeholderImage from '../../assets/images/imgplaceholder.svg' // Import the placeholder image

const FIRST_HAND = 'FIRST_HAND'
const WEB_DOCUMENT = 'WEB_DOCUMENT'
const FIRST_HAND_BENEFIT = 'FIRST_HAND_BENEFIT'
const FIRST_HAND_REJECTED = 'FIRST_HAND_REJECTED'
const WEB_DOCUMENT_REJECTED = 'WEB_DOCUMENT_REJECTED'

const CLAIM_RATED = 'rated'
const CLAIM_IMPACT = 'impact'

const Validate = ({ toggleSnackbar, setSnackbarMessage }: IHomeProps) => {
  const [loading, setLoading] = useState(false)
  const queryParams = useQueryParams()
  const [subjectValue, setSubjectValue] = useState('')
  const [statementValue, setStatementValue] = useState('')
  const [amtValue, setAmtValue] = useState('')
  const [effectiveDateValue, setEffectiveDateValue] = useState('')
  const [aspectValue, setAspectValue] = useState('')
  const [confidenceValue, setConfidenceValue] = useState<number | null>(null) // Initialize with null
  const [issuerValue, setIssuerValue] = useState('')
  const [sourceThumbnail, setSourceThumbnail] = useState('')
  const [howKnownValue, setHowKnownValue] = useState('')

  const subject = queryParams.get('subject')
  const howknown = (queryParams.get('how_known') ?? '').replace(/_/g, ' ') || 'FIRST_HAND'
  console.log('how known: ' + howknown)

  let number: string | undefined
  if (subject) {
    const parts = subject.split('/')
    number = parts[parts.length - 1]
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await axios.get(`/api/claim/${number}`)
        console.log(res.data)

        if (res.data.subject) setSubjectValue(res.data.subject)
        if (res.data.statement) setStatementValue(res.data.statement)
        if (res.data.amt) setAmtValue(res.data.amt)
        if (res.data.aspect) setAspectValue(res.data.aspect)
        if (res.data.confidence !== undefined) setConfidenceValue(res.data.confidence)
        if (res.data.source_name) setIssuerValue(res.data.source_name)
        if (res.data.source_thumbnail) setSourceThumbnail(res.data.source_thumbnail)
        if (res.data.howKnown) setHowKnownValue(res.data.howKnown)

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

  const { handleSubmit, reset, control } = useForm({
    defaultValues: {
      subject: subject as string,
      statement: '' as string,
      sourceURI: '' as string,
      amt: '' as string,
      howKnown: '' as string,
      effectiveDate: new Date()
    }
  })

  const { createClaim } = useCreateClaim()
  const navigate = useNavigate()

  const onSubmit = handleSubmit(async ({ subject, statement, howKnown, effectiveDate, amt, sourceURI }) => {
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
      }

      const payload: PayloadType = {
        subject,
        statement,
        sourceURI,
        howKnown,
        effectiveDate: effectiveDateAsString,
        claim: CLAIM_RATED
      }

      // some how known settings have implications for other fields
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

      const { message, isSuccess } = await createClaim(payload) // Change this line

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

  const isStatementLong = statementValue.length > 400
  const [isExpanded, setIsExpanded] = useState(false)

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      <Loader open={loading} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          mt: '5vh',
          width: isMediumScreen ? '97%' : '95%',
          backgroundColor: theme.palette.menuBackground,
          borderRadius: '20px',
          padding: '35px',
          height: isMediumScreen ? 'auto' : '1097px'
        }}
      >
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: isMediumScreen ? 'column' : 'row' }}>
          <Box sx={{ width: '100%', p: 2 }}>
            <Typography
              sx={{
                fontFamily: 'Montserrat',
                fontSize: '23px',
                fontWeight: '800',
                width: '242px',
                height: '28px'
              }}
            >
              {`There’s a claim that`}
              <Box
                sx={{
                  height: '4px',
                  backgroundColor: theme.palette.maintext,
                  marginTop: '4px',
                  borderRadius: '2px',
                  width: '70%'
                }}
              />
            </Typography>
            <Box
              sx={{ display: 'flex', flexDirection: isMediumScreen ? 'column' : 'row', justifyContent: 'space-around' }}
            >
              <Box
                sx={{
                  width: isMediumScreen ? '95%' : '47.5%',
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
                  <Box sx={{ height: '544', width: '536' }}>
                    {issuerValue && (
                      <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>Issuer: {issuerValue}</Typography>
                    )}
                    {subjectValue && (
                      <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>Subject: {subjectValue}</Typography>
                    )}
                    {aspectValue && (
                      <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>Aspect: {aspectValue}</Typography>
                    )}
                    {confidenceValue !== null && (
                      <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                        Confidence: {confidenceValue}
                      </Typography>
                    )}
                    {amtValue && (
                      <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>Amount of claim: {amtValue}</Typography>
                    )}
                    {effectiveDateValue && (
                      <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>Date: {effectiveDateValue}</Typography>
                    )}
                    {howKnownValue && (
                      <Typography sx={{ fontSize: '20px', fontWeight: 'bold' }}>How Known: {howKnownValue}</Typography>
                    )}
                    {statementValue && (
                      <Typography variant='body1'>
                        <Typography
                          variant='inherit'
                          component='span'
                          sx={{
                            padding: '5px 1 1 5px',
                            wordBreak: 'break-word',
                            marginBottom: '1px',
                            color: theme.palette.texts
                          }}
                        >
                          {isExpanded || !isStatementLong ? statementValue : truncateText(statementValue, 500)}
                          {isStatementLong && (
                            <MuiLink
                              onClick={handleToggleExpand}
                              sx={{ cursor: 'pointer', marginLeft: '5px', color: theme.palette.link }}
                            >
                              {isExpanded ? 'Show Less' : 'See More'}
                            </MuiLink>
                          )}
                        </Typography>
                      </Typography>
                    )}
                  </Box>
                </Card>
              </Box>

              <Box
                sx={{
                  width: isMediumScreen ? '95%' : '47.5%',
                  height: 'auto',
                  minHeight: isMediumScreen ? 'auto' : '870px',
                  borderRadius: '20px',
                  mt: isMediumScreen ? 2 : 0,
                  p: 2,
                  backgroundColor: theme.palette.cardBackground
                }}
              >
                <Card
                  sx={{
                    backgroundColor: theme.palette.cardBackground,
                    padding: '30px',
                    width: '100%',
                    height: 'auto',
                    borderRadius: '20px'
                  }}
                >
                  <Box sx={{ height: '544', width: '100%' }}>
                    <Typography
                      sx={{
                        fontFamily: 'Montserrat',
                        fontSize: '23px',
                        fontWeight: '800'
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
                          }
                        }}
                      >
                        <MenuItem value='option1'>First Hand</MenuItem>
                        <MenuItem value='option2'>Second Hand</MenuItem>
                        <MenuItem value='option3'>Website</MenuItem>
                        <MenuItem value='option4'>Physical Document</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography
                      sx={{
                        fontFamily: 'Montserrat',
                        fontSize: '23px',
                        fontWeight: '800'
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
                                      color: 'transparent'
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
                        fontFamily: 'Montserrat',
                        fontSize: '23px',
                        fontWeight: '800',

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
                          }
                        }
                      }}
                      margin='normal'
                    />{' '}
                    <Typography
                      sx={{
                        fontFamily: 'Montserrat',
                        fontSize: '23px',
                        fontWeight: '800',
                        margin: '10px'
                      }}
                    >
                      Upload image
                    </Typography>
                    <Box
                      sx={{
                        border: `5px dashed ${theme.palette.input}`,
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        height: '304px',
                        width: '99%',
                        cursor: 'pointer'
                      }}
                    >
                      <IconButton component='label' sx={{ mt: 2 }}>
                        <CloudUpload sx={{ color: theme.palette.input, fontSize: '4.2rem' }} />
                        <input type='file' hidden />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              </Box>
            </Box>
          </Box>
        </form>

        <Box sx={{ display: 'flex', justifyContent: 'center', p: '4' }}>
          <Button
            onClick={onSubmit}
            variant='contained'
            size='large'
            sx={{
              mt: 4,
              height: '8%',
              margin: '46px auto',
              minHeight: '50px',
              maxHeight: '63px',
              width: '15%',
              minWidth: '100px',
              maxWidth: '229px',
              color: theme.palette.buttontext,
              borderRadius: '30px',
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
    </>
  )
}

export default Validate
