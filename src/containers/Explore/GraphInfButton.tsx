import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import DensityMediumIcon from '@mui/icons-material/DensityMedium'
import { Grid, IconButton, useMediaQuery, useTheme } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { primaryColors, darkColors, neutralColors, linkedTrustTheme } from '../../theme/colors'
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
            right: theme.spacing(-3.75),
            zIndex: theme.zIndex.appBar - 1,
            backgroundColor: primaryColors.teal,
            color: neutralColors.white,
            writingMode: 'vertical-lr',
            letterSpacing: '0.3rem',
            display: 'flex',
            alignItems: 'start',
            justifyContent: 'center',
            width: theme.spacing(1.25),
            height: theme.spacing(21),
            borderRadius: linkedTrustTheme.borderRadius.lg,
            boxShadow: linkedTrustTheme.shadows.md,
            transition: 'background-color 0.3s, transform 0.3s',
            '&:hover': {
              backgroundColor: darkColors.teal,
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
            zIndex: theme.zIndex.modal,
            background: `${neutralColors.gray[900]}8C`,
            borderRadius: linkedTrustTheme.borderRadius.lg,
            boxShadow: linkedTrustTheme.shadows.xl,
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
              right: theme.spacing(1),
              color: neutralColors.white
            }}
          >
            <CloseIcon sx={{ fontSize: '20px' }} />
          </IconButton>
          <Box
            sx={{
              zIndex: 1000,
              width: '100%',
              minWidth: '255px',
              backgroundColor: neutralColors.gray[800],
              color: neutralColors.white,
              borderRadius: linkedTrustTheme.borderRadius.lg,
              boxShadow: linkedTrustTheme.shadows.md,
              lineHeight: 1.5,
              p: 2.5
            }}
          >
            <Grid container spacing={2} alignItems='center' gap={10}>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center', padding: '2.2vh' }}>
                  <img src={Left} alt='Left Click' width='97.59' height='115.82' />
                </Grid>
                <Grid item xs={8} sx={{ padding: '1.1vh' }}>
                  <Typography variant='h6' sx={{ display: 'flex', justifyContent: 'left' }}>
                    Left Click
                  </Typography>
                  <Typography variant='body2'>
                    When clicked on the nodes, it expands the graph to show more relation, if any.
                  </Typography>
                </Grid>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center', padding: '2.2vh' }}>
                  <img src={Right} alt='Right Click' width='97.59' height='115.82' />
                </Grid>
                <Grid item xs={8} sx={{ padding: '1.1vh' }}>
                  <Typography variant='h6' sx={{ display: 'flex', justifyContent: 'left' }}>
                    Right Click
                  </Typography>
                  <Typography variant='body2'>
                    When clicked on the nodes, it shows option to either validate a claim or if you want to create a
                    claim.
                  </Typography>
                </Grid>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center', padding: '2.2vh' }}>
                  <img src={Middle} alt='Middle Wheel' width='76.99' height='95.62' />
                </Grid>
                <Grid item xs={8} sx={{ padding: '1.1vh' }}>
                  <Typography variant='h6' sx={{ display: 'flex', justifyContent: 'left' }}>
                    Middle Wheel
                  </Typography>
                  <Typography variant='body2'>Zooms in or zoom out the graph.</Typography>
                </Grid>
              </Box>
            </Grid>
          </Box>
        </Box>
      </Modal>
    </>
  )
}
