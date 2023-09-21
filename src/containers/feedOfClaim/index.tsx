import { useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import SchemaIcon from '@mui/icons-material/Schema'
import { IHomeProps, ExpandMoreProps } from './types'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown'
import { Box, Card, CardContent, CardActions, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material'
import axios from 'axios'
import Loader from '../../components/Loader'
import { Claim } from './types'
import { BACKEND_BASE_URL } from '../../utils/settings'

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props
  return <IconButton {...other} />
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  })
}))

const FeedClaim = ({}: IHomeProps) => {
  const [claims, setClaims] = useState<Array<Claim>>([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    setIsLoading(true)
    axios
      .get(`${BACKEND_BASE_URL}/api/claimsfeed2`, { timeout: 60000 })
      .then(res => {
        console.log(res.data)
        setClaims(res.data)
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false))
  }, [])

  const handleschema = async (nodeUri: string) => {
    const domain = nodeUri.replace(/^https?:\/\//, '').replace(/\/$/, '')
    navigate({
      pathname: '/search',
      search: `?query=${domain}`
    })
  }

  const formatClaimText = (claim: any) => {
    const Style = { color: '#009688' }

    function formatUrl(url: string) {
      if (!/^https?:\/\//i.test(url)) {
        return 'http://' + url
      }
      return url
    }

    const subject = (
      <span style={Style}>
        <a href={formatUrl(claim.link || '')} target='_blank' rel='noopener noreferrer' style={Style}>
          {claim.name || ''}
        </a>
      </span>
    )

    const claimText = <span style={{ color: '#009688', textDecoration: 'none' }}>{claim.claim || ''}</span>

    const source = (
      <span style={Style}>
        <a href={formatUrl(claim.source_link || '')} target='_blank' rel='noopener noreferrer' style={Style}>
          {claim.source_name || ''}
        </a>
      </span>
    )

    return (
      <>
        {subject && <span style={Style}>{subject}</span>} got {claimText} claim from {source}
      </>
    )
  }

  const [expanded, setExpanded] = useState<number | null>(null)
  const handleExpandClick = (index: number) => {
    if (expanded === index) {
      setExpanded(null)
    } else {
      setExpanded(index)
    }
  }

  return (
    <>
      {claims && (
        <Box
          sx={{
            position: 'center',
            justifyContent: 'center',
            width: '75%',
            p: '0 10px',
            background: '#FFFFFF',
            ml: '130',
            mt: isSmallScreen ? '140px' : '90px',
            boxShadow: 20,
            bgcolor: 'background.paper',
            flexDirection: 'column'
          }}
        >
          {claims &&
            claims.map((claim: any, index: number) => (
              <div key={claim.id}>
                <Card
                  sx={{
                    maxWidth: 'fit',
                    height: 'fit',
                    mt: '15px',
                    borderRadius: '20px',
                    border: '2px solid #009688',
                    display: 'flex',
                    flexDirection: isSmallScreen ? 'column' : 'row'
                  }}
                >
                  <div style={{ display: 'block' }}>
                    <CardContent>
                      <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                        {formatClaimText(claim)}
                      </Typography>
                      {claim.statement && (
                        <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                          <strong>Statement:</strong> {claim.statement}
                        </Typography>
                      )}

                      <div style={{ display: expanded === index ? 'block' : 'none' }}>
                        {claim.how_known && (
                          <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                            <strong>How Known: </strong>
                            {claim.how_known}
                          </Typography>
                        )}

                        {claim.aspect && (
                          <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                            <strong>Aspect: </strong>
                            {claim.aspect}
                          </Typography>
                        )}

                        {claim.confidence && (
                          <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                            <strong>Confidence: </strong>
                            {claim.confidence}
                          </Typography>
                        )}
                        {claim.stars && (
                          <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                            <strong>Rating as Stars: </strong>
                            {claim.stars}
                          </Typography>
                        )}

                        {claim.score && (
                          <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                            <strong>Rating as Score: </strong>
                            {claim.score}
                          </Typography>
                        )}

                        {claim.amt && (
                          <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                            <strong>Amount of claim: </strong>$ {claim.amt}
                          </Typography>
                        )}
                      </div>
                    </CardContent>
                  </div>
                  <CardActions
                    disableSpacing
                    sx={{
                      marginLeft: 'auto',
                      marginTop: 'auto',
                      marginBottom: 'auto',
                      width: isSmallScreen ? '100%' : 'auto',
                      display: isSmallScreen ? 'flex' : 'block',
                      justifyContent: isSmallScreen ? 'space-evenly' : 'none'
                    }}
                  >
                    <SchemaIcon
                      sx={{
                        color: 'primary.main',
                        right: 0,
                        cursor: 'pointer',
                        marginTop: '10px',
                        marginLeft: isSmallScreen ? '5px' : 'auto'
                      }}
                      onClick={() => handleschema(claim.link)}
                    />
                    <ExpandMore
                      expand={expanded === index}
                      onClick={() => handleExpandClick(index)}
                      aria-expanded={expanded === index}
                      aria-label='show more'
                      sx={{ marginLeft: 'auto', right: '10px', marginTop: '10px', display: 'block' }}
                    >
                      <ExpandCircleDownIcon sx={{ color: 'primary.main' }} />
                    </ExpandMore>
                  </CardActions>
                </Card>
              </div>
            ))}
        </Box>
      )}
      <Loader open={isLoading} />
    </>
  )
}

export default FeedClaim
