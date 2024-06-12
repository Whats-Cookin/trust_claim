import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import SchemaIcon from '@mui/icons-material/Schema'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AssessmentIcon from '@mui/icons-material/Assessment'
import StarIcon from '@mui/icons-material/Star'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { IHomeProps, Claim as ImportedClaim } from './types'
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  Menu,
  MenuItem,
  Grow
} from '@mui/material'
import axios from 'axios'
import Loader from '../../components/Loader'
import AlwaysOpenSidebar from '../../components/FeedSidebar/AlwaysOpenSidebar'
import FeedFooter from '../../components/FeedFooter'
import { BACKEND_BASE_URL } from '../../utils/settings'
import OverlayModal from '../../components/OverLayModal/OverlayModal'
const CLAIM_ROOT_URL = 'https://live.linkedtrust.us/claims'

interface LocalClaim {
  name: string
  source_link: string
}

// Extracts the profile name from a LinkedIn URL
const extractProfileName = (url: string) => {
  const regex = /linkedin\.com\/(?:in|company)\/([^\\/]+)(?:\/.*)?/
  const match = regex.exec(url)
  return match ? match[1].replace(/-/g, ' ') : url
}

// Extracts the source name from a LinkedIn URL
const extractSourceName = (url: string) => {
  const regex = /linkedin\.com\/(?:in|company)\/([^\\/]+)(?:\/.*)?/
  const match = regex.exec(url)
  return match ? match[1].replace(/\./g, ' ') : url
}

// Renders the claim name with highlighting for the search term
const ClaimName = ({ claim, searchTerm }: { claim: LocalClaim; searchTerm: string }) => {
  const displayName = extractProfileName(claim.name)
  const theme = useTheme()
  const highlightedName = searchTerm
    ? displayName.replace(
        new RegExp(`(${searchTerm})`, 'gi'),
        (match: string) => `<span style="background-color:${theme.palette.searchBarBackground};">${match}</span>`
      )
    : displayName

  return (
    <Typography variant='h6' sx={{ marginBottom: '10px', color: theme.palette.texts }} fontWeight='bold'>
      <span dangerouslySetInnerHTML={{ __html: highlightedName }} />
      <OpenInNewIcon sx={{ marginLeft: '5px', color: theme.palette.texts, fontSize: '1rem' }} />
    </Typography>
  )
}

// Renders the source link with highlighting for the search term
const SourceLink = ({ claim, searchTerm }: { claim: LocalClaim; searchTerm: string }) => {
  const displayLink = extractSourceName(claim.source_link)
  const theme = useTheme()
  const highlightedLink = searchTerm
    ? displayLink.replace(
        new RegExp(`(${searchTerm})`, 'gi'),
        (match: string) => `<span style="background-color:${theme.palette.searchBarBackground};">${match}</span>`
      )
    : displayLink

  return (
    <Typography variant='body2' sx={{ color: theme.palette.texts }}>
      From: <span dangerouslySetInnerHTML={{ __html: highlightedLink }} />
    </Typography>
  )
}

// Filters duplicate claims from the list by statement and claim_id, keeping the preferred one
const filterDuplicateClaims = (claims: Array<ImportedClaim>): Array<ImportedClaim> => {
  const uniqueClaimsMap = new Map<string, ImportedClaim>()

  claims.forEach(claim => {
    if (claim.statement && claim.claim_id) {
      const key = `${claim.statement}_${claim.claim_id}`
      const existingClaim = uniqueClaimsMap.get(key)

      // Skip claims with source_link containing 'https://live.linkedtrust.us/claims'
      if (claim.source_link.includes('https://live.linkedtrust.us/claims')) {
        return
      }

      // Skip claims with name 'Trust Claims' if there is a duplicate
      if (claim.name === 'Trust Claims' && existingClaim) {
        return
      }

      // Set or update the claim in the map
      uniqueClaimsMap.set(key, claim)
    }
  })

  return Array.from(uniqueClaimsMap.values())
}

