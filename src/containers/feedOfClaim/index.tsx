import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SchemaIcon from '@mui/icons-material/Schema'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AssessmentIcon from '@mui/icons-material/Assessment'
import StarIcon from '@mui/icons-material/Star'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { IHomeProps, Claim } from './types'
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
import { BACKEND_BASE_URL } from '../../utils/settings'

const FeedClaim: React.FC<IHomeProps> = () => {
  const [claims, setClaims] = useState<Array<Claim>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null)
  const navigate = useNavigate()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    setIsLoading(true)
    axios
      .get(`${BACKEND_BASE_URL}/api/claimsfeed2`, { timeout: 60000 })
      .then(res => {
        setClaims(res.data)
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false))
  }, [])

  const handleValidation = (subject: any, id: number) => {
    navigate({
      pathname: '/validate',
      search: `?subject=${subject}/${id}`
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
            position: 'center',
            justifyContent: 'center',
            width: isSmallScreen ? '100%' : '50%',
            p: '0 10px',
            // ml: isSmallScreen ? 0 : '0px',
            mt: isSmallScreen ? '12vh' : '90px',
            flexDirection: 'column'
          }}
        >
          {claims.map((claim: any, index: number) => (
            <div key={claim.id}>
              <Card
                sx={{
                  maxWidth: 'fit',
                  height: 'fit',
                  mt: '15px',
                  borderRadius: '20px',
                  display: 'flex',
                  flexDirection: isSmallScreen ? 'column' : 'row',
                  backgroundColor: selectedIndex === index ? '#2d3838' : '#172d2d',
                  filter: selectedIndex === index ? 'blur(0.8px)' : 'none',
                  color: '#ffffff'
                }}
              >
                <Box sx={{ display: 'block', position: 'relative', width: '100%' }}>
                  <CardContent>
                    <a href={claim.link} target='_blank' rel='noopener noreferrer' style={{ textDecoration: 'none' }}>
                      <Typography variant='h6' sx={{ marginBottom: '10px' }} fontWeight={'bold'} color='#ffffff'>
                        {claim.name}
                        <OpenInNewIcon sx={{ marginLeft: '5px', color: '#ffffff', fontSize: '1rem' }} />
                      </Typography>
                    </a>
                    <Typography variant='body2' sx={{ marginBottom: '10px', color: '#ffffff' }}>
                      {new Date(claim.effective_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                    {claim.statement && (
                      <Typography
                        sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px', color: '#ffffff' }}
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
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        marginRight: '10px',
                        p: '4px',
                        '&:hover': {
                          backgroundColor: '#00695f'
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
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#00695f',
                            color: 'white'
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
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#00695f',
                          color: 'white'
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
                              color: '#009688',
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
                      color: '#ffffff',
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
                        color: '#009688'
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
                        backgroundColor: '#172d2d',
                        color: '#ffffff',
                        border: '1px solid #009688'
                      }
                    }}
                  >
                    {claim.source_link && (
                      <MenuItem onClick={() => window.open(claim.source_link, '_blank')}>
                        <Typography variant='body2' color='#ffffff'>
                          From: {claim.source_link}
                        </Typography>
                        <OpenInNewIcon style={{ marginLeft: '5px' }} />
                      </MenuItem>
                    )}
                    {claim.how_known && (
                      <MenuItem>
                        <Typography variant='body2' color='#ffffff'>
                          How Known: {claim.how_known}
                        </Typography>
                      </MenuItem>
                    )}
                    {claim.aspect && (
                      <MenuItem>
                        <Typography variant='body2' color='#ffffff'>
                          Aspect: {claim.aspect}
                        </Typography>
                      </MenuItem>
                    )}
                    {claim.confidence !== 0 && (
                      <MenuItem>
                        <Typography variant='body2' color='#ffffff'>
                          Confidence: {claim.confidence}
                        </Typography>
                      </MenuItem>
                    )}
                    {claim.stars && (
                      <MenuItem>
                        <Typography variant='body2' color='#ffffff'>
                          Rating as Stars: {claim.stars}
                        </Typography>
                      </MenuItem>
                    )}
                    {claim.score && (
                      <MenuItem>
                        <Typography variant='body2' color='#ffffff'>
                          Rating as Score: {claim.score}
                        </Typography>
                      </MenuItem>
                    )}
                    {claim.amt && (
                      <MenuItem>
                        <Typography variant='body2' color='#ffffff'>
                          Amount of claim: $ {claim.amt}
                        </Typography>
                      </MenuItem>
                    )}
                  </Menu>
                </Box>
              </Card>
            </div>
          ))}
        </Box>
      ) : (
        <Loader open={isLoading} />
      )}
    </>
  )
}

export default FeedClaim
