import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Box, Button, Typography, useTheme, Alert, CircularProgress, Paper, LinearProgress } from '@mui/material'
import VideocamIcon from '@mui/icons-material/Videocam'
import StopIcon from '@mui/icons-material/Stop'
import DeleteIcon from '@mui/icons-material/Delete'
import ReplayIcon from '@mui/icons-material/Replay'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import axiosInstance from '../../axiosInstance'

interface VideoRecorderProps {
  onVideoUploaded: (videoUrl: string, thumbnailUrl?: string) => void
  /** Fires whenever there is recorded footage that is not yet safely uploaded. */
  onPendingChange?: (pending: boolean) => void
  onVideoRemoved?: () => void
  maxDuration?: number // in seconds
  /** Hide the “Video Testimonial (Optional)” heading (e.g. when embedded in another layout). */
  hideHeading?: boolean
  /** Render without bordered Paper (e.g. inside a Dialog). */
  noPaper?: boolean
  /** Request camera as soon as the component mounts (dialog flow). */
  openCameraOnMount?: boolean
}

/**
 * VideoRecorder - Browser-based video recording with backend upload
 *
 * Uses MediaRecorder API to capture webcam video.
 * Uploads video to backend which stores it in DigitalOcean Spaces.
 */
const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onVideoUploaded,
  onPendingChange,
  onVideoRemoved,
  maxDuration = 30, // 30 seconds default
  hideHeading = false,
  noPaper = false,
  openCameraOnMount = false
}) => {
  const theme = useTheme()
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [status, setStatus] = useState<
    | 'idle'
    | 'requesting'
    | 'ready'
    | 'recording'
    | 'recorded'
    | 'uploading'
    | 'uploaded'
    | 'upload-failed'
    | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const autoCameraStartedRef = useRef(false)
  const autoUploadedBlobRef = useRef<Blob | null>(null)
  const playbackRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
        streamRef.current = null
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop()
        } catch {
          /* ignore */
        }
      }
    }
  }, [])

  // Request camera access
  const startCamera = useCallback(async () => {
    setStatus('requesting')
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        await videoRef.current.play()
      }

      setStatus('ready')
    } catch (err) {
      console.error('Camera access error:', err)
      // Inside the WhatsApp and Instagram browsers the camera is usually blocked
      // outright, and no permission prompt was ever shown to grant.
      setError('No camera here. If you opened this inside another app, open it in your browser instead — or just write a few words.')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (!openCameraOnMount || autoCameraStartedRef.current) return
    autoCameraStartedRef.current = true
    void startCamera()
  }, [openCameraOnMount, startCamera])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  // Start recording
  const startRecording = useCallback(() => {
    if (!streamRef.current) return

    chunksRef.current = []
    setRecordingTime(0)

    const preferred = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'].find(
      t => typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(t)
    )

    let mediaRecorder: MediaRecorder
    try {
      mediaRecorder = preferred
        ? new MediaRecorder(streamRef.current, { mimeType: preferred })
        : new MediaRecorder(streamRef.current)
    } catch (err) {
      console.error('MediaRecorder error:', err)
      setError('This browser won’t record video. Try Safari or Chrome, or just write a few words.')
      setStatus('error')
      return
    }

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType || 'video/webm' })
      const url = URL.createObjectURL(blob)
      setRecordedUrl(url)
      setRecordedBlob(blob)
      setStatus('recorded')
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start(1000) // Capture in 1-second chunks
    setStatus('recording')

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        const newTime = prev + 1
        if (newTime >= maxDuration) {
          stopRecording()
        }
        return newTime
      })
    }, 1000)
  }, [maxDuration, stopRecording])

  // Upload video to backend
  const uploadVideo = useCallback(async () => {
    if (!recordedBlob) return

    setStatus('uploading')
    setUploadProgress(0)
    setError(null)

    try {
      // Create FormData and send to backend
      const formData = new FormData()
      formData.append('video', recordedBlob, 'video.webm')

      const response = await axiosInstance.post('/api/video/upload', formData, {
        timeout: 120000, // 2 min timeout for video uploads (default 10s is too short)
        onUploadProgress: progressEvent => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            setUploadProgress(percent)
          }
        }
      })

      const { videoUrl } = response.data
      setUploadedVideoUrl(videoUrl)
      setStatus('uploaded')
      onVideoUploaded(videoUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError('That video didn’t upload. Try again, or send your words without it.')
      setStatus('upload-failed')
    }
  }, [recordedBlob, onVideoUploaded])

  // Footage that exists but isn't on the server yet would be silently lost on
  // submit, so upload it the moment recording stops. The ref keeps a failed
  // upload (which returns to 'recorded' for retry) from looping.
  useEffect(() => {
    if (status !== 'recorded' || !recordedBlob) return
    if (autoUploadedBlobRef.current === recordedBlob) return
    autoUploadedBlobRef.current = recordedBlob
    uploadVideo()
  }, [status, recordedBlob, uploadVideo])

  useEffect(() => {
    // 'upload-failed' is deliberately not pending: the form must not wait for
    // an upload that is never coming.
    onPendingChange?.(status === 'recorded' || status === 'uploading')
  }, [status, onPendingChange])

  // Delete recording and restart
  const deleteRecording = useCallback(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
    }
    setRecordedUrl(null)
    setRecordedBlob(null)
    setUploadedVideoUrl(null)
    autoUploadedBlobRef.current = null
    setStatus('idle')
    setRecordingTime(0)
    setUploadProgress(0)
    onVideoRemoved?.()
  }, [recordedUrl, onVideoRemoved])

  // Re-record
  const reRecord = useCallback(() => {
    deleteRecording()
    startCamera()
  }, [deleteRecording, startCamera])

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const content = (
    <>
      {!hideHeading && (
        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
          Video Testimonial (Optional)
        </Typography>
      )}

      {error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Video preview area */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: '#000',
          borderRadius: 1,
          overflow: 'hidden',
          mb: 2
        }}
      >
        {status === 'idle' && openCameraOnMount && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        )}

        {status === 'idle' && !openCameraOnMount && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <VideocamIcon sx={{ fontSize: 48, mb: 1, opacity: 0.7 }} />
            <Typography variant='body2' sx={{ opacity: 0.7 }}>
              Record a video testimonial
            </Typography>
          </Box>
        )}

        {status === 'requesting' && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress color='primary' />
          </Box>
        )}

        {/* Live preview */}
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: status === 'ready' || status === 'recording' ? 'block' : 'none',
            transform: 'scaleX(-1)' // Mirror for selfie view
          }}
          playsInline
        />

        {/* Recorded/uploaded video playback */}
        {(status === 'recorded' || status === 'uploading' || status === 'uploaded' || status === 'upload-failed') && recordedUrl && (
          <video
            ref={playbackRef}
            // Once uploaded, prefer the hosted copy: it is a real HTTP resource,
            // so the browser can range-request the end and work out the length.
            src={uploadedVideoUrl || recordedUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#000'
            }}
            controls
            playsInline
            // MediaRecorder writes webm with no duration in the header, so the
            // element reports Infinity and will not seek or play. Seeking past
            // the end forces the browser to measure it. The timeout matters: if
            // the seek is refused the position must still come back to zero,
            // otherwise playback sits at the end and the play button does nothing.
            onError={() => {
              const el = playbackRef.current
              console.error('Playback error', el?.error?.code, el?.error?.message, el?.currentSrc)
              setError('Could not play that back. The recording was still saved.')
            }}
            onLoadedMetadata={() => {
              const el = playbackRef.current
              console.log('Playback metadata: duration', el?.duration, 'src', el?.currentSrc)
              if (!el || el.duration !== Infinity) return
              const reset = () => {
                try {
                  el.currentTime = 0
                } catch {
                  /* nothing more to do */
                }
              }
              el.addEventListener('seeked', reset, { once: true })
              el.addEventListener('durationchange', reset, { once: true })
              try {
                el.currentTime = 1e101
              } catch {
                reset()
              }
              window.setTimeout(reset, 800)
            }}
          />
        )}

        {/* Recording indicator */}
        {status === 'recording' && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              px: 1.5,
              py: 0.5,
              borderRadius: 1
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: 'red',
                animation: 'pulse 1s infinite'
              }}
            />
            <Typography variant='body2' sx={{ color: 'white', fontWeight: 600 }}>
              {formatTime(recordingTime)} / {formatTime(maxDuration)}
            </Typography>
          </Box>
        )}

        {/* Upload progress overlay */}
        {status === 'uploading' && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)'
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: 'white', mb: 2 }} />
            <Typography variant='body2' sx={{ color: 'white', mb: 1 }}>
              Uploading... {uploadProgress}%
            </Typography>
            <LinearProgress
              variant='determinate'
              value={uploadProgress}
              sx={{ width: '60%', height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        {/* Uploaded success indicator */}
        {status === 'uploaded' && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'rgba(46, 125, 50, 0.9)',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 18 }} />
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              Uploaded
            </Typography>
          </Box>
        )}
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        {status === 'idle' && !openCameraOnMount && (
          <Button variant='contained' startIcon={<VideocamIcon />} onClick={startCamera} sx={{ textTransform: 'none' }}>
            Enable Camera
          </Button>
        )}

        {status === 'ready' && (
          <Button
            variant='contained'
            color='error'
            startIcon={<VideocamIcon />}
            onClick={startRecording}
            sx={{ textTransform: 'none' }}
          >
            Start Recording
          </Button>
        )}

        {status === 'recording' && (
          <Button
            variant='contained'
            color='error'
            startIcon={<StopIcon />}
            onClick={stopRecording}
            sx={{ textTransform: 'none' }}
          >
            Stop Recording
          </Button>
        )}

        {(status === 'recorded' || status === 'upload-failed') && (
          <>
            <Button
              variant='contained'
              color='primary'
              startIcon={<CloudUploadIcon />}
              onClick={uploadVideo}
              sx={{ textTransform: 'none' }}
            >
              {status === 'upload-failed' ? 'Try the upload again' : 'Upload Video'}
            </Button>
            <Button variant='outlined' startIcon={<ReplayIcon />} onClick={reRecord} sx={{ textTransform: 'none' }}>
              Re-record
            </Button>
          </>
        )}

        {status === 'uploaded' && (
          <>
            <Button variant='outlined' startIcon={<ReplayIcon />} onClick={reRecord} sx={{ textTransform: 'none' }}>
              Record New
            </Button>
            <Button
              variant='outlined'
              color='error'
              startIcon={<DeleteIcon />}
              onClick={deleteRecording}
              sx={{ textTransform: 'none' }}
            >
              Remove
            </Button>
          </>
        )}
      </Box>

      <Typography
        variant='caption'
        sx={{ display: 'block', textAlign: 'center', mt: 1, color: theme.palette.text.secondary }}
      >
        Max {maxDuration} seconds
      </Typography>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  )

  if (noPaper) {
    return <Box sx={{ width: '100%', pt: 0 }}>{content}</Box>
  }

  return (
    <Paper
      variant='outlined'
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper
      }}
    >
      {content}
    </Paper>
  )
}

export default VideoRecorder
