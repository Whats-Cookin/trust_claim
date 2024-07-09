import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import DensityMediumIcon from '@mui/icons-material/DensityMedium'
import { Grid, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export default function BasicModal() {
  const [open, setOpen] = React.useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <>
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
        {' '}
        <DensityMediumIcon sx={{ fontSize: '1.2rem', mb: 1 }} />
        <Box component='span' sx={{ fontSize: '0.6rem', display: 'flex', alignItems: 'left', justifyContent: 'left' }}>
          GRAPH INFO
        </Box>
      </Button>

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
            width: '36.528vw',
            minWidth: '150px',
            maxWidth: '530px',
            height: '78.816vh',
            minHeight: '720px',
            maxHeight: '920px',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.55)',
            borderRadius: '16px',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(4.9px)',
            WebkitBackdropFilter: 'blur(4.9px)',
            overflow: 'scroll'
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
              Height: '64.322vh',
              minHeight: '480px',
              maxHeight: '700px',
              width: '31.111vw',
              maxWidth: '450px',
              position: 'relative',
              margin: '35px',
              padding: '20px',
              borderRadius: '20px',
              backgroundColor: '#253939',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              lineHeight: '1.5',
              overflow: 'scroll'
            }}
          >
            <Grid container spacing={2} alignItems='center' sx={{p:2}}>
              <Box sx={{display: 'flex', justifyContent: 'center'}}>
                {' '}
                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center',padding: '2.2vh' }}>
                  <svg width='70' height='70' viewBox='0 0 98 116' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M97.0814 68.3796C97.2482 68.1092 97.2634 67.8084 97.1269 67.5329C99.0225 55.2923 93.0855 41.601 84.6235 32.449C55.0444 3.21871 17.1904 32.1002 18.1508 68.5894C19.915 127.116 89.7896 133.773 97.4681 74.3293C97.688 72.3478 97.645 69.9618 97.0814 68.3796ZM59.2956 34.0287C63.1399 35.2393 64.6513 38.4619 64.0144 42.1444C63.423 45.5969 63.9967 49.7193 62.7482 52.9671C61.0093 56.3615 55.7496 56.273 54.0182 52.919C52.9592 50.9602 53.4496 48.3013 53.1665 46.0873C52.8556 41.2674 51.5666 35.9394 57.4455 33.9554C57.8448 34.1171 58.7345 34.1298 59.2956 34.0287ZM55.325 25.2128C55.6308 25.1749 55.9265 25.1901 56.2323 25.1623C55.7066 27.3561 55.8077 29.5323 56.4017 31.6908C47.1536 33.4398 48.8218 43.0644 48.6019 50.1793C48.2227 54.8374 51.8118 59.3944 56.3688 60.365C55.8658 61.9497 55.7774 63.5496 56.1236 65.1394C45.1948 65.0964 34.266 65.4048 23.3397 66.1782C24.1536 46.8733 35.138 28.0284 55.325 25.2128ZM95.8177 69.1075C94.3947 80.4483 90.6919 92.8127 82.3538 100.971C56.2778 126.694 22.5587 101.366 23.2892 68.8143C47.4519 70.4243 71.6702 71.0385 95.8227 69.0898C95.8202 69.1 95.8202 69.1025 95.8177 69.1075ZM60.754 65.1748C61.1432 63.5446 61.0901 61.9017 60.5796 60.2715C67.0398 58.9167 68.7383 52.7573 68.1595 46.3324C68.6726 39.9986 67.8688 33.1036 60.5189 31.8323C61.1634 29.5854 61.0952 27.3233 60.4027 25.089C78.6864 26.0418 92.8555 43.9162 94.9912 61.75C95.1251 62.5639 95.4739 65.147 95.9289 66.7696C84.2418 65.7258 72.4714 65.3997 60.754 65.1748ZM36.9755 14.7238C35.2366 9.96961 35.2846 5.1396 37.0184 0.387936C37.1246 -0.0720647 38.9949 -0.360197 39.5788 0.938926C41.1711 5.3974 41.2368 9.97213 39.5029 14.7213C39.4018 14.9614 38.6461 15.4694 37.9485 15.434C37.3748 15.4087 37.0538 14.9134 36.9755 14.7238ZM23.6279 25.1117C18.8838 22.8269 15.363 19.2151 13.0782 14.4786C12.8128 14.0616 13.2222 12.0977 14.8651 12.6892C19.6092 14.974 23.1299 18.5883 25.4148 23.3223C25.6802 23.7393 25.2303 25.8371 23.6279 25.1117ZM15.0825 39.0685C10.3131 40.7998 5.45782 40.9085 0.678357 39.167C-0.542415 38.5908 0.155169 36.8342 0.678357 36.6396C5.44771 34.9082 10.303 34.7995 15.0825 36.541C16.278 37.14 15.5981 38.8738 15.0825 39.0685Z'
                      fill='white'
                    />
                  </svg>
                </Grid>
                <Grid item xs={8} sx={{ padding: '1.1vh' }}>
                <Typography variant='h6' sx={{ display: 'flex', justifyContent: 'left', fontSize: '1.3rem' }}>
                    Left Click
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem' }}>
                    When clicked on the nodes, it expands the graph to show more relation, if any.
                  </Typography>
                </Grid>
              </Box>
              <Box sx={{display: 'flex', justifyContent: 'center'}}>
                {' '}
                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center',padding: '2.2vh' }}>
                <svg width='70' height='70' viewBox='0 0 98 116' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M60.0576 15.107C58.6763 15.107 57.5552 13.979 57.5552 12.5891V2.51783C57.5552 1.12799 58.6763 0 60.0576 0C61.439 0 62.56 1.12799 62.56 2.51783V12.5891C62.56 13.979 61.439 15.107 60.0576 15.107ZM84.3485 16.8871C85.3269 15.9026 85.3269 14.3113 84.3485 13.3269C83.37 12.3424 81.7885 12.3424 80.8101 13.3269L73.3029 20.8803C72.3244 21.8648 72.3244 23.4561 73.3029 24.4405C74.2813 25.425 75.8628 25.425 76.8413 24.4405L84.3485 16.8871ZM82.5793 37.7674C82.5793 39.1572 83.7003 40.2852 85.0817 40.2852H95.0913C96.4726 40.2852 97.5937 39.1572 97.5937 37.7674C97.5937 36.3776 96.4726 35.2496 95.0913 35.2496H85.0817C83.7003 35.2496 82.5793 36.3776 82.5793 37.7674ZM40.0384 20.1426C62.1146 20.1426 80.0769 41.602 80.0769 67.9813C80.0769 94.3606 62.1146 115.82 40.0384 115.82C17.9622 115.82 0 94.3606 0 67.9813C0 41.602 17.9622 20.1426 40.0384 20.1426ZM37.536 25.3344C20.0693 26.8526 6.13589 44.0519 5.1099 65.4635H37.536V60.0703C33.2319 58.9448 30.0288 55.0346 30.0288 50.3565V40.2852C30.0288 35.6071 33.2319 31.6969 37.536 30.5714V25.3344ZM35.0336 40.2852V50.3565C35.0336 53.1337 37.2783 55.3922 40.0384 55.3922C42.7986 55.3922 45.0432 53.1337 45.0432 50.3565V40.2852C45.0432 37.5081 42.7986 35.2496 40.0384 35.2496C37.2783 35.2496 35.0336 37.5081 35.0336 40.2852ZM42.5408 25.3344V30.574C46.845 31.6994 50.048 35.6096 50.048 40.2877V50.359C50.048 55.0372 46.845 58.9473 42.5408 60.0728V65.4635H74.967C73.941 44.0519 60.0076 26.8526 42.5408 25.3344ZM40.0384 110.784C58.6613 110.784 73.8909 92.9279 74.967 70.4991H5.1099C6.18594 92.9279 21.4156 110.784 40.0384 110.784Z'
                    fill='white'
                  />
                </svg>
                </Grid>
                <Grid item xs={8} sx={{ padding: '1.1vh' }}>
                <Typography variant='h6' sx={{ display: 'flex', justifyContent: 'left', fontSize: '1.3rem' }}>
                  Right Click
                </Typography>
                <Typography sx={{ fontSize: '0.9rem' }}>
                  When clicked on the nodes, it shows option to eithir validate a claim or if you want to create a
                  claim.
                </Typography>
                </Grid>
              </Box>
              <Box sx={{display: 'flex', justifyContent: 'center'}}>
                {' '}
                <Grid item xs={4} sx={{ display: 'flex', justifyContent: 'center',padding: '2.2vh' }}>
                <svg width='70' height='70' viewBox='0 0 98 116' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  {' '}
                  <path
                    d='M38.495 0C59.7202 0 76.99 21.4469 76.99 47.8108C76.99 74.1747 59.7202 95.6216 38.495 95.6216C17.2698 95.6216 0 74.1747 0 47.8108C0 21.4469 17.2698 0 38.495 0ZM36.0891 5.18873C19.2956 6.7061 5.89936 23.8953 4.91292 45.2945H36.0891V39.9044C31.9508 38.7796 28.8712 34.8717 28.8712 30.1963V20.1309C28.8712 15.4555 31.9508 11.5476 36.0891 10.4228V5.18873ZM33.6831 20.1309V30.1963C33.6831 32.9719 35.8413 35.229 38.495 35.229C41.1487 35.229 43.3069 32.9719 43.3069 30.1963V20.1309C43.3069 17.3553 41.1487 15.0982 38.495 15.0982C35.8413 15.0982 33.6831 17.3553 33.6831 20.1309ZM40.9009 5.18873V10.4253C45.0391 11.5501 48.1188 15.458 48.1188 20.1334V30.1988C48.1188 34.8742 45.0391 38.7821 40.9009 39.9069V45.2945H72.0771C71.0906 23.8953 57.6944 6.7061 40.9009 5.18873ZM38.495 90.5889C56.4 90.5889 71.0425 72.7429 72.0771 50.3272H4.91292C5.94748 72.7429 20.59 90.5889 38.495 90.5889Z'
                    fill='white'
                  />
                </svg>
                </Grid>
                <Grid item xs={8} sx={{ padding: '1.1vh' }}>
                <Typography variant='h6' sx={{ display: 'flex', justifyContent: 'left', fontSize: '1.3rem' }}>
                  Middle Wheel
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem' }}>
                  Zooms in or zoom out the graph.
                  </Typography>
                </Grid>
              </Box>
            </Grid>
          </Box>
        </Box>
      </Modal>
    </>
  )
}
