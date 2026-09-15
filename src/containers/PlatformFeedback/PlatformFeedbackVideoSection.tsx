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
  /** Show the recorder itself rather than a trigger the user must find. */
  alwaysOpen?: boolean
  /** Heading above the recorder when alwaysOpen. */
  heading?: string
  videoUrl: string | null
  onVideoUploaded: (url: string) => void
  onVideoRemoved: () => void
  /** Fires while footage is recorded but not yet uploaded. */
  onPendingChange?: (pending: boolean) => void
  /** Opening the camera unprompted is hostile in an in-app browser; opt out. */
  autoOpenCamera?: boolean
  /** Render as a quiet text link rather than a dashed drop-zone row. */
  compact?: boolean
}

const PlatformFeedbackVideoSection = ({
  videoUrl,
  onVideoUploaded,
  onVideoRemoved,
  onPendingChange,
  autoOpenCamera = true,
  compact = false,
  alwaysOpen = false,
  heading
}: PlatformFeedbackVideoSectionProps) => {
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

  if (alwaysOpen) {
    return (
      <Box sx={{ mb: 2.5 }}>
        {heading && (
          <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#1B2430', mb: 1.25, lineHeight: 1.5 }}>
            {heading}
          </Typography>
        )}
        <VideoRecorder
          hideHeading
          noPaper
          openCameraOnMount={autoOpenCamera}
          maxDuration={60}
          onVideoUploaded={onVideoUploaded}
          onVideoRemoved={onVideoRemoved}
          onPendingChange={onPendingChange}
        />
      </Box>
    )
  }

  return (
    <Box sx={{ mb: compact ? 0 : 2.5 }}>
      {compact ? (
        <Box
          role='button'
          tabIndex={0}
          onClick={toggle}
          onKeyDown={onKeyDown}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            cursor: 'pointer',
            color: '#155DFC',
            fontSize: 14,
            outline: 'none',
            '&:focus-visible': { textDecoration: 'underline' }
          }}
        >
          <VideocamIcon sx={{ fontSize: 18 }} />
          <Typography sx={{ fontSize: 14, color: 'inherit' }}>
            {videoUrl ? 'Video added, change it' : 'Rather say it out loud? Record a short video'}
          </Typography>
        </Box>
      ) : (
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
      )}

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
            openCameraOnMount={autoOpenCamera}
            maxDuration={60}
            onVideoUploaded={url => {
              onVideoUploaded(url)
              setOpen(false)
            }}
            onPendingChange={onPendingChange}
            onVideoRemoved={onVideoRemoved}
          />
        </Box>
      </Collapse>
    </Box>
  )
}

export default PlatformFeedbackVideoSection
