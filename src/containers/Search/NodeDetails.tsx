import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Button, useTheme } from '@mui/material'
import { camelCaseToSimpleString } from '../../utils/string.utils'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

export default function NodeDetails({ setOpen, selectedClaim, isDarkMode }: NodeDetailsProps) {
  const handleClose = () => setOpen(false)

  const theme = useTheme()
  const navigate = useNavigate()
  const [showFullText, setShowFullText] = useState(false)

  if (!selectedClaim) return null
  const excludedFields = ['id', 'userId', 'issuerId', 'issuerIdType', 'createdAt', 'lastUpdatedAt']

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return text.slice(0, length) + '...'
  }

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
          variant='body1'
          sx={{
            color: theme.palette.texts,
            textAlign: 'center',
            ml: '0.5rem'
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
                  variant='body2'
                  sx={{
                    paddingRight: '13.25px 15px'
                  }}
                >
                  {camelCaseToSimpleString(key)}:
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    overflow: 'hidden',
                    overflowWrap: 'break-word',
                    width: '80%'
                  }}
                >
                  {displayText}
                  {key === 'statement' && value.length > 60 && (
                    <Typography
                      variant='body2'
                      onClick={() => setShowFullText(!showFullText)}
                      sx={{
                        color: theme.palette.maintext,
                        cursor: 'pointer'
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
          justifyContent: 'center',
          gap: '2rem'
        }}
      >
        <Button
          sx={{
            color: theme.palette.buttontext,
            bgcolor: theme.palette.footerBackground,
            borderRadius: '100px',
            px: '2rem'
          }}
          onClick={() =>
            navigate({
              pathname: '/validate',
              search: `?subject=https://live.linkedtrust.us/claims/${selectedClaim.id}`
            })
          }
        >
          Validate
        </Button>

        <Button
          sx={{
            color: theme.palette.buttontext,
            bgcolor: theme.palette.footerBackground,
            borderRadius: '100px',
            px: '2rem'
          }}
          onClick={() =>
            navigate({
              pathname: `/report/${selectedClaim.id}`
            })
          }
        >
          Evidence
        </Button>

        <Button
          sx={{
            color: theme.palette.buttontext,
            bgcolor: theme.palette.footerBackground,
            borderRadius: '100px',
            px: '2rem'
          }}
          onClick={handleClose}
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
