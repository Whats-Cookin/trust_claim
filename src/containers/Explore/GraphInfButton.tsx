import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import DensityMediumIcon from '@mui/icons-material/DensityMedium'
import { IconButton, useMediaQuery, useTheme } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Left from '../../assets/leftClick.svg'
import Right from '../../assets/rightClick.svg'
import Middle from '../../assets/middlewheel.svg'

export default function BasicModal() {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <>
      {!isSmallScreen && (
        <Button
          onClick={handleOpen}
          sx={{
            position: 'fixed',
            top: '40%',
            right: '-30px',
            zIndex: 999,
            backgroundColor: '#009688',
            color: '#fff',
            writingMode: 'vertical-lr',
            letterSpacing: '0.3rem',
            display: 'flex',
            alignItems: 'start',
            justifyContent: 'center',
            width: '10px',
            height: '170px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s, transform 0.3s',
            '&:hover': {
              backgroundColor: '#00796b',
              transform: 'scale(1.05)'
            }
          }}
        >
          <DensityMediumIcon sx={{ fontSize: '1.2rem', mb: 1 }} />
          <Box
            component='span'
            sx={{ fontSize: '0.6rem', display: 'flex', alignItems: 'left', justifyContent: 'left' }}
          >
            GRAPH INFO
          </Box>
        </Button>
      )}

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            top: '12.178vh',
            right: '0px',
            width: 'auto',
            minWidth: '150px',
            maxWidth: '526px',
            height: 'auto',
            maxHeight: '90vh',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.55)',
            borderRadius: '16px',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(4.9px)',
            WebkitBackdropFilter: 'blur(4.9px)',
            overflow: 'auto',
            padding: '117px 23px 52px 55px'
          }}
        >
          <IconButton
            onClick={handleClose}
            aria-label='close'
            sx={{
              position: 'absolute',
              top: '30px',
              right: '8px',
              color: '#fff'
            }}
          >
            <CloseIcon sx={{ fontSize: '20px' }} />
          </IconButton>
          <Box
            sx={{
              zIndex: 1000,
              width: '100%',
              minWidth: '255px',
              backgroundColor: '#253939',
              color: '#fff',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              lineHeight: '1.5',
              padding: '20px'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', gap: 2 }}>
                <Box sx={{ flex: 4, display: 'flex', justifyContent: 'center', padding: '2.2vh' }}>
                  <img src={Left} alt='Left Click' width='97.59' height='115.82' />
                </Box>
                <Box sx={{ flex: 8, padding: '1.1vh' }}>
                  <Typography variant='h6' sx={{ display: 'flex', justifyContent: 'left', fontSize: '30px' }}>
                    Left Click
                  </Typography>
                  <Typography sx={{ fontSize: '15px' }}>
                    When clicked on the nodes, it expands the graph to show more relation, if any.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', gap: 2 }}>
                <Box sx={{ flex: 4, display: 'flex', justifyContent: 'center', padding: '2.2vh' }}>
                  <img src={Right} alt='Right Click' width='97.59' height='115.82' />
                </Box>
                <Box sx={{ flex: 8, padding: '1.1vh' }}>
                  <Typography variant='h6' sx={{ display: 'flex', justifyContent: 'left', fontSize: '30px' }}>
                    Right Click
                  </Typography>
                  <Typography sx={{ fontSize: '15px' }}>
                    When clicked on the nodes, it shows option to either validate a claim or if you want to create a
                    claim.
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', gap: 2 }}>
                <Box sx={{ flex: 4, display: 'flex', justifyContent: 'center', padding: '2.2vh' }}>
                  <img src={Middle} alt='Middle Wheel' width='76.99' height='95.62' />
                </Box>
                <Box sx={{ flex: 8, padding: '1.1vh' }}>
                  <Typography variant='h6' sx={{ display: 'flex', justifyContent: 'left', fontSize: '30px' }}>
                    Middle Wheel
                  </Typography>
                  <Typography sx={{ fontSize: '15px' }}>Zooms in or zoom out the graph.</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  )
}
