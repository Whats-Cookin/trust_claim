import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import StarIcon from '@mui/icons-material/Star'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import { Claim as ImportedClaim, IHomeProps } from './types'
import {
  Box,
  Button,
  Card,
  CardContent,
  Fab,
  Grow,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Fade,
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import axios from 'axios'
import Loader from '../../components/Loader'
import IntersectionObservee from '../../components/IntersectionObservee'
import { BACKEND_BASE_URL } from '../../utils/settings'
import { AddCircleOutlineOutlined } from '@mui/icons-material'
import MainContainer from '../../components/MainContainer'
import { checkAuth } from '../../utils/authUtils'
import Redirection from '../../components/RedirectPage'
import { sleep } from '../../utils/promise.utils'
import Badge from './Badge'
const CLAIM_ROOT_URL = `${BACKEND_BASE_URL}/claims`
const PAGE_LIMIT = 50

interface LocalClaim {
  name: string
  source_link: string
  link: string
  author: string // this is who created the claim
  curator: string // this is claim about
}

const extractProfileName = (url: string): string | null => {
  const capitalizeFirstLetter = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1)

  try {
    const formattedUri = url.startsWith('http') ? url : `https://${url}`
    const parsedUrl = new URL(formattedUri)
    const domain = parsedUrl.hostname.replace(/^www\./, '')

    const pathParts = parsedUrl.pathname.split('/').filter(Boolean)

    // Define common social media platforms and their username extraction logic
    const socialMediaPatterns: { [key: string]: number } = {
      'linkedin.com': 1, // linkedin.com/in/username
      'twitter.com': 0, // twitter.com/username
      'x.com': 0, // x.com/username
      'instagram.com': 0, // instagram.com/username
      'facebook.com': 0, // facebook.com/username or facebook.com/profile.php?id=xyz
      'tiktok.com': 1, // tiktok.com/@username
      'github.com': 0, // github.com/username
      'youtube.com': 1, // youtube.com/c/username or youtube.com/user/username
      'medium.com': 0, // medium.com/@username
      'reddit.com': 1 // reddit.com/user/username
    }

    // Extract username if domain is a known social media platform
    const usernameIndex = socialMediaPatterns[domain]
    if (usernameIndex !== undefined && pathParts.length > usernameIndex) {
      return capitalizeFirstLetter(pathParts[usernameIndex].replace('@', ''))
    }

    return capitalizeFirstLetter(domain.replace('.com', ''))
  } catch (error) {
    console.error('Failed to parse URL:', error)
    return null
  }
}

const extractSourceName = (url: string) => {
  const regex = /linkedin\.com\/(?:in|company)\/([^\\/]+)(?:\/.*)?/
  const match = regex.exec(url)
  return match ? match[1].replace(/\./g, ' ') : url
}
const ClaimName = ({ claim, searchTerm }: { claim: LocalClaim; searchTerm: string }) => {
  let displayName = claim.name
  if (claim.curator) {
    displayName = `${claim.curator} - ${claim.name}`
  } else if (extractProfileName(claim.link)) {
    displayName = `${extractProfileName(claim.link)} - ${claim.name}`
  }

  const theme = useTheme()
  const highlightedName = searchTerm.trim()
    ? displayName.replace(
        new RegExp(`(${searchTerm})`, 'gi'),
        (match: string) => `<span style="background-color:${theme.palette.searchBarBackground};">${match}</span>`
      )
    : displayName

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography variant='body1' sx={{ marginBottom: '10px', color: theme.palette.texts }}>
        <span dangerouslySetInnerHTML={{ __html: highlightedName }} />
        <OpenInNewIcon sx={{ marginLeft: '10px', color: theme.palette.texts, fontSize: '18px' }} />
      </Typography>
    </Box>
  )
}

