import { CircularProgress, Container } from '@mui/material'

const LoadingState = () => (
  <Container
    maxWidth='sm'
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh'
    }}
  >
    <CircularProgress />
  </Container>
)

export default LoadingState
