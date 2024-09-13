import React, { useState, useEffect, useRef } from 'react'
import { Typography, Box, Link as MuiLink, Dialog, DialogContent, DialogTitle } from '@mui/material'
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

  const claimImage = claim.image ? claim.image : null
  const isStatementLong = claim.statement && claim.statement.length > 500

  return (
    <>
      <Box
        ref={cardRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          // justifyContent: 'space-between',
          backgroundColor: theme.palette.cardBackground,
          borderRadius: '20px',
          color: theme.palette.texts,
          transition: 'min-height 0.3s ease-in-out',
          overflowWrap: 'break-word',
          wordBreak: 'break-word'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'revert',
            justifyContent: 'flex-start',
            flexWrap: 'wrap'
          }}
        >
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
                fontWeight: 600,
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
                    padding: '5px 1 1 5px',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    marginBottom: '1px',
                    color: theme.palette.texts
                  }}
                >
                  {isExpanded || !isStatementLong ? claim.statement : truncateText(claim.statement, 500)}
                  {(isStatementLong || hasExtraDetails) && (
                    <MuiLink
                      onClick={handleToggleExpand}
                      sx={{ cursor: 'pointer', marginLeft: '5px', color: theme.palette.link, textDecoration:'none' }}
                    >
                      {isExpanded ? 'Show Less' : 'See More'}
                    </MuiLink>
                  )}
                </Typography>
              </Typography>
            )}
          </Box>
        </Box>

        {isExpanded && hasExtraDetails && (
          <Box sx={{ marginTop: '1rem' }}>
            {otherEntries.map(([key, value]) => (
              <Typography key={key} variant='body2' sx={{ color: theme.palette.texts,marginLeft: '10px' }}>
                <strong>{key}:</strong> {value}
              </Typography>
            ))}
          </Box>
        )}
      </Box>

      {openD && claimImage && (
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
            src={claimImage}
            style={{
              width: '100%',
              maxHeight: '100%'
            }}
            alt='claim'
          />
        </Dialog>
      )}

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth>
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
