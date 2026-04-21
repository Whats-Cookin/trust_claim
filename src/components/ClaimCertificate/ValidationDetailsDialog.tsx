import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, IconButton, Box, Typography, Link as MuiLink } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import { ValidationDetailsDialogProps } from '../../types/certificate'
import { useTheme, useMediaQuery } from '@mui/material'

// Helper to detect if a URL is a video
const isVideoUrl = (url?: string): boolean => {
  if (!url) return false
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov']
  const lowerUrl = url.toLowerCase()
  return videoExtensions.some(ext => lowerUrl.includes(ext))
}

const ValidationDetailsDialog: React.FC<ValidationDetailsDialogProps> = ({ open, onClose, validation }) => {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))
  const [videoPlaying, setVideoPlaying] = useState(false)

  // Reset video playing state when dialog closes
  useEffect(() => {
    if (!open) {
      setVideoPlaying(false)
    }
  }, [open])

  if (!validation) return null

  // Check for video - either explicit videoUrl or video-like mediaUrl/image
  const videoUrl =
    validation.videoUrl ||
    (isVideoUrl(validation.mediaUrl) ? validation.mediaUrl : undefined) ||
    (isVideoUrl(validation.image) ? validation.image : undefined)

  // Check for image (only if not a video)
  const imageUrl = !videoUrl && validation.image ? validation.image : undefined

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      sx={{
        '& .MuiDialog-paper': {
          width: { xs: '95%', sm: '90%', md: '85%' },
          maxWidth: '800px',
          maxHeight: { xs: '95vh', sm: '90vh' },
          borderRadius: { xs: '8px', sm: '10px', md: '12px' },
          backgroundColor: '#FFFFFF',
          overflowY: 'auto'
        }
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: { xs: 6, sm: 8 },
            top: { xs: 6, sm: 8 },
            color: '#212529',
            zIndex: 1,
            padding: { xs: '4px', sm: '8px' }
          }}
          size={isXs ? 'small' : 'medium'}
        >
          <CloseIcon fontSize={isXs ? 'small' : 'medium'} />
        </IconButton>
        <Box sx={{ padding: { xs: 2, sm: 2.5, md: 3 } }}>
          <Box sx={{ marginBottom: { xs: 2, sm: 2.5, md: 3 } }}>
            {validation.subject && (
              <Box
                sx={{
                  fontSize: { xs: '16px', sm: '18px', md: '20px' },
                  fontWeight: 500,
                  color: '#2D6A4F',
                  marginBottom: { xs: 1.5, sm: 2 },
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}
              >
                <MuiLink
                  href={validation.sourceURI}
                  target='_blank'
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    },
                    wordBreak: 'break-word'
                  }}
                >
                  {validation.sourceURI}
                  <OpenInNewIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                </MuiLink>
              </Box>
            )}
            <Typography
              sx={{
                fontSize: { xs: '18px', sm: '20px', md: '24px' },
                fontWeight: 500,
                color: '#2D6A4F',
                marginBottom: { xs: 1.5, sm: 2 }
              }}
            >
              {validation.issuer_name}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '14px', sm: '15px', md: '16px' },
                color: '#212529',
                marginBottom: { xs: 1.5, sm: 2 },
                lineHeight: 1.6
              }}
            >
              {validation.statement}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '12px', sm: '13px', md: '14px' },
                color: '#495057',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {validation.effectiveDate &&
                new Date(validation.effectiveDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
            </Typography>

            {/* Video Testimonial */}
            {videoUrl && (
              <Box
                sx={{
                  mt: { xs: 2, sm: 2.5 },
                  width: '100%',
                  maxWidth: { xs: '100%', sm: 360, md: 420 }
                }}
              >
                <Typography
                  sx={{
                    color: '#495057',
                    mb: 1,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    fontSize: { xs: 10, sm: 11 },
                    fontWeight: 600
                  }}
                >
                  Video Testimonial
                </Typography>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16/9',
                    backgroundColor: '#f5f5f5',
                    borderRadius: { xs: '6px', sm: '8px' },
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  {!videoPlaying ? (
                    <Box
                      onClick={() => setVideoPlaying(true)}
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, rgba(102,126,234,0.9) 0%, rgba(118,75,162,0.9) 100%)',
                        transition: 'opacity 0.2s ease',
                        '&:hover': { opacity: 0.92 }
                      }}
                    >
                      <Box sx={{ textAlign: 'center', color: 'white' }}>
                        <PlayCircleOutlineIcon sx={{ fontSize: { xs: 40, sm: 48 }, mb: 0.5 }} />
                        <Typography sx={{ fontWeight: 500, fontSize: { xs: 12, sm: 14 } }}>Play video</Typography>
                      </Box>
                    </Box>
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* Image */}
            {imageUrl && (
              <Box
                sx={{
                  mt: { xs: 2, sm: 2.5 },
                  width: '100%',
                  maxWidth: { xs: '100%', sm: 360, md: 420 }
                }}
              >
                <Box
                  sx={{
                    borderRadius: { xs: '6px', sm: '8px' },
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                >
                  <img src={imageUrl} alt='' style={{ width: '100%', display: 'block' }} />
                </Box>
              </Box>
            )}
          </Box>
          <Box sx={{ marginTop: { xs: 2, sm: 2.5, md: 3 } }}>
            {validation.howKnown && (
              <Box sx={{ marginBottom: { xs: 1.5, sm: 2 } }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: '#495057',
                    minWidth: { xs: '120px', sm: '140px', md: '150px' },
                    display: { xs: 'block', sm: 'inline-block' },
                    fontSize: { xs: '13px', sm: '14px' }
                  }}
                >
                  How Known:
                </Typography>
                <Typography
                  sx={{
                    color: '#212529',
                    fontSize: { xs: '13px', sm: '14px' }
                  }}
                >
                  {validation.howKnown.replace(/_/g, ' ')}
                </Typography>
              </Box>
            )}
            {validation.sourceURI && (
              <Box sx={{ marginBottom: { xs: 1.5, sm: 2 } }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: '#495057',
                    minWidth: { xs: '120px', sm: '140px', md: '150px' },
                    display: { xs: 'block', sm: 'inline-block' },
                    fontSize: { xs: '13px', sm: '14px' }
                  }}
                >
                  Source:
                </Typography>
                <Typography>
                  <MuiLink
                    href={validation.sourceURI}
                    target='_blank'
                    sx={{
                      color: '#2D6A4F',
                      textDecoration: 'none',
                      fontSize: { xs: '13px', sm: '14px' },
                      '&:hover': {
                        textDecoration: 'underline'
                      },
                      wordBreak: 'break-word'
                    }}
                  >
                    {validation.sourceURI}
                  </MuiLink>
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ValidationDetailsDialog
