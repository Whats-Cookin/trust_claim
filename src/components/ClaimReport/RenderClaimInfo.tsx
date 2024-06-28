import React, { useState, useEffect, useRef } from 'react'
import {
  Typography,
  Box,
  Link as MuiLink,
  Dialog,
  Rating,
  Button,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material'
import { Close } from '@mui/icons-material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useTheme } from '@mui/system'

const RenderClaimInfo = ({
  claim,
  index,
  setSelectedIndex,
  handleMenuClose
}: {
  claim: { [key: string]: string }
  index: number
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>
  handleMenuClose: () => void
}) => {
  const theme = useTheme()
  const excludedKeys = [
    'id',
    'issuerId',
    'issuerIdType',
    'subject',
    'claimAddress',
    'createdAt',
    'lastUpdatedAt',
    'claim_id',
    'thumbnail',
    'image'
  ]
  const chipKeys = [
    'aspect',
    'howKnown',
    'amt',
    'confidence',
    'claim',
    'effectiveDate',
    'effective_date',
    'link',
    'name',
    'stars'
  ] // Keys to display as chips
  const claimEntries = Object.entries(claim).filter(([key]) => !excludedKeys.includes(key))
  const [openD, setOpenD] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

  const otherEntries = claimEntries.filter(([key]) => !chipKeys.includes(key) && key !== 'statement' && claim[key])
  const hasExtraDetails = otherEntries.length > 0

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return `${text.substring(0, length)}...`
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.minHeight = isExpanded ? `${cardRef.current.scrollHeight}px` : '200px'
    }
  }, [isExpanded])

  const handleDetailsOpen = () => {
    setDetailsOpen(true)
  }

  const handleDetailsClose = () => {
    setDetailsOpen(false)
  }

  return (
    <>
      <Box
        ref={cardRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: theme.palette.cardBackground,
          borderRadius: '20px',
          color: theme.palette.texts,
          transition: 'min-height 0.3s ease-in-out',
          padding: '20px'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '20px',
            flexDirection: {
              xs: 'column',
              sm: 'row'
            }
          }}
        >
          {claim.image && !imageError && (
            <Box>
              <IconButton
                onClick={() => setOpenD(true)}
                sx={{
                  padding: 0,
                  borderRadius: '50%'
                }}
              >
                <img
                  src={claim.image}
                  onError={() => setImageError(true)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%'
                  }}
                  alt='claim'
                />
              </IconButton>
            </Box>
          )}
          <Box
            sx={{
              paddingInline: '10px',
              flexGrow: 1,
              order: {
                xs: 3,
                sm: 0
              }
            }}
          >
            {claim.subject && (
              <MuiLink
                href={claim.subject}
                target='_blank'
                sx={{
                  color: theme.palette.texts,
                  fontSize: 24,
                  flexWrap: 'wrap',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none'
                }}
              >
                {claim.subject}
                <OpenInNewIcon
                  sx={{
                    marginLeft: '5px',
                    color: theme.palette.texts,
                    fontSize: '1.5rem'
                  }}
                />
              </MuiLink>
            )}

            <Typography
              variant='body1'
              sx={{
                color: theme.palette.date,
                fontWeight: 500,
                marginBottom: '1rem'
              }}
            >
              {new Date(claim.effectiveDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>
            {claim.statement && (
              <Typography variant='body1'>
                <Typography
                  variant='inherit'
                  component='span'
                  sx={{
                    color: theme.palette.texts,
                    fontWeight: 600,
                    textAlign: 'left'
                  }}
                >
                  {claim.statement.length > 500 ? (
                    <>
                      {isExpanded ? claim.statement : truncateText(claim.statement, 500)}
                      <MuiLink
                        onClick={handleToggleExpand}
                        sx={{ cursor: 'pointer', marginLeft: '5px', color: theme.palette.link }}
                      >
                        {isExpanded ? 'Show Less' : 'See More'}
                      </MuiLink>
                    </>
                  ) : (
                    claim.statement
                  )}
                </Typography>
              </Typography>
            )}
          </Box>
        </Box>

        {hasExtraDetails && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column',
                sm: 'row'
              },
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '20px',
              position: 'relative'
            }}
          >
            <Button
              onClick={handleDetailsOpen}
              variant='contained'
              sx={{
                backgroundColor: theme.palette.buttons,
                color: theme.palette.buttontext
              }}
            >
              Read More
            </Button>
            {claim.stars && (
              <Rating
                name='size-medium'
                defaultValue={parseInt(claim.stars)}
                sx={{
                  color: theme.palette.stars,
                  marginTop: {
                    xs: '10px',
                    sm: '0'
                  },
                  position: {
                    xs: 'static',
                    sm: 'absolute'
                  },
                  right: {
                    sm: 0
                  }
                }}
                readOnly
              />
            )}
          </Box>
        )}
      </Box>

      {openD && claim.image && (
        <Dialog open={openD} onClose={() => setOpenD(false)}>
          <Close
            sx={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              cursor: 'pointer',
              color: theme.palette.texts,
              backgroundColor: theme.palette.dialogBackground,
              borderRadius: '50%',
              padding: '0.2rem',
              margin: '0.2rem'
            }}
            onClick={() => setOpenD(false)}
          />
          <img
            src={claim.image}
            style={{
              width: '100%',
              maxHeight: '100%'
            }}
            alt='claim'
          />
        </Dialog>
      )}

      <Dialog open={detailsOpen} onClose={handleDetailsClose} fullWidth>
        <DialogTitle>Claim Details</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem' }}>
          {Object.entries(claim)
            .filter(
              ([key, value]) => value && !excludedKeys.includes(key) && !chipKeys.includes(key) && key !== 'statement'
            )
            .map(([key, value]) => (
              <Typography key={key} variant='body1' sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <strong>{key}:</strong>&nbsp;
                {typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')) ? (
                  <MuiLink
                    href={value}
                    target='_blank'
                    sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: theme.palette.link }}
                  >
                    {value}
                    <OpenInNewIcon sx={{ marginLeft: '5px' }} />
                  </MuiLink>
                ) : (
                  value
                )}
              </Typography>
            ))}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RenderClaimInfo
