import React from 'react'
import { Container, Typography, Box, Grid, Divider, Chip, Paper, alpha } from '@mui/material'
import MockBadgeExample from './MockBadgeExample'

/**
 * Gallery page to preview all badge variations
 * Route: /badge-gallery
 */
const BadgeGallery: React.FC = () => {
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
          Design Comparison - Mock Examples
        </Typography>
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          These are design mockups showing exactly how badges will look with real data. "Minimal" versions show just video, quote, and name - clicking takes them to a detailed landing page.
        </Typography>
      </Box>

      {/* MINIMAL CLEAN VERSION */}
      <Box sx={{ mb: 8, p: 4, backgroundColor: alpha('#10B981', 0.05), borderRadius: 2, border: '2px solid #10B981' }}>
        <Typography variant='h4' sx={{ mb: 1, fontWeight: 700, color: '#059669' }}>
          ✨ Minimal Versions (Recommended)
        </Typography>
        <Typography variant='body1' sx={{ mb: 4, color: 'text.secondary' }}>
          Clean, focused design - just video, quote, and endorser. All details available on click.
        </Typography>

        {/* Horizontal Compact */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Chip label='Horizontal Compact' color='success' size='medium' sx={{ fontWeight: 600 }} />
            <Typography variant='subtitle2' sx={{ mt: 1, color: 'text.secondary' }}>
              Best for website embedding (600px x 140px)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
            <MockBadgeExample hasVideo={true} hasStars={true} enhanced={true} minimal={true} horizontal={true} />
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Vertical Options */}
        <Box sx={{ mb: 2 }}>
          <Typography variant='h6' sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
            Vertical Options (if needed)
          </Typography>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Chip label='With Video' variant='outlined' size='small' />
              <Typography variant='caption' sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                Standard (600px)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <MockBadgeExample hasVideo={true} hasStars={true} enhanced={true} minimal={true} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Chip label='Text Only' variant='outlined' size='small' />
              <Typography variant='caption' sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                Standard (600px)
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <MockBadgeExample hasVideo={false} hasStars={true} enhanced={true} minimal={true} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* With Video Examples */}
      <Box sx={{ mb: 8 }}>
        <Typography variant='h4' sx={{ mb: 3, fontWeight: 600 }}>
          With Video Testimonial
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Chip label='Enhanced Design' color='primary' size='medium' sx={{ fontWeight: 600 }} />
              <Typography variant='subtitle2' sx={{ mt: 1, color: 'text.secondary' }}>
                Standard (600px) - With video & 5 stars
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <MockBadgeExample hasVideo={true} hasStars={true} enhanced={true} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Chip label='Current Design' variant='outlined' size='medium' />
              <Typography variant='subtitle2' sx={{ mt: 1, color: 'text.secondary' }}>
                Standard (600px) - With video & 5 stars
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <MockBadgeExample hasVideo={true} hasStars={true} enhanced={false} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Without Video Examples */}
      <Box sx={{ mb: 8 }}>
        <Typography variant='h4' sx={{ mb: 3, fontWeight: 600 }}>
          Without Video (Text Only)
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Chip label='Enhanced Design' color='primary' size='medium' sx={{ fontWeight: 600 }} />
              <Typography variant='subtitle2' sx={{ mt: 1, color: 'text.secondary' }}>
                Text endorsement with stars
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <MockBadgeExample hasVideo={false} hasStars={true} enhanced={true} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Chip label='Current Design' variant='outlined' size='medium' />
              <Typography variant='subtitle2' sx={{ mt: 1, color: 'text.secondary' }}>
                Text endorsement with stars
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <MockBadgeExample hasVideo={false} hasStars={true} enhanced={false} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Compact Size Comparison */}
      <Box sx={{ mb: 8 }}>
        <Typography variant='h4' sx={{ mb: 3, fontWeight: 600 }}>
          Compact Size (320px)
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Chip label='Enhanced' color='primary' size='small' />
              <Typography variant='caption' sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                With video
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <MockBadgeExample compact={true} hasVideo={true} enhanced={true} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Chip label='Enhanced' color='primary' size='small' />
              <Typography variant='caption' sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                No video
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <MockBadgeExample compact={true} hasVideo={false} enhanced={true} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Chip label='Current' variant='outlined' size='small' />
              <Typography variant='caption' sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                With video
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <MockBadgeExample compact={true} hasVideo={true} enhanced={false} />
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Theme Variations */}
      <Box sx={{ mb: 8 }}>
        <Typography variant='h4' sx={{ mb: 3, fontWeight: 600 }}>
          Theme Variations (Enhanced)
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                Light Theme
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                For light-colored websites
              </Typography>
            </Box>
            <Box sx={{ p: 3, backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center' }}>
              <MockBadgeExample theme='light' hasVideo={true} enhanced={true} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                Dark Theme
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                For dark-colored websites
              </Typography>
            </Box>
            <Box sx={{ p: 3, backgroundColor: '#0a0a0a', display: 'flex', justifyContent: 'center' }}>
              <MockBadgeExample theme='dark' hasVideo={true} enhanced={true} />
            </Box>
          </Grid>
        </Grid>
      </Box>


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
