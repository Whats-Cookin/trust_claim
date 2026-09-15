import React, { useState } from 'react'
import { Box, Button, Link, MenuItem, Snackbar, TextField, Typography } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import axios from '../../axiosInstance'
import { ratingAspectOptions } from '../../containers/PlatformFeedback/ratingAspectOptions'

const ink = '#1B2430'
const muted = '#6B7684'
const rule = '#E6E9EE'

/**
 * Builds a personal testimonial link. Everything filled in here is already
 * answered for the recipient, so their page is just a box for their words.
 */
const RequestTestimonial: React.FC = () => {
  const [form, setForm] = useState({
    recipientName: '',
    recipientProfile: '',
    subjectUri: '',
    subjectName: '',
    workSummary: '',
    suggestions: '',
    aspect: '',
    note: '',
    requesterName: ''
  })
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const create = async () => {
    if (!form.subjectUri.trim()) return setError('Add what they’ll be talking about.')
    setError(null)
    setBusy(true)
    try {
      const { data } = await axios.post('/api/testimonial-requests', form)
      setUrl(data.url)
    } catch {
      setError('Couldn’t create the link. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const field = { mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 15 } }

  return (
    <Box sx={{ bgcolor: '#fff', color: ink, px: 3, py: 5, minHeight: 'calc(100vh - 64px)' }}>
      <Box sx={{ maxWidth: 540, mx: 'auto' }}>
        <Typography sx={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em', mb: 0.5 }}>
          Request a rating
        </Typography>
        <Typography sx={{ color: muted, fontSize: 15.5, lineHeight: 1.55, mb: 3.5 }}>
          Make a personal link and send it however you like. They write a few words and send. No sign-in, no account.
        </Typography>

        <TextField value={form.recipientName} onChange={set('recipientName')} fullWidth label='Their first name' placeholder='Sahra' sx={field} />
        <TextField value={form.recipientProfile} onChange={set('recipientProfile')} fullWidth label='Their profile link (optional)' placeholder='https://www.linkedin.com/in/sahra' sx={field} />
        <TextField value={form.subjectUri} onChange={set('subjectUri')} fullWidth label='What they’re rating' placeholder='https://yourcompany.com' sx={field} />
        <TextField value={form.subjectName} onChange={set('subjectName')} fullWidth label='Its name (optional)' placeholder='Your Company' sx={field} />
        <TextField value={form.workSummary} onChange={set('workSummary')} fullWidth label='What the work was' placeholder='the Q2 data pipeline migration' sx={field} />
        <TextField value={form.suggestions} onChange={set('suggestions')} fullWidth multiline minRows={2} label='Suggestions for them (optional)' placeholder='Anything you would like them to mention. Your words, shown to them behind a "Not sure what to say?" link.' sx={field} />
        <TextField value={form.aspect} onChange={set('aspect')} select fullWidth label='Aspect (optional)' sx={field}>
          <MenuItem value=''>Let them speak freely</MenuItem>
          {ratingAspectOptions.map(o => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        <TextField value={form.note} onChange={set('note')} fullWidth multiline minRows={3} label='Your note to them' placeholder={`Hi${form.recipientName ? ` ${form.recipientName}` : ''}, it was great working together. Would you mind sharing a few words?`} sx={field} />
        <TextField value={form.requesterName} onChange={set('requesterName')} fullWidth label='Your name' placeholder='Golda' sx={field} />

        {error && <Typography sx={{ color: '#B3261E', fontSize: 14.5, mb: 1.5 }}>{error}</Typography>}

        <Button
          onClick={create}
          disabled={busy}
          fullWidth
          variant='contained'
          disableElevation
          sx={{ textTransform: 'none', borderRadius: '12px', py: 1.4, fontSize: 16.5, fontWeight: 600, bgcolor: ink, '&:hover': { bgcolor: '#0F1720' } }}
        >
          {busy ? 'Creating…' : 'Create link'}
        </Button>

        {url && (
          <Box sx={{ mt: 3.5, pt: 3, borderTop: `1px solid ${rule}` }}>
            <Typography sx={{ fontSize: 15, mb: 1.5 }}>Ready to send:</Typography>
            <Typography sx={{ fontSize: 17, fontWeight: 600, wordBreak: 'break-all', mb: 2 }}>{url}</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant='contained'
                disableElevation
                startIcon={<ContentCopyIcon />}
                onClick={() => {
                  navigator.clipboard.writeText(url)
                  setCopied(true)
                }}
                sx={{ textTransform: 'none', borderRadius: '10px', bgcolor: ink, '&:hover': { bgcolor: '#0F1720' } }}
              >
                Copy
              </Button>
              <Link href={url} target='_blank' rel='noopener noreferrer' sx={{ fontSize: 15 }}>
                See what they’ll see
              </Link>
            </Box>
          </Box>
        )}
      </Box>
      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)} message='Link copied' />
    </Box>
  )
}

export default RequestTestimonial
