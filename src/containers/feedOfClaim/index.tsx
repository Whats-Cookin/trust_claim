import { useState, useEffect } from 'react'
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import SchemaIcon from '@mui/icons-material/Schema'
import { IHomeProps, ExpandMoreProps } from './types'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown'
import {
  Box,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  Grid
} from '@mui/material'
import axios from 'axios'
import Loader from '../../components/Loader'
import { Claim } from './types'
import { BACKEND_BASE_URL } from '../../utils/settings'
import Divider from '@mui/material/Divider'
import { Link } from '@mui/icons-material'
import { flexbox } from '@mui/system'

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props
  return <IconButton {...other} />
})(({ theme }) => ({
  marginLeft: 'auto'
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

  const handelValidation = (subject: any, id: number) => {
    console.log(subject, 'and', id)
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

    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {subject && (
          <>
            <span style={Style}>{subject}</span>
          </>
        )}
        <SchemaIcon
          sx={{
            color: 'primary.main',
            cursor: 'pointer'
          }}
          onClick={() => handleschema(claim.link)}
        />
        <Divider sx={{ margin: '10px 0' }} />
      </Box>
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
    <Box display='flex' justifyContent='center' alignItems='center' width='100%'>
      {claims && claims.length > 0 ? (
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
          {claims.map((claim: any, index: number) => (
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
                <Box sx={{ display: 'block' }}>
                  <CardContent>
                    <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                      {formatClaimText(claim)}
                    </Typography>
                    {claim.stars && (
                      <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                        <strong>Rating as Stars: </strong>
                        {claim.stars}
                      </Typography>
                    )}
                    {claim.claim && (
                      <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                        <strong>From:</strong> {claim.source_name}
                      </Typography>
                    )}
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

                      {claim.confidence !== 0 && (
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
                    <ExpandMore
                      expand={expanded === index}
                      onClick={() => handleExpandClick(index)}
                      aria-expanded={expanded === index}
                      aria-label='view More'
                      sx={{ fontSize: '1em' }}
                    >
                      {expanded ? 'view Less' : 'view More'}
                    </ExpandMore>
                  </CardContent>
                  <Button
                    onClick={() => handelValidation(claim.link, claim.claim_id)}
                    sx={{
                      m: '0 0 10px 20px',
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      p: '4px',
                      '&:hover': {
                        backgroundColor: '#00695f'
                      }
                    }}
                  >
                    Validate
                  </Button>
                </Box>
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
                ></CardActions>
              </Card>
            </div>
          ))}
        </Box>
      ) : (
        <Loader open={isLoading} />
      )}
    </Box>
  )
}

export default FeedClaim
