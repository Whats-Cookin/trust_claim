import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Button, TextField, useTheme, IconButton, Link as MuiLink, Alert, Skeleton } from '@mui/material'
import type { Theme } from '@mui/material/styles'
import { Controller, useForm, useFieldArray } from 'react-hook-form'
import IHomeProps from '../Form/types'
import { useQueryParams } from '../../hooks'
import * as api from '../../api'
import MailOutline from '@mui/icons-material/MailOutline'
import Add from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopy from '@mui/icons-material/ContentCopy'
import { neutralColors } from '../../theme/colors'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import LegalConsentFooter from '../../components/LegalConsentFooter'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isHttpSubjectUri = (s: string) => /^https?:\/\//i.test((s ?? '').trim())

const endorseOutlinedFieldSx = (theme: Theme) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    backgroundColor: neutralColors.white,
    fontSize: '14px',
    '& fieldset': {
      borderColor: '#CAD5E2',
      borderWidth: '1px'
    },
    '&:hover fieldset': {
      borderColor: '#CAD5E2'
    },
    '&.Mui-focused fieldset': {
      borderWidth: '1px',
      borderColor: theme.palette.primary.main
    },
    '& .MuiInputBase-input': {
      fontSize: '14px',
      color: neutralColors.gray[900]
    },
    '& .MuiInputBase-input::placeholder': {
      color: 'rgba(15, 23, 43, 0.5)',
      opacity: 1
    }
  }
})

const fieldLabelSx = {
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '20px',
  color: '#314158',
  mb: 1,
  display: 'block'
} as const

const sendButtonGradientSx = {
  borderRadius: '10px',
  minHeight: 48,
  py: 1.25,
  textTransform: 'none' as const,
  fontWeight: 500,
  fontSize: '14px',
  color: '#fff',
  background: 'linear-gradient(90deg, #11aae6 0%, #1fa3e7 20.19%, #3299e7 48.08%, #4290e8 71.64%, #5586e9 100%)',
  boxShadow: '0px 4px 6px rgba(0,0,0,0.1), 0px 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    background: 'linear-gradient(90deg, #0d9ad4 0%, #1892c9 20.19%, #2a87c9 48.08%, #387ecc 71.64%, #4874cd 100%)',
    boxShadow: '0px 6px 8px rgba(0,0,0,0.12), 0px 2px 4px rgba(0,0,0,0.1)'
  },
  '&.Mui-disabled': {
    background: 'linear-gradient(90deg, #94a3b8 0%, #64748b 100%)',
    color: '#fff'
  }
}

const pageShellSx = () => ({
  width: '100%',
  maxWidth: '100%',
  mx: 'auto',
  px: { xs: 2, sm: 3 },
  pt: { xs: 2, sm: 4 },
  pb: { xs: 10, sm: 6 },
  boxSizing: 'border-box' as const,
  bgcolor: neutralColors.gray[50],
  minHeight: { xs: 'calc(100vh - 120px)', sm: 'auto' }
})

interface FormData {
  subject: string
  endorsementTopic: string
  recipients: { email: string }[]
  personalNote: string
}

/**
 * Request endorsement: loads claim context, opens the user's email client (mailto) with a draft.
 * Does not create a claim on the server — only GET /api/claims/:id to load context.
 */
