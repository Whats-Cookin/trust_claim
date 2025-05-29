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
  useMediaQuery,
  useTheme,
  InputAdornment
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import MainContainer from '../MainContainer'
import MediaUploader, { MediaI } from './imageUploading'
import { HowKnown } from '../../enums'

const CLAIM_TYPES = {
  rated: {
    label: 'Rate or Review',
    aspects: ['quality:speed', 'quality:excellence', 'quality:affordable', 'quality:technical', 'quality:usefulness']
  },
  impact: {
    label: 'Impact Assessment',
    aspects: ['impact:social', 'impact:climate', 'impact:work', 'impact:financial', 'impact:educational']
  },
  report: {
    label: 'Report Issue',
    aspects: ['report:scam', 'report:spam', 'report:misinfo', 'report:abuse', 'report:dangerous']
  },
  related_to: {
    label: 'Relationship',
    aspects: [
      'relationship:owns',
      'relationship:works-for',
      'relationship:works-with',
      'relationship:worked-on',
      'relationship:same-as'
    ]
  }
} as const

interface FormData {
  stars: number | null
  amt: number | null
  confidence: number | null
  name: string | null
  subject: string
  statement: string | null
  sourceURI: string | null
  howKnown: HowKnown
  effectiveDate: Date | null
  aspect: string | null
  images: MediaI[]
  claim: string
  object: string | null
}

interface IFormProps {
  toggleSnackbar?: (open: boolean) => void
  setSnackbarMessage?: (message: string) => void
  setLoading?: (loading: boolean) => void
  onCancel?: () => void
}

