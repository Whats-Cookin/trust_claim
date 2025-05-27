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
  const creatorName = useMemo(() => {
    // If we have issuer info, use that
    if (claim.issuerId) {
      return extractProfileName(claim.issuerId)
    }
    // Otherwise use subject as creator
    const subject = typeof claim.subject === 'string' ? claim.subject : claim.subject.uri
    return extractProfileName(subject)
  }, [claim.issuerId, claim.subject])

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
      {`Created by: ${creatorName}, ${formattedDate}`}
    </Typography>
  )
})

export default ClaimMetadata
