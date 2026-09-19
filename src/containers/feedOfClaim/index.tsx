import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import ForwardToInboxOutlinedIcon from '@mui/icons-material/ForwardToInboxOutlined'
import { IHomeProps } from './types'
import type { Claim, Entity } from '../../api/types'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Fab,
  Grow,
  IconButton,
  Typography,
  Fade,
  useMediaQuery,
  useTheme,
  Rating
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
    <Typography variant='body1' sx={{ fontWeight: 600, color: theme.palette.texts, wordBreak: 'break-word' }}>
      <span dangerouslySetInnerHTML={{ __html: highlightedName }} />
      <OpenInNewIcon sx={{ ml: 0.5, fontSize: 'inherit', verticalAlign: 'text-bottom' }} />
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

    // Check if link is internal to current LinkedTrust instance
    const isInternal = url.startsWith(BACKEND_BASE_URL) || url.startsWith(window.location.origin)

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

                // Check if this is a validation claim (claim about another claim)
                const validationTypes = ['is_vouched_for', 'agree', 'verified', 'validated']
                const isValidationClaim = validationTypes.includes(claim.claim || '')

                const action = (label: string, icon: React.ReactNode, onClick?: () => void) => (
                  <Button size='small' startIcon={icon} onClick={onClick} sx={{ color: theme.palette.sidecolor }}>
                    {label}
                  </Button>
                )

                return (
                  <Grow in={true} timeout={1000} key={claimId}>
                    <Card variant='outlined' sx={{ mb: 2, backgroundColor: theme.palette.cardBackground, color: theme.palette.texts }}>
                      <CardContent sx={{ pb: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                          <IconButton
                            size='small'
                            aria-label={expandedCards.has(claimId) ? 'collapse' : 'expand'}
                            onClick={() => toggleCardExpansion(claimId)}
                            sx={{ color: theme.palette.date, p: 0, mt: 0.25 }}
                          >
                            {expandedCards.has(claimId) ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                          </IconButton>
                          <Link
                            to={subject.uri}
                            onClick={e => handleLinkClick(e, subject.uri)}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}
                          >
                            <ClaimName claim={claim} searchTerm={searchTerm} />
                          </Link>
                          <Badge claim={claim.claim || ''} />
                        </Box>
                        {claim.statement && (
                          <Typography variant='body1' sx={{ mt: 1, wordBreak: 'break-word', color: theme.palette.texts }}>
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
                          <Typography variant='caption' sx={{ display: 'block', mt: 1, color: theme.palette.date }}>
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
                          <Box sx={{ mt: 1, animation: 'fadeIn 0.2s ease-in' }}>
                            {claim.aspect && (
                              <Typography variant='caption' sx={{ display: 'block', color: theme.palette.date }}>
                                Aspect: {claim.aspect}
                              </Typography>
                            )}
                            {claim.howKnown && (
                              <Typography variant='caption' sx={{ display: 'block', color: theme.palette.date }}>
                                How Known: {claim.howKnown}
                              </Typography>
                            )}
                            {claim.score !== undefined && claim.score !== null && (
                              <Typography variant='caption' sx={{ display: 'block', color: theme.palette.date }}>
                                Score: {claim.score}
                              </Typography>
                            )}
                            {claim.amt !== undefined && claim.amt !== null && (
                              <Typography variant='caption' sx={{ display: 'block', color: theme.palette.date }}>
                                Amount: ${claim.amt} {claim.unit || ''}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </CardContent>

                      <CardActions sx={{ flexWrap: 'wrap', px: 2, pb: 2, gap: 0.5 }}>
                        {/* Only show Validate, Evidence, and Certificate for non-validation claims */}
                        {!isValidationClaim && (
                          <>
                            {action('Validate', <VerifiedOutlinedIcon />, () => handleValidation(claimId))}
                            <Link to={'/report/' + claimId} style={{ textDecoration: 'none' }}>
                              {action('Evidence', <FeedOutlinedIcon />)}
                            </Link>
                            {/* Present button - opens presentation options (certificate, embed, share) */}
                            {!!claimId && (
                              <Link to={`/present/${claimId}`} style={{ textDecoration: 'none' }}>
                                {action('Present', <WorkspacePremiumOutlinedIcon />)}
                              </Link>
                            )}
                            {!!claimId && (
                              <Link to={`/request-endorsement/${claimId}`} style={{ textDecoration: 'none' }}>
                                {action('Request endorsement', <ForwardToInboxOutlinedIcon />)}
                              </Link>
                            )}
                          </>
                        )}

                        {/* Always show Graph View */}
                        {action('Graph View', <ShareOutlinedIcon />, () => handleSchema(claim))}

                        {expandedCards.has(claimId) &&
                          action('Export', <SystemUpdateAltIcon />, () => handleExportClaim(claim))}

                        {claim.stars && (
                          <Rating
                            readOnly
                            size='small'
                            value={claim.stars}
                            sx={{ ml: 'auto', color: theme.palette.stars }}
                          />
                        )}
                      </CardActions>
                    </Card>
                  </Grow>
                )
              })}
              <Grow in={showScrollButton}>
                <Fab
                  aria-label='scroll to top'
                  size='medium'
                  onClick={handleScrollToTop}
                  sx={{
                    position: 'fixed',
                    right: theme.spacing(2),
                    color: theme.palette.buttontext,
                    backgroundColor: theme.palette.buttons,
                    '&:hover': { backgroundColor: theme.palette.buttonHover },
                    // above the create-claim FAB, which sits above the bottom nav on phones
                    bottom: isMediumScreen ? `calc(${theme.mixins.bottomNav.height + 72}px + env(safe-area-inset-bottom))` : theme.spacing(11)
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
              size='medium'
              onClick={handleCreateClaim}
              sx={{
                position: 'fixed',
                right: theme.spacing(2),
                color: theme.palette.buttontext,
                backgroundColor: theme.palette.buttons,
                '&:hover': { backgroundColor: theme.palette.buttonHover },
                bottom: isMediumScreen ? `calc(${theme.mixins.bottomNav.height + 16}px + env(safe-area-inset-bottom))` : theme.spacing(3)
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
