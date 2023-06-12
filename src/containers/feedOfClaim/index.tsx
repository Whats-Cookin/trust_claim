import * as React from 'react'
import { styled } from '@mui/material/styles'
import { Card, CardContent, CardActions, IconButton, Collapse, Typography } from '@mui/material'
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown'
import { Box } from '@mui/system'
import SchemaIcon from '@mui/icons-material/Schema'
import { useNavigate } from 'react-router-dom'
import { IHomeProps, ExpandMoreProps } from './types'
import { useEffect, useState } from 'react'
import axios from '../../axiosInstance'

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
  const [claims, setClaims] = useState<any>(null)
  const [claimSelected, setClaimSelected] = useState<number | null>(null)

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

    // Retrieve the subject from edgesTo
    const subject = <span style={Style}> {claim.edgesFrom[0]?.claim?.subject || ''}</span>

    // Retrieve the claim text from the current claim
    const claimText = <span style={Style}>{claim.edgesFrom[0]?.claim?.claim || ''}</span>

    // Retrieve the source from edgesFrom
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
        mt: '90px',
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
                m: '20px',
                borderRadius: '20px',
                border: '2px solid #009688',
                display: 'flex'
              }}
            >
              <CardContent>
                <Typography sx={{ padding: '5px 0 0 5px' }}>{formatClaimText(claim)}</Typography>
              </CardContent>

              <Collapse in={expanded === index} timeout='auto' unmountOnExit>
                <CardContent sx={{ display: 'block' }}></CardContent>
              </Collapse>

              <CardActions disableSpacing sx={{ marginLeft: 'auto', marginTop: 'auto', display: 'block' }}>
                <SchemaIcon
                  sx={{ color: 'primary.main', right: 0, cursor: 'pointer' }}
                  onClick={() => handleschame(claim.id)}
                />
                <ExpandMore
                  expand={expanded === index}
                  onClick={() => handleExpandClick(index)}
                  aria-expanded={expanded === index}
                  aria-label='show more'
                  sx={{ marginLeft: 'auto', display: 'block', right: '10px' }}
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
