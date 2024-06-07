import React, { useState } from 'react'
import { Typography, Box, Link, Dialog, Rating } from '@mui/material'
import { Close } from '@mui/icons-material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { useTheme } from '@mui/system'
import { CERAMIC_URL } from '../../utils/settings'

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

  // Options for the claim menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    setSelectedIndex(index)
  }
  const handleClose = () => {
    setAnchorEl(null)
    handleMenuClose()
  }
  const options = [
    {
      label: 'From',
      value: claim.author || 'Not provided',
      sourceURI: claim.sourceURI || 'Not provided'
    },
    { label: 'How Known', value: claim.howKnown || 'Not provided' },
    { label: 'Aspect', value: claim.claim || 'Not provided' },
    { label: 'Confidence', value: claim.confidence || 'Not provided' },
    { label: 'Link', value: claim.subject || 'Not provided' }
  ]

  // Separate the entries into chips and others for different rendering strategies
  // const chipEntries = claimEntries.filter(([key]) => chipKeys.includes(key))
  const otherEntries = claimEntries.filter(([key]) => !chipKeys.includes(key))

  return (
    <>
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
        {/* Render the image */}
        <Box
          sx={{
            flexShrink: 0,
            marginInline: {
              xs: 'auto',
              sm: 0
            },
            order: {
              xs: 2,
              sm: 0
            }
          }}
        >
          <img
            src={
              claim.image
                ? claim.image
                : 'https://conference.nbasbl.org/wp-content/uploads/2022/05/placeholder-image-1.png'
            }
            style={{
              width: '60px',
              height: '60px',
              cursor: 'pointer',
              borderRadius: '50%'
            }}
            onClick={() => setOpenD(true)}
            alt='claim'
          />
        </Box>

        {/* Render other claim information */}
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
            <Link
              href={claim.subject}
              target='_blank'
              style={{
                color: theme.palette.texts,
                fontSize: 24,
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none'
              }}
            >
              {claim.subject} {/* TODO: Claim Title */}
              <OpenInNewIcon
                sx={{
                  marginLeft: '5px',
                  color: theme.palette.texts,
                  fontSize: '1.5rem'
                }}
              />
            </Link>
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
                  <Typography
                    variant='inherit'
                    component='span'
                    sx={{
                      color: theme.palette.texts,
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    {value}
                  </Typography>
                </Typography>
              )
            )
          })}
        </Box>

        {/* Render popup */}
        <Box
          sx={{
            flexShrink: 0,
            marginInline: 'auto',
            marginRight: 0,
            order: {
              xs: 1,
              sm: 0
            }
          }}
        >
          <IconButton onClick={handleClick}>
            <MoreHorizIcon style={{ color: theme.palette.smallButton }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            sx={{
              '& .MuiPaper-root': {
                backgroundColor: theme.palette.menuBackground,
                color: theme.palette.texts
              }
            }}
          >
            {options.map(option => (
              <MenuItem key={option.label} onClick={handleClose}>
                {option.label === 'Link' ? (
                  option.value !== 'Not provided' ? (
                    <a
                      href={option.value}
                      target='_blank'
                      style={{
                        color: 'inherit',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {option.label}: <OpenInNewIcon />
                    </a>
                  ) : (
                    'Link: Not provided'
                  )
                ) : option.label === 'From' ? (
                  <>
                    {`${option.label}: ${option.value}`}
                    {option.sourceURI && (
                      <a
                        href={option.sourceURI}
                        target='_blank'
                        rel='noopener noreferrer'
                        style={{
                          color: 'inherit',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginLeft: '0.5rem'
                        }}
                      >
                        <OpenInNewIcon />
                      </a>
                    )}
                  </>
                ) : (
                  `${option.label}: ${option.value}`
                )}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* Render Rating */}
      {claim.stars && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: '1rem'
          }}
        >
          <Rating
            name='size-medium'
            defaultValue={parseInt(claim.stars)}
            style={{ color: theme.palette.stars }}
            readOnly
          />
        </Box>
      )}

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
    </>
  )
}

export default RenderClaimInfo
