import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import StarIcon from '@mui/icons-material/Star'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
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
  Grow,
  Fab
} from '@mui/material'
import axios from 'axios'
import Loader from '../../components/Loader'
import { BACKEND_BASE_URL } from '../../utils/settings'
// import OverlayModal from '../../components/OverLayModal/OverlayModal'

const CLAIM_ROOT_URL = 'https://live.linkedtrust.us/claims'

interface LocalClaim {
  name: string
  source_link: string
}

const extractProfileName = (url: string) => {
  const regex = /linkedin\.com\/(?:in|company)\/([^\\/]+)(?:\/.*)?/
  const match = regex.exec(url)
  return match ? match[1].replace(/-/g, ' ') : url
}

const extractSourceName = (url: string) => {
  const regex = /linkedin\.com\/(?:in|company)\/([^\\/]+)(?:\/.*)?/
  const match = regex.exec(url)
  return match ? match[1].replace(/\./g, ' ') : url
}

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

const filterDuplicateClaims = (claims: Array<ImportedClaim>): Array<ImportedClaim> => {
  const uniqueClaimsMap = new Map<string, ImportedClaim>()

  claims.forEach(claim => {
    if (claim.statement && claim.claim_id) {
      const key = `${claim.statement}_${claim.claim_id}`
      const existingClaim = uniqueClaimsMap.get(key)

      if (claim.source_link.includes('https://live.linkedtrust.us/claims')) {
        return
      }

      if (claim.name === 'Trust Claims' && existingClaim) {
        return
      }

      uniqueClaimsMap.set(key, claim)
    }
  })

  return Array.from(uniqueClaimsMap.values())
}

