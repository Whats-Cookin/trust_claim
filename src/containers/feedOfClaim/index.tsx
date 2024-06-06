import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import Loader from '../../components/Loader'
import AlwaysOpenSidebar from '../../components/FeedSidebar/AlwaysOpenSidebar'
import FeedFooter from '../../components/FeedFooter'
import { BACKEND_BASE_URL } from '../../utils/settings'
import SearchFeed from './SearchFeed'
import { IHomeProps, ImportedClaim } from './types'

const CLAIM_ROOT_URL = 'https://live.linkedtrust.us/claims'

const FeedClaim: React.FC<IHomeProps> = () => {
  const [claims, setClaims] = useState<Array<ImportedClaim>>([])
  const [isAuth, setIsAuth] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null)
  const navigate = useNavigate()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const isMediumScreen = useMediaQuery(theme.breakpoints.down(800))

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
    const token = localStorage.getItem('accessToken')
    if (token) {
      setIsAuth(true)
    } else {
      setIsAuth(false)
    }
  }, [])

  const handleValidation = (subject: any, id: number) => {
    console.log(subject, 'and', id)
    navigate({
      pathname: '/validate',
      search: `?subject=${CLAIM_ROOT_URL}/${id}`
    })
  }

  const handleschema = async (nodeUri: string) => {
    const domain = nodeUri.replace(/^https?:\/\//, '').replace(/\/$/, '')
    navigate({
      pathname: '/search',
      search: `?query=${domain}`
    })
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(event.currentTarget)
    setSelectedIndex(index)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setSelectedIndex(null)
  }

  return (
    <>
      {claims && claims.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            position: 'center',
            justifyContent: 'center',
            width: isMediumScreen ? '100%' : '50%',
            p: '0 10px',
            mt: isSmallScreen ? '6vh' : '55px',
            flexDirection: 'column',
            backgroundColor: theme.palette.formBackground
          }}
        >
          {!isMediumScreen && <AlwaysOpenSidebar isAuth={isAuth} />}
          <SearchFeed
            claims={claims}
            handleValidation={handleValidation}
            handleMenuClick={handleMenuClick}
            handleClose={handleClose}
            anchorEl={anchorEl}
            selectedIndex={selectedIndex}
            handleschema={handleschema}
          />
          <Box
            sx={{
              width: '30%',
              bgcolor: theme.palette.footerBackground
            }}
          >
            {!isMediumScreen && <FeedFooter />}
          </Box>
        </Box>
      ) : (
        <Loader open={isLoading} />
      )}
    </>
  )
}

export default FeedClaim
