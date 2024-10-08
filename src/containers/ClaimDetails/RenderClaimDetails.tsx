import { Box, Theme, Typography } from '@mui/material'
import { useState } from 'react'
import { camelCaseToSimpleString } from '../../utils/string.utils'

interface Claim {
  statement: string | null
  subject: string
  id: string
  [key: string]: any
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const truncateText = (text: string, length: number) => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

const EXCLUDED_FIELDS = ['id', 'userId', 'issuerId', 'issuerIdType', 'createdAt', 'lastUpdatedAt']

const RenderClaimDetails = ({ claimData, theme }: { claimData: Claim; theme: Theme }) => {
  const [showFullText, setShowFullText] = useState<{ [key: string]: boolean }>({})

  const handleToggleText = (key: string) => {
    setShowFullText(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }))
  }

  return (
    <>
      {Object.entries(claimData).map(([key, value]) => {
        if (EXCLUDED_FIELDS.includes(key) || value == null || value === '') return null
        if (key === 'effectiveDate') value = formatDate(value) // Format the date

        const displayText = key === 'statement' && !showFullText[key] ? truncateText(value, 60) : value

        return (
          <Box
            key={key}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '5px 10px',
              flexGrow: 1
            }}
          >
            <Typography sx={{ fontSize: 'clamp(10px, 5vw, 28px)' }}>{camelCaseToSimpleString(key)}:</Typography>
            <Typography
              component='p'
              sx={{
                overflowWrap: 'break-word',
                width: '80%',
                fontSize: 'clamp(10px, 5vw, 26px)'
              }}
            >
              {displayText}
              {key === 'statement' && value.length > 60 && (
                <Typography
                  component='span'
                  onClick={() => handleToggleText(key)}
                  sx={{ color: theme.palette.maintext, cursor: 'pointer', fontSize: 'clamp(10px, 5vw, 26px)' }}
                >
                  {showFullText[key] ? ' See less' : ' See more'}
                </Typography>
              )}
            </Typography>
          </Box>
        )
      })}
    </>
  )
}

export default RenderClaimDetails
