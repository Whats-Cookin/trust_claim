import { useParams } from 'react-router-dom'
import { Box, Container, Typography } from '@mui/material'
import MainContainer from '../../components/MainContainer'
import BadgeSharePanel from '../../components/BadgeSharePanel'

export default function BadgePage() {
  const { claimId } = useParams<{ claimId: string }>()
  const id = parseInt(claimId || '', 10)

  if (!id || isNaN(id)) {
    return (
      <MainContainer>
        <Container maxWidth='sm' sx={{ py: 4 }}>
          <Typography color='error'>Invalid badge ID.</Typography>
        </Container>
      </MainContainer>
    )
  }

  return (
    <MainContainer>
      <Container maxWidth='sm' sx={{ py: 4 }}>
        <BadgeSharePanel claimId={id} />
      </Container>
    </MainContainer>
  )
}
