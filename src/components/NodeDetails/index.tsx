import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Button, Card, useMediaQuery, useTheme } from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'
import backSvg from '../../assets/images/back.svg'
import StartNode from '../StartNode'
import EndNode from '../EndNode'
import { BACKEND_BASE_URL } from '../../utils/settings'
import { useEffect, useState } from 'react'
import axios from '../../axiosInstance'

interface NodeDetailsProps {
  open: boolean
  setOpen: (open: boolean) => void
  selectedClaimId: string
  startNodeId: string
  endNodeId: string
  claimImg: string
  isDarkMode: boolean
}

export default function NodeDetails({ setOpen, selectedClaimId, claimImg, startNodeId, endNodeId }: NodeDetailsProps) {
  const handleClose = () => setOpen(false)

  const theme = useTheme()
  const [startNode, setStartNode] = useState<any>(null)
  const [endNode, setEndNode] = useState<any>(null)

  useEffect(() => {
    async function fetchNodeDetails(nodeId: string, setNode: any) {
      const claimRes = await axios.get(`/api/claim/${nodeId}`)
      setNode(claimRes.data.claim)
    }
    Promise.all([fetchNodeDetails(startNodeId, setStartNode), fetchNodeDetails(endNodeId, setEndNode)])
  }, [startNodeId, endNodeId])

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
        <StartNode selectedClaim={startNode} claimImg={claimImg} />
        <EndNode selectedClaim={endNode} claimImg={claimImg} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '15px' }}>
        <Button
          sx={{
            color: theme.palette.link,
            fontWeight: 400,
            borderRadius: '100px',
            fontSize: 'clamp(0.875rem, 2.5vw, 1.1rem)',
            px: '2rem'
          }}
          onClick={handleClose}
        >
          <img src={backSvg} alt='arrow' style={{ width: '10px', marginRight: '10px' }} />
          BACK
        </Button>
        <Box>
          <Button
            component={Link}
            to={`/validate?subject=${BACKEND_BASE_URL}/claims/${selectedClaimId}`}
            sx={{
              color: theme.palette.buttontext,
              bgcolor: theme.palette.buttons,
              fontWeight: 500,
              borderRadius: '24px',
              fontSize: 'clamp(0.875rem, 2.5vw, 1.1rem)',
              px: '2rem',
              marginRight: '15px',
              width: { xs: '10px', sm: '180px' },
              height: '48px'
            }}
          >
            Validate
          </Button>

          <Button
            component={Link}
            to={`/report/${selectedClaimId}`}
            sx={{
              color: theme.palette.buttontext,
              bgcolor: theme.palette.buttons,
              fontWeight: 500,
              borderRadius: '24px',
              fontSize: 'clamp(0.875rem, 2.5vw, 1.1rem)',
              px: '2rem',
              width: { xs: '10px', sm: '180px' },
              height: '48px'
            }}
          >
            Evidence
          </Button>
        </Box>
      </Box>
    </>
  )
}