const SourceLink = ({ claim, searchTerm }: { claim: LocalClaim; searchTerm: string }) => {
  const displayLink = extractSourceName(claim.source_link)
  const theme = useTheme()
  const highlightedLink = searchTerm.trim()
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

async function fetchClaims(nextPage: string | null, query?: string, type?: string) {
  const res = await axios.get(`${BACKEND_BASE_URL}/api/claims/v3`, {
    timeout: 60000,
    params: {
      limit: PAGE_LIMIT,
      search: query || undefined,
      type: type || undefined,
      nextPage: nextPage || undefined
    }
  })
  return res
}

const FeedClaim: React.FC<IHomeProps> = () => {
  const [claims, setClaims] = useState<ImportedClaim[]>([])
  const claimsRef = useRef<ImportedClaim[]>([])
  const location = useLocation()

  const filter = getSearchFromParams()
  const [isLoading, setIsLoading] = useState(true)
  const [loadingNextPage, setLoadingNextPage] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null)
  const [searchTerm, setSearchTerm] = useState(filter?.query || '')
  const [type, setType] = useState(filter?.type || '')

  const [showNotification, setShowNotification] = useState<boolean>(false)
  const [externalLink, setExternalLink] = useState<string>('')

  const navigate = useNavigate()
  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))

  const [showScrollButton, setShowScrollButton] = useState(false)

  const [isLastPage, setIsLastPage] = useState(false)
  const initialPageLoad = useRef(true)
  const nextPage = useRef<string | null>(null)

  const isAuth = checkAuth()

  useEffect(() => {
    if (isLoading && !initialPageLoad.current) return

    initialPageLoad.current = false

    setIsLastPage(false)
    setIsLoading(true)

    fetchClaims(null, searchTerm, type)
      .then(({ data }) => {
        claimsRef.current = data.claims
        nextPage.current = data.nextPage
        if (data.claims.length < PAGE_LIMIT) {
          setIsLastPage(true)
        }
        setClaims(claimsRef.current)
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false))
  }, [searchTerm, type])

  useEffect(() => {
    const search = getSearchFromParams()
    const newQuery = search.query ?? ''
    const newType = search.type ?? ''

    if (searchTerm !== newQuery || type !== newType) {
      console.log('URL changed, updating search state:', { newQuery, newType })
      setSearchTerm(newQuery)
      setType(newType)
    }
  }, [location.search])

  useEffect(() => {
    document.addEventListener('scroll', onScroll)
    return () => {
      document.removeEventListener('scroll', onScroll)
    }
  }, [])

  function onScroll() {
    setShowScrollButton(window.scrollY > 200)
  }

  async function loadNextPage() {
    if (isLastPage || loadingNextPage) return

    try {
      setLoadingNextPage(true)

      // To give room for the spinner to render
      await sleep()

      const { data } = await fetchClaims(nextPage.current, searchTerm, type)

      // Check if we got any new claims
      if (data.claims.length === 0) {
        setIsLastPage(true)
        setLoadingNextPage(false)
        return
      }

      claimsRef.current = claimsRef.current.concat(data.claims)
      nextPage.current = data.nextPage

      if (data.claims.length < PAGE_LIMIT || !data.nextPage) {
        setIsLastPage(true)
      }

      setClaims(claimsRef.current)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingNextPage(false)
    }
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleValidation = (id: number) => {
    navigate({
      pathname: '/validate',
      search: `?subject=${CLAIM_ROOT_URL}/${id}`
    })
  }

  const handleSchema = async (claim: ImportedClaim) => {
    navigate({
      pathname: `/explore/${claim.claim_id}`
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

  const handleCreateClaim = () => {
    navigate('/claim')
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault()

    const allowedDomains = ['https://live.linkedtrust.us', 'https://dev.linkedtrust.us', 'https://linkedtrust.us']
    const isInternal = allowedDomains.some(domain => url.startsWith(domain))

    if (!isInternal) {
      setShowNotification(true)
      setExternalLink(url)
    } else {
      window.open(url, '_blank', 'noopener noreferrer')
    }
  }

  const handleContinue = () => {
    setShowNotification(false)
    window.open(externalLink, '_blank')
  }

  const handleCancel = () => {
    setShowNotification(false)
  }

  function getSearchFromParams() {
    const search = new URLSearchParams(location.search)
    return { query: search.get('query'), type: search.get('type') }
  }

  return (
    <>
      {isLoading ? (
        <Loader open={isLoading} />
      ) : (
        <>
          {claims.length > 0 ? (
            <MainContainer
              sx={{
                marginLeft: 'auto',
                backgroundColor: '#FFFFFF',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)'
              }}
            >
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
                <Typography
                  sx={{
                    color: theme.palette.texts,
                    textAlign: 'center',
                    marginLeft: isMediumScreen ? '0' : '1rem',
                    marginTop: isMediumScreen ? '0' : '1rem',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}
                >
                  Recent Claims
                </Typography>
              </Box>
              <Box
                sx={{
                  height: '1px',
                  backgroundColor: '#E0E0E0',
                  marginTop: '4px',
                  borderRadius: '2px',
                  width: '100%',
                  mb: '40px'
                }}
              />

              {claims.map((claim: any, index: number) => (
                <Grow in={true} timeout={1000} key={claim.claim_id}>
                  <Box sx={{ marginBottom: '15px' }}>
                    <Card
                      sx={{
                        height: 'fit-content',
                        textWrap: 'break-word',
                        borderRadius: '8px',
                        display: isMediumScreen ? 'column' : 'row',
                        backgroundColor:
                          selectedIndex === index ? theme.palette.cardBackgroundBlur : theme.palette.cardBackground,
                        backgroundImage: 'none',
                        filter: selectedIndex === index ? 'blur(0.8px)' : 'none',
                        color: theme.palette.texts,
                        boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.2)',
                        mb: '10px'
                      }}
                    >
                      <Box sx={{ display: 'block', position: 'relative', width: '100%' }}>
                        <CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              width: '95%',
                              gap: '10px',
                              justifyContent: 'space-between'
                            }}
                          >
                            <Tooltip
                              title='View the original credential'
                              arrow
                              placement='left'
                              componentsProps={{
                                tooltip: {
                                  sx: {
                                    bgcolor: '#222222',
                                    color: '#FFFFFF',
                                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    borderRadius: '4px'
                                  }
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'block',
                                  wordBreak: 'break-word',
                                  overflowWrap: 'anywhere',
                                  whiteSpace: 'normal'
                                }}
                              >
                                <Link
                                  to={claim.link}
                                  onClick={e => handleLinkClick(e, claim.link)}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  style={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    fontSize: '18px !important',
                                    alignItems: 'center'
                                  }}
                                >
                                  <ClaimName claim={claim} searchTerm={searchTerm} />
                                </Link>
                              </Box>
                            </Tooltip>

                            <Badge claim={claim.claim} />
                          </Box>
                          <Typography
                            variant='body1'
                            sx={{
                              marginBottom: '10px',
                              color: theme.palette.text1,
                              fontSize: '14px !important',
                              fontFamily: 'Roboto'
                            }}
                          >
                            {`Created by: ${claim.author ? claim.author : extractProfileName(claim.link)}, ${new Date(
                              claim.effective_date
                            ).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}`}
                          </Typography>

                          {claim.statement && (
                            <Typography
                              variant='body1'
                              sx={{
                                padding: '5px 1 1 5px',
                                wordBreak: 'break-word',
                                fontSize: '16px !important',
                                fontWeight: 500,
                                marginBottom: '1px',
                                color: theme.palette.claimtext
                              }}
                            >
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: searchTerm
                                    ? claim.statement.replace(
                                        new RegExp(`(${searchTerm})`, 'gi'),
                                        (match: any) =>
                                          `<span style="background-color:${theme.palette.searchBarBackground};">${match}</span>`
                                      )
                                    : claim.statement
                                }}
                              />
                            </Typography>
                          )}
                        </CardContent>
                        {/* moka work here  */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', m: '20px' }}>
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
                                    color: '#FFC107',
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
                        <Box
                          sx={{
                            height: '1px',
                            backgroundColor: '#E0E0E0',
                            marginTop: '4px',
                            borderRadius: '2px',
                            display: 'flex',
                            width: '100%',
                            mb: '10px',
                            mr: 'auto',
                            ml: 'auto'
                          }}
                        />
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-evenly',
                            gap: 2,
                            position: 'relative',
                            mt: '10px',
                            mb: '10px',
                            pl: '20px',
                            pr: '20px'
                          }}
                        >
                          <Button
                            onClick={() => handleValidation(claim.claim_id)}
                            startIcon={<VerifiedOutlinedIcon sx={{ color: '#2D6A4F' }} />}
                            variant='outlined'
                            sx={{
                              minWidth: {
                                xs: '80px',
                                sm: '100px',
                                md: '120px'
                              },
                              fontSize: {
                                xs: '10px',
                                sm: '12px',
                                md: '16px'
                              },
                              p: {
                                xs: '4px 8px',
                                md: '9px 24px'
                              },
                              textTransform: 'none',
                              color: '#2D6A4F',
                              borderColor: 'transparent',
                              borderRadius: '8px',
                              '&:hover': {
                                backgroundColor: '#F1F4F6',
                                borderColor: '#F1F4F6'
                              }
                            }}
                          >
                            Validate
                          </Button>

                          <Link to={'/report/' + claim.claim_id} style={{ textDecoration: 'none' }}>
                            <Button
                              startIcon={<InsertDriveFileOutlinedIcon sx={{ color: '#2D6A4F' }} />}
                              variant='outlined'
                              sx={{
                                minWidth: {
                                  xs: '80px',
                                  sm: '100px',
                                  md: '120px'
                                },
                                fontSize: {
                                  xs: '10px',
                                  sm: '12px',
                                  md: '16px'
                                },
                                p: {
                                  xs: '4px 8px',
                                  md: '9px 24px'
                                },
                                textTransform: 'none',
                                color: '#2D6A4F',
                                borderColor: 'transparent',
                                borderRadius: '8px',
                                '&:hover': {
                                  backgroundColor: '#F1F4F6',
                                  borderColor: '#F1F4F6'
                                }
                              }}
                            >
                              Evidence
                            </Button>
                          </Link>

                          <Button
                            startIcon={<HubOutlinedIcon sx={{ color: '#2D6A4F' }} />}
                            onClick={() => handleSchema(claim)}
                            variant='outlined'
                            sx={{
                              minWidth: {
                                xs: '80px',
                                sm: '100px',
                                md: '120px'
                              },
                              fontSize: {
                                xs: '10px',
                                sm: '12px',
                                md: '16px'
                              },
                              p: {
                                xs: '4px 8px',
                                md: '9px 24px'
                              },
                              textTransform: 'none',
                              color: '#2D6A4F',
                              borderColor: 'transparent',
                              borderRadius: '8px',
                              '&:hover': {
                                backgroundColor: '#F1F4F6',
                                borderColor: '#F1F4F6'
                              }
                            }}
                          >
                            Graph
                          </Button>
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
                </Grow>
              ))}
              <Grow in={showScrollButton}>
                <Fab
                  aria-label='scroll to top'
                  onClick={handleScrollToTop}
                  sx={{
                    position: 'fixed',
                    bottom: {
                      xs: 145,
                      sm: 140,
                      md: 120,
                      lg: 120
                    },
                    right: 36,
                    color: theme.palette.buttontext,
                    width: '4.5vw',
                    minWidth: '35px',
                    minHeight: '35px',
                    height: '4.5vw',
                    maxWidth: '79px',
                    maxHeight: '79px',
                    backgroundColor: '#2D6A4F',
                    '&:hover': {
                      backgroundColor: theme.palette.buttonHover
                    }
                  }}
                >
                  <ArrowUpwardIcon />
                </Fab>
              </Grow>

              {!isLastPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Fade in={loadingNextPage}>
                    <CircularProgress color='inherit' />
                  </Fade>
                </Box>
              )}

              {/* Only show intersection observer if we have less than 10 results */}
              {claims.length < 10 && !isLastPage && <IntersectionObservee onIntersection={loadNextPage} />}

              {/* Always add an intersection observer at the end */}
              <IntersectionObservee onIntersection={loadNextPage} />
            </MainContainer>
          ) : (
            <MainContainer sx={{ textAlign: 'center' }}>
              <Typography variant='body2'>No results found{searchTerm ? ` for ${searchTerm}` : '.'}</Typography>
            </MainContainer>
          )}

          {/* Create Claim Button */}
          {isAuth && (
            <Fab
              aria-label='create claim'
              onClick={handleCreateClaim}
              sx={{
                position: 'fixed',
                bottom: {
                  xs: 84,
                  sm: 75,
                  md: 45,
                  lg: 40
                },
                right: 36,
                color: theme.palette.buttontext,
                width: '4.5vw',
                minWidth: '35px',
                minHeight: '35px',
                height: '4.5vw',
                maxWidth: '79px',
                maxHeight: '79px',
                backgroundColor: '#2D6A4F',
                '&:hover': {
                  backgroundColor: theme.palette.buttonHover
                }
              }}
            >
              <AddCircleOutlineOutlined />
            </Fab>
          )}
        </>
      )}
      {showNotification && (
        <Redirection externalLink={externalLink} onContinue={handleContinue} onCancel={handleCancel} />
      )}
    </>
  )
}

export default FeedClaim
