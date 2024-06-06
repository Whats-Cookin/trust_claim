import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const ClaimName = ({ claim }: { claim: LocalClaim }) => {
  const displayName = extractProfileName(claim.name)
  const theme = useTheme()

  return (
    <Typography variant='h6' sx={{ marginBottom: '10px', color: theme.palette.texts }} fontWeight='bold'>
      {displayName}
      <OpenInNewIcon sx={{ marginLeft: '5px', color: theme.palette.texts, fontSize: '1rem' }} />
    </Typography>
  )
}

const SourceLink = ({ claim }: { claim: LocalClaim }) => {
  const displayLink = extractSourceName(claim.source_link)
  const theme = useTheme()

  return (
    <Typography variant='body2' sx={{ color: theme.palette.texts }}>
      From: {displayLink}
    </Typography>
  )
}
const filterDuplicateClaims = (claims: Array<ImportedClaim>): Array<ImportedClaim> => {
  const uniqueClaimsMap = new Map<number, ImportedClaim>()

  claims.forEach(claim => {
    uniqueClaimsMap.set(claim.claim_id, claim)
  })

  return Array.from(uniqueClaimsMap.values())
}

const FeedClaim: React.FC<IHomeProps> = () => {
  const [claims, setClaims] = useState<Array<ImportedClaim>>([])
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null)
  const navigate = useNavigate()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.down(800))

  useEffect(() => {
    setIsLoading(true)
    axios
      .get(`${BACKEND_BASE_URL}/api/claimsfeed2`, { timeout: 60000 })
      .then(res => {
        console.log(res.data)
        const filteredClaims = filterDuplicateClaims(res.data)
        setClaims(filteredClaims)
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

  return (
    <>
      {claims && claims.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            position: 'center',
            justifyContent: 'center',
            width: isMediumScreen ? '100%' : '50%',
            p: '0 10px',
            mt: isSmallScreen ? '6vh' : '55px',
            flexDirection: 'column',
            backgroundColor: theme.palette.formBackground
          }}
        >
          {!isMediumScreen && <AlwaysOpenSidebar isAuth={isAuth} />}
          {claims.map((claim: any, index: number) => (
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
                    <a href={claim.link} target='_blank' rel='noopener noreferrer' style={{ textDecoration: 'none' }}>
                      <ClaimName claim={claim} />
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
                        {claim.statement}
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
                          <SourceLink claim={claim} />
                        </Typography>
                        <OpenInNewIcon style={{ marginLeft: '5px' }} />
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
        <Loader open={isLoading} />
      )}
    </>
  )
}

export default FeedClaim
