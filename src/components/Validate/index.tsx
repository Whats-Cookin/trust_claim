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
  CardMedia,
  Select,
  TextField,
  useMediaQuery,
  IconButton
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
import MobileIndex from './MobileIndex'

const FIRST_HAND = 'FIRST_HAND'
const WEB_DOCUMENT = 'WEB_DOCUMENT'
const FIRST_HAND_BENEFIT = 'FIRST_HAND_BENEFIT'
const FIRST_HAND_REJECTED = 'FIRST_HAND_REJECTED'
const WEB_DOCUMENT_REJECTED = 'WEB_DOCUMENT_REJECTED'

const CLAIM_RATED = 'rated'
const CLAIM_IMPACT = 'impact'

const Validate = ({ toggleSnackbar, setSnackbarMessage }: IHomeProps) => {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const queryParams = useQueryParams()
  const [subjectValue, setSubjectValue] = useState('')
  const [claimVerbValue, setClaimVerbValue] = useState('')
  const [statementValue, setStatementValue] = useState('')
  const [objectValue, setObjectValue] = useState('')
  const [amtValue, setAmtValue] = useState('')
  const [effectiveDateValue, setEffectiveDateValue] = useState('')
  const [howknownInputValue, setHowknownInputValue] = useState('')

  const subject = queryParams.get('subject')
  const howknown = (queryParams.get('how_known') ?? '').replace(/_/g, ' ') || 'FIRST_HAND'
  console.log('how known: ' + howknown)
  const toggleExpansion = () => {
    setExpanded(!expanded)
  }

  const handleHowKnownChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = event.target.value
    setHowknownInputValue(selectedValue)
  }

  if (subject) {
    const parts = subject.split('/')
    var number = parts[parts.length - 1] || undefined
  }

  useEffect(() => {
    interface ClaimDict {
      [key: string]: string
    }

    const claimDict: ClaimDict = {
      rated: 'was reviewed as follows',
      helped: 'created a positive impact',
      impact: 'created a positive impact'
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        let res = await axios.get(`/api/claim/${number}`)
        console.log(res.data)
        setSubjectValue(res.data.subject)
        setClaimVerbValue(claimDict[res.data.claim] || res.data.claim)
        setStatementValue(res.data.statement)
        setObjectValue(res.data.object)
        setAmtValue(res.data.amt)
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

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)

  const { register, handleSubmit, reset, watch, setValue, control } = useForm({
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
        setDialogOpen(true)
        setIsFormSubmitted(true)
        setTimeout(() => {
          setDialogOpen(false)
          navigate('/feed')
        }, 3000)
        reset()
      } else {
        setLoading(false)
        toggleSnackbar(true)
        setSnackbarMessage('Subject and Claims are required fields.')
      }
    }
  })

  const watchEffectiveDate = watch('effectiveDate')

  const inputOptions = {
    howKnown: [
      { value: FIRST_HAND, text: 'validate first hand' },
      { value: WEB_DOCUMENT, text: 'validate from source' },

      // these are not valid to return to server, will be modified in handler
      { value: FIRST_HAND_BENEFIT, text: 'received direct benefit' },
      { value: FIRST_HAND_REJECTED, text: 'reject first hand' },
      { value: WEB_DOCUMENT_REJECTED, text: 'reject from source' }
    ]
  }

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [isDarkMode, setIsDarkMode] = useState(false)

  if (isMobile) {
    function toggleTheme(): void {
      throw new Error('Function not implemented.')
    }

    return (
      <MobileIndex
        toggleSnackbar={toggleSnackbar}
        setSnackbarMessage={setSnackbarMessage}
        setLoading={setLoading}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />
    )
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
          width: '95%',
          backgroundColor: theme.palette.menuBackground,
          borderRadius: '20px',
          padding: '35px',
          height: '1097px'
        }}
      >
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'row' }}>
          <Box sx={{ width: '50%', p: 2 }}>
            <Typography
              sx={{
                fontFamily: 'Montserrat',
                fontSize: '23px',
                fontWeight: '800',
                width: '242px',
                height: '28px',
                maxWidth: '1000px'
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
            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
              <Box
                sx={{
                  width: '95%',
                  height: '1097',
                  top: '210px',
                  left: '212px',
                  borderRadius: '50px',
                  backgroundColor: 'theme.palette.cardBackground',
                  marginTop: ' 0vh'
                }}
              >
                <Card
                  sx={{
                    backgroundColor: theme.palette.cardBackground,
                    padding: '30px',
                    width: '45%',
                    height: '870px',
                    borderRadius: '20px',
                    position: 'absolute',
                    top: '134px'
                  }}
                >
                  {' '}
                  <Box
                    sx={{
                      border: '2px ',
                      borderRadius: '8px',
                      height: '328px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#425655',
                      p: '3',
                      marginBottom: '45px'
                    }}
                  >
                    <CardMedia component='img' image='/' />
                    {/* <CloudUpload sx={{ color: '#fff', fontSize: '3rem' }} /> */}
                  </Box>
                  <Box sx={{ height: '544', width: '536' }}>
                    <Typography sx={{ fontSize: '20px' }}>
                      <strong>Issuer:</strong>
                    </Typography>
                    <Typography sx={{ fontSize: '20px' }}>
                      <strong>Subject:</strong>
                      {subjectValue}
                    </Typography>
                    <Typography sx={{ fontSize: '20px' }}>
                      <strong>Aspect:</strong> impact
                    </Typography>
                    <Typography sx={{ fontSize: '20px' }}>
                      <strong>Confidence:</strong> 0.9
                    </Typography>
                    <Typography sx={{ fontSize: '20px' }}>
                      <strong>Amount of claim:</strong> 50 $
                    </Typography>
                    <Typography sx={{ fontSize: '20px' }}>
                      <strong>Date:</strong> {effectiveDateValue}
                    </Typography>
                    <Typography sx={{ fontSize: '18px' }}>
                      <strong>Statement : </strong>
                      {statementValue}

                      <a href='./' style={{ color: theme.palette.buttons }}>
                        ...View more
                      </a>
                    </Typography>
                  </Box>
                </Card>
              </Box>

              <Box
                sx={{
                  width: '45%',
                  height: '872px',
                  top: '210px',
                  left: '212px',
                  borderRadius: '20px'
                }}
              ></Box>
            </Box>
          </Box>
          <Box sx={{ width: '50%', p: 2 }}>
            <Typography
              sx={{
                fontFamily: 'Montserrat',
                fontSize: '23px',
                fontWeight: '800',
                textAlign: 'left'
              }}
            >
              {`Do you know anything about that?`}
              <Box
                sx={{
                  height: '4px',
                  backgroundColor: theme.palette.maintext,
                  marginTop: '4px',
                  borderRadius: '2px',
                  width: '60%'
                }}
              />
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
              <Box
                sx={{
                  width: '95%',
                  height: '1097',
                  top: '210px',
                  left: '212px',
                  borderRadius: '50px',
                  backgroundColor: 'theme.palette.cardBackground',
                  marginTop: ' 0vh'
                }}
              >
                <Card
                  sx={{
                    backgroundColor: theme.palette.cardBackground,
                    padding: '30px',
                    width: '45%',
                    height: '870px',
                    borderRadius: '20px',
                    position: 'absolute',
                    top: '134px'
                  }}
                >
                  {' '}
                  <Box sx={{ height: '544', width: '536' }}>
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
                            borderColor: 'transparent' // Remove border
                          },
                          '&:hover fieldset': {
                            borderColor: 'transparent' // Transparent on hover
                          }
                        }
                      }}
                    >
                      <Select
                        sx={{
                          '& .MuiSelect-icon': {
                            color: '#0A1C1D' // Change dropdown icon color to red
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none' // Remove border
                          }
                        }}
                      >
                        <MenuItem value='option1'>First Hand 1</MenuItem>
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
                        // width: '242px',
                        // height: '28px'
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
                                        borderColor: 'transparent' // Make the border transparent
                                      },
                                      '&:hover fieldset': {
                                        borderColor: 'transparent' // Transparent on hover
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: 'transparent' // Transparent when focused
                                      }
                                    },
                                    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                                      color: '#0A1C1D' // Change icon color
                                    },
                                    '& .MuiInputBase-input': {
                                      color: 'transparent' // Make text inside input transparent
                                    }
                                  }}
                                  margin='normal'
                                  InputProps={{
                                    ...params.InputProps,
                                    sx: {
                                      '&:before': {
                                        borderBottom: 'none' // Remove the bottom border
                                      },
                                      '&:hover:not(.Mui-disabled):before': {
                                        borderBottom: 'none' // No border on hover
                                      },
                                      '&.Mui-focused:after': {
                                        borderBottom: 'none' // No border when focused
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
                        // width: '242px',
                        // height: '28px'
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
                        border: `5px dashed ${theme.palette.input}`, // استخدام علامات الاقتباس الصحيحة
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

              <Box
                sx={{
                  width: '45%',
                  height: '872px',
                  top: '210px',
                  left: '212px',
                  borderRadius: '20px'
                }}
              ></Box>
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
