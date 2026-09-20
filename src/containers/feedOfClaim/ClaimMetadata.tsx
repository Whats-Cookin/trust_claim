import { useMemo, memo } from 'react'
import { Typography } from '@mui/material'
import type { Claim, Entity } from '../../api/types'

const extractProfileName = (url: string) => {
  const regex = /linkedin\.com\/(?:in|company)\/([^\\/]+)(?:\/.*)?/
  const match = regex.exec(url)
  return match ? match[1].replace(/-/g, ' ') : url
}

interface ClaimMetadataProps {
  claim: Claim
}

const ClaimMetadata = memo(({ claim }: ClaimMetadataProps) => {
  const formattedDate = useMemo(
    () =>
      new Date(claim.effectiveDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    [claim.effectiveDate]
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
      {formattedDate}
    </Typography>
  )
})

export default ClaimMetadata
