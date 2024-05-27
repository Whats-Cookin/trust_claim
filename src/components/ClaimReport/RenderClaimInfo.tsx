import { Chip, Typography, Box, Link, Dialog } from '@mui/material'
import { CERAMIC_URL } from '../../utils/settings'
import React, { useState } from 'react'
import { Close } from '@mui/icons-material'

const RenderClaimInfo = ({ claim }: { claim: { [ky: string]: string } }) => {
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
    'name'
  ] // Keys to display as chips
  const claimEntries = Object.entries(claim).filter(([key]) => !excludedKeys.includes(key))
  const [openD, setOpenD] = useState(false)

  // Separate the entries into chips and others for different rendering strategies
  const chipEntries = claimEntries.filter(([key]) => chipKeys.includes(key))
  const otherEntries = claimEntries.filter(([key]) => !chipKeys.includes(key))

  return (
    <>
      {/* Render the image */}
      {claim.image && (
        <img
          src={claim.image}
          style={{
            width: '200px',
            maxHeight: '300px',
            cursor: 'pointer'
          }}
          onClick={() => setOpenD(true)}
          alt='claim image'
        />
      )}
      {openD && (
        <Dialog open={openD} onClose={() => setOpenD(false)}>
          <Close
            sx={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              cursor: 'pointer',
              color: 'white',
              backgroundColor: '#333',
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
              objectFit: 'cover',
              aspectRatio: '1/1'
            }}
            alt='claim image'
          />
        </Dialog>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: {
            xs: 'center',
            md: 'flex-start'
          },
          flexDirection: {
            xs: 'column',
            md: 'row'
          },
          gap: 2
        }}
      >
        {/* Render chips in a row at the top */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            mb: 1
          }}
        >
          {chipEntries.map(([key, value]) => {
            if (key === 'effectiveDate' && value) {
              value = new Date(value).toLocaleDateString()
            } else if (key === 'amt' && value) {
              value = `$${value}`
            } else if (key === 'aspect' && value) {
              //"impact:educational" => "Impact: Educational"
              value = value
                .split(':')
                .map(s => s.charAt(0).toUpperCase() + s.slice(1))
                .join(':')
            }
            return (
              value && (
                <Chip
                  key={key}
                  label={`${formatClaimKey(key)}: ${value}`}
                  color='primary'
                  sx={{
                    backgroundColor: '#008a7cdc',
                    color: 'white',
                    m: '0.2rem 0.2rem 0.2rem 0.2rem'
                  }}
                />
              )
            )
          })}
        </Box>
      </Box>

      {/* Render other claim information */}
      {otherEntries.map(([key, value]) => {
        // Handle date formatting
        const refLink = value
          ? value.toString().startsWith('http')
            ? value.toString()
            : CERAMIC_URL + 'api/v0/streams/' + value.toString()
          : ''
        return (
          value && (
            <Typography key={key} variant='body1'>
              {key.includes('URI') || key.split('_').includes('link') ? (
                <>
                  <Typography variant='inherit' component='span' sx={{ color: 'primary.main' }}>
                    {formatClaimKey(key)}:{' '}
                  </Typography>
                  <Link href={refLink} style={{ color: '#1976d2' }} target='_blank'>
                    {refLink}
                  </Link>
                </>
              ) : (
                <>
                  <Typography variant='inherit' component='span' sx={{ color: 'primary.main' }}>
                    {formatClaimKey(key)}:
                  </Typography>{' '}
                  {value}
                </>
              )}
            </Typography>
          )
        )
      })}
    </>
  )
}

export default RenderClaimInfo

// Helper function to format claim keys into readable text
const formatClaimKey = (key: string) => {
  if (key === 'effective_date') {
    return 'Date'
  } else if (key === 'sourceURI') {
    return 'From'
  } else if (key === 'amt') {
    return 'Amount'
  }
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
    return str.toUpperCase()
  })
}
