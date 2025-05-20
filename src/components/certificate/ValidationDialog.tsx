import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Card,
  Typography
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { ValidationDialogProps } from '../../types/certificate'
import { validationCardStyles, truncateText } from '../../constants/certificateStyles'
import { useTheme, useMediaQuery } from '@mui/material'

const ValidationDialog: React.FC<ValidationDialogProps> = ({
  open,
  onClose,
  validations,
  onValidationClick
}) => {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
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
      <DialogTitle
        sx={{
          color: '#2D6A4F',
          fontSize: { xs: '20px', sm: '22px', md: '24px' },
          fontWeight: 600,
          textAlign: 'center',
          padding: { xs: 2, sm: 2.5, md: 3 }
        }}
      >
        All Validations
      </DialogTitle>
      <DialogContent sx={{ padding: { xs: 2, sm: 2.5, md: 3 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 2.5
          }}
        >
          {validations?.map((validation, index) => (
            <Card
              key={index}
              onClick={() => onValidationClick(validation)}
              sx={{
                ...validationCardStyles,
                minHeight: { xs: '180px', sm: '190px' }
              }}
            >
              <Typography
                color='#2D6A4F'
                fontWeight={500}
                fontSize={{ xs: 18, sm: 20 }}
                marginBottom={1.5}
                sx={{
                  wordBreak: 'break-word',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {validation.issuer_name}
              </Typography>
              <Typography
                color='#212529'
                fontSize={{ xs: 14, sm: 16 }}
                sx={{
                  flexGrow: 1,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  marginBottom: 3.5
                }}
              >
                {truncateText(validation.statement || '', isXs ? 70 : 90)}
              </Typography>
              <Button
                onClick={e => {
                  e.stopPropagation()
                  onValidationClick(validation)
                }}
                endIcon={<OpenInNewIcon sx={{ fontSize: 18 }} />}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  color: '#2D6A4F',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '14px',
                  padding: 0,
                  minWidth: 'auto',
                  textDecoration: 'underline',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                see all
              </Button>
            </Card>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: { xs: '12px 16px', sm: '14px 20px', md: '16px 24px' } }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#2D6A4F',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: { xs: '14px', sm: '15px', md: '16px' },
            '&:hover': {
              backgroundColor: 'rgba(45, 106, 79, 0.04)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ValidationDialog 