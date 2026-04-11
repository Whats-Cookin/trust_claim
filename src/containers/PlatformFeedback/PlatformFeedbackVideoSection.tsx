import { useState, useCallback, type KeyboardEvent } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import VideocamIcon from '@mui/icons-material/Videocam'
import CloseIcon from '@mui/icons-material/Close'
import VideoRecorder from '../../components/VideoRecorder'
import { neutralColors } from '../../theme/colors'

interface PlatformFeedbackVideoSectionProps {
  videoUrl: string | null
  onVideoUploaded: (url: string) => void
  onVideoRemoved: () => void
}

const PlatformFeedbackVideoSection = ({ videoUrl, onVideoUploaded, onVideoRemoved }: PlatformFeedbackVideoSectionProps) => {
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState(0)

  const toggle = useCallback(() => {
    setOpen(prev => {
      if (!prev) setSession(s => s + 1)
      return !prev
    })
  }, [])

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggle()
      }
    },
    [toggle]
  )

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box
        role='button'
        tabIndex={0}
        onClick={toggle}
        onKeyDown={onKeyDown}
        aria-label='Add optional video testimonial'
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: '10px 18px',
          minHeight: 67,
          bgcolor: '#F8FAFC',
          border: '1.6px dashed #CAD5E2',
          borderRadius: '10px',
          cursor: 'pointer',
          outline: 'none',
          '&:focus-visible': { boxShadow: theme => `0 0 0 2px ${theme.palette.primary.main}` }
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: '#E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {videoUrl ? (
            <Box
              component='video'
              src={videoUrl}
              muted
              playsInline
              sx={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <VideocamIcon sx={{ fontSize: 20, color: neutralColors.gray[600] }} />
          )}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '20px', color: '#314158' }}>
            Add video testimonial
          </Typography>
          <Typography sx={{ fontSize: '12px', fontWeight: 500, lineHeight: '16px', color: '#62748E' }}>
            Optional - Record or upload
          </Typography>
        </Box>
      </Box>

      <Collapse in={open} timeout='auto' unmountOnExit>
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0F172B' }}>Record a video</Typography>
            <IconButton aria-label='Close video recorder' size='small' onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <VideoRecorder
            key={session}
            hideHeading
            noPaper
            openCameraOnMount
            maxDuration={60}
            onVideoUploaded={url => {
              onVideoUploaded(url)
              setOpen(false)
            }}
            onVideoRemoved={onVideoRemoved}
          />
        </Box>
      </Collapse>
    </Box>
  )
}

export default PlatformFeedbackVideoSection
