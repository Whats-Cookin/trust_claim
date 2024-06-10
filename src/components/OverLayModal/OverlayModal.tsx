import React, { useState, useEffect } from 'react'
import { Box, Button, Typography, Checkbox, FormControlLabel } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const OverlayModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const theme = useTheme()

  useEffect(() => {
    const dontShowOverlay = localStorage.getItem('dontShowOverlay')
    const lastShown = localStorage.getItem('lastShownOverlay')
    const now = new Date().getTime()

    if (!dontShowOverlay && (!lastShown || now - parseInt(lastShown) > 300000)) {
      setShowModal(true)
      localStorage.setItem('lastShownOverlay', now.toString())
    }
  }, [])

  const handleClose = () => {
    setShowModal(false)
    if (dontShowAgain) {
      localStorage.setItem('dontShowOverlay', 'true')
    }
  }

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDontShowAgain(event.target.checked)
  }

  if (!showModal) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.pageBackground,
          padding: 3,
          borderRadius: 2,
          textAlign: 'center',
          width: '75%'
        }}
      >
        <Typography variant='h6' sx={{ color: theme.palette.maintext }}>
          Welcome to LinkedTrust! 🎉
        </Typography>
        <Typography sx={{ margin: '10px 0', color: theme.palette.texts }}>
          LinkedTrust is a platform that allows you to create and share trustable claims or attestations about anything
          with a URI address. Imagine being able to verify or vouch for things, such as someone's skills, achievements,
          or content, in a decentralized and secure way.
        </Typography>
        <Typography sx={{ margin: '10px 0', textAlign: 'left', color: theme.palette.texts }}>
          <strong>How It Works:</strong>
          <ul>
            <li>
              <strong>Make Attestations:</strong> You can make signed attestations about any URI (like a webpage,
              document, or profile).
            </li>
            <li>
              <strong>Decentralized Storage:</strong> Your attestations are securely stored on the Ceramic Network and
              in our database.
            </li>
            <li>
              <strong>Graph View:</strong> Visualize relationships between different attestations through nodes and
              edges.
            </li>
            <li>
              <strong>Import Credentials:</strong> Bring in credentials from other sources, like GitHub badges, to build
              your trust profile.
            </li>
            <li>
              <strong>Request Validations:</strong> Ask others to validate your claims, adding more credibility.
            </li>
          </ul>
        </Typography>
        <FormControlLabel
          control={
            <Checkbox checked={dontShowAgain} onChange={handleCheckboxChange} sx={{ color: theme.palette.texts }} />
          }
          label="Don't show again"
        />
        <Button
          variant='contained'
          onClick={handleClose}
          sx={{
            color: theme.palette.buttontext,
            width: '100%',
            maxWidth: '16vw',
            backgroundColor: theme.palette.buttons,
            '&:hover': {
              backgroundColor: theme.palette.buttonHover
            }
          }}
        >
          Close ❌
        </Button>
      </Box>
    </Box>
  )
}

export default OverlayModal
