import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Button, useTheme } from '@mui/material'
import { camelCaseToSimpleString } from '../../utils/string.utils'
import { useState } from 'react'

import placeholderDark from '../../assets/imgplaceholderdark.svg'
import placeholderWhite from '../../assets/imgplaceholderwhite.svg'
import arrow from '../../assets/arrow.svg'
import arrowDark from '../../assets/arrowdark.svg'

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

interface NodeDetailsProps {
  open: boolean
  setOpen: (open: boolean) => void
  selectedClaim: any
  claimImg: string
  isDarkMode: boolean
}

export default function NodeDetails({ open, setOpen, selectedClaim, claimImg, isDarkMode }: NodeDetailsProps) {
  const handleClose = () => setOpen(!open)
  const theme = useTheme()
  console.log(selectedClaim)
  if (!selectedClaim) return null
  const excludedFields = ['id', 'userId', 'issuerId', 'issuerIdType', 'createdAt', 'lastUpdatedAt']

  console.log(selectedClaim)
  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return text.slice(0, length) + '...'
  }

  const [showFullText, setShowFullText] = useState(false)

  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'start',
          marginBottom: '20px'
        }}
      >
        <Typography
          variant='h6'
          component='div'
          sx={{
            color: theme.palette.texts,
            textAlign: 'center',
            fontSize: 'clamp(14px, 5vw, 32px)',
            fontWeight: 'bold'
          }}
        >
          Claim Details
          <Box
            sx={{
              height: '4px',
              backgroundColor: theme.palette.buttons,
              marginTop: '4px',
              borderRadius: '2px',
              width: '100%'
            }}
          />
        </Typography>
      </Box>

      <Box
        sx={{
          bottom: 0,
          width: '100%',
          height: '800px',
          backgroundColor: theme.palette.pageBackground,
          color: theme.palette.texts,
          borderRadius: '30px',
          padding: '3vh 3vw 3vh 3vw',
          overflow: 'auto',
          marginBottom: '2rem'
        }}
      >
        <ClaimImage claimImg={claimImg} isDarkMode={isDarkMode} />

        {selectedClaim &&
          Object.keys(selectedClaim).map((key: string) => {
            let value = selectedClaim[key]
            if (excludedFields.includes(key) || value == null || value === '') return null
            if (key === 'effectiveDate') value = formatDate(value) // Format the date
            const displayText = key === 'statement' && !showFullText ? truncateText(value, 60) : value

            return (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  columnGap: '2vw',
                  padding: '5px 10px',
                  flexGrow: 1
                }}
                gap={0}
                key={key}
              >
                <Typography
                  sx={{
                    fontWeight: 'bold',
                    paddingRight: '13.25px 15px',
                    fontSize: 'clamp(10px, 5vw, 28px)'
                  }}
                >
                  {camelCaseToSimpleString(key)}:
                </Typography>
                <Typography
                  component='p'
                  sx={{
                    overflow: 'hidden',
                    overflowWrap: 'break-word',
                    width: '80%',
                    fontSize: 'clamp(10px, 5vw, 26px)'
                  }}
                >
                  {displayText}
                  {key === 'statement' && value.length > 60 && (
                    <Typography
                      component='span'
                      onClick={() => setShowFullText(!showFullText)}
                      sx={{
                        color: theme.palette.maintext,
                        cursor: 'pointer',
                        fontSize: 'clamp(10px, 5vw, 26px)'
                      }}
                    >
                      {showFullText ? ' See less' : ' See more'}
                    </Typography>
                  )}
                </Typography>
              </Box>
            )
          })}
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'end'
        }}
      >
        <Button
          sx={{
            color: theme.palette.buttontext,
            bgcolor: theme.palette.footerBackground,
            fontWeight: 500,
            borderRadius: '100px',
            fontSize: 'clamp(12px, 3vw, 25px)',
            px: '2rem'
          }}
        >
          BACK <img src={isDarkMode ? arrow : arrowDark} alt='arrow' style={{ width: '25px', marginLeft: '10px' }} />
        </Button>
      </Box>
    </>
  )
}

function ClaimImage({ claimImg, isDarkMode }: { claimImg: string; isDarkMode: boolean }) {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '40vh',
        width: '100%',
        backgroundColor: theme.palette.pageBackground,
        borderRadius: '20px',
        marginBottom: '20px',
        overflow: 'hidden',
        mx: 'auto'
      }}
    >
      {claimImg ? (
        <img
          src={placeholderDark}
          alt=''
          style={{
            width: '70%',
            height: '100%',
            objectFit: 'cover',
            fill: 'black'
          }}
        />
      ) : (
        <Box
          sx={{
            bgcolor: theme.palette.footerBackground,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <img src={isDarkMode ? placeholderDark : placeholderWhite} alt='' />
        </Box>
      )}
    </Box>
  )
}
