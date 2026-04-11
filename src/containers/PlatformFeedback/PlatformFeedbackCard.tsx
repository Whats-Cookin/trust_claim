import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { neutralColors } from '../../theme/colors'

const pillGradient =
  'linear-gradient(90deg, #11aae6 0%, #1fa3e7 20.19%, #3299e7 48.08%, #4290e8 71.64%, #5586e9 100%)'

type Mode = 'rating' | 'endorsement'

interface PlatformFeedbackCardProps {
  mode: Mode
  title: string
  subtitleLinkHref?: string
  children: ReactNode
}

const PlatformFeedbackCard = ({ mode, title, subtitleLinkHref = 'https://linkedtrust.us/', children }: PlatformFeedbackCardProps) => {
  const pillLabel = mode === 'rating' ? 'Rating' : 'Endorsement'
  const pillMinWidth = mode === 'rating' ? 82 : 124

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 576,
        mx: 'auto',
        bgcolor: neutralColors.white,
        borderRadius: '16px',
        boxShadow: '0px 20px 25px rgba(0,0,0,0.1), 0px 8px 10px rgba(0,0,0,0.1)',
        p: 3
      }}
    >
      {/* Normal document flow: pill → title → subtitle (avoids absolute overlap bugs). */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 2,
          mb: 3
        }}
      >
        <Box
          sx={{
            height: 36,
            minWidth: pillMinWidth,
            px: 2,
            borderRadius: '999px',
            background: pillGradient,
            boxShadow: '0px 4px 6px rgba(0,0,0,0.1), 0px 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Typography sx={{ fontSize: '14px', fontWeight: 500, lineHeight: '20px', color: '#fff' }}>{pillLabel}</Typography>
        </Box>

        <Typography
          sx={{
            fontSize: { xs: '1.25rem', sm: '24px' },
            fontWeight: 500,
            lineHeight: '32px',
            color: '#0F172B',
            m: 0,
            maxWidth: '100%'
          }}
        >
          {title}
        </Typography>

        <Typography component='p' sx={{ fontSize: '16px', lineHeight: '20px', color: '#62748E', m: 0 }}>
          Share about{' '}
          <Typography
            component='a'
            href={subtitleLinkHref}
            target='_blank'
            rel='noopener noreferrer'
            sx={{ color: '#155DFC', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            linkedtrust.us
          </Typography>
        </Typography>
      </Box>

      {children}
    </Box>
  )
}

export default PlatformFeedbackCard
