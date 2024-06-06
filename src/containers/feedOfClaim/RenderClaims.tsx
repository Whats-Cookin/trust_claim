import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Card, CardContent, IconButton, Typography, useTheme, Button, Menu, MenuItem, Grow } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AssessmentIcon from '@mui/icons-material/Assessment'
import SchemaIcon from '@mui/icons-material/Schema'
import StarIcon from '@mui/icons-material/Star'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { LocalClaim } from './types'

const extractProfileName = (url: string) => {
  const regex = /linkedin\.com\/(?:in|company)\/([^\\/]+)(?:\/.*)?/
  const match = regex.exec(url)
  return match ? match[1].replace(/-/g, ' ') : url
}

const highlightSearchTerm = (text: string, search: string) => {
  const theme = useTheme()
  if (!search) return text

  const parts = text.split(new RegExp(`(${search})`, 'gi'))
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === search.toLowerCase() ? (
          <span key={index} style={{ backgroundColor: theme.palette.searchBarBackground }}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  )
}

const ClaimName = ({ claim, search }: { claim: LocalClaim; search: string }) => {
  const displayName = extractProfileName(claim.name)
  const theme = useTheme()

  return (
    <Typography variant='h6' sx={{ marginBottom: '10px', color: theme.palette.texts }} fontWeight='bold'>
      {highlightSearchTerm(displayName, search)}
      <OpenInNewIcon sx={{ marginLeft: '5px', color: theme.palette.texts, fontSize: '1rem' }} />
    </Typography>
  )
}

const RenderClaims = ({
  claims,
  search,
  handleValidation,
  handleMenuClick,
  handleClose,
  anchorEl,
  selectedIndex,
  handleschema
}: any) => {
  const theme = useTheme()

  return (
    <>
      {claims.map((claim: any, index: number) => (
        <Box key={claim.id}>
          <Card
            sx={{
              maxWidth: 'fit',
              height: 'fit',
              mt: '15px',
              borderRadius: '20px',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor:
                selectedIndex === index ? theme.palette.cardBackgroundBlur : theme.palette.cardBackground,
              backgroundImage: 'none',
              filter: selectedIndex === index ? 'blur(0.8px)' : 'none',
              color: theme.palette.texts
            }}
          >
            <Box sx={{ display: 'block', position: 'relative', width: '100%' }}>
              <CardContent>
                <a href={claim.link} target='_blank' rel='noopener noreferrer' style={{ textDecoration: 'none' }}>
                  <ClaimName claim={claim} search={search} />
                </a>
                <Typography variant='body2' sx={{ marginBottom: '10px', color: theme.palette.date }}>
                  {new Date(claim.effective_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
                {claim.statement && (
                  <Typography
                    sx={{
                      padding: '5px 1 1 5px',
                      wordBreak: 'break-word',
                      marginBottom: '1px',
                      color: theme.palette.texts
                    }}
                  >
                    {highlightSearchTerm(claim.statement, search)}
                  </Typography>
                )}
              </CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  position: 'relative',
                  mt: '10px',
                  mb: '10px',
                  pl: '20px',
                  pr: '20px'
                }}
              >
                <Button
                  onClick={() => handleValidation(claim.link, claim.claim_id)}
                  startIcon={<CheckCircleIcon />}
                  sx={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    marginRight: '10px',
                    p: '4px',
                    color: theme.palette.buttontext,
                    '&:hover': {
                      backgroundColor: theme.palette.buttonHover,
                      color: theme.palette.buttontext
                    }
                  }}
                >
                  VALIDATE
                </Button>
                <Link to={'/report/' + claim.claim_id}>
                  <Button
                    startIcon={<AssessmentIcon />}
                    sx={{
                      fontSize: '10px',
                      fontWeight: 'bold',
                      marginRight: '10px',
                      p: '4px',
                      color: theme.palette.buttontext,
                      '&:hover': {
                        backgroundColor: theme.palette.buttonHover,
                        color: theme.palette.buttontext
                      }
                    }}
                  >
                    Evidence
                  </Button>
                </Link>
                <Button
                  startIcon={<SchemaIcon />}
                  onClick={() => handleschema(claim.link)}
                  sx={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    marginRight: '10px',
                    p: '4px',
                    color: theme.palette.buttontext,
                    '&:hover': {
                      backgroundColor: theme.palette.buttonHover,
                      color: theme.palette.buttontext
                    }
                  }}
                >
                  Graph View
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                {claim.stars && (
                  <Box
                    sx={{
                      display: 'flex',
                      p: '4px',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-end'
                    }}
                  >
                    {Array.from({ length: claim.stars }).map((_, index) => (
                      <StarIcon
                        key={index}
                        sx={{
                          color: theme.palette.stars,
                          width: '3vw',
                          height: '3vw',
                          fontSize: '3vw',
                          maxWidth: '24px',
                          maxHeight: '24px'
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              <IconButton
                sx={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  color: theme.palette.texts,
                  cursor: 'pointer'
                }}
                onClick={event => handleMenuClick(event, index)}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotate(90deg)',
                    color: theme.palette.smallButton
                  }}
                >
                  <MoreVertIcon />
                </span>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl && selectedIndex === index)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                TransitionComponent={Grow}
                transitionDuration={250}
                sx={{
                  '& .MuiPaper-root': {
                    backgroundColor: theme.palette.menuBackground,
                    color: theme.palette.texts
                  }
                }}
              >
                {claim.source_link && (
                  <MenuItem onClick={() => window.open(claim.source_link, '_blank')}>
                    <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                      {highlightSearchTerm(claim.source_link, search)}
                    </Typography>
                    <OpenInNewIcon style={{ marginLeft: '5px' }} />
                  </MenuItem>
                )}
                {claim.how_known && (
                  <MenuItem>
                    <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                      How Known: {highlightSearchTerm(claim.how_known, search)}
                    </Typography>
                  </MenuItem>
                )}
                {claim.aspect && (
                  <MenuItem>
                    <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                      Aspect: {highlightSearchTerm(claim.aspect, search)}
                    </Typography>
                  </MenuItem>
                )}
                {claim.confidence !== 0 && (
                  <MenuItem>
                    <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                      Confidence: {claim.confidence}
                    </Typography>
                  </MenuItem>
                )}
                {claim.stars && (
                  <MenuItem>
                    <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                      Rating as Stars: {highlightSearchTerm(claim.stars.toString(), search)}
                    </Typography>
                  </MenuItem>
                )}
                {claim.score && (
                  <MenuItem>
                    <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                      Rating as Score: {highlightSearchTerm(claim.score.toString(), search)}
                    </Typography>
                  </MenuItem>
                )}
                {claim.amt && (
                  <MenuItem>
                    <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                      Amount of claim: $ {highlightSearchTerm(claim.amt.toString(), search)}
                    </Typography>
                  </MenuItem>
                )}
              </Menu>
            </Box>
          </Card>
        </Box>
      ))}
    </>
  )
}

export default RenderClaims
