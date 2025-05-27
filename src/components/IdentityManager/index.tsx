import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material'
import {
  Edit,
  Delete,
  Info,
  AccountBalanceWallet,
  Key
} from '@mui/icons-material'
import {
  getUserIdentity,
  setCustomDid,
  clearCustomDid,
  getIdentityDisplayName,
  createDidFromAddress,
  getCurrentAccount
} from '../../utils/web3Auth'

interface IdentityManagerProps {
  open: boolean
  onClose: () => void
  onIdentityChange?: () => void
}

export const IdentityManager: React.FC<IdentityManagerProps> = ({
  open,
  onClose,
  onIdentityChange
}) => {
  const theme = useTheme()
  const [currentIdentity, setCurrentIdentity] = useState(getUserIdentity())
  const [customDidInput, setCustomDidInput] = useState('')
  const [error, setError] = useState('')
  const [ethAddress, setEthAddress] = useState<string | null>(null)

  useEffect(() => {
    // Get current Ethereum address if connected
    getCurrentAccount().then(setEthAddress)
    // Update identity when dialog opens
    if (open) {
      setCurrentIdentity(getUserIdentity())
    }
  }, [open])

  const handleSetCustomDid = () => {
    try {
      setError('')
      
      // Validate DID format
      if (!customDidInput.startsWith('did:')) {
        setError('DID must start with "did:"')
        return
      }
      
      // Basic DID validation (method:specific-identifier)
      const didParts = customDidInput.split(':')
      if (didParts.length < 3) {
        setError('Invalid DID format. Expected: did:method:identifier')
        return
      }
      
      setCustomDid(customDidInput)
      setCurrentIdentity(getUserIdentity())
      setCustomDidInput('')
      onIdentityChange?.()
    } catch (err: any) {
      setError(err.message || 'Failed to set DID')
    }
  }

  const handleClearCustomDid = () => {
    clearCustomDid()
    setCurrentIdentity(getUserIdentity())
    onIdentityChange?.()
  }

  const handleClose = () => {
    setError('')
    setCustomDidInput('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Manage Your Identity
        <Tooltip title="Your identity is used to sign claims and establish trust">
          <IconButton size="small" sx={{ ml: 1 }}>
            <Info fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Current Identity
          </Typography>
          
          <Box sx={{ 
            p: 2, 
            border: 1, 
            borderColor: 'divider', 
            borderRadius: 1,
            backgroundColor: theme.palette.background.default
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {currentIdentity.did?.startsWith('did:ethr') ? (
                <AccountBalanceWallet fontSize="small" />
              ) : (
                <Key fontSize="small" />
              )}
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {currentIdentity.did || currentIdentity.address || 'No identity set'}
              </Typography>
            </Box>
            
            <Chip 
              label={currentIdentity.idType} 
              size="small" 
              color={currentIdentity.idType === 'DID' ? 'primary' : 'default'}
            />
            
            {currentIdentity.did && localStorage.getItem('userDid') && (
              <IconButton 
                size="small" 
                onClick={handleClearCustomDid}
                sx={{ ml: 1 }}
                color="error"
              >
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {ethAddress && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Ethereum Address
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {ethAddress}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Default DID: {createDidFromAddress(ethAddress)}
            </Typography>
          </Box>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Use Custom DID
          </Typography>
          <Typography variant="caption" color="text.secondary" paragraph>
            If you have a DID from another system (did:key, did:web, did:ion, etc.), 
            you can use it here.
          </Typography>
          
          <TextField
            fullWidth
            label="Custom DID"
            placeholder="did:key:z6MkhaXgBZD..."
            value={customDidInput}
            onChange={(e) => setCustomDidInput(e.target.value)}
            error={!!error}
            helperText={error || 'Example: did:key:z6MkhaXgBZD...'}
            sx={{ mb: 2 }}
          />
          
          <Button 
            variant="contained" 
            onClick={handleSetCustomDid}
            disabled={!customDidInput}
            startIcon={<Edit />}
          >
            Set Custom DID
          </Button>
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            Your DID identifies you across all your claims. Using a custom DID allows 
            you to maintain the same identity across different systems.
          </Typography>
        </Alert>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

// Simple button to open the identity manager
export const IdentityButton: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [identity, setIdentity] = useState(getIdentityDisplayName())
  
  const handleIdentityChange = () => {
    setIdentity(getIdentityDisplayName())
  }
  
  return (
    <>
      <Chip
        icon={<Key />}
        label={identity}
        onClick={() => setOpen(true)}
        variant="outlined"
        size="small"
      />
      
      <IdentityManager 
        open={open} 
        onClose={() => setOpen(false)}
        onIdentityChange={handleIdentityChange}
      />
    </>
  )
}