const RequestEndorsement = ({ toggleSnackbar, setSnackbarMessage }: IHomeProps & { isAuthenticated?: boolean }) => {
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invitationSent, setInvitationSent] = useState(false)
  const queryParams = useQueryParams()
  const [searchParams] = useSearchParams()
  const [subjectValue, setSubjectValue] = useState('')
  const [statementValue, setStatementValue] = useState('')
  const [sourceThumbnail, setSourceThumbnail] = useState('')
  const [claimName, setClaimName] = useState('')
  const [subject_name, setSubjectName] = useState('')

  const { claimId: pathClaimId } = useParams<{ claimId: string }>()
  const subject = queryParams.get('subject') || searchParams.get('claim')
  const theme = useTheme()
  const navigate = useNavigate()
  const hasSyncedClaimToForm = useRef(false)

  let number: string | undefined = pathClaimId
  if (!number && subject) {
    const parts = subject.split('/')
    number = parts.at(-1)
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!number) {
        setError('No claim provided')
        setDataLoading(false)
        return
      }

      try {
        setDataLoading(true)
        setError(null)
        const res = await api.getClaim(number)

        if (res.data.claim.subject) {
          const subj = typeof res.data.claim.subject === 'string' ? res.data.claim.subject : res.data.claim.subject.uri
          setSubjectValue(subj)
        }
        if (res.data.claim.statement) setStatementValue(res.data.claim.statement)
        if ((res.data.claim as { source_thumbnail?: string }).source_thumbnail) {
          setSourceThumbnail((res.data.claim as { source_thumbnail?: string }).source_thumbnail ?? '')
        }

        const claimData = (res.data as { claimData?: { name?: string; subject_name?: string } }).claimData
        if (claimData?.name) setClaimName(claimData.name)
        if (claimData?.subject_name) setSubjectName(claimData.subject_name)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load claim data. Please try again.')
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [number])

  const defaultValues: FormData = {
    subject: subject ?? '',
    endorsementTopic: '',
    recipients: [{ email: '' }],
    personalNote: ''
  }

  const { handleSubmit, reset, control, setValue, getValues } = useForm<FormData>({ defaultValues })

  const {
    fields: recipientFields,
    append: appendRecipient,
    remove: removeRecipient
  } = useFieldArray({
    control,
    name: 'recipients'
  })

  useEffect(() => {
    hasSyncedClaimToForm.current = false
  }, [number])

  useEffect(() => {
    if (dataLoading || !subjectValue || hasSyncedClaimToForm.current) return
    setValue('subject', subjectValue)
    hasSyncedClaimToForm.current = true
  }, [dataLoading, subjectValue, setValue])

  const buildDraft = ({ personalNote, endorsementTopic }: Pick<FormData, 'personalNote' | 'endorsementTopic'>) => {
    const endorseUrl = `${window.location.origin}/endorse/${number}`
    const claimSubjectUri = `${window.location.origin}/claims/${number}`
    const validateUrl = `${window.location.origin}/validate?subject=${encodeURIComponent(claimSubjectUri)}`
    const topic = endorsementTopic.trim()
    let body = ''
    if (personalNote.trim()) {
      body += `${personalNote.trim()}\n\n`
    }
    body += `I'm requesting your endorsement for:\n${topic}\n\n`
    body += `Write your endorsement on LinkedTrust:\n${validateUrl}\n\n`
    body += `Or use the endorsement page:\n${endorseUrl}`
    const mailSubject = `Request for endorsement${
      topic ? `: ${topic.slice(0, 60)}${topic.length > 60 ? '…' : ''}` : ''
    }`
    return { body, mailSubject, validateUrl }
  }

  const openInvitationMailto = (data: Pick<FormData, 'recipients' | 'personalNote' | 'endorsementTopic'>) => {
    const emails = data.recipients.map(r => r.email.trim()).filter(Boolean)
    if (emails.length === 0 || !number) return
    const { body, mailSubject } = buildDraft(data)
    const mailto = `mailto:${emails.join(',')}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(
      body
    )}`
    window.open(mailto, '_blank', 'noopener,noreferrer')
  }

  const handleCopyDraft = async () => {
    if (!number) return
    const { endorsementTopic, personalNote } = getValues()
    if (!endorsementTopic.trim()) {
      setSnackbarMessage('Please describe what you would like to be endorsed for.')
      toggleSnackbar(true)
      return
    }
    const { body } = buildDraft({ endorsementTopic, personalNote })
    try {
      await navigator.clipboard.writeText(body)
      setSnackbarMessage('Draft and link copied to clipboard')
      toggleSnackbar(true)
    } catch {
      setSnackbarMessage('Could not copy — please select the text and copy manually.')
      toggleSnackbar(true)
    }
  }

  const doSubmit = ({ subject, personalNote, endorsementTopic, recipients }: FormData) => {
    if (!subject) {
      setSnackbarMessage('Subject is required')
      toggleSnackbar(true)
      return
    }

    const invitationEmails = recipients.map(r => r.email.trim()).filter(Boolean)
    for (const e of invitationEmails) {
      if (!EMAIL_REGEX.test(e)) {
        setSnackbarMessage('Please enter a valid email for each recipient.')
        toggleSnackbar(true)
        return
      }
    }
    if (!endorsementTopic.trim()) {
      setSnackbarMessage('Please describe what you would like to be endorsed for.')
      toggleSnackbar(true)
      return
    }

    openInvitationMailto({ recipients, personalNote, endorsementTopic })
    setInvitationSent(true)
    reset({
      subject: subjectValue,
      endorsementTopic: '',
      recipients: [{ email: '' }],
      personalNote: ''
    })
  }

  const onSubmit = handleSubmit(doSubmit)

  const handleSendAnother = () => {
    setInvitationSent(false)
    reset({
      subject: subjectValue,
      endorsementTopic: '',
      recipients: [{ email: '' }],
      personalNote: ''
    })
  }

  if (dataLoading) {
    return (
      <Box sx={pageShellSx()}>
        <Box sx={{ width: '100%', maxWidth: 576, mx: 'auto', textAlign: 'center', py: 4 }}>
          <Skeleton variant='rectangular' height={200} sx={{ mb: 2, borderRadius: 2 }} />
          <Skeleton variant='text' width='60%' sx={{ mx: 'auto' }} />
        </Box>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={pageShellSx()}>
        <Box sx={{ width: '100%', maxWidth: 576, mx: 'auto' }}>
          <Alert
            severity='error'
            sx={{
              mb: 2,
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
            action={
              <Button color='inherit' size='small' onClick={() => navigate('/feed')} sx={{ fontWeight: 600 }}>
                Return to Feed
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      </Box>
    )
  }

  const subjectIsUrl = Boolean(subjectValue && isHttpSubjectUri(subjectValue))
  const endorsementHeadline =
    claimName && subject_name
      ? `${claimName} - ${subject_name}`
      : !subjectValue || !isHttpSubjectUri(subjectValue)
      ? subjectValue
      : claimName || subject_name || ''

  return (
    <Box sx={pageShellSx()}>
      <form onSubmit={onSubmit} style={{ width: '100%', maxWidth: 576, margin: '0 auto' }}>
        <Box
          sx={{
            width: '100%',
            p: 3,
            backgroundColor: neutralColors.white,
            borderRadius: '16px',
            boxShadow: '0px 20px 25px rgba(0,0,0,0.1), 0px 8px 10px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: '#DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <MailOutline sx={{ fontSize: 32, color: theme.palette.primary.main }} />
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: '1.25rem', sm: '24px' },
                  fontWeight: 500,
                  lineHeight: '32px',
                  color: neutralColors.gray[900],
                  mb: 0.5,
                  px: 0.5
                }}
              >
                Request an Endorsement
              </Typography>
              <Typography sx={{ fontSize: '14px', lineHeight: '20px', color: neutralColors.gray[500], px: 0.5 }}>
                Ask your connections to endorse your work
              </Typography>
            </Box>

            {invitationSent && (
              <Alert severity='success' sx={{ fontSize: '14px' }}>
                Your email app should open with a draft message. Send it when you’re ready — LinkedTrust does not send
                email from our servers for this step.
              </Alert>
            )}

            <Box
              sx={{
                bgcolor: neutralColors.gray[50],
                border: `1px solid ${neutralColors.gray[200]}`,
                borderRadius: '10px',
                p: 1.5
              }}
            >
              <Typography
                sx={{
                  fontSize: '12px',
                  lineHeight: '16px',
                  color: neutralColors.gray[500],
                  mb: 1.25
                }}
              >
                Endorsement for
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 86,
                    height: 65,
                    flexShrink: 0,
                    bgcolor: neutralColors.gray[200],
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {sourceThumbnail ? (
                    <Box
                      component='img'
                      src={sourceThumbnail}
                      alt=''
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : null}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {subjectIsUrl ? (
                    <MuiLink
                      href={subjectValue}
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{
                        fontSize: '13px',
                        fontWeight: 500,
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        color: 'primary.main',
                        alignSelf: 'flex-start',
                        maxWidth: '100%'
                      }}
                    >
                      {subjectValue}
                    </MuiLink>
                  ) : null}
                  {endorsementHeadline ? (
                    <Typography
                      sx={{
                        fontSize: '16px',
                        fontWeight: 500,
                        lineHeight: 1.4,
                        color: neutralColors.gray[900],
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                      }}
                    >
                      {endorsementHeadline}
                    </Typography>
                  ) : null}
                  {statementValue && (
                    <Typography
                      sx={{
                        fontSize: '13px',
                        lineHeight: 1.5,
                        color: neutralColors.gray[500],
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                        display: '-webkit-box',
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {statementValue}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
              <Controller
                name='endorsementTopic'
                control={control}
                rules={{ required: 'This field is required' }}
                render={({ field, fieldState: { error } }) => (
                  <Box>
                    <Typography component='label' sx={fieldLabelSx} htmlFor='endorsement-topic-input'>
                      What would you like to be endorsed for? *
                    </Typography>
                    <TextField
                      {...field}
                      id='endorsement-topic-input'
                      fullWidth
                      error={Boolean(error)}
                      helperText={error?.message}
                      sx={endorseOutlinedFieldSx(theme)}
                    />
                  </Box>
                )}
              />

              <Box>
                <Typography component='label' sx={fieldLabelSx}>
                  Send request to *
                </Typography>
                {recipientFields.map((rField, index) => (
                  <Box
                    key={rField.id}
                    sx={{
                      display: 'flex',
                      gap: 0.5,
                      alignItems: 'flex-start',
                      mb: index < recipientFields.length - 1 ? 1 : 0
                    }}
                  >
                    <Controller
                      name={`recipients.${index}.email`}
                      control={control}
                      rules={{
                        validate: (v: string) => {
                          const t = (v ?? '').trim()
                          if (index === 0 && !t) return 'Email is required'
                          if (!t) return true
                          return EMAIL_REGEX.test(t) || 'Enter a valid email'
                        }
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type='email'
                          placeholder='name@example.com'
                          error={Boolean(error)}
                          helperText={error?.message}
                          sx={{ ...endorseOutlinedFieldSx(theme), flex: 1 }}
                        />
                      )}
                    />
                    {recipientFields.length > 1 && (
                      <IconButton
                        aria-label={`Remove recipient ${index + 1}`}
                        onClick={() => removeRecipient(index)}
                        size='small'
                        sx={{ mt: 0.5 }}
                      >
                        <CloseIcon fontSize='small' />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  type='button'
                  startIcon={<Add />}
                  onClick={() => appendRecipient({ email: '' })}
                  sx={{
                    mt: 1,
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: theme.palette.primary.main
                  }}
                >
                  Add another recipient
                </Button>
              </Box>

              <Controller
                name='personalNote'
                control={control}
                render={({ field }) => (
                  <Box>
                    <Typography component='label' sx={fieldLabelSx} htmlFor='personal-note-input'>
                      Personal message (optional)
                    </Typography>
                    <TextField
                      {...field}
                      id='personal-note-input'
                      fullWidth
                      multiline
                      minRows={3}
                      placeholder='Add a short note to include with your request…'
                      sx={endorseOutlinedFieldSx(theme)}
                    />
                  </Box>
                )}
              />

              <LegalConsentFooter variant='emailDraftTerms' />

              {invitationSent ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button
                    type='button'
                    fullWidth
                    variant='outlined'
                    onClick={handleSendAnother}
                    sx={{ textTransform: 'none' }}
                  >
                    Send another request
                  </Button>
                  <Button
                    type='button'
                    fullWidth
                    variant='text'
                    onClick={() => navigate('/feed')}
                    sx={{ textTransform: 'none' }}
                  >
                    Back to feed
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button type='submit' fullWidth variant='contained' sx={sendButtonGradientSx}>
                    Send endorsement request
                  </Button>
                  <Button
                    type='button'
                    fullWidth
                    variant='outlined'
                    startIcon={<ContentCopy />}
                    onClick={handleCopyDraft}
                    sx={{ textTransform: 'none', borderRadius: '10px', minHeight: 48 }}
                  >
                    Copy draft & link
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </form>
    </Box>
  )
}

export default RequestEndorsement
