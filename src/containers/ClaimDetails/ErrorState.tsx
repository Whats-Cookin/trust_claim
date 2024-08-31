import { Container, Theme, Typography } from '@mui/material'

const ErrorState = ({ error, theme }: { error: string; theme: Theme }) => (
  <Container maxWidth='sm' sx={{ textAlign: 'center' }}>
    <Typography variant='body1' sx={{ color: theme.palette.texts }}>
      {error || 'Report data is not available.'}
    </Typography>
  </Container>
)

export default ErrorState
