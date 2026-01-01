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
  InputAdornment,
  Autocomplete
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import { PromiseTimeoutError, timeoutPromise } from '../../utils/promise.utils'
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
}

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
  claimAddress: string | null
  aspect: string | null
  images: MediaI[]
  claim: string
  object: string | null
  subjectEntityType: 'PERSON' | 'ORGANIZATION' | null
}

// Infer entity type from URL patterns
const inferEntityType = (url: string): 'PERSON' | 'ORGANIZATION' => {
  if (!url) return 'ORGANIZATION'
  const urlLower = url.toLowerCase()

  // LinkedIn personal profiles
  if (urlLower.includes('linkedin.com/in/')) return 'PERSON'

  // LinkedIn company pages
  if (urlLower.includes('linkedin.com/company/')) return 'ORGANIZATION'

  // Twitter/X profiles (excluding non-profile paths)
  if (urlLower.includes('twitter.com/') || urlLower.includes('x.com/')) {
    if (!['/status/', '/search', '/explore', '/home', '/i/'].some(p => urlLower.includes(p))) {
      return 'PERSON'
    }
  }

  // Bluesky profiles
  if (urlLower.includes('bsky.app/profile/') || urlLower.includes('bsky.social')) return 'PERSON'

  // GitHub profiles (single path segment)
  if (urlLower.includes('github.com/')) {
    const path = urlLower.split('github.com/')[1]?.replace(/^\/|\/$/g, '') || ''
    const segments = path.split('/').filter(Boolean)
    if (segments.length === 1) return 'PERSON'
  }

  return 'ORGANIZATION'
}

interface IFormProps {
  toggleSnackbar?: (open: boolean) => void
  setSnackbarMessage?: (message: string) => void
  setLoading?: (loading: boolean) => void
  onCancel?: () => void
  selectedClaim?: any
}

