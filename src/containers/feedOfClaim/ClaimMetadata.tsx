import { useMemo, memo } from 'react'
import { Typography } from '@mui/material'

const extractProfileName = (url: string) => {
  const regex = /linkedin\.com\/(?:in|company)\/([^\\/]+)(?:\/.*)?/
  const match = regex.exec(url)
  return match ? match[1].replace(/-/g, ' ') : url
}

interface LocalClaim {
  name: string
  link: string
  claim_id: number
  statement: string
  claim: string
  subject_name: string
  issuer_name: string
  stars: null
  effective_date: string
}

interface ClaimMetadataProps {
  claim: LocalClaim
}

const ClaimMetadata = memo(({ claim }: ClaimMetadataProps) => {
  const creatorName = useMemo(
    () => (claim.issuer_name ? claim.issuer_name : extractProfileName(claim.link)),
    [claim.issuer_name, claim.link]
  )

  const formattedDate = useMemo(
    () =>
      new Date(claim.effective_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    [claim.effective_date]
  )

  return (
    <Typography
      sx={{
        marginBottom: '10px',
        color: '#495057',
        fontSize: '14px',
        fontWeight: '500',
        fontFamily: 'Roboto'
      }}
    >
      {`Created by: ${creatorName}, ${formattedDate}`}
    </Typography>
  )
})

export default ClaimMetadata
