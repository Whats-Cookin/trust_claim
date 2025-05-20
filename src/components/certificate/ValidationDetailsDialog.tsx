import React from 'react'
import { Dialog, DialogContent, IconButton, Box, Typography, Link as MuiLink } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { ValidationDetailsDialogProps } from '../../types/certificate'
import { useTheme, useMediaQuery } from '@mui/material'

const ValidationDetailsDialog: React.FC<ValidationDetailsDialogProps> = ({ open, onClose, validation }) => {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))

  if (!validation) return null

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
            {validation.confidence !== undefined && (
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
                  Confidence:
                </Typography>
                <Typography
                  sx={{
                    color: '#212529',
                    fontSize: { xs: '13px', sm: '14px' }
                  }}
                >
                  {validation.confidence}
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
