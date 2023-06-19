import * as React from 'react'
import { styled } from '@mui/material/styles'
import { Card, CardContent, CardActions, IconButton, Collapse, Typography } from '@mui/material'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown'
import { Box } from '@mui/system'
import SchemaIcon from '@mui/icons-material/Schema'
import { useNavigate } from 'react-router-dom'
import { IHomeProps, ExpandMoreProps, Claim } from './types'
import { useEffect, useState } from 'react'
import axios from '../../axiosInstance'
import node from '../../../db.json'
import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material'

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

const FeedClaim = ({ toggleSnackbar, setSnackbarMessage, setLoading }: IHomeProps) => {
  const navigate = useNavigate()
  const [claims, setClaims] = useState<any[]>(node.nodes)
  const [claimSelected, setClaimSelected] = useState<number | null>(null)
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/nodes')
        const data = response.data
        setClaims(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchData() // Call the fetchData function
  }, [])

  const handleschame = async (claimId: number) => {
    window.localStorage.removeItem('claims')
    setClaimSelected(claimId)
    navigate({
      pathname: '/search',
      search: `?query=${claimId}`
    })
  }

  const formatClaimText = (claim: any) => {
    const Style = { color: '#009688' }

    const subject = <span style={Style}> {claim.edgesFrom[0]?.claim?.subject || ''}</span>

    const claimText = <span style={Style}>{claim.edgesFrom[0]?.claim?.claim || ''}</span>

    const source = <span style={Style}> {claim.edgesFrom[0]?.endNode?.name || ''}</span>

    return (
      <>
        {subject && <span style={Style}>{subject}</span>} got {claimText} claim from {source}
      </>
    )
  }

  const [expanded, setExpanded] = React.useState<number | null>(null)
  const handleExpandClick = (index: number) => {
    if (expanded === index) {
      setExpanded(null)
    } else {
      setExpanded(index)
    }
  }

  return (
    <Box
      sx={{
        position: 'center',
        justifyContent: 'center',
        width: '75%',
        p: '10px',
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
            <div style={{ display: 'block' }}>
              <div style={{ marginBottom: '1px' }}>
                <CardContent>
                  <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                    {formatClaimText(claim)}
                  </Typography>
                </CardContent>
              </div>
              <div style={{ marginTop: '1px' }}>
                <Collapse in={expanded === index} timeout='auto' unmountOnExit>
                  <CardContent sx={{ paddingBottom: '1px', marginBottom: '1px' }}>
                    {claim.edgesFrom[0]?.claim?.howKnown || ''}
                  </CardContent>
                  <CardContent sx={{ paddingBottom: '1px', marginBottom: '1px' }}>
                    {claim.edgesFrom[0]?.claim?.aspect || ''}
                  </CardContent>
                  <CardContent sx={{ paddingBottom: '1px', marginBottom: '1px' }}>
                    {claim.edgesFrom[0]?.claim?.confidence || ''}
                  </CardContent>
                </Collapse>
              </div>
            </div>
            <CardActions
              disableSpacing
              sx={{
                marginLeft: 'auto',
                marginTop: 'auto',
                width: isSmallScreen ? '100%' : 'auto',
                display: isSmallScreen ? 'flex' : 'block',
                justifyContent: isSmallScreen ? 'space-evenly' : 'none'
              }}
            >
              <SchemaIcon
                sx={{ color: 'primary.main', right: 0, cursor: 'pointer', marginLeft: isSmallScreen ? '5px' : 'auto' }}
                onClick={() => handleschame(claim.id)}
              />
              <ExpandMore
                expand={expanded === index}
                onClick={() => handleExpandClick(index)}
                aria-expanded={expanded === index}
                aria-label='show more'
                sx={{ marginLeft: 'auto', right: '10px', display: 'block' }}
              >
                <ExpandCircleDownIcon sx={{ color: 'primary.main' }} />
              </ExpandMore>
            </CardActions>
          </Card>
        </div>
      ))}
    </Box>
  )
}

export default FeedClaim
