import React from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import {
  TextField,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import IHomeProps from '../../containers/Form/types'
import styles from '../../containers/Form/styles'
import { useForm } from 'react-hook-form'
import { useCreateClaim } from '../../hooks/useCreateClaim'

export const Form = ({
  toggleSnackbar,
  setSnackbarMessage,
  setLoading,
  simple,
  onCancel
}: IHomeProps & { simple: boolean; onCancel?: () => void }) => {
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

  const [isSimple, setIsSimple] = React.useState(simple)

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
      name: 'claim',
      options: ['rated', 'same_as', 'performed', 'helped', 'harmed', 'scam', 'owns', 'related_to']
    },
    {
      name: 'aspect',
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
      name: 'howKnown',
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
    }
  ]

  const simpleList = ['subject', 'claim', 'object', 'sourceURI']

  return (
    <>
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
        <form onSubmit={onSubmit}>
          <Box sx={styles.inputFieldWrap}>
            <TextField
              {...register('subject', { required: { value: true, message: 'subject is required' } })}
              sx={{ ml: 1, mr: 1, width: '22ch' }}
              margin='dense'
              variant='outlined'
              fullWidth
              label='Subject'
              key='subject'
              type='text'
              error={Boolean(errors.subject)}
              helperText={errors.subject?.message}
            />
            <TextField
              select
              label='Claim'
              {...register('claim', { required: { value: true, message: 'claim is required' } })}
              sx={{ ml: 1, mr: 1, width: '22ch' }}
              margin='dense'
              variant='outlined'
              fullWidth
              error={Boolean(errors.claim)}
              helperText={errors.claim?.message}
            >
              {inputFieldLabelArr
                .filter(input => input.name === 'claim')
                .map(option =>
                  option.options?.map((i: string) => (
                    <MenuItem value={i} key={i}>
                      {i}
                    </MenuItem>
                  ))
                )}
            </TextField>
            <TextField
              select
              label='Aspect'
              {...register('aspect')}
              sx={{ ml: 1, mr: 1, width: '22ch' }}
              margin='dense'
              variant='outlined'
              fullWidth
            >
              {inputFieldLabelArr
                .filter(input => input.name === 'aspect')
                .map(option =>
                  option.options?.map((i: string) => (
                    <MenuItem value={i} key={i}>
                      {i}
                    </MenuItem>
                  ))
                )}
            </TextField>
            <TextField
              select
              label='How Known'
              {...register('howKnown')}
              sx={{ ml: 1, mr: 1, width: '22ch' }}
              margin='dense'
              variant='outlined'
              fullWidth
            >
              {inputFieldLabelArr
                .filter(input => input.name === 'howKnown')
                .map(option =>
                  option.options?.map((i: string) => (
                    <MenuItem value={i} key={i}>
                      {i}
                    </MenuItem>
                  ))
                )}
            </TextField>
            <TextField
              {...register('object')}
              sx={{ ml: 1, mr: 1, width: '22ch' }}
              margin='dense'
              variant='outlined'
              fullWidth
              label='Object'
              key='object'
              type='text'
            />
            <TextField
              {...register('statement')}
              sx={{ ml: 1, mr: 1, width: '22ch' }}
              margin='dense'
              variant='outlined'
              fullWidth
              label='Statement'
              key='statement'
              type='text'
            />
            <TextField
              {...register('sourceURI')}
              sx={{ ml: 1, mr: 1, width: '22ch' }}
              margin='dense'
              variant='outlined'
              fullWidth
              label='Source URI'
              key='sourceURI'
              type='text'
            />
            <TextField
              {...register('confidence')}
              sx={{ ml: 1, mr: 1, width: '22ch' }}
              margin='dense'
              variant='outlined'
              fullWidth
              label='Confidence'
              key='confidence'
              type='number'
              inputProps={{
                min: 0.0,
                max: 1.0,
                step: 0.1
              }}
            />

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
          {isSimple && (
            <Box display='flex' justifyContent='center'>
              <Button onClick={() => setIsSimple(false)}>Advanced</Button>
            </Box>
          )}
        </form>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', columnGap: 3 }}>
        <Button
          onClick={onSubmit}
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
        {!!onCancel && <Button onClick={onCancel}>Cancel</Button>}
      </DialogActions>
    </>
  )
}
