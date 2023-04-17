import React from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { TextField, Button, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import IHomeProps from './types'
import styles from './styles'
import polygon1 from '../../assets/circle.png'
import polygon2 from '../../assets/Polygon 2.png'
import polygon3 from '../../assets/Polygon 3.png'
import { useForm } from 'react-hook-form'
import { useCreateClaim } from '../../hooks/useCreateClaim'

const Form = ({ toggleSnackbar, setSnackbarMessage, setLoading }: IHomeProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue
  } = useForm({
    defaultValues: {
      subject: '',
      claim: '',
      object: '',
      statement: '',
      aspect: '',
      howKnown: '',
      sourceURI: '',
      effectiveDate: new Date(),
      confidence: 0.0,
      stars: 0
    }
  })

  const { createClaim } = useCreateClaim()

  const onSubmit = handleSubmit(
    async ({ subject, claim, object, statement, aspect, howKnown, sourceURI, effectiveDate, confidence, stars }) => {
      if (subject && claim) {
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

        setLoading(true)

        const { message, isSuccess } = await createClaim(payload)

        setLoading(false)
        toggleSnackbar(true)
        setSnackbarMessage(message)
        if (isSuccess) {
          reset()
        }
      } else {
        setLoading(false)
        toggleSnackbar(true)
        setSnackbarMessage('Subject and Claims are required fields.')
      }
    }
  )

  const watchClaim = watch('claim')
  const watchAspect = watch('aspect')
  const watchEffectiveDate = watch('effectiveDate')
  const watchStars = watch('stars')

  const inputFieldLabelArr = [
    {
      label: 'Subject',
      name: 'subject',
      type: 'text',
      fieldType: 'inputField'
    },

    {
      label: 'Claim',
      name: 'claim',
      type: 'text',
      fieldType: 'dropdown',
      options: ['rated', 'same_as', 'performed', 'helped', 'harmed', 'scam', 'owns', 'related_to']
    },
    {
      label: 'Aspect',
      name: 'aspect',
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
      name: 'howKnown',
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
      label: 'Object',
      name: 'object',
      type: 'text',
      fieldType: 'inputField'
    },
    {
      label: 'Statement',
      name: 'statement',
      type: 'text',
      fieldType: 'inputField'
    },
    {
      label: 'Source URI',
      name: 'sourceURI',
      type: 'text',
      fieldType: 'inputField'
    },
    {
      label: 'Confidence',
      name: 'confidence',
      type: 'number',
      min: 0.0,
      max: 1.0,
      fieldType: 'inputField',
      step: 0.01
    }
  ]

  return (
    <>
      <img src={polygon1} alt='' style={{ position: 'absolute', top: '3%', left: '-10%' }} />
      <img
        src={polygon2}
        alt=''
        style={{
          position: 'absolute',
          top: '50%',
          right: '20%',
          transform: 'translateY(-50%)'
        }}
      />
      <img
        src={polygon3}
        alt=''
        style={{
          position: 'absolute',
          right: '20%',
          top: '5%',
          width: '200px'
        }}
      />

      <form onSubmit={onSubmit} style={{ zIndex: 20 }}>
        <Container sx={styles.formContainer}>
          <Typography variant='h4' sx={styles.formHeading}>
            Enter a Claim
          </Typography>
          <Box sx={styles.inputFieldWrap}>
            {inputFieldLabelArr.map(({ label, name, setter, options, type, fieldType, ...rest }: any, i) =>
              fieldType === 'inputField' ? (
                <TextField
                  {...register(name)}
                  sx={{ ml: 1, mr: 1, width: '22ch' }}
                  margin='dense'
                  variant='outlined'
                  fullWidth
                  label={label}
                  key={name}
                  type={type}
                  inputProps={{ ...rest }}
                />
              ) : (
                <Box sx={{ ml: 1, mr: 1, mb: 0.5, mt: 1, width: '22ch' }}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ ml: 2, mr: 2 }}>{label}</InputLabel>
                    <Select {...register(name)} label={label} variant='outlined'>
                      {options.map((option: string) => (
                        <MenuItem value={option} key={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )
            )}
            {watchClaim === 'rated' && watchAspect.includes('quality:') ? (
              <Box sx={styles.sliderField}>
                <Box display='flex' flexDirection='column'>
                  <Typography variant='body2'>Review Rating "Stars"</Typography>
                  <Slider
                    {...register('stars')}
                    getAriaLabel={() => 'Review rating (stars)'}
                    min={0}
                    max={5}
                    valueLabelDisplay='auto'
                  />
                </Box>
                <Typography variant='body2'>{watchStars}</Typography>
              </Box>
            ) : (
              <TextField
                {...register('stars')}
                fullWidth
                label='Review Rating (stars)'
                variant='filled'
                sx={{ ml: 1, mr: 1, width: '22ch' }}
                type='number'
              />
            )}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='Effective Date'
                value={watchEffectiveDate}
                onChange={(newValue: any) => setValue('effectiveDate', newValue)}
                renderInput={(params: any) => (
                  <TextField {...params} sx={{ ml: 1, mr: 1, width: '100%' }} variant='filled' />
                )}
              />
            </LocalizationProvider>
          </Box>
          <Box sx={styles.submitButtonWrap}>
            <Button
              type='submit'
              variant='contained'
              size='large'
              sx={{
                ml: 1,
                mr: 1,
                width: '100%',
                backgroundColor: '#80B8BD',
                '&:hover': {
                  backgroundColor: '#80B8BD'
                }
              }}
            >
              Submit
            </Button>
          </Box>
        </Container>
      </form>
    </>
  )
}

export default Form
