import React from 'react'
import { Popover, Box, Button } from '@mui/material'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { SharePopoverProps } from '../../types/certificate'

const SharePopover: React.FC<SharePopoverProps> = ({
  anchorEl,
  onClose,
  onCopyLink,
  onLinkedInShare
}) => {
  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      sx={{
        '& .MuiPopover-paper': {
          width: { xs: '200px', sm: 'auto' },
          padding: { xs: 1, sm: 1.5, md: 2 }
        }
      }}
    >
      <Box
        sx={{
          p: { xs: 1, sm: 1.5, md: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: { xs: 0.5, sm: 1 }
        }}
      >
        <Button
          startIcon={<LinkedInIcon />}
          onClick={onLinkedInShare}
          sx={{
            color: '#2D6A4F',
            justifyContent: 'flex-start',
            fontSize: { xs: '13px', sm: '14px', md: '15px' }
          }}
        >
          Share on LinkedIn
        </Button>
        <Button
          startIcon={<ContentCopyIcon />}
          onClick={onCopyLink}
          sx={{
            color: '#2D6A4F',
            justifyContent: 'flex-start',
            fontSize: { xs: '13px', sm: '14px', md: '15px' }
          }}
        >
          Copy Link
        </Button>
      </Box>
    </Popover>
  )
}

export default SharePopover 