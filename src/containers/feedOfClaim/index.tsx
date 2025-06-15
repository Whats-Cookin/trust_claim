import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import StarIcon from '@mui/icons-material/Star'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import { IHomeProps } from './types'
import type { Claim, Entity } from '../../api/types'
import {
  Box,
  Button,
  Card,
  CardContent,
  Fab,
  Grow,
  IconButton,
  Typography,
  Fade,
  useMediaQuery,
  useTheme,
  Chip
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import * as api from '../../api'
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

// Helper to get entity data whether it's nested or string
const getEntityData = (
  entity: Entity | string | undefined
): { uri: string; name?: string; type?: string; image?: string } => {
  if (!entity) return { uri: '' }
  if (typeof entity === 'string') return { uri: entity }
  return entity
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

const ClaimName = ({ claim, searchTerm }: { claim: Claim; searchTerm: string }) => {
  const subject = getEntityData(claim.subject)
  const displayName = subject.name || extractProfileName(subject.uri)
  const theme = useTheme()
  const highlightedName = searchTerm.trim()
    ? displayName.replace(
        new RegExp(`(${searchTerm})`, 'gi'),
        (match: string) => `<span style="background-color:${theme.palette.searchBarBackground};">${match}</span>`
      )
    : displayName

  return (
    <Typography variant='body2' sx={{ marginBottom: '10px', color: theme.palette.texts }}>
      <span dangerouslySetInnerHTML={{ __html: highlightedName }} />
      <OpenInNewIcon sx={{ marginLeft: '5px', color: theme.palette.texts, fontSize: '1rem' }} />
    </Typography>
  )
}

const SourceLink = ({ claim, searchTerm }: { claim: Claim; searchTerm: string }) => {
  const displayLink = claim.sourceURI ? extractSourceName(claim.sourceURI) : ''
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

async function fetchClaims(page: number, query?: string) {
  const res = await api.getFeed({
    limit: PAGE_LIMIT,
    search: query || undefined,
    page: page
  })
  return res
}

const FeedClaim: React.FC<IHomeProps> = () => {
  const [claims, setClaims] = useState<Claim[]>([])
  const claimsRef = useRef<Claim[]>([])
  const currentPage = useRef(1)

  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [loadingNextPage, setLoadingNextPage] = useState(false)
  const [searchTerm, setSearchTerm] = useState(getSearchFromParams() || '')
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  const [showNotification, setShowNotification] = useState<boolean>(false)
  const [externalLink, setExternalLink] = useState<string>('')

  const navigate = useNavigate()
  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))

  const [showScrollButton, setShowScrollButton] = useState(false)

  const [isLastPage, setIsLastPage] = useState(false)
  const initialPageLoad = useRef(true)

  const isAuth = checkAuth()

  useMemo(() => {
    if (isLoading && !initialPageLoad.current) return
    initialPageLoad.current = false
    setIsLastPage(false)
    setIsLoading(true)
    currentPage.current = 1
    fetchClaims(1, searchTerm)
      .then(({ data }) => {
        claimsRef.current = data.entries
        if (data.pagination.page >= data.pagination.pages) {
          setIsLastPage(true)
        }
        setClaims(claimsRef.current)
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false))
  }, [searchTerm])

  useEffect(() => {
    const prev = searchTerm
    const search = getSearchFromParams()
    if (search === prev) return

    setSearchTerm(search ?? '')
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

      currentPage.current += 1
      const { data } = await fetchClaims(currentPage.current, searchTerm)

      claimsRef.current = claimsRef.current.concat(data.entries)

      if (data.pagination.page >= data.pagination.pages) {
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

  const handleSchema = async (claim: Claim) => {
    navigate({
      pathname: `/explore/${claim.id || claim.claim_id}`
    })
  }

  const handleCreateClaim = () => {
    navigate('/claim')
  }

  const toggleCardExpansion = (claimId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(claimId)) {
        newSet.delete(claimId)
      } else {
        newSet.add(claimId)
      }
      return newSet
    })
  }

  const handleExportClaim = (claim: Claim) => {
    const exportData = {
      ...claim,
      _metadata: {
        exportedAt: new Date().toISOString(),
        claimId: claim.id || claim.claim_id
      }
    }
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `claim_${claim.id || claim.claim_id}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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
    return new URLSearchParams(location.search).get('query')
  }

  return (
    <>
      {isLoading ? (
        <Loader open={isLoading} />
      ) : (
        <>
          {claims.length > 0 ? (
            <MainContainer>
              {claims.map((claim: Claim, index: number) => {
                const subject = getEntityData(claim.subject)
                const object = getEntityData(claim.object)
                const claimId = claim.id || claim.claim_id || 0

                return (
                  <Grow in={true} timeout={1000} key={claimId}>
                    <Box sx={{ marginBottom: '15px' }}>
                      <Card
                        sx={{
                          maxWidth: 'fit',
                          height: 'fit',
                          borderRadius: '20px',
                          display: isMediumScreen ? 'column' : 'row',
                          backgroundColor: theme.palette.cardBackground,
                          backgroundImage: 'none',
                          color: theme.palette.texts
                        }}
                      >
                        <Box sx={{ display: 'block', position: 'relative', width: '100%' }}>
                          {/* Badge positioned absolutely in top right */}
                          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
                            <Badge claim={claim.claim || ''} />
                          </Box>

                          <CardContent>
                            <Box sx={{ pr: '140px' }}>
                              {' '}
                              {/* Add padding to prevent overlap with badge */}
                              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                <IconButton
                                  size='small'
                                  onClick={() => toggleCardExpansion(claimId)}
                                  sx={{
                                    p: 0,
                                    mr: 0.5,
                                    mt: '4px',
                                    color: theme.palette.date,
                                    '&:hover': {
                                      backgroundColor: 'transparent'
                                    }
                                  }}
                                >
                                  <Box
                                    component='span'
                                    sx={{
                                      fontSize: '10px',
                                      display: 'inline-block',
                                      transform: expandedCards.has(claimId) ? 'rotate(90deg)' : 'rotate(0deg)',
                                      transition: 'transform 0.2s'
                                    }}
                                  >
                                    ▶
                                  </Box>
                                </IconButton>
                                <Link
                                  to={subject.uri}
                                  onClick={e => handleLinkClick(e, subject.uri)}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  style={{ textDecoration: 'none' }}
                                >
                                  <ClaimName claim={claim} searchTerm={searchTerm} />
                                </Link>
                              </Box>
                            </Box>
                            {claim.statement && (
                              <Typography
                                variant='body2'
                                sx={{
                                  padding: '5px 1 1 5px',
                                  wordBreak: 'break-word',
                                  marginBottom: '10px',
                                  color: theme.palette.texts
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
                            {(claim.sourceURI || claim.effectiveDate) && (
                              <Typography
                                variant='body2'
                                sx={{
                                  padding: '5px 1 1 5px',
                                  fontSize: '12px',
                                  color: theme.palette.date,
                                  fontFamily: 'Roboto, sans-serif'
                                }}
                              >
                                {claim.sourceURI && `source: ${extractSourceName(claim.sourceURI)}`}
                                {claim.sourceURI && claim.effectiveDate && ' · '}
                                {claim.effectiveDate &&
                                  new Date(claim.effectiveDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                              </Typography>
                            )}

                            {/* Expanded details */}
                            {expandedCards.has(claimId) && (
                              <Box
                                sx={{
                                  mt: 2,
                                  p: '5px 1 1 5px',
                                  animation: 'fadeIn 0.2s ease-in'
                                }}
                              >
                                {claim.aspect && (
                                  <Typography
                                    variant='body2'
                                    sx={{
                                      mb: 0.5,
                                      fontSize: '12px',
                                      color: theme.palette.date,
                                      fontFamily: 'Roboto, sans-serif'
                                    }}
                                  >
                                    Aspect: {claim.aspect}
                                  </Typography>
                                )}
                                {claim.confidence !== undefined && claim.confidence !== null && (
                                  <Typography
                                    variant='body2'
                                    sx={{
                                      mb: 0.5,
                                      fontSize: '12px',
                                      color: theme.palette.date,
                                      fontFamily: 'Roboto, sans-serif'
                                    }}
                                  >
                                    Confidence:{' '}
                                    {claim.confidence === 0 ? '0%' : `${Math.round(claim.confidence * 100)}%`}
                                  </Typography>
                                )}
                                {claim.howKnown && (
                                  <Typography
                                    variant='body2'
                                    sx={{
                                      mb: 0.5,
                                      fontSize: '12px',
                                      color: theme.palette.date,
                                      fontFamily: 'Roboto, sans-serif'
                                    }}
                                  >
                                    How Known: {claim.howKnown}
                                  </Typography>
                                )}
                                {claim.score !== undefined && claim.score !== null && (
                                  <Typography
                                    variant='body2'
                                    sx={{
                                      mb: 0.5,
                                      fontSize: '12px',
                                      color: theme.palette.date,
                                      fontFamily: 'Roboto, sans-serif'
                                    }}
                                  >
                                    Score: {claim.score}
                                  </Typography>
                                )}
                                {claim.amt !== undefined && claim.amt !== null && (
                                  <Typography
                                    variant='body2'
                                    sx={{
                                      mb: 0.5,
                                      fontSize: '12px',
                                      color: theme.palette.date,
                                      fontFamily: 'Roboto, sans-serif'
                                    }}
                                  >
                                    Amount: ${claim.amt} {claim.unit || ''}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </CardContent>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              position: 'relative',
                              mt: '5px',
                              mb: '10px',
                              pl: '20px',
                              pr: '20px'
                            }}
                          >
                            <Button
                              onClick={() => handleValidation(claimId)}
                              startIcon={<VerifiedOutlinedIcon />}
                              variant='text'
                              sx={{
                                fontSize: isMediumScreen ? '8px' : '12px',
                                marginRight: '10px',
                                p: '4px',
                                color: theme.palette.sidecolor,
                                '&:hover': {
                                  backgroundColor: theme.palette.cardsbuttons
                                }
                              }}
                            >
                              Validate
                            </Button>
                            <Link to={'/report/' + claimId}>
                              <Button
                                startIcon={<FeedOutlinedIcon />}
                                variant='text'
                                sx={{
                                  fontSize: isMediumScreen ? '8px' : '12px',
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
                              onClick={() => handleSchema(claim)}
                              variant='text'
                              sx={{
                                fontSize: isMediumScreen ? '8px' : '12px',
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
                            {expandedCards.has(claimId) && (
                              <Button
                                startIcon={<SystemUpdateAltIcon />}
                                onClick={() => handleExportClaim(claim)}
                                variant='text'
                                sx={{
                                  fontSize: isMediumScreen ? '8px' : '12px',
                                  marginRight: '10px',
                                  p: '4px',
                                  color: theme.palette.sidecolor,
                                  '&:hover': {
                                    backgroundColor: theme.palette.cardsbuttons
                                  }
                                }}
                              >
                                Export
                              </Button>
                            )}
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
                        </Box>
                      </Card>
                    </Box>
                  </Grow>
                )
              })}
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
                    backgroundColor: theme.palette.buttons,
                    '&:hover': {
                      backgroundColor: theme.palette.buttonHover
                    }
                  }}
                >
                  <ArrowUpwardIcon />
                </Fab>
              </Grow>

              {!isLastPage ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Fade in={loadingNextPage}>
                    <CircularProgress color='inherit' />
                  </Fade>
                </Box>
              ) : (
                ''
              )}

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
                backgroundColor: theme.palette.buttons,
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
