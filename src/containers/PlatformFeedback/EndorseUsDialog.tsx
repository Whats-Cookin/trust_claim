import { useNavigate } from 'react-router-dom'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import CloseIcon from '@mui/icons-material/Close'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'

export interface EndorseUsDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * “Endorse Us” entry: pick Rating vs Endorsement, then navigate to the corresponding form.
 */
const EndorseUsDialog = ({ open, onClose }: EndorseUsDialogProps) => {
  const navigate = useNavigate()

  const goRating = () => {
    onClose()
    navigate('/feedback/rating')
  }

  const goEndorsement = () => {
    onClose()
    navigate('/feedback/endorsement')
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth aria-labelledby='endorse-us-dialog-title'>
      <DialogTitle
        id='endorse-us-dialog-title'
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}
      >
        <Typography component='span' variant='h6' sx={{ fontWeight: 600 }}>
          Share feedback about LinkedTrust
        </Typography>
        <IconButton aria-label='Close' onClick={onClose} edge='end' size='small'>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0, pb: 3 }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5 }}>
          Choose how you would like to respond.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant='outlined'
            onClick={goRating}
            sx={{
              py: 2,
              px: 2,
              borderRadius: '12px',
              borderColor: '#CAD5E2',
              textTransform: 'none',
              justifyContent: 'flex-start',
              gap: 2
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                bgcolor: '#DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <StarOutlineIcon sx={{ color: '#155DFC' }} />
            </Box>
            <Box sx={{ textAlign: 'left' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '15px', color: 'text.primary' }}>Rating</Typography>
              <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>Rate your experience with linkedtrust.us</Typography>
            </Box>
          </Button>
          <Button
            variant='outlined'
            onClick={goEndorsement}
            sx={{
              py: 2,
              px: 2,
              borderRadius: '12px',
              borderColor: '#CAD5E2',
              textTransform: 'none',
              justifyContent: 'flex-start',
              gap: 2
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '10px',
                bgcolor: '#DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RateReviewOutlinedIcon sx={{ color: '#155DFC' }} />
            </Box>
            <Box sx={{ textAlign: 'left' }}>
              <Typography sx={{ fontWeight: 600, fontSize: '15px', color: 'text.primary' }}>Endorsement</Typography>
              <Typography sx={{ fontSize: '13px', color: 'text.secondary' }}>Write an endorsement for linkedtrust.us</Typography>
            </Box>
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default EndorseUsDialog
