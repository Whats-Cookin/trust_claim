import React, { useEffect, useRef, useState } from 'react'
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Backdrop
} from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import CloseIcon from '@mui/icons-material/Close'
import { useNavigate } from 'react-router-dom'
import axios from '../../axiosInstance'

interface CredentialPopupProps {
  selectedClaimId: string
  isOpen: boolean
  onClose: () => void
}
const CredentialPopup = ({ isOpen, onClose, selectedClaimId }: CredentialPopupProps) => {
  const handleClose = () => {
    onClose()
  }

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth='sm'
        fullWidth={false}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.7)' }
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'transparent',
            boxShadow: 'none',
            maxWidth: 450,
            margin: 0
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <CredentialDetails handleClose={handleClose} selectedClaimId={selectedClaimId} />
        </DialogContent>
      </Dialog>
    </>
  )
}

const CredentialDetails = ({ handleClose, selectedClaimId }: any) => {
  const navigate = useNavigate()
  const [credentialData, setCredentialData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const descriptionRef = useRef<HTMLDivElement>(null)

  const truncateIssuerId = (issuerId: string) => {
    if (issuerId.length > 28) {
      return `${issuerId.substring(0, 15)}...${issuerId.slice(-10)}`
    }
    return issuerId
  }

  useEffect(() => {
    async function fetchCredentialDetails() {
      setIsLoading(true)
      const claimRes = await axios.get(`/api/claim/${selectedClaimId}`)
      setCredentialData(claimRes.data.claim)
      setIsLoading(false)
    }
    fetchCredentialDetails()
  }, [selectedClaimId])

  useEffect(() => {
    if (descriptionRef.current && credentialData?.statement) {
      const element = descriptionRef.current
      setHasOverflow(element.scrollHeight > element.clientHeight)
    }
  }, [credentialData?.statement])

  if (isLoading) {
    return (
      <Card
        sx={{
          maxWidth: 450,
          borderRadius: 2,
          bgcolor: '#1e1e2d',
          color: 'white',
          border: '1px solid #2d2d3d',
          position: 'relative'
        }}
      >
        <CardContent sx={{ pt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant='h5' component='div' sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Loading...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        maxWidth: 450,
        borderRadius: 2,
        bgcolor: '#1e1e2d',
        color: 'white',
        border: '1px solid #2d2d3d',
        position: 'relative'
      }}
    >
      <IconButton
        aria-label='close'
        onClick={handleClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: '#a0a0b0',
          '&:hover': {
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)'
          }
        }}
      >
        <CloseIcon />
      </IconButton>

      <CardContent sx={{ pt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant='h5' component='div' sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            {credentialData.name || 'Untitled Credential'}
            <Box component='span' sx={{ ml: 1 }}>
              <VerifiedIcon sx={{ color: '#00c9a7', fontSize: 20 }} />
            </Box>
          </Typography>
        </Box>
        <Typography variant='body2' color='text.secondary' sx={{ color: '#a0a0b0', mb: 2 }}>
          Issued by {truncateIssuerId(credentialData.issuerId)}
        </Typography>
        {credentialData.subject && (
          <Typography variant='body2' color='text.secondary' sx={{ color: '#a0a0b0', mb: 2 }}>
            Verification URL: {credentialData.subject.length > 40 ? 
              `${credentialData.subject.substring(0, 20)}...${credentialData.subject.slice(-20)}` : 
              credentialData.subject}
          </Typography>
        )}
        <Box sx={{ mb: 2 }}>
          <Typography variant='body2' color='text.secondary' sx={{ color: '#a0a0b0', display: 'flex', mb: 0.5 }}>
            <Box component='span' sx={{ width: 100 }}>
              Description:
            </Box>
            <Box component='span' sx={{ flexGrow: 1 }}>
              <Box
                ref={descriptionRef}
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: isExpanded ? 'unset' : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.5
                }}
              >
                {credentialData.statement}
              </Box>
              {hasOverflow && (
                <Button
                  onClick={() => setIsExpanded(!isExpanded)}
                  sx={{
                    ml: 1,
                    color: '#00c9a7',
                    textTransform: 'none',
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': { backgroundColor: 'transparent' }
                  }}
                >
                  {isExpanded ? 'Read less' : 'Read more'}
                </Button>
              )}
            </Box>
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ color: '#a0a0b0', display: 'flex' }}>
            <Box component='span' sx={{ width: 100 }}>
              Issued On:
            </Box>
            <Box component='span'>
              {new Date(credentialData.effectiveDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Box>
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Button
          variant='contained'
          sx={{
            bgcolor: '#00c9a7',
            '&:hover': { bgcolor: '#00b096' },
            borderRadius: 1
          }}
          onClick={() => navigate(`/report/${selectedClaimId}`)}
        >
          View Full Details
        </Button>
        <Button
          variant='outlined'
          sx={{
            color: 'white',
            borderColor: 'white',
            borderRadius: 1,
            '&:hover': {
              borderColor: '#bbbbbb',
              bgcolor: 'rgba(255,255,255,0.05)'
            }
          }}
        >
          Share Credential
        </Button>
      </CardActions>
    </Card>
  )
}

export default CredentialPopup
