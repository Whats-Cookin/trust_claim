import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  MenuItem,
  Card,
  CardContent,
  Container,
  useTheme,
  Alert,
  FormControl,
  FormHelperText,
  Divider,
  Link as MuiLink
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import StarIcon from '@mui/icons-material/Star'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import Loader from '../Loader'
import MainContainer from '../MainContainer'

/**
 * RequestRating - Public page for collecting ratings/testimonials
 *
 * This page allows anyone to submit a rating about a subject (person/company).
 * It's designed to be shared as a link: /request-rating?about=<subject-uri>
 *
 * Flow:
 * 1. User gets their profile URL
 * 2. Creates request rating link with their URL as the subject
 * 3. Sends link to client/colleague
 * 4. Client fills out rating form (no login required to view, but needed to submit)
 * 5. Rating claim is created about the subject
 */

interface FormData {
  subject: string
  statement: string
  aspect: string
  stars: number | null
  sourceURI: string // The rater's profile URL
  effectiveDate: Date
}

const aspectOptions = [
  { value: 'quality', label: 'Quality of Work' },
  { value: 'communication', label: 'Communication' },
  { value: 'reliability', label: 'Reliability' },
  { value: 'expertise', label: 'Expertise' },
  { value: 'value', label: 'Value for Money' },
  { value: 'responsiveness', label: 'Responsiveness' },
  { value: 'professionalism', label: 'Professionalism' },
  { value: 'other', label: 'Other' }
]

const RequestRating: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const aboutUri = searchParams.get('about') || ''

  // Try to extract a display name from the URI
  const extractDisplayName = (uri: string): string => {
    try {
      const url = new URL(uri)
      // LinkedIn
      if (url.hostname.includes('linkedin.com')) {
        const parts = url.pathname.split('/').filter(Boolean)
        const name = parts[parts.length - 1]
        return name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
      // GitHub
      if (url.hostname.includes('github.com')) {
        return url.pathname.split('/').filter(Boolean)[0] || uri
      }
      // Generic - use last path segment
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts.length > 0) {
        return parts[parts.length - 1].replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
      return url.hostname
    } catch {
      return uri
    }
  }

  const subjectName = extractDisplayName(aboutUri)

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      subject: aboutUri,
      statement: '',
      aspect: '',
      stars: null,
      sourceURI: '',
      effectiveDate: new Date()
    }
  })

  const { createClaim } = useCreateClaim()

  const onSubmit = handleSubmit(async data => {
    if (!data.subject) {
      return
    }

    setLoading(true)

    try {
      const payload = {
        subject: data.subject,
        claim: 'rated',
        statement: data.statement,
        aspect: data.aspect,
        howKnown: 'FIRST_HAND',
        effectiveDate: data.effectiveDate.toISOString(),
        stars: data.stars || undefined,
        sourceURI: data.sourceURI || undefined
      }

      const { message, isSuccess } = await createClaim(payload)

      if (isSuccess) {
        setSubmitted(true)
      } else {
        console.error('Failed to create rating:', message)
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setLoading(false)
    }
  })

  const watchStars = watch('stars')

  if (!aboutUri) {
    return (
      <MainContainer>
        <Container maxWidth='sm' sx={{ py: 4 }}>
          <Alert severity='error'>
            No subject specified. This link should include an "about" parameter with the subject's profile URL.
          </Alert>
        </Container>
      </MainContainer>
    )
  }

  if (submitted) {
    return (
      <MainContainer>
        <Container maxWidth='sm' sx={{ py: 4 }}>
          <Card sx={{ textAlign: 'center', p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <StarIcon sx={{ fontSize: 64, color: theme.palette.warning.main }} />
            </Box>
            <Typography variant='h5' sx={{ fontWeight: 700, mb: 2 }}>
              Thank You for Your Rating!
            </Typography>
            <Typography variant='body1' sx={{ color: theme.palette.text.secondary, mb: 3 }}>
              Your testimonial has been submitted and will be visible on LinkedTrust.
            </Typography>
            <Button
              variant='contained'
              onClick={() => navigate('/feed')}
              sx={{ textTransform: 'none' }}
            >
              Browse Feed
            </Button>
          </Card>
        </Container>
      </MainContainer>
    )
  }

  return (
    <>
      <Loader open={loading} />
      <MainContainer>
        <Container maxWidth='sm' sx={{ py: 4 }}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
                  Rate Your Experience
                </Typography>
                <Typography variant='body1' sx={{ color: theme.palette.text.secondary }}>
                  Share your testimonial about{' '}
                  <MuiLink href={aboutUri} target='_blank' rel='noopener noreferrer'>
                    {subjectName}
                  </MuiLink>
                </Typography>
              </Box>

              <form onSubmit={onSubmit}>
                {/* Star Rating */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 2 }}>
                    Your Rating *
                  </Typography>
                  <Controller
                    name='stars'
                    control={control}
                    rules={{ required: 'Please select a rating' }}
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                      <FormControl error={!!error}>
                        <Rating
                          name='stars'
                          value={value || 0}
                          onChange={(_, newValue) => onChange(newValue)}
                          size='large'
                          sx={{
                            fontSize: '3rem',
                            '& .MuiRating-iconFilled': {
                              color: theme.palette.warning.main
                            }
                          }}
                        />
                        {error && <FormHelperText sx={{ textAlign: 'center' }}>{error.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                  {watchStars && (
                    <Typography variant='body2' sx={{ mt: 1, color: theme.palette.text.secondary }}>
                      {watchStars === 5 && 'Excellent!'}
                      {watchStars === 4 && 'Very Good'}
                      {watchStars === 3 && 'Good'}
                      {watchStars === 2 && 'Fair'}
                      {watchStars === 1 && 'Poor'}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Aspect */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                    What aspect are you rating?
                  </Typography>
                  <Controller
                    name='aspect'
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select fullWidth size='small'>
                        <MenuItem value=''>Select an aspect...</MenuItem>
                        {aspectOptions.map(opt => (
                          <MenuItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Box>

                {/* Statement */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                    Your Testimonial *
                  </Typography>
                  <Controller
                    name='statement'
                    control={control}
                    rules={{ required: 'Please write a testimonial' }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        multiline
                        rows={4}
                        fullWidth
                        placeholder='Share your experience working with them...'
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Box>

                {/* Your Profile URL */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                    Your Profile URL
                  </Typography>
                  <Typography variant='body2' sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Optional: Link to your LinkedIn, website, or other profile
                  </Typography>
                  <Controller
                    name='sourceURI'
                    control={control}
                    rules={{
                      pattern: {
                        value: /^(https?:\/\/)/,
                        message: 'Please enter a valid URL starting with http:// or https://'
                      }
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size='small'
                        placeholder='https://linkedin.com/in/yourprofile'
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                </Box>

                {/* Date */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                    When did you work with them?
                  </Typography>
                  <Controller
                    name='effectiveDate'
                    control={control}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          value={field.value}
                          onChange={date => field.onChange(date)}
                          renderInput={params => <TextField {...params} fullWidth size='small' />}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </Box>

                {/* Submit */}
                <Button
                  type='submit'
                  variant='contained'
                  size='large'
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                  Submit Rating
                </Button>
              </form>

              {/* Footer */}
              <Typography
                variant='body2'
                sx={{ textAlign: 'center', mt: 3, color: theme.palette.text.secondary }}
              >
                Your rating will be publicly visible on{' '}
                <MuiLink href='https://linkedtrust.us' target='_blank' rel='noopener noreferrer'>
                  LinkedTrust
                </MuiLink>
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </MainContainer>
    </>
  )
}

export default RequestRating
