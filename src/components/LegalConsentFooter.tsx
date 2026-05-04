import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'

const lineSx = {
  fontSize: '12px',
  lineHeight: 1.5,
  color: '#62748E',
  textAlign: 'center' as const,
  letterSpacing: '0.01em',
  m: 0
}

const linkSx = { color: '#155DFC' }

export type LegalConsentFooterVariant = 'rating' | 'endorsement' | 'emailDraftTerms'

interface LegalConsentFooterProps {
  variant: LegalConsentFooterVariant
}

/**
 * Shared legal / visibility copy for rating, endorsement, and mail-draft flows.
 * Uses a tight vertical stack so lines read clearly without feeling disconnected.
 */
const LegalConsentFooter = ({ variant }: LegalConsentFooterProps) => {
  if (variant === 'emailDraftTerms') {
    return (
      <Box
        component='footer'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          textAlign: 'center',
          mt: 0.5
        }}
      >
        <Typography component='p' sx={{ ...lineSx, color: '#64748B' }}>
          We open your email app with a draft — you send the message.
        </Typography>
        <Typography component='p' sx={lineSx}>
          By continuing, you agree to our{' '}
          <Link href='/terms' sx={linkSx}>
            Terms
          </Link>
          .
        </Typography>
      </Box>
    )
  }

  const visibilityPrefix =
    variant === 'rating' ? 'Your rating will be publicly visible on ' : 'Your endorsement will be publicly visible on '

  return (
    <Box
      component='footer'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.125,
        textAlign: 'center',
        mt: 2.25,
        pt: 0.25
      }}
    >
      <Typography component='p' sx={lineSx}>
        {visibilityPrefix}
        <Link href='https://linkedtrust.us' target='_blank' rel='noopener noreferrer' sx={linkSx}>
          linkedtrust.us
        </Link>
      </Typography>
      <Typography component='p' sx={lineSx}>
        By submitting, you agree to our{' '}
        <Link href='/terms' sx={linkSx}>
          Terms
        </Link>{' '}
        and{' '}
        <Link href='/privacy' sx={linkSx}>
          Privacy Policy
        </Link>
        .
      </Typography>
    </Box>
  )
}

export default LegalConsentFooter
