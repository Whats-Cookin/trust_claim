import React from 'react'
import { Container, Typography, Box, Grid, Paper, Divider, Chip } from '@mui/material'
import VideoBadge from '../VideoBadge'
import VideoBadgeEnhanced from '../VideoBadge/VideoBadgeEnhanced'
import { BACKEND_BASE_URL } from '../../utils/settings'

/**
 * Gallery page to preview all badge variations
 * Route: /badge-gallery
 */
const BadgeGallery: React.FC = () => {
  // Example claim URIs for demonstration
  const exampleClaims = {
    withVideo: `${BACKEND_BASE_URL}/claims/124446`, // Replace with actual claim with video
    rated: `${BACKEND_BASE_URL}/claims/124446`, // Example rated claim
    achievement: `${BACKEND_BASE_URL}/claims/124446` // Example achievement
  }

  return (
    <Container maxWidth='xl' sx={{ py: 6 }}>
      <Typography variant='h3' sx={{ mb: 2, fontWeight: 700 }}>
        Video Badge Design Gallery
      </Typography>
      <Typography variant='body1' sx={{ mb: 3, color: 'text.secondary' }}>
        Preview all badge variations and sizes. Use this to test designs before deployment.
      </Typography>
      <Box sx={{ mb: 6, p: 3, backgroundColor: '#f0f7ff', borderRadius: 2 }}>
        <Typography variant='h6' sx={{ mb: 1 }}>
          Comparing Designs
        </Typography>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          <strong>Enhanced Version:</strong> Polished design with better hierarchy, animations, and visual appeal
          <br />
          <strong>Original Version:</strong> Current production version for comparison
        </Typography>
      </Box>

      {/* Enhanced vs Original Comparison */}
      <Box sx={{ mb: 8 }}>
        <Typography variant='h4' sx={{ mb: 3, fontWeight: 600 }}>
          Enhanced Design (NEW)
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Chip label='NEW - Enhanced' color='primary' size='small' sx={{ mb: 2 }} />
              <Typography variant='h6' sx={{ mb: 2 }}>
                Standard (600px)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <VideoBadgeEnhanced claimUri={exampleClaims.withVideo} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Chip label='NEW - Enhanced' color='primary' size='small' sx={{ mb: 2 }} />
              <Typography variant='h6' sx={{ mb: 2 }}>
                Compact (320px)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <VideoBadgeEnhanced claimUri={exampleClaims.withVideo} compact={true} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Original for Comparison */}
      <Box sx={{ mb: 8 }}>
        <Typography variant='h4' sx={{ mb: 3, fontWeight: 600 }}>
          Original Design (for comparison)
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Chip label='Current' variant='outlined' size='small' sx={{ mb: 2 }} />
              <Typography variant='h6' sx={{ mb: 2 }}>
                Standard
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <VideoBadge claimUri={exampleClaims.withVideo} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Chip label='Current' variant='outlined' size='small' sx={{ mb: 2 }} />
              <Typography variant='h6' sx={{ mb: 2 }}>
                Compact
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <VideoBadge claimUri={exampleClaims.withVideo} compact={true} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Theme Variations - Enhanced */}
      <Box sx={{ mb: 8 }}>
        <Typography variant='h4' sx={{ mb: 3, fontWeight: 600 }}>
          Theme Variations (Enhanced)
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Light Theme
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <VideoBadgeEnhanced claimUri={exampleClaims.withVideo} theme='light' />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, backgroundColor: '#0a0a0a' }}>
              <Typography variant='h6' sx={{ mb: 2, color: 'white' }}>
                Dark Theme
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <VideoBadgeEnhanced claimUri={exampleClaims.withVideo} theme='dark' />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Claim Type Variations */}
      <Box sx={{ mb: 8 }}>
        <Typography variant='h4' sx={{ mb: 3, fontWeight: 600 }}>
          Claim Type Variations
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Rated Claim (with stars)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <VideoBadge claimUri={exampleClaims.rated} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                Achievement Claim
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <VideoBadge claimUri={exampleClaims.achievement} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Usage Instructions */}
      <Box>
        <Typography variant='h4' sx={{ mb: 3, fontWeight: 600 }}>
          Usage
        </Typography>
        <Paper sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Direct Link:
          </Typography>
          <Typography variant='body2' sx={{ mb: 3, fontFamily: 'monospace', color: 'text.secondary' }}>
            /badge?claim=https://live.linkedtrust.us/claims/ID&compact=true&theme=dark
          </Typography>

          <Typography variant='h6' sx={{ mb: 2 }}>
            Component Usage:
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace', fontSize: 14 }}>
            <pre style={{ margin: 0 }}>
              {`import VideoBadge from './components/VideoBadge'

<VideoBadge
  claimUri="https://live.linkedtrust.us/claims/124446"
  compact={false}
  theme="light"
/>`}
            </pre>
          </Paper>
        </Paper>
      </Box>
    </Container>
  )
}

export default BadgeGallery
