import React, { useEffect } from 'react'
import Box from '@mui/material/Box'
import { useNavigate } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import {
  TextField,
  Button,
  FormControl,
  MenuItem,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  FormHelperText
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import IHomeProps from '../../containers/Form/types'
import styles from '../../containers/Form/styles'
import { Controller, useForm } from 'react-hook-form'
import { useCreateClaim } from '../../hooks/useCreateClaim'

export const Form = ({
  toggleSnackbar,
  setSnackbarMessage,
  setLoading,
  selectedClaim,
  onCancel
}: IHomeProps & { onCancel?: () => void; selectedClaim?: any }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    control
  } = useForm({
    defaultValues: {
      subject: (selectedClaim?.nodeUri as string) || null,
      claim: 'rated',
      object: null as string | null,
      statement: null as string | null,
      aspect: null as string | null,
      howKnown: null as string | null,
      sourceURI: null as string | null,
      effectiveDate: new Date(),
      confidence: null as number | null,
      stars: null as number | null
    }
  })

  const { createClaim } = useCreateClaim()
  const navigate = useNavigate()

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
          navigate('search')
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
  const watchEffectiveDate = watch('effectiveDate')

  useEffect(() => {
    if (watchClaim === 'rated') {
      setValue('object', null)
    } else {
      setValue('stars', null)
      setValue('aspect', null)
    }
  }, [watchClaim, setValue])

  const inputOptions = {
    claim:
      selectedClaim?.entType === 'CLAIM'
        ? ['agree', 'disagree']
        : ['rated', 'same_as', 'performed', 'helped', 'harmed', 'scam', 'owns', 'related_to'],
    aspect: [
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
    ],
    howKnown: [
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
          {selectedClaim
            ? selectedClaim?.entType === 'CLAIM'
              ? 'do you want to validate ?'
              : 'what do you have to say about'
            : 'Enter a Claim'}
        </Typography>
        {selectedClaim?.name && selectedClaim?.entType !== 'CLAIM' && <Typography>{selectedClaim.name}</Typography>}
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
              disabled={!!selectedClaim?.nodeUri}
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
              {inputOptions.claim.map((i: string) => (
                <MenuItem value={i} key={i}>
                  {i}
                </MenuItem>
              ))}
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
              {inputOptions.howKnown.map((i: string) => (
                <MenuItem value={i} key={i}>
                  {i}
                </MenuItem>
              ))}
            </TextField>
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
            {!(selectedClaim?.entType === 'CLAIM') && (
              <>
                {watchClaim === 'rated' ? (
                  <>
                    <TextField
                      select
                      label='Aspect'
                      {...register('aspect')}
                      sx={{ ml: 1, mr: 1, width: '22ch' }}
                      margin='dense'
                      variant='outlined'
                      fullWidth
                    >
                      {inputOptions.aspect.map((i: string) => (
                        <MenuItem value={i} key={i}>
                          {i}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Controller
                      name='stars'
                      control={control}
                      rules={{ required: { value: true, message: 'rating is required' } }}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <FormControl sx={{ ml: 1, mr: 1, width: '22ch' }} fullWidth error={!!error}>
                          <Typography>Review Rating</Typography>
                          <Rating
                            name='stars'
                            value={value}
                            onChange={(e, newValue) => onChange(newValue)}
                            precision={1}
                            size='large'
                          />
                          <FormHelperText>{error?.message}</FormHelperText>
                        </FormControl>
                      )}
                    />
                  </>
                ) : (
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
                )}
              </>
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
            width: '50%'
          }}
        >
          Submit
        </Button>
        {!!onCancel && <Button onClick={onCancel}>Cancel</Button>}
      </DialogActions>
    </>
  )
}
