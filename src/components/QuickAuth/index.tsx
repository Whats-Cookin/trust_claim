import { useState } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Collapse
} from '@mui/material'
import { GoogleLogin } from '@react-oauth/google'
import { useForm } from 'react-hook-form'
import axios from '../../axiosInstance'
import { connectWallet, createDidFromAddress } from '../../utils/web3Auth'
import { handleAuthSuccess } from '../../utils/authUtils'
import metaicon from '../../containers/Login/metamask-icon.svg'

interface QuickAuthProps {
  mode: 'banner' | 'dialog' | 'inline'
  onAuthenticated: () => void
  onDismiss?: () => void
  onSubmitAnonymous?: () => void
  /** Custom copy when `mode` is `dialog` */
  dialogTitle?: string
  dialogDescription?: string
  /**
   * When `mode` is `inline`, hide the MetaMask button (default true — matches platform feedback Figma).
   */
  inlineHideMetaMask?: boolean
  /** When `mode` is `dialog`, optionally hide MetaMask (e.g. platform feedback: Google + email only). */
  dialogHideMetaMask?: boolean
}

const QuickAuth = ({
  mode,
  onAuthenticated,
  onDismiss,
  onSubmitAnonymous,
  dialogTitle,
  dialogDescription,
  inlineHideMetaMask = true,
  dialogHideMetaMask = false
}: QuickAuthProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [showEmail, setShowEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>()

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true)
      setError(null)
      const { data: { accessToken, refreshToken } } = await axios.post('/auth/google', {
        googleAuthCode: credentialResponse.credential
      })
      handleAuthSuccess({ accessToken, refreshToken })
      onAuthenticated()
    } catch (err) {
      console.error('Google auth error:', err)
      setError('Google sign-in failed. Try another method.')
    } finally {
      setLoading(false)
    }
  }

  const handleMetaMask = async () => {
    try {
      setLoading(true)
      setError(null)
      const address = await connectWallet()
      const did = createDidFromAddress(address)

      handleAuthSuccess({ ethAddress: address, did })

      try {
        const res = await axios.post('/auth/wallet', { address, did })
        if (res.data.accessToken) {
          handleAuthSuccess({
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken
          })
        }
      } catch {
        // Backend wallet auth optional — client-side signing still works
      }

      onAuthenticated()
    } catch (err) {
      console.error('Wallet error:', err)
      setError('Failed to connect wallet.')
    } finally {
      setLoading(false)
    }
  }

  const onEmailSubmit = handleSubmit(async ({ email, password }) => {
    try {
      setLoading(true)
      setError(null)
      const { data: { accessToken, refreshToken } } = await axios.post('/auth/login', { email, password })
      handleAuthSuccess({ accessToken, refreshToken })
      onAuthenticated()
    } catch (err) {
      console.error('Email auth error:', err)
      setError('Sign-in failed. Check your email and password.')
    } finally {
      setLoading(false)
    }
  })

  const hasMetaMask = typeof window.ethereum !== 'undefined' && (window.ethereum as any).isMetaMask

  const showMetaMaskButton =
    hasMetaMask &&
    !(mode === 'inline' && inlineHideMetaMask) &&
    !(mode === 'dialog' && dialogHideMetaMask)

  const authButtons = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: mode === 'dialog' || mode === 'inline' ? 'column' : 'row',
        gap: mode === 'inline' ? '10px' : 2,
        alignItems: 'stretch',
        width: mode === 'inline' ? '100%' : 'auto'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: mode === 'inline' ? '10px' : '8px',
          overflow: 'hidden',
          width: mode === 'inline' ? '100%' : 'auto',
          minHeight: mode === 'inline' ? 42 : 'auto',
          border: mode === 'inline' ? '0.8px solid #CAD5E2' : 'none',
          bgcolor: mode === 'inline' ? '#fff' : 'transparent',
          boxSizing: 'border-box'
        }}
      >
        <GoogleLogin
          type='standard'
          size='medium'
          text='signin'
          shape='rectangular'
          onSuccess={handleGoogleSuccess}
          onError={() => setError('Google sign-in failed')}
        />
      </Box>

      {showMetaMaskButton && (
        <Button
          onClick={handleMetaMask}
          variant='outlined'
          disabled={loading}
          startIcon={<Box component='img' src={metaicon} alt='MetaMask' sx={{ width: 20, height: 20 }} />}
          sx={{ textTransform: 'none', borderColor: theme.palette.divider }}
        >
          MetaMask
        </Button>
      )}

      {mode === 'inline' ? (
        <Button
          type='button'
          onClick={() => setShowEmail(!showEmail)}
          variant='outlined'
          disabled={loading}
          fullWidth
          sx={{
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '14px',
            color: '#314158',
            borderColor: '#CAD5E2',
            borderRadius: '10px',
            minHeight: 42,
            py: 1
          }}
        >
          Continue with Email
        </Button>
      ) : (
        <Button
          onClick={() => setShowEmail(!showEmail)}
          variant='text'
          size='small'
          sx={{ textTransform: 'none' }}
        >
          {showEmail ? 'Hide' : 'Email sign-in'}
        </Button>
      )}
    </Box>
  )

  const emailForm = (
    <Collapse in={showEmail}>
      <Box
        component='form'
        onSubmit={onEmailSubmit}
        sx={{
          display: 'flex',
          gap: 1,
          mt: mode === 'inline' ? 1.5 : 1,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          width: mode === 'inline' ? '100%' : 'auto'
        }}
      >
        <TextField
          {...register('email', {
            required: 'Required',
            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
          })}
          size='small'
          placeholder='Email'
          type='email'
          error={!!errors.email}
          helperText={errors.email?.message as string}
          sx={{ flex: 1, minWidth: 150 }}
        />
        <TextField
          {...register('password', { required: 'Required' })}
          size='small'
          placeholder='Password'
          type='password'
          error={!!errors.password}
          helperText={errors.password?.message as string}
          sx={{ flex: 1, minWidth: 150 }}
        />
        <Button type='submit' variant='contained' size='small' disabled={loading} sx={{ textTransform: 'none', mt: '3px' }}>
          Sign in
        </Button>
      </Box>
    </Collapse>
  )

  if (mode === 'inline') {
    return (
      <Box sx={{ width: '100%' }}>
        {authButtons}
        {emailForm}
        {error && (
          <Typography variant='body2' color='error' sx={{ mt: 1.5 }}>
            {error}
          </Typography>
        )}
      </Box>
    )
  }

  if (mode === 'banner') {
    return (
      <Alert
        severity='info'
        sx={{
          '& .MuiAlert-message': { width: '100%' },
          mb: 2
        }}
      >
        <Typography variant='body2' sx={{ mb: 1, fontWeight: 600 }}>
          Signing in makes your endorsement stronger and links it to your identity.
        </Typography>
        {authButtons}
        {emailForm}
        {error && (
          <Typography variant='body2' color='error' sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Alert>
    )
  }

  // Dialog mode
  return (
    <Dialog
      open
      onClose={onDismiss}
      maxWidth='sm'
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {dialogTitle ?? 'Sign in to strengthen your endorsement'}
      </DialogTitle>
      <DialogContent>
        <Typography variant='body2' sx={{ mb: 2, color: theme.palette.text.secondary }}>
          {dialogDescription ??
            'A signed endorsement carries more weight. You can also submit without signing in.'}
        </Typography>
        {authButtons}
        {emailForm}
        {error && (
          <Typography variant='body2' color='error' sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button
          onClick={onSubmitAnonymous}
          sx={{ textTransform: 'none', color: theme.palette.text.secondary }}
        >
          Submit without signing in
        </Button>
        <Button onClick={onDismiss} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default QuickAuth
