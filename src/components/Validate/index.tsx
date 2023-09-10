import Box from '@mui/material/Box'
import { useNavigate } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import { TextField, Button, MenuItem, FormControl, InputLabel, OutlinedInput, InputAdornment } from '@mui/material'
import IHomeProps from '../../containers/Form/types'
import { useForm } from 'react-hook-form'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import Tooltip from '@mui/material/Tooltip'
import { useQueryParams } from '../../hooks'
import Dialog from '@mui/material/Dialog'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import Loader from '../Loader'
import DialogContentText from '@mui/material/DialogContentText'
import React, { useEffect, useState } from 'react'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import axios from '../../axiosInstance'
import BackgroundImages from '../../containers/BackgroundImags'

// TODO make these shared in settings across app

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
  const howknown = (queryParams.get('how_known') || '').replace(/_/g, ' ') || 'FIRST_HAND'
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
        var res = await axios.get(`/api/claim/${number}`)
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

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
    setValue
  } = useForm({
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

  return (
    <>
      <Loader open={loading} />
      <BackgroundImages />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          rowGap: 2,
          width: '100%',
          padding: '2rem',
          maxWidth: '830px',
          marginTop: { xs: 15, md: 8 },
          background: '#FFFFFF',
          boxShadow: '0px 1px 20px rgba(0, 0, 0, 0.25)',
          zIndex: 20,
          borderRadius: '10px',
          margin: '0'
        }}
      >
        <Box sx={{}}>
          <Typography
            variant='h4'
            sx={{
              textAlign: 'center',
              fontSize: '20px',
              color: 'primary.main',
              fontWeight: 'bold'
            }}
          >
            {`Welcome!  We value your input, thank you for helping keep it real`}
          </Typography>
        </Box>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'row', borderTop: '3px solid #009688' }}>
          <Box sx={{ width: '50%', borderRight: '3px solid #009688' }}>
            <Typography
              variant='h4'
              sx={{
                textAlign: 'center',
                fontSize: '20px',
                color: 'primary.main',
                fontWeight: 'bold',
                mb: '20px',
                mt: '20px'
              }}
            >
              {`We have a claim that`}
            </Typography>
            <Box
              sx={{
                width: '100%',
                color: 'primary.main',
                fontSize: '20px',
                fontWeight: 'bold',
                '& > *': { margin: '12px 0' }
              }}
            >
              <Typography variant='h5' style={{ fontWeight: 'bold', color: '#003747' }}>{`${subjectValue}`}</Typography>
              <Typography variant='h5' style={{ color: '#065465' }}>{`${claimVerbValue}`}</Typography>
              {statementValue && (
                <Box sx={{ display: 'flex', margin: '0' }}>
                  <Typography
                    variant='h5'
                    borderColor='primary.main'
                    sx={{
                      p: '6px 8px 0',
                      color: 'black',
                      borderRadius: 1,
                      border: 1,
                      fontSize: '11pt',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: expanded ? 'unset' : 10,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {statementValue}
                  </Typography>
                  <Box onClick={toggleExpansion} sx={{ cursor: 'pointer', display: 'flex', alignItems: 'start' }}>
                    {expanded ? (
                      <>
                        <ExpandLessIcon />
                      </>
                    ) : (
                      <Box style={{ display: 'flex', alignItems: 'center' }}>
                        <ExpandMoreIcon />
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
              {objectValue && <Typography variant='h5'>{`to: ${objectValue}`}</Typography>}
              {amtValue && <Typography variant='h5' style={{ color: '#065465' }}>{`worth: ${amtValue}`}</Typography>}
              {effectiveDateValue && (
                <Typography style={{ color: '#065465' }}>{`as of: ${effectiveDateValue}`}</Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ width: '50%', rowGap: 1, m: 1 }}>
            <Typography
              sx={{
                textAlign: 'center',
                fontSize: '20px',
                color: 'primary.main',
                fontWeight: 'bold',
                mt: '10px'
              }}
            >
              Do you know anything about this?
            </Typography>
            <Box sx={{ width: '95%', mb: '10px', mt: '20px' }}>
              <Tooltip title='How do you know about it?' placement='right' arrow>
                <TextField
                  select
                  label='How known'
                  {...register('howKnown')}
                  margin='dense'
                  variant='outlined'
                  fullWidth
                  defaultValue={FIRST_HAND}
                  onChange={handleHowKnownChange}
                >
                  {inputOptions.howKnown.map(howKnownItem => (
                    <MenuItem value={howKnownItem.value} key={howKnownItem.value}>
                      <Box sx={{ width: '100%', height: '100%' }}>{howKnownItem.text}</Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Tooltip>
              {(howknownInputValue === FIRST_HAND_BENEFIT || howknown === FIRST_HAND_BENEFIT) && (
                <FormControl {...register('amt')} fullWidth sx={{ mt: 1, width: '100%' }}>
                  <InputLabel htmlFor='outlined-adornment-amount'>Value</InputLabel>
                  <OutlinedInput
                    id='outlined-adornment-amount'
                    startAdornment={<InputAdornment position='start'>$</InputAdornment>}
                    label='Amount'
                  />
                </FormControl>
              )}
              {(howknownInputValue === WEB_DOCUMENT || howknown === WEB_DOCUMENT) && (
                <FormControl {...register('sourceURI')} fullWidth sx={{ mt: 1, width: '100%' }}>
                  <InputLabel htmlFor='outlined-adornment-amount'>Source</InputLabel>
                  <OutlinedInput id='outlined-adornment-amount' label='Source' />
                </FormControl>
              )}
            </Box>
            <Tooltip title='write more information here ' placement='right' arrow>
              <TextField
                {...register('statement')}
                placeholder={''}
                sx={{ mr: 1, width: '95%', mb: '20px' }}
                margin='dense'
                variant='outlined'
                fullWidth
                label='explain here'
                key='statement'
                type='text'
                multiline={true}
                rows={4}
              />
            </Tooltip>{' '}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='Effective Date'
                value={watchEffectiveDate}
                onChange={(newValue: any) => setValue('effectiveDate', newValue)}
                renderInput={(params: any) => <TextField {...params} sx={{ mr: 1, width: '95%' }} variant='filled' />}
              />
            </LocalizationProvider>
            <input type='hidden' value='first_hand' {...register('howKnown')} />
          </Box>
          <Dialog
            open={dialogOpen}
            onClose={() => {
              setDialogOpen(false)
              if (isFormSubmitted) {
                navigate('/feed')
              }
            }}
          >
            <DialogContentText sx={{ p: '30px' }}>Thank you for your submission!</DialogContentText>
          </Dialog>
        </form>

        <Button
          onClick={onSubmit}
          type='submit'
          variant='contained'
          size='large'
          sx={{
            ml: 1,
            mr: 1,
            width: '50%',
            bgcolor: 'praimary.main',
            margin: '0 auto',
            '&:hover': {
              backgroundColor: '#00695f'
            }
          }}
        >
          Submit
        </Button>
      </Box>
    </>
  )
}

export default Validate