const FeedClaim: React.FC<IHomeProps> = ({ toggleTheme, isDarkMode }) => {
  const [claims, setClaims] = useState<Array<ImportedClaim>>([])
  const [filteredClaims, setFilteredClaims] = useState<Array<ImportedClaim>>([])
  const [visibleClaims, setVisibleClaims] = useState<Array<ImportedClaim>>([])
  const location = useLocation()
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false) // state for scroll button visibility
  const navigate = useNavigate()
  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    setIsLoading(true)
    axios
      .get(`${BACKEND_BASE_URL}/api/claimsfeed2`, { timeout: 60000 })
      .then(res => {
        console.log(res.data)
        const filteredClaims = filterDuplicateClaims(res.data)
        setClaims(filteredClaims)
        setFilteredClaims(filteredClaims)
        setVisibleClaims(filteredClaims.slice(0, 4))
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
  useEffect(() => {
    const search = new URLSearchParams(location.search).get('query')
    setSearchTerm(search ?? '')
  }, [location.search])
  useEffect(() => {
    if (searchTerm) {
      const results = claims.filter(
        claim =>
          claim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.statement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          claim.source_link.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredClaims(results)
      setVisibleClaims(results.slice(0, 4))
    } else {
      setFilteredClaims(claims)
      setVisibleClaims(claims.slice(0, 4))
    }
  }, [searchTerm, claims])

  // Effect to track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollButton(true)
      } else {
        setShowScrollButton(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleValidation = (subject: any, id: number) => {
    console.log(subject, 'and', id)
    navigate({
      pathname: '/validate',
      search: `?subject=${CLAIM_ROOT_URL}/${id}`
    })
  }

  const handleschema = async (nodeUri: string) => {
    const domain = nodeUri.replace(/^https?:\/\//, '').replace(/\/$/, '')
    navigate({
      pathname: '/search',
      search: `?query=${domain}`
    })
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(event.currentTarget)
    setSelectedIndex(index)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setSelectedIndex(null)
  }

  const handleSeeMore = () => {
    const newVisibleCount = visibleClaims.length + 4
    setVisibleClaims(filteredClaims.slice(0, newVisibleCount))
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* <OverlayModal /> */}
      {isLoading ? (
        <Loader open={isLoading} />
      ) : (
        <>
          {filteredClaims.length > 0 ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                position: 'relative',
                mt: '64px',
                // mb: '1vh',
                width: isMediumScreen ? '97%' : '100%',
                flexDirection: 'column',
                backgroundColor: theme.palette.menuBackground,
                borderRadius: isMediumScreen ? '10px' : '10px 0px 0px 10px',
                padding: '20px'
              }}
            >
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
                <Typography
                  variant='h6'
                  component='div'
                  sx={{
                    color: theme.palette.texts,
                    textAlign: 'center',
                    marginLeft: isMediumScreen ? '0' : '1rem',
                    fontSize: '23px',
                    fontWeight: 'bold'
                  }}
                >
                  Feed of Claims
                  <Box
                    sx={{
                      height: '4px',
                      backgroundColor: theme.palette.maintext,
                      marginTop: '4px',
                      borderRadius: '2px',
                      width: '80%'
                    }}
                  />
                </Typography>
              </Box>
              {visibleClaims.map((claim: any, index: number) => (
                <Box key={claim.id} sx={{ marginBottom: '15px' }}>
                  <Card
                    sx={{
                      maxWidth: 'fit',
                      height: 'fit',
                      borderRadius: '20px',
                      display: isMediumScreen ? 'column' : 'row',
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
                          startIcon={<VerifiedOutlinedIcon />}
                          variant='text'
                          sx={{
                            fontSize: isMediumScreen ? '8px' : '16px',
                            fontWeight: 'bold',
                            marginRight: '10px',
                            p: '4px',
                            color: theme.palette.sidecolor,
                            '&:hover': {
                              backgroundColor: theme.palette.cardsbuttons
                            }
                          }}
                        >
                          VALIDATE
                        </Button>
                        <Link to={'/report/' + claim.claim_id}>
                          <Button
                            startIcon={<FeedOutlinedIcon />}
                            variant='text'
                            sx={{
                              fontSize: isMediumScreen ? '8px' : '16px',
                              fontWeight: 'bold',
                              marginRight: '10px',
                              p: '4px',
                              color: theme.palette.sidecolor,
                              '&:hover': {
                                backgroundColor: theme.palette.cardsbuttons
                              }
                            }}
                          >
                            Evidence
                          </Button>
                        </Link>
                        <Button
                          startIcon={<ShareOutlinedIcon />}
                          onClick={() => handleschema(claim.link)}
                          variant='text'
                          sx={{
                            fontSize: isMediumScreen ? '8px' : '16px',
                            fontWeight: 'bold',
                            marginRight: '10px',
                            p: '4px',
                            color: theme.palette.sidecolor,
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
              {visibleClaims.length < filteredClaims.length && (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <Button
                    variant='contained'
                    onClick={handleSeeMore}
                    sx={{
                      backgroundColor: theme.palette.buttons,
                      color: theme.palette.buttontext,
                      borderRadius: '91px',
                      fontWeight: 'bold',
                      fontSize: '22px',
                      width: '13.3vw',
                      maxWidth: '192px',
                      minWidth: '158px',
                      '&:hover': {
                        backgroundColor: theme.palette.buttonHover
                      }
                    }}
                  >
                    See More
                  </Button>
                </Box>
              )}
              <Grow in={showScrollButton}>
                <Fab
                  aria-label='scroll to top'
                  onClick={handleScrollToTop}
                  sx={{
                    position: 'fixed',
                    bottom: 84,
                    right: 36,
                    color: theme.palette.buttontext,
                    width: '5.486vw',
                    minWidth: '35px',
                    minHeight: '35px',
                    height: '5.486vw',
                    maxWidth: '79px',
                    maxHeight: '79px',
                    backgroundColor: theme.palette.buttons,
                    '&:hover': {
                      backgroundColor: theme.palette.buttonHover
                    }
                  }}
                >
                  <ArrowUpwardIcon />
                </Fab>
              </Grow>
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