export const Form = ({ toggleSnackbar, setSnackbarMessage, setLoading, onCancel, selectedClaim }: IFormProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { createClaim } = useCreateClaim()

  const [selectedClaimType, setSelectedClaimType] = useState<string>('')
  const [subjectEntityType, setSubjectEntityType] = useState<'PERSON' | 'ORGANIZATION'>('ORGANIZATION')

  // Get subject and name from URL params if present
  const subjectFromUrl = searchParams.get('subject') || ''
  const nameFromUrl = searchParams.get('name') || ''

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: nameFromUrl || null,
      subject: subjectFromUrl || '',
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
      images: [],
      subjectEntityType: null
    }
  })

  const watchSubject = watch('subject')

  // Set subject and name when URL params change
  useEffect(() => {
    if (subjectFromUrl) {
      setValue('subject', subjectFromUrl)
    }
    if (nameFromUrl) {
      setValue('name', nameFromUrl)
    }
  }, [subjectFromUrl, nameFromUrl, setValue])

  // Update entity type guess when subject changes
  useEffect(() => {
    if (watchSubject) {
      setSubjectEntityType(inferEntityType(watchSubject))
    }
  }, [watchSubject])

  const imageFieldArray = useFieldArray({
    control,
    name: 'images'
  })

  const watchHowKnown = watch('howKnown')

  const onSubmit = async (formData: any) => {
    if (setLoading) setLoading(true)

    // Ensure a claim type is selected
    if (!selectedClaimType) {
      if (setSnackbarMessage && toggleSnackbar) {
        setSnackbarMessage('Please select a claim type first')
        toggleSnackbar(true)
      }
      if (setLoading) setLoading(false)
      return
    }

    // Set the claim field based on the selected type
    const claimData = {
      ...formData,
      claim: selectedClaimType.toUpperCase(), // Convert 'rated' to 'RATED', etc.
      // Ensure sourceURI is null if empty, not defaulting to subject
      sourceURI: formData.sourceURI || null,
      subjectEntityType: subjectEntityType
    }

    // Debug logging to track the sourceURI issue
    console.log('Form submission data:', {
      subject: claimData.subject,
      sourceURI: claimData.sourceURI,
      claim: claimData.claim
    })

    // Additional validation for required fields
    if (!claimData.subject || !claimData.claim) {
      if (setSnackbarMessage && toggleSnackbar) {
        setSnackbarMessage('Subject and claim type are required')
        toggleSnackbar(true)
      }
      if (setLoading) setLoading(false)
      return
    }

    try {
      const response = await timeoutPromise(createClaim(claimData), 10_000)

      if (response.message && setSnackbarMessage && toggleSnackbar) {
        setSnackbarMessage(response.message)
        toggleSnackbar(true)
      }

      if (response.isSuccess) {
        navigate('/feed')
      }
    } catch (e) {
      if (e instanceof PromiseTimeoutError) {
        navigate('/feed')
      } else {
        if (setSnackbarMessage && toggleSnackbar) {
          setSnackbarMessage('Failed to create claim')
          toggleSnackbar(true)
        }
      }
    } finally {
      if (setLoading) setLoading(false)
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
          {/* Claim Type Selection - only show if no type selected */}
          {!selectedClaimType ? (
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ mb: 2 }}>What kind of claim would you like to make?</Typography>
              <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                {Object.entries(CLAIM_TYPES).map(([type, info]) => (
                  <Button
                    key={type}
                    onClick={() => setSelectedClaimType(type)}
                    variant='outlined'
                    sx={{ justifyContent: 'flex-start', p: 2 }}
                  >
                    {info.label}
                  </Button>
                ))}
              </Box>
            </Box>
          ) : (
            <>
              {/* Header with claim type selection and back button */}
              <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant='h6' sx={{ color: theme.palette.text.primary }}>
                  {CLAIM_TYPES[selectedClaimType as keyof typeof CLAIM_TYPES].label}
                </Typography>
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => setSelectedClaimType('')}
                  sx={{ textTransform: 'none' }}
                >
                  Change Type
                </Button>
              </Box>

              {/* Basic Information */}
              <Box sx={{ mb: 4 }}>
                <TextField
                  {...register('name')}
                  label="Name of what you're making a claim about"
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  {...register('subject', { required: true })}
                  label="Link to what you're making a claim about"
                  fullWidth
                  sx={{ mb: 0.5 }}
                  error={Boolean(errors.subject)}
                  helperText={errors.subject ? 'This field is required' : ''}
                />
                {watchSubject && (
                  <Typography
                    variant='caption'
                    onClick={() => setSubjectEntityType(prev => (prev === 'PERSON' ? 'ORGANIZATION' : 'PERSON'))}
                    sx={{
                      color: 'text.secondary',
                      cursor: 'pointer',
                      mb: 2,
                      display: 'block',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {subjectEntityType.toLowerCase()}
                  </Typography>
                )}
                <TextField
                  {...register('statement', { required: true })}
                  label='Describe your claim'
                  multiline
                  rows={4}
                  fullWidth
                  error={Boolean(errors.statement)}
                  helperText={errors.statement ? 'This field is required' : ''}
                />
              </Box>

              {/* Claim Type Specific Fields */}
              <Box sx={{ mb: 4 }}>
                {selectedClaimType === 'rated' && (
                  <>
                    <Controller
                      name='aspect'
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          freeSolo
                          options={CLAIM_TYPES.rated.aspects}
                          getOptionLabel={option => {
                            if (typeof option === 'string' && option.includes(':')) {
                              return option.split(':')[1]
                            }
                            return option
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label='Aspect'
                              placeholder='Select or type your own'
                              helperText='Choose from the list or type a custom aspect'
                              fullWidth
                              sx={{ mb: 2 }}
                            />
                          )}
                          onChange={(_, value) => field.onChange(value)}
                          onInputChange={(_, value) => {
                            // If user types something that doesn't match any option
                            field.onChange(value)
                          }}
                        />
                      )}
                    />
                    <Controller
                      name='stars'
                      control={control}
                      render={({ field }) => (
                        <Box sx={{ mb: 2 }}>
                          <Typography>Rating</Typography>
                          <Rating value={field.value} onChange={(_, newValue) => field.onChange(newValue)} />
                        </Box>
                      )}
                    />
                  </>
                )}

                {selectedClaimType === 'impact' && (
                  <>
                    <Controller
                      name='aspect'
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          freeSolo
                          options={CLAIM_TYPES.impact.aspects}
                          getOptionLabel={option => {
                            if (typeof option === 'string' && option.includes(':')) {
                              return option.split(':')[1]
                            }
                            return option
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label='Impact Type'
                              placeholder='Select or type your own'
                              helperText='Choose from the list or type a custom impact type'
                              fullWidth
                              sx={{ mb: 2 }}
                            />
                          )}
                          onChange={(_, value) => field.onChange(value)}
                          onInputChange={(_, value) => {
                            field.onChange(value)
                          }}
                        />
                      )}
                    />
                    <TextField
                      {...register('amt')}
                      label='Value'
                      type='number'
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>$</InputAdornment>
                      }}
                    />
                  </>
                )}

                {selectedClaimType === 'report' && (
                  <Controller
                    name='aspect'
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        freeSolo
                        options={CLAIM_TYPES.report.aspects}
                        getOptionLabel={option => {
                          if (typeof option === 'string' && option.includes(':')) {
                            return option.split(':')[1]
                          }
                          return option
                        }}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label='Report Type'
                            placeholder='Select or type your own'
                            helperText='Choose from the list or type a custom report type'
                            fullWidth
                            sx={{ mb: 2 }}
                          />
                        )}
                        onChange={(_, value) => field.onChange(value)}
                        onInputChange={(_, value) => {
                          field.onChange(value)
                        }}
                      />
                    )}
                  />
                )}

                {selectedClaimType === 'related_to' && (
                  <>
                    <TextField {...register('object')} label='Related To (URL)' fullWidth sx={{ mb: 2 }} />
                    <Controller
                      name='aspect'
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          {...field}
                          freeSolo
                          options={CLAIM_TYPES.related_to.aspects}
                          getOptionLabel={option => {
                            if (typeof option === 'string' && option.includes(':')) {
                              return option.split(':')[1]
                            }
                            return option
                          }}
                          renderInput={params => (
                            <TextField
                              {...params}
                              label='Relationship Type'
                              placeholder='Select or type your own'
                              helperText='Choose from the list or type a custom relationship'
                              fullWidth
                            />
                          )}
                          onChange={(_, value) => field.onChange(value)}
                          onInputChange={(_, value) => {
                            field.onChange(value)
                          }}
                        />
                      )}
                    />
                  </>
                )}
              </Box>

              {/* Common Bottom Fields */}
              <Box sx={{ mb: 4 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>How do you know this?</InputLabel>
                  <Select {...register('howKnown')} defaultValue={HowKnown.FIRST_HAND}>
                    <MenuItem value={HowKnown.FIRST_HAND}>First Hand</MenuItem>
                    <MenuItem value={HowKnown.SECOND_HAND}>Second Hand</MenuItem>
                    <MenuItem value={HowKnown.WEB_DOCUMENT}>Website</MenuItem>
                    <MenuItem value={HowKnown.PHYSICAL_DOCUMENT}>Physical Document</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  {...register('sourceURI')}
                  label={
                    watchHowKnown === HowKnown.FIRST_HAND
                      ? 'Your home page or social media link (URI)'
                      : 'Where did you find the information (URI)'
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                  helperText='Leave blank if unknown. Examples: https://example.com, did:ethr:0x123...'
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
                        renderInput={params => <TextField {...params} fullWidth />}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Box>

              {/* Optional Image Upload */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ mb: 1 }}>Add supporting image (optional)</Typography>
                <MediaUploader fieldArray={imageFieldArray} control={control} register={register} />
              </Box>

              {/* Submit Buttons */}
              <DialogActions sx={{ justifyContent: 'flex-end', gap: 2 }}>
                {onCancel && <Button onClick={onCancel}>Cancel</Button>}
                <Button type='submit' variant='contained' color='primary'>
                  Submit
                </Button>
              </DialogActions>
            </>
          )}
        </form>
      </MainContainer>
    </Box>
  )
}
