import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Button, Card, useMediaQuery, useTheme } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import backSvg from '../../assets/images/back.svg'
import placeholderWhite from '../../assets/imgplaceholderwhite.svg'
import RenderClaimDetails from '../ClaimDetails/RenderClaimDetails'
import StartNode from './StartNode'
import EndNode from './EndNode'

interface NodeDetailsProps {
  open: boolean
  setOpen: (open: boolean) => void
  selectedClaim: any
  startNode: any
  endNode: any
  claimImg: string
  isDarkMode: boolean
}

export default function NodeDetails({
  open,
  setOpen,
  selectedClaim,
  claimImg,
  startNode,
  endNode,
  isDarkMode
}: NodeDetailsProps) {
  const handleClose = () => setOpen(false)

  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
        <StartNode selectedClaim={startNode} claimImg={claimImg} />
        <EndNode selectedClaim={endNode} claimImg={claimImg} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '15px' }}>
        <Button
          sx={{
            color: theme.palette.link,
            textDecoration: 'underline',
            fontWeight: 500,
            borderRadius: '100px',
            fontSize: 'clamp(12px, 2.5vw, 20px)',
            px: '2rem'
          }}
          onClick={handleClose}
        >
          <img src={backSvg} alt='arrow' style={{ width: '10px', marginRight: '10px' }} />
          BACK
        </Button>
        <Box>
          <Button
            sx={{
              color: theme.palette.buttontext,
              bgcolor: theme.palette.buttons,
              fontWeight: 500,
              borderRadius: '100px',
              fontSize: 'clamp(5px, 2.5vw, 20px)',
              px: '2rem',
              marginRight: '15px',
              width: { xs: '10px', sm: '150px' }
            }}
            onClick={() =>
              navigate({
                pathname: '/validate',
                search: `?subject=https://live.linkedtrust.us/claims/${selectedClaim.id}`
              })
            }
          >
            Validate
          </Button>

          <Button
            sx={{
              color: theme.palette.buttontext,
              bgcolor: theme.palette.buttons,
              fontWeight: 500,
              borderRadius: '100px',
              fontSize: 'clamp(5px, 2.5vw, 20px)',
              px: '2rem',
              width: { xs: '10px', sm: '150px' }
            }}
            onClick={() =>
              navigate({
                pathname: `/report/${selectedClaim.id}`
              })
            }
          >
            Evidence
          </Button>
        </Box>
      </Box>
    </>
  )
}
