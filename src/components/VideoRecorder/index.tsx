import React, { useState, useRef, useCallback } from 'react'
import {
  Box,
  Button,
  Typography,
  useTheme,
  Alert,
  CircularProgress,
  Paper,
  LinearProgress
} from '@mui/material'
import VideocamIcon from '@mui/icons-material/Videocam'
import StopIcon from '@mui/icons-material/Stop'
import DeleteIcon from '@mui/icons-material/Delete'
import ReplayIcon from '@mui/icons-material/Replay'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import axiosInstance from '../../axiosInstance'

interface VideoRecorderProps {
  onVideoUploaded: (videoUrl: string, thumbnailUrl?: string) => void
  onVideoRemoved?: () => void
  maxDuration?: number // in seconds
}

/**
 * VideoRecorder - Browser-based video recording with DigitalOcean Spaces upload
 *
 * Uses MediaRecorder API to capture webcam video.
 * Uploads directly to DO Spaces using presigned URL from backend.
 */
const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onVideoUploaded,
  onVideoRemoved,
  maxDuration = 30 // 30 seconds default (backend limit)
}) => {
  const theme = useTheme()
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [status, setStatus] = useState<
    'idle' | 'requesting' | 'ready' | 'recording' | 'recorded' | 'uploading' | 'uploaded' | 'error'
  >('idle')
  const [error, setError] = useState<string | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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
      setError('Could not access camera. Please ensure you have granted permission.')
      setStatus('error')
    }
  }, [])

  // Start recording
  const startRecording = useCallback(() => {
    if (!streamRef.current) return

    chunksRef.current = []
    setRecordingTime(0)

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'
    })

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
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
  }, [maxDuration])

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

  // Upload video to DigitalOcean Spaces
  const uploadVideo = useCallback(async () => {
    if (!recordedBlob) return

    setStatus('uploading')
    setUploadProgress(0)
    setError(null)

    try {
      // 1. Get presigned upload URL from backend
      const { data: uploadData } = await axiosInstance.post('/api/video/upload-url')
      const { uploadUrl, videoUrl, videoId } = uploadData

      // 2. Upload video directly to DO Spaces
      const xhr = new XMLHttpRequest()

      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = event => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            setUploadProgress(percent)
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`))
          }
        }

        xhr.onerror = () => reject(new Error('Upload failed'))

        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', 'video/webm')
        xhr.send(recordedBlob)
      })

      // 3. Success
      setUploadedVideoUrl(videoUrl)
      setStatus('uploaded')
      onVideoUploaded(videoUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload video. Please try again.')
      setStatus('recorded') // Allow retry
    }
  }, [recordedBlob, onVideoUploaded])

  // Delete recording and restart
  const deleteRecording = useCallback(() => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
    }
    setRecordedUrl(null)
    setRecordedBlob(null)
    setUploadedVideoUrl(null)
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

  return (
    <Paper
      variant='outlined'
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
        Video Testimonial (Optional)
      </Typography>

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
        {status === 'idle' && (
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
        {(status === 'recorded' || status === 'uploading' || status === 'uploaded') && recordedUrl && (
          <video
            src={uploadedVideoUrl || recordedUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            controls
            playsInline
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
        {status === 'idle' && (
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

        {status === 'recorded' && (
          <>
            <Button
              variant='contained'
              color='primary'
              startIcon={<CloudUploadIcon />}
              onClick={uploadVideo}
              sx={{ textTransform: 'none' }}
            >
              Upload Video
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
        Max {maxDuration} seconds • Video stored on DigitalOcean Spaces
      </Typography>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </Paper>
  )
}

export default VideoRecorder
