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
  const { createClaim } = useCreateClaim()

  const [selectedClaimType, setSelectedClaimType] = useState<string>('')

  const {
    register,
    handleSubmit,
    control,
    watch,
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

  const onSubmit = async (formData: any) => {
    if (setLoading) setLoading(true)

    try {
      const response = await timeoutPromise(createClaim(formData), 10_000)

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
              {/* Basic Information */}
              <Box sx={{ mb: 4 }}>
                <TextField
                  {...register('name', { required: true })}
                  label="Name of what you're making a claim about"
                  fullWidth
                  sx={{ mb: 2 }}
                  error={Boolean(errors.name)}
                  helperText={errors.name ? 'This field is required' : ''}
                />
                <TextField
                  {...register('subject', {
                    required: 'This field is required',
                    pattern: {
                      value: /^(https?:\/\/|www\.)[\w\-\.]+(\.[a-z]{2,})([\/\w \-\.\?\=\&\%]*)*\/?$/,
                      message: 'Please enter a valid URL (e.g., http://example.com or www.example.com)'
                    }
                  })}
                  label="Link to what you're making a claim about"
                  fullWidth
                  sx={{ mb: 2 }}
                  error={Boolean(errors.subject)}
                  helperText={errors.subject ? errors.subject.message : ''}
                />
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
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Aspect</InputLabel>
                      <Select {...register('aspect')}>
                        {CLAIM_TYPES.rated.aspects.map(aspect => (
                          <MenuItem key={aspect} value={aspect}>
                            {aspect.split(':')[1]}
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
                          <Rating {...field} />
                        </Box>
                      )}
                    />
                  </>
                )}

                {selectedClaimType === 'impact' && (
                  <>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Impact Type</InputLabel>
                      <Select {...register('aspect')}>
                        {CLAIM_TYPES.impact.aspects.map(aspect => (
                          <MenuItem key={aspect} value={aspect}>
                            {aspect.split(':')[1]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Report Type</InputLabel>
                    <Select {...register('aspect')}>
                      {CLAIM_TYPES.report.aspects.map(aspect => (
                        <MenuItem key={aspect} value={aspect}>
                          {aspect.split(':')[1]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {selectedClaimType === 'related_to' && (
                  <>
                    <TextField {...register('object')} label='Related To (URL)' fullWidth sx={{ mb: 2 }} />
                    <FormControl fullWidth>
                      <InputLabel>Relationship Type</InputLabel>
                      <Select {...register('aspect')}>
                        {CLAIM_TYPES.related_to.aspects.map(aspect => (
                          <MenuItem key={aspect} value={aspect}>
                            {aspect.split(':')[1]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                  {...register('sourceURI', {
                    pattern: {
                      value: /^(https?:\/\/|www\.)[\w\-\.]+(\.[a-z]{2,})([\/\w \.-]*)*\/?$/,
                      message:
                        watchHowKnown === HowKnown.FIRST_HAND
                          ? 'Please enter a valid home page or social media link (e.g., http://example.com or www.example.com)'
                          : 'Please enter a valid source link (e.g., http://example.com or www.example.com)'
                    }
                  })}
                  label={
                    watchHowKnown === HowKnown.FIRST_HAND
                      ? 'Your home page or social media link'
                      : 'Where did you find the information'
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                  error={Boolean(errors.sourceURI)} // Check for errors in `sourceURI`
                  helperText={errors.sourceURI ? errors.sourceURI.message : ''} // Display `sourceURI` errors
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
