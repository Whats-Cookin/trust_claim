import React, { useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown'
import DialogTitle from '@mui/material/DialogTitle'
import { Accordion, AccordionDetails, AccordionSummary, Slider, Typography, Collapse } from '@mui/material'
import { Box } from '@mui/system'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Dropdown from '../Dropdown'
import { PublishClaim } from '../../composedb/compose'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import IHomeProps from '../../containers/Form/types'

const FormDialog = ({ open, setOpen, toggleSnackbar, setSnackbarMessage, setLoading }: IHomeProps) => {
  const [subject, setSubject] = useState('')
  const [claim, setClaim] = useState('')
  const [object, setObject] = useState('')
  const [statement, setStatement] = useState('')
  const [aspect, setAspect] = useState('')
  const [howKnown, setHowKnow] = useState('')
  const [sourceURI, setSourceURI] = useState('')
  const [effectiveDate, setEffectiveDate] = useState(new Date())
  const [confidence, setConfidence] = useState(0.0)
  const [stars, setStars] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const handleClose = () => {
    setOpen(false)
    setExpanded(false)
  }
  const navigate = useNavigate()

  const handleSubmission = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    if (subject && claim) {
      try {
        const effectiveDateAsString = effectiveDate.toISOString()
        const confidenceAsNumber = Number(confidence)
        const starsAsNumber = Number(stars)

        const payload = {
          subject,
          claim,
          object,
          statement,
          aspect,
          howKnown,
          sourceURI,
          effectiveDate: effectiveDateAsString,
          confidence: confidenceAsNumber,
          stars: starsAsNumber
        }
        console.log(payload)

        setLoading(true)

        const did = localStorage.getItem('did')
        const ethAddress = localStorage.getItem('ethAddress')

        let res
        if (did && ethAddress) {
          res = await PublishClaim(payload)
        } else {
          // if user is not auththicatesd with Metamask and/or do not have a did
          res = await axios.post(`/api/claim`, payload)
        }

        if (res.status === 201) {
          setLoading(false)
          toggleSnackbar(true)
          setSnackbarMessage('Claim submitted successfully!')
          setSubject('')
          setClaim('')
          setObject('')
          setStatement('')
          setAspect('')
          setHowKnow('')
          setSourceURI('')
          setEffectiveDate(new Date())
          setConfidence(1)
          setStars(0)
        } else {
          setLoading(false)
          toggleSnackbar(true)
          setSnackbarMessage('Something went wrong!')
        }
      } catch (err: any) {
        setLoading(false)
        toggleSnackbar(true)
        setSnackbarMessage(err.response.data.message)
        console.error('err', err.response.data.message)
      }
    } else {
      setLoading(false)
      toggleSnackbar(true)
      setSnackbarMessage('Subject and Claims are required fields.')
    }
  }
  const inputFieldLabelArr = [
    {
      label: 'Subject',
      value: subject,
      setter: setSubject,
      type: 'text',
      fieldType: 'inputField'
    },

    {
      label: 'Object',
      value: object,
      setter: setObject,
      type: 'text',
      fieldType: 'inputField'
    },

    {
      label: 'Source URI',
      value: sourceURI,
      setter: setSourceURI,
      type: 'text',
      fieldType: 'inputField'
    }
  ]
  const inputFieldLabelArrAdvanced = [
    {
      label: 'Claim',
      value: claim,
      setter: setClaim,
      type: 'text',
      fieldType: 'dropdown',
      options: ['rated', 'same_as', 'performed', 'helped', 'harmed', 'scam', 'owns', 'related_to']
    },
    {
      label: 'Aspect',
      value: aspect,
      setter: setAspect,
      type: 'text',
      fieldType: 'dropdown',
      options: [
        'impact:social',
        'impact:climate',
        'impact:work',
        'impact:financial',
        'impact:educational',
        'quality:technical',
        'quality:asthetic',
        'quality:taste',
        'quality:journalistic',
        'quality:academic',
        'quality:fun',
        'quality:usefulness',
        'quality:literary',
        'quality:relevance',
        'quality:self-improvment',
        'quality:historical',
        'quality:theological',
        'quality:adventure',
        'quality:biographical',
        'quality:scientific',
        'risk:scam',
        'risk:justice',
        'risk:safety',
        'risk:reliability',
        'relationship:works-for',
        'relationship:same-as'
      ]
    },
    {
      label: 'How Known',
      value: howKnown,
      setter: setHowKnow,
      type: 'text',
      fieldType: 'dropdown',
      options: [
        'first_hand',
        'second_hand',
        'website',
        'verified_website',
        'verified_login',
        'signed_claim',
        'blockchain',
        'physical_document',
        'integration'
      ]
    },
    {
      label: 'Statement',
      value: statement,
      setter: setStatement,
      type: 'text',
      fieldType: 'inputField'
    },
    {
      label: 'Confidence',
      value: confidence,
      setter: setConfidence,
      type: 'number',
      min: 0.0,
      max: 1.0,
      fieldType: 'inputField',
      step: 0.01
    }
  ]

  if (!open) {
    return null
  }

  const handleAccordionChange = () => {
    setExpanded(!expanded)
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          <Typography
            variant='h4'
            sx={{
              mb: 3,
              textAlign: 'center',
              fontSize: '20px',
              color: '#80B8BD',
              textTransform: 'uppercase',
              fontWeight: 'bold'
            }}
          >
            Enter a Claim
          </Typography>
        </DialogTitle>
        <DialogContent>
          <>
            <form style={{ zIndex: 20 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  maxWidth: 600,
                  rowGap: 3,
                  mb: 4
                }}
              >
                {inputFieldLabelArr.map(({ label, value, setter, type }, i) => (
                  <TextField
                    key={i}
                    value={value}
                    fullWidth
                    margin='normal'
                    label={label}
                    type={type}
                    onChange={event => setter(event.target.value)}
                  />
                ))}
              </Box>
            </form>
          </>
          <Accordion expanded={expanded} onChange={handleAccordionChange}>
            {expanded ? null : (
              <AccordionSummary expandIcon={<ExpandCircleDownIcon />}>
                <Typography
                  variant='h4'
                  sx={{
                    textAlign: 'center',
                    fontSize: '20px',
                    color: '#80B8BD',
                    textTransform: 'uppercase',
                    fontWeight: 'bold'
                  }}
                >
                  Advanced
                </Typography>
              </AccordionSummary>
            )}
            <Collapse in={expanded} timeout='auto'>
              <AccordionDetails>
                <Typography
                  variant='h4'
                  sx={{
                    pl: '0.5em',
                    fontSize: '20px',
                    color: '#80B8BD',
                    fontWeight: 'bold'
                  }}
                >
                  Advanced
                </Typography>
                <form>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      maxWidth: 600,
                      rowGap: 3,
                      mb: 4
                    }}
                  >
                    {inputFieldLabelArrAdvanced.map(
                      ({ label, value, setter, options, type, fieldType, ...rest }: any, i) =>
                        fieldType === 'inputField' ? (
                          <TextField
                            value={value}
                            sx={{ ml: 1, mr: 1, width: '22ch' }}
                            margin='dense'
                            variant='outlined'
                            fullWidth
                            label={label}
                            key={i}
                            onChange={(event: any) => setter(event.currentTarget.value)}
                            type={type}
                            inputProps={{ ...rest }}
                          />
                        ) : (
                          <Dropdown
                            key={i}
                            label={label}
                            value={value}
                            setter={setter}
                            options={options}
                            variant='outlined'
                            sx={{ ml: 1, mr: 1, mb: 0.5, mt: 1, width: '22ch' }}
                          />
                        )
                    )}
                    {claim === 'rated' && aspect.includes('quality:') ? (
                      <Box>
                        <Box display='flex'>
                          <Typography variant='body2'>Review Rating "Stars"</Typography>
                          <Slider
                            getAriaLabel={() => 'Review rating (stars)'}
                            value={stars}
                            onChange={(_: Event, stars: number | number[]): void => setStars(Number(stars))}
                            min={0}
                            max={5}
                            valueLabelDisplay='auto'
                          />
                        </Box>
                        <Typography variant='body2'>{stars}</Typography>
                      </Box>
                    ) : (
                      <TextField
                        value={stars}
                        fullWidth
                        label='Review Rating (stars)'
                        variant='filled'
                        sx={{ ml: 1, mr: 1, width: '22ch' }}
                        onChange={(event: any) => setStars(event.currentTarget.value)}
                        type='number'
                      />
                    )}
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label='Effective Date'
                        value={effectiveDate}
                        onChange={(newValue: any) => setEffectiveDate(newValue)}
                        renderInput={(params: any) => (
                          <TextField {...params} sx={{ ml: 1, mr: 1, width: '100%' }} variant='filled' />
                        )}
                      />
                    </LocalizationProvider>
                  </Box>
                </form>
              </AccordionDetails>
            </Collapse>
          </Accordion>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', columnGap: 3 }}>
          <Button
            onClick={async (event: any) => await handleSubmission(event)}
            variant='contained'
            size='large'
            sx={{
              ml: 1,
              mr: 1,
              width: '50%',
              backgroundColor: '#80B8BD',
              '&:hover': {
                backgroundColor: '#80B8BD'
              }
            }}
          >
            Submit
          </Button>
          <Button onClick={handleClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
export default FormDialog