export const Form = ({ toggleSnackbar, setSnackbarMessage, setLoading, onCancel }: IFormProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { createClaim } = useCreateClaim()

  const [selectedClaimType, setSelectedClaimType] = useState<string>('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: null,
      subject: '',
      claim: '',
      object: null,
      statement: null,
      aspect: null,
      howKnown: HowKnown.FIRST_HAND,
      sourceURI: null,
      effectiveDate: new Date(),
      confidence: 1,
      stars: null,
      amt: null,
      images: []
    }
  })

  const imageFieldArray = useFieldArray({
    control,
    name: 'images'
  })

  const watchHowKnown = watch('howKnown')

  const onSubmit = async (formData: FormData) => {
    if (setLoading) setLoading(true)

    try {
      // Create payload with selected claim type
      const payload = {
        ...formData,
        claim: selectedClaimType || formData.claim,
        images: formData.images || []
      }

      // Development logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Form submitting payload:', payload)
      }

      const response = await createClaim(payload)

      // Development logging
      if (process.env.NODE_ENV === 'development') {
        console.log('Create claim response:', response)
      }

      // Show response message
      if (response.message && setSnackbarMessage && toggleSnackbar) {
        setSnackbarMessage(response.message)
        toggleSnackbar(true)
      }

      // Navigate on success
      if (response.isSuccess) {
        // Delay navigation to show success message
        setTimeout(() => {
          navigate('/feed')
        }, 1500)
      }
    } catch (error) {
      // This should rarely happen as createClaim handles its own errors
      console.error('Unexpected error in form submission:', error)
      if (setSnackbarMessage && toggleSnackbar) {
        setSnackbarMessage('An unexpected error occurred. Please try again.')
        toggleSnackbar(true)
      }
    } finally {
      if (setLoading) setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedClaimType) {
      setValue('claim', selectedClaimType)
    }
  }, [selectedClaimType, setValue])

  const renderClaimTypeSpecificFields = () => {
    switch (selectedClaimType) {
      case 'rated':
        return (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Aspect</InputLabel>
              <Select {...register('aspect')} defaultValue=''>
                {CLAIM_TYPES.rated.aspects.map(aspect => (
                  <MenuItem key={aspect} value={aspect}>
                    {aspect.split(':')[1].replace('-', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Controller
              name='stars'
              control={control}
              render={({ field }) => (
                <Box sx={{ mb: 2 }}>
                  <Typography>Rating</Typography>
                  <Rating {...field} value={field.value || 0} />
                </Box>
              )}
            />
          </>
        )

      case 'impact':
        return (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Impact Type</InputLabel>
              <Select {...register('aspect')} defaultValue=''>
                {CLAIM_TYPES.impact.aspects.map(aspect => (
                  <MenuItem key={aspect} value={aspect}>
                    {aspect.split(':')[1].replace('-', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              {...register('amt')}
              label='Value (optional)'
              type='number'
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position='start'>$</InputAdornment>
              }}
            />
          </>
        )

      case 'report':
        return (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Report Type</InputLabel>
            <Select {...register('aspect')} defaultValue=''>
              {CLAIM_TYPES.report.aspects.map(aspect => (
                <MenuItem key={aspect} value={aspect}>
                  {aspect.split(':')[1].replace('-', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )

      case 'related_to':
        return (
          <>
            <TextField
              {...register('object')}
              label='Related To (URL)'
              fullWidth
              sx={{ mb: 2 }}
              placeholder='https://example.com/entity'
            />
            <FormControl fullWidth>
              <InputLabel>Relationship Type</InputLabel>
              <Select {...register('aspect')} defaultValue=''>
                {CLAIM_TYPES.related_to.aspects.map(aspect => (
                  <MenuItem key={aspect} value={aspect}>
                    {aspect.split(':')[1].replace('-', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )

      default:
        return null
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mx: 'auto' }}>
      <MainContainer
        flexRowOnDesktop={true}
        sx={{
          backgroundColor: theme.palette.cardBackground,
          padding: '20px',
          width: '100%',
          maxWidth: '800px'
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Claim Type Selection */}
          {!selectedClaimType ? (
            <Box sx={{ mb: 4 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                What kind of claim would you like to make?
              </Typography>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                {Object.entries(CLAIM_TYPES).map(([type, info]) => (
                  <Button
                    key={type}
                    onClick={() => setSelectedClaimType(type)}
                    variant='outlined'
                    sx={{
                      justifyContent: 'flex-start',
                      p: 2,
                      textTransform: 'none'
                    }}
                  >
                    {info.label}
                  </Button>
                ))}
              </Box>
            </Box>
          ) : (
            <>
              {/* Basic Information */}
              <Box sx={{ mb: 4 }}>
                <TextField
                  {...register('name')}
                  label="Name of what you're making a claim about (optional)"
                  fullWidth
                  sx={{ mb: 2 }}
                  placeholder="e.g., John's Restaurant, Acme Corp"
                />
                <TextField
                  {...register('subject', { required: 'Subject URL is required' })}
                  label="Link to what you're making a claim about"
                  fullWidth
                  sx={{ mb: 2 }}
                  error={Boolean(errors.subject)}
                  helperText={errors.subject?.message || 'Enter a URL (e.g., https://example.com)'}
                  required
                  placeholder='https://...'
                />
                <TextField
                  {...register('statement', {
                    required: 'Claim description is required',
                    minLength: { value: 10, message: 'Please provide more detail (at least 10 characters)' }
                  })}
                  label='Describe your claim'
                  multiline
                  rows={4}
                  fullWidth
                  error={Boolean(errors.statement)}
                  helperText={errors.statement?.message || 'Be specific about your claim'}
                  required
                  placeholder='Provide details about your experience, observation, or assessment...'
                />
              </Box>

              {/* Claim Type Specific Fields */}
              <Box sx={{ mb: 4 }}>{renderClaimTypeSpecificFields()}</Box>

              {/* Evidence and Source */}
              <Box sx={{ mb: 4 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>How do you know this?</InputLabel>
                  <Select {...register('howKnown')} value={watchHowKnown}>
                    <MenuItem value={HowKnown.FIRST_HAND}>First Hand Experience</MenuItem>
                    <MenuItem value={HowKnown.SECOND_HAND}>Second Hand Information</MenuItem>
                    <MenuItem value={HowKnown.WEB_DOCUMENT}>Website/Online Source</MenuItem>
                    <MenuItem value={HowKnown.PHYSICAL_DOCUMENT}>Physical Document</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  {...register('sourceURI')}
                  label={
                    watchHowKnown === HowKnown.FIRST_HAND
                      ? 'Your profile or website (optional)'
                      : 'Source of information (optional)'
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                  placeholder={
                    watchHowKnown === HowKnown.FIRST_HAND
                      ? 'https://linkedin.com/in/yourprofile'
                      : 'https://source-website.com/article'
                  }
                />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Controller
                    name='effectiveDate'
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label='When did this happen?'
                        value={field.value}
                        onChange={field.onChange}
                        maxDate={new Date()}
                        renderInput={params => <TextField {...params} fullWidth />}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Box>

              {/* Optional Image Upload */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ mb: 1 }}>Add supporting images (optional)</Typography>
                <MediaUploader fieldArray={imageFieldArray} control={control} register={register} />
              </Box>

              {/* Action Buttons */}
              <DialogActions sx={{ justifyContent: 'space-between', gap: 2 }}>
                <Button onClick={() => setSelectedClaimType('')} variant='text'>
                  Back
                </Button>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {onCancel && (
                    <Button onClick={onCancel} variant='outlined'>
                      Cancel
                    </Button>
                  )}
                  <Button type='submit' variant='contained' color='primary'>
                    Submit Claim
                  </Button>
                </Box>
              </DialogActions>
            </>
          )}
        </form>
      </MainContainer>
    </Box>
  )
}
