import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Container } from '@mui/material'
import VideoBadge from '../VideoBadge'

/**
 * Standalone badge view page for embedding via iframe or direct links
 * Usage: /badge?claim=<claim-uri>&compact=true&theme=dark
 */
const BadgeView: React.FC = () => {
  const [searchParams] = useSearchParams()

  const claimUri = searchParams.get('claim')
  const compact = searchParams.get('compact') === 'true'
  const theme = (searchParams.get('theme') as 'light' | 'dark') || 'light'

  if (!claimUri) {
    return (
      <Container maxWidth='sm' sx={{ py: 4, textAlign: 'center' }}>
        <Box sx={{ p: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
          Missing claim parameter. Usage: /badge?claim=&lt;claim-uri&gt;
        </Box>
      </Container>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f5f5f5',
        p: 2
      }}
    >
      <VideoBadge claimUri={claimUri} compact={compact} theme={theme} />
    </Box>
  )
}

export default BadgeView
