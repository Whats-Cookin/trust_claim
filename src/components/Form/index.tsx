import {
  Box,
  Button,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import { PromiseTimeoutError, timeoutPromise } from '../../utils/promise.utils'
import MainContainer from '../MainContainer'
import MediaUploader, { MediaI } from './imageUploading'
import { HowKnown } from '../../enums'

const CLAIM_CATEGORIES = [
  'Scam',
  'Spam',
  'Misinformation',
  'Abuse',
  'Dangerous',
  'Social',
  'Climate',
  'Work',
  'Financial',
  'Educational',
  'Ownership',
  'Employment',
  'Collaboration',
  'Similarity'
]

interface FormData {
  stars: number | null
  amt: number | null
  confidence: number | null
  name: string
  subject: string
  statement: string
  sourceURI: string
  howKnown: HowKnown
  effectiveDate: Date
  claimAddress: string
  aspect: string
  images: MediaI[]
  claim: string
  object: string
}

const URL_PATTERN = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/

export const Form = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { createClaim } = useCreateClaim()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      claim: '',
      subject: '',
      sourceURI: '',
      statement: '',
      aspect: '',
      stars: 0,
      effectiveDate: new Date(),
      images: [],
      howKnown: HowKnown.FIRST_HAND,
      name: '',
      amt: 0
    }
  })

  const imageFieldArray = useFieldArray({ control, name: 'images' })
  const watchHowKnown = watch('howKnown')
  const watchSourceURI = watch('sourceURI')
  const watchSubject = watch('subject')

  const formatURL = (url: string): string => {
    if (!url) return ''

    if (!url.match(/^https?:\/\//)) {
      return `https://${url}`
    }
    return url
  }

  const validateURL = (url: string): boolean => {
    return URL_PATTERN.test(url)
  }

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setSubmissionError(null)

    // Format URLs before submission
    const formattedData = {
      ...formData,
      sourceURI: formatURL(formData.sourceURI),
      subject: formatURL(formData.subject)
    }

    try {
      const response = await timeoutPromise(createClaim(formattedData), 10_000)
      console.log('Claim submission response:', response)

      if (response.isSuccess) {
        const claimData = {
          ...formattedData,
          id: response.claim?.id || response.claimData?.id,
          claimId: response.claimData?.claimId,
          subject_name: response.claimData?.subject_name || formattedData.subject,
          issuer_name: response.claimData?.issuer_name || formattedData.name
        }

        sessionStorage.setItem('newClaimData', JSON.stringify(claimData))

        // Navigate to feed with the new claim data
        navigate('/feed', { state: { newClaim: claimData, timestamp: new Date().getTime() } })
      } else {
        setSubmissionError('Submission successful but marked as unsuccessful. Please check your feed.')
        navigate('/feed')
      }
    } catch (e) {
      console.error('Claim submission error:', e)
      setSubmissionError('Failed to submit the claim. Please try again.')
      // Still navigate to feed after a short delay
      setTimeout(() => navigate('/feed'), 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleURLBlur = (field: 'sourceURI' | 'subject') => {
    const value = field === 'sourceURI' ? watchSourceURI : watchSubject
    if (value) {
      setValue(field, formatURL(value))
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', px: 2, width: '100%' }}>
      <MainContainer
        sx={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
          backgroundColor: theme.palette.cardBackground,
          padding: 3,
          width: '100%',
          maxWidth: '1000px',
          borderRadius: '8px'
        }}
      >
        <Typography variant='h6' sx={{ mb: 6, boxShadow: '2px 2px 3px rgba(0, 0, 0, 0.5)', padding: 2 }}>
          Create a Claim{' '}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)', mb: 4, padding: 2, borderRadius: 1 }}>
            <Typography sx={{ mb: 1 }}>Claim Type</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Choose the Claim type</InputLabel>
              <Controller
                name='claim'
                control={control}
                rules={{ required: 'Claim type is required' }}
                render={({ field }) => (
                  <Select label='Choose the Claim type' {...field} error={!!errors.claim}>
                    <MenuItem value='rated'>Rate or Review</MenuItem>
                    <MenuItem value='impact'>Impact Assessment</MenuItem>
                    <MenuItem value='report'>Report Issue</MenuItem>
                    <MenuItem value='related_to'>Relationship</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
            {errors.claim && (
              <Typography color='error' variant='caption'>
                {errors.claim.message}
              </Typography>
            )}
          </Box>

          <Box sx={{ boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.5)', padding: 2, borderRadius: 1 }}>
            <Typography sx={{ mb: 3 }}>Claim Information</Typography>

            <Typography>Claim Subject</Typography>
            <TextField
              {...register('name', { required: 'Claim subject is required' })}
              label='Enter the name of the person, company, or entity involved'
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.name}
              helperText={errors.name ? errors.name.message : ''}
            />

            <Typography>Reference Link</Typography>
            <TextField
              {...register('subject', {
                required: 'Reference link is required',
                validate: value =>
                  !value || validateURL(formatURL(value)) || 'Please enter a valid URL e.g https//...com'
              })}
              label='Provide a supporting link'
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.subject}
              helperText={errors.subject ? errors.subject.message : 'Format: https://example.com'}
              placeholder='https://claim.com'
              onBlur={() => handleURLBlur('subject')}
            />

            <Typography>Claim Description</Typography>
            <TextField
              {...register('statement', { required: 'Claim description is required' })}
              label='Explain your claim in detail'
              fullWidth
              multiline
              rows={4}
              sx={{ mb: 2 }}
              error={!!errors.statement}
              helperText={errors.statement ? errors.statement.message : ''}
            />

            <Typography>Claim Category</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Choose the category that best fits your claim</InputLabel>
              <Controller
                name='aspect'
                control={control}
                rules={{ required: 'Claim category is required' }}
                render={({ field }) => (
                  <Select label='Claim Category' {...field} error={!!errors.aspect}>
                    {CLAIM_CATEGORIES.map((cat, i) => (
                      <MenuItem key={i} value={cat.toLowerCase()}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
            {errors.aspect && (
              <Typography color='error' variant='caption'>
                {errors.aspect.message}
              </Typography>
            )}

            <Box sx={{ mb: 2, border: 1, padding: 2, borderRadius: 1, borderColor: 'rgba(0, 0, 0, 0.12)' }}>
              <Typography>Claim Rating</Typography>
              <Controller
                name='stars'
                control={control}
                rules={{ required: 'Rating is required' }}
                render={({ field }) => {
                  const ratingValue = typeof field.value === 'string' ? parseFloat(field.value) : field.value
                  return <Rating {...field} value={ratingValue || 0} />
                }}
              />
              {errors.stars && (
                <Typography color='error' variant='caption'>
                  {errors.stars.message}
                </Typography>
              )}
            </Box>

            <Typography sx={{ mb: 2 }}>Source of Information:</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>How did you learn about this?</InputLabel>
              <Controller
                name='howKnown'
                control={control}
                rules={{ required: 'Source of information is required' }}
                render={({ field }) => (
                  <Select label='How did you learn about this?' {...field} error={!!errors.howKnown}>
                    <MenuItem value={HowKnown.FIRST_HAND}>First Hand</MenuItem>
                    <MenuItem value={HowKnown.SECOND_HAND}>Second Hand</MenuItem>
                    <MenuItem value={HowKnown.WEB_DOCUMENT}>Website</MenuItem>
                    <MenuItem value={HowKnown.PHYSICAL_DOCUMENT}>Physical Document</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
            {errors.howKnown && (
              <Typography color='error' variant='caption'>
                {errors.howKnown.message}
              </Typography>
            )}

            <Typography>Your Website</Typography>
            <TextField
              {...register('sourceURI', {
                required: 'Website link is required',
                validate: value => !value || validateURL(formatURL(value)) || 'Please enter a valid URL'
              })}
              label={
                watchHowKnown === HowKnown.FIRST_HAND
                  ? 'Provide your website or social media for verification'
                  : 'Source Link'
              }
              fullWidth
              sx={{ mb: 2 }}
              error={!!errors.sourceURI}
              helperText={errors.sourceURI ? errors.sourceURI.message : 'Format: https://example.com'}
              placeholder='https://yourwebsite.com'
              onBlur={() => handleURLBlur('sourceURI')}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Typography sx={{ mb: 2 }}>Incident Date</Typography>
              <Controller
                name='effectiveDate'
                control={control}
                rules={{ required: 'Incident date is required' }}
                render={({ field }) => (
                  <DatePicker
                    label='Date of Incident'
                    value={field.value}
                    onChange={field.onChange}
                    renderInput={params => (
                      <TextField
                        fullWidth
                        sx={{ mb: 2 }}
                        {...params}
                        error={!!errors.effectiveDate}
                        helperText={errors.effectiveDate ? errors.effectiveDate.message : ''}
                      />
                    )}
                  />
                )}
              />
            </LocalizationProvider>

            <Typography sx={{ mb: 1 }}>Upload Supporting Evidence (optional)</Typography>
            <MediaUploader fieldArray={imageFieldArray} control={control} register={register} />

            {submissionError && (
              <Typography color='error' sx={{ mt: 2 }}>
                {submissionError}
              </Typography>
            )}

            <DialogActions sx={{ justifyContent: 'flex-end', mt: 3 }}>
              <Button type='submit' variant='contained' disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogActions>
          </Box>
        </form>
      </MainContainer>
    </Box>
  )
}