// Main FeedClaim component
const FeedClaim: React.FC<IHomeProps> = ({ toggleTheme, isDarkMode }) => {
  const [claims, setClaims] = useState<Array<ImportedClaim>>([])
  const [filteredClaims, setFilteredClaims] = useState<Array<ImportedClaim>>([])
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.down(800))

  // Fetches claims data from the backend and sets initial states
  useEffect(() => {
    setIsLoading(true)
    axios
      .get(`${BACKEND_BASE_URL}/api/claimsfeed2`, { timeout: 60000 })
      .then(res => {
        console.log(res.data)
        const filteredClaims = filterDuplicateClaims(res.data)
        setClaims(filteredClaims)
        setFilteredClaims(filteredClaims)
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false))
    const token = localStorage.getItem('accessToken')
    if (token) {
      setIsAuth(true)
    } else {
      setIsAuth(false)
    }
  }, [])

  // Updates the search term based on the URL query parameter
  useEffect(() => {
    const search = new URLSearchParams(location.search).get('query')
    setSearchTerm(search ?? '')
  }, [location.search])

  // Filters claims based on the search term
  useEffect(() => {
    if (searchTerm) {
      const results = claims.filter(
        claim =>
          claim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.statement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.source_link.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredClaims(results)
    } else {
      setFilteredClaims(claims)
    }
  }, [searchTerm, claims])

  // Navigates to the validation page for a claim
  const handleValidation = (subject: any, id: number) => {
    console.log(subject, 'and', id)
    navigate({
      pathname: '/validate',
      search: `?subject=${CLAIM_ROOT_URL}/${id}`
    })
  }

  // Handles graph navigation
  const handleschema = async (nodeUri: string) => {
    const domain = nodeUri.replace(/^https?:\/\//, '').replace(/\/$/, '')
    navigate({
      pathname: '/search',
      search: `?query=${domain}`
    })
  }

  // Handles menu click
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(event.currentTarget)
    setSelectedIndex(index)
  }

  // Handles menu close
  const handleClose = () => {
    setAnchorEl(null)
    setSelectedIndex(null)
  }

  return (
    <>
      <OverlayModal />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          position: 'relative',
          mt: isSmallScreen ? '8vh' : '8vh  '
        }}
      ></Box>
      {isLoading ? (
        <Loader open={isLoading} />
      ) : (
        <>
          {filteredClaims.length > 0 ? (
            <Box
              sx={{
                display: 'flex',
                position: 'center',
                justifyContent: 'center',
                width: isMediumScreen ? '100%' : '50%',
                p: '0 10px',
                flexDirection: 'column',
                backgroundColor: theme.palette.formBackground
              }}
            >
              {!isMediumScreen && <AlwaysOpenSidebar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />}
              {filteredClaims.map((claim: any, index: number) => (
                <Box key={claim.id}>
                  <Card
                    sx={{
                      maxWidth: 'fit',
                      height: 'fit',
                      mt: '15px',
                      borderRadius: '20px',
                      display: 'flex',
                      flexDirection: isSmallScreen ? 'column' : 'row',
                      backgroundColor:
                        selectedIndex === index ? theme.palette.cardBackgroundBlur : theme.palette.cardBackground,
                      backgroundImage: 'none',
                      filter: selectedIndex === index ? 'blur(0.8px)' : 'none',
                      color: theme.palette.texts
                    }}
                  >
                    <Box sx={{ display: 'block', position: 'relative', width: '100%' }}>
                      <CardContent>
                        <Link
                          to={claim.link}
                          target='_blank'
                          rel='noopener noreferrer'
                          style={{ textDecoration: 'none' }}
                        >
                          <ClaimName claim={claim} searchTerm={searchTerm} />
                        </Link>
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
                            <span
                              dangerouslySetInnerHTML={{
                                __html: claim.statement.replace(
                                  new RegExp(`(${searchTerm})`, 'gi'),
                                  (match: any) =>
                                    `<span style="background-color:${theme.palette.searchBarBackground};">${match}</span>`
                                )
                              }}
                            />
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
                          variant='text'
                          sx={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            marginRight: '10px',
                            p: '4px',
                            color: theme.palette.texts,
                            '&:hover': {
                              backgroundColor: theme.palette.cardsbuttons
                            }
                          }}
                        >
                          VALIDATE
                        </Button>
                        <Link to={'/report/' + claim.claim_id}>
                          <Button
                            startIcon={<AssessmentIcon />}
                            variant='text'
                            sx={{
                              fontSize: '10px',
                              fontWeight: 'bold',
                              marginRight: '10px',
                              p: '4px',
                              color: theme.palette.texts,
                              '&:hover': {
                                backgroundColor: theme.palette.cardsbuttons
                              }
                            }}
                          >
                            Evidence
                          </Button>
                        </Link>
                        <Button
                          startIcon={<SchemaIcon />}
                          onClick={() => handleschema(claim.link)}
                          variant='text'
                          sx={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            marginRight: '10px',
                            p: '4px',
                            color: theme.palette.texts,
                            '&:hover': {
                              backgroundColor: theme.palette.cardsbuttons
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
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: 'rotate(90deg)',
                            color: theme.palette.smallButton
                          }}
                        >
                          <MoreVertIcon />
                        </Box>
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
                              <SourceLink claim={claim} searchTerm={searchTerm} />
                            </Typography>
                            <OpenInNewIcon sx={{ marginLeft: '5px' }} />
                          </MenuItem>
                        )}
                        {claim.how_known && (
                          <MenuItem>
                            <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                              How Known: {claim.how_known}
                            </Typography>
                          </MenuItem>
                        )}
                        {claim.aspect && (
                          <MenuItem>
                            <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                              Aspect: {claim.aspect}
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
                              Rating as Stars: {claim.stars}
                            </Typography>
                          </MenuItem>
                        )}
                        {claim.score && (
                          <MenuItem>
                            <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                              Rating as Score: {claim.score}
                            </Typography>
                          </MenuItem>
                        )}
                        {claim.amt && (
                          <MenuItem>
                            <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                              Amount of claim: $ {claim.amt}
                            </Typography>
                          </MenuItem>
                        )}
                      </Menu>
                    </Box>
                  </Card>
                </Box>
              ))}
              <Box
                sx={{
                  width: '30%',
                  bgcolor: theme.palette.footerBackground
                }}
              >
                {!isMediumScreen && <FeedFooter />}
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', mt: '20px' }}>
              <Typography variant='h6'>No results found for "{searchTerm}"</Typography>
            </Box>
          )}
        </>
      )}
    </>
  )
}

export default FeedClaim
