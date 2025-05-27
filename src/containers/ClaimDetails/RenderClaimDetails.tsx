import { Box, Theme, Typography } from '@mui/material'
import { useState } from 'react'
import { camelCaseToSimpleString } from '../../utils/string.utils'

interface Claim {
  statement?: string | null | undefined
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

        const displayText = key === 'statement' && value && !showFullText[key] ? truncateText(value, 120) : value

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
            <Typography variant='body2'>{camelCaseToSimpleString(key)}:</Typography>
            <Typography
              component='p'
              sx={{
                overflowWrap: 'break-word',
                width: '75%'
              }}
            >
              {displayText}
              {key === 'statement' && value && value.length > 120 && (
                <Typography
                  component='span'
                  onClick={() => handleToggleText(key)}
                  sx={{ color: theme.palette.maintext, cursor: 'pointer' }}
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
