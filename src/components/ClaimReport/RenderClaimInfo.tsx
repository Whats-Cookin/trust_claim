import React, { useState, useEffect, useRef } from 'react'
import { 
  Typography, 
  Box, 
  Link as MuiLink, 
  Dialog, 
  DialogContent, 
  Card,
  CardContent,
  Chip,
  Stack,
  styled,
  IconButton
} from '@mui/material'
import { Close, OpenInNew, CalendarToday, Info } from '@mui/icons-material'
import { useTheme } from '@mui/system'

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  backgroundColor: theme.palette.cardBackground,
  color: theme.palette.texts,
  transition: 'all 0.3s ease',
  boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.15)'
  }
}))

const SubjectLink = styled(MuiLink)(({ theme }) => ({
  color: theme.palette.texts,
  fontSize: '1.25rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  textDecoration: 'none',
  marginBottom: theme.spacing(1),
  transition: 'color 0.2s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    textDecoration: 'underline'
  }
}))

const StatementText = styled(Typography)(({ theme }) => ({
  lineHeight: 1.6,
  marginBottom: theme.spacing(2),
  fontWeight: 400,
  fontSize: '1rem',
  color: theme.palette.texts
}))

const MetadataContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2)
}))

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(1),
  '& .label': {
    minWidth: '120px',
    fontWeight: 600,
    color: theme.palette.text.secondary
  },
  '& .value': {
    flex: 1,
    wordBreak: 'break-word'
  }
}))

const ExpandButton = styled(MuiLink)(({ theme }) => ({
  cursor: 'pointer',
  color: theme.palette.primary.main,
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  '&:hover': {
    textDecoration: 'underline'
  }
}))

const RenderClaimInfo = ({
  claim
}: {
  claim: { [key: string]: string }
  index: number
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>
  handleMenuClose: () => void
}) => {
  const theme = useTheme()
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement | null>(null)

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

  const displayedKeys = [
    'effectiveDate',
    'claim',
    'statement'
  ]

  const metadataKeys = [
    'aspect',
    'howKnown',
    'amt',
    'confidence',
    'stars'
  ]

  const otherEntries = Object.entries(claim).filter(
    ([key, value]) => 
      value && 
      !excludedKeys.includes(key) && 
      !displayedKeys.includes(key) && 
      !metadataKeys.includes(key)
  )

  const hasExtraDetails = otherEntries.length > 0
  const isStatementLong = claim.statement && claim.statement.length > 300

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return `${text.substring(0, length)}...`
  }

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  const renderValue = (value: string) => {
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
      return (
        <MuiLink
          href={value}
          target='_blank'
          sx={{
            color: theme.palette.primary.main,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          {value}
          <OpenInNew fontSize='small' />
        </MuiLink>
      )
    }
    return value
  }

  return (
    <>
      <StyledCard ref={cardRef}>
        <CardContent sx={{ p: 3 }}>
          {/* Header with subject link */}
          {claim.subject && (
            <SubjectLink href={claim.subject} target='_blank'>
              {claim.subject}
              <OpenInNew fontSize='small' />
            </SubjectLink>
          )}

          {/* Metadata chips */}
          <MetadataContainer>
            {claim.effectiveDate && (
              <Chip
                icon={<CalendarToday />}
                label={formatDate(claim.effectiveDate)}
                variant='outlined'
                size='small'
              />
            )}
            {claim.claim && (
              <Chip
                label={claim.claim}
                color='primary'
                size='small'
              />
            )}
            {claim.howKnown && (
              <Chip
                label={claim.howKnown.replace(/_/g, ' ')}
                variant='outlined'
                size='small'
              />
            )}
            {claim.confidence && (
              <Chip
                label={`${Math.round(Number(claim.confidence) * 100)}% confidence`}
                color='success'
                variant='outlined'
                size='small'
              />
            )}
            {claim.stars && (
              <Chip
                label={`${'★'.repeat(Number(claim.stars))} (${claim.stars})`}
                color='warning'
                variant='outlined'
                size='small'
              />
            )}
          </MetadataContainer>

          {/* Statement */}
          {claim.statement && (
            <StatementText>
              {isExpanded || !isStatementLong 
                ? claim.statement 
                : truncateText(claim.statement, 300)
              }
              {(isStatementLong || hasExtraDetails) && (
                <ExpandButton onClick={handleToggleExpand} sx={{ ml: 1 }}>
                  {isExpanded ? 'Show Less' : 'Show More'}
                </ExpandButton>
              )}
            </StatementText>
          )}

          {/* Additional details when expanded */}
          {isExpanded && hasExtraDetails && (
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant='subtitle2' sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info fontSize='small' />
                Additional Details
              </Typography>
              <Stack spacing={1}>
                {otherEntries.map(([key, value]) => (
                  <DetailRow key={key}>
                    <Typography className='label' variant='body2'>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                    </Typography>
                    <Typography className='value' variant='body2'>
                      {renderValue(value)}
                    </Typography>
                  </DetailRow>
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </StyledCard>

      {/* Image Dialog */}
      {imageDialogOpen && claim.image && (
        <Dialog 
          open={imageDialogOpen} 
          onClose={() => setImageDialogOpen(false)}
          maxWidth='md'
          fullWidth
        >
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <IconButton
              onClick={() => setImageDialogOpen(false)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.7)'
                }
              }}
            >
              <Close />
            </IconButton>
            <img
              src={claim.image}
              alt='Claim'
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default RenderClaimInfo