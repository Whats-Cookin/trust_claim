import * as React from 'react'
import { styled } from '@mui/material/styles'
import { Card, CardContent, CardActions, IconButton, Collapse, Typography } from '@mui/material'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown'
import { Box } from '@mui/system'
import SchemaIcon from '@mui/icons-material/Schema'
import { Link, useNavigate } from 'react-router-dom'
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

    function formatUrl(url: string) {
      if (!/^https?:\/\//i.test(url)) {
        return 'http://' + url
      }
      return url
    }

    const subject = (
      <span style={Style}>
        <a
          href={formatUrl(claim.edgesFrom[0]?.claim?.subject || '')}
          target='_blank'
          rel='noopener noreferrer'
          style={Style}
        >
          {claim.edgesFrom[0]?.claim?.subject || ''}
        </a>
      </span>
    )

    const claimText = (
      <span style={{ color: '#009688', textDecoration: 'none' }}>{claim.edgesFrom[0]?.claim?.claim || ''}</span>
    )

    const source = (
      <span style={Style}>
        <a
          href={formatUrl(claim.edgesFrom[0]?.endNode?.name || '')}
          target='_blank'
          rel='noopener noreferrer'
          style={Style}
        >
          {claim.edgesFrom[0]?.endNode?.name || ''}
        </a>
      </span>
    )

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
              <CardContent>
                <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                  {formatClaimText(claim)}
                </Typography>
                <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                  <strong>Statement:</strong>
                  {claim.edgesFrom[0]?.claim?.statement || 'No information provided'}
                </Typography>

                <div style={{ display: expanded === index ? 'block' : 'none' }}>
                  <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                    <strong>How Known:</strong>
                    {claim.edgesFrom[0]?.claim?.howKnown || ''}
                  </Typography>
                  <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                    <strong>Aspect :</strong>
                    {claim.edgesFrom[0]?.claim?.aspect || ''}
                  </Typography>
                  <Typography sx={{ padding: '5px 1 1 5px', wordBreak: 'break-word', marginBottom: '1px' }}>
                    <strong>confidence</strong> {claim.edgesFrom[0]?.claim?.confidence || ''}
                  </Typography>
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
                onClick={() => handleschame(claim.id)}
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
  )
}

export default FeedClaim
