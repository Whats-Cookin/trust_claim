import { useState } from 'react'
import axios from '../../axiosInstance'
import SearchWrapper from '../../components/SearchWrapper'
import Claim from '../../components/Claim'
import Form from '../Form'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

import IHomeProps from './types'
import { ClaimWrapper } from './styles'

const Home = (homeProps: IHomeProps) => {
  const [searchVal, setSearchVal] = useState('')
  const [fetchedClaims, setFetchedClaims] = useState<null | any[]>(null)
  const { setLoading, setSnackbarMessage, toggleSnackbar } = homeProps

  const fetchClaims = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/claim`, {
        params: { search: searchVal }
      })
      setFetchedClaims(res.data)
    } catch (err: any) {
      toggleSnackbar(true)
      setSnackbarMessage(err.message)
    } finally {
      setSearchVal('')
      setLoading(false)
    }
  }

  const handleSearchKeypress = async (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      // const searchVal = event.currentTarget.value;
      await fetchClaims()
    }
  }

  const handleSearchIconClick = async () => {
    await fetchClaims()
  }

  const handleSearchValChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    setSearchVal(event.currentTarget.value)
  }

  return (
    <>
      <Box sx={{ mt: 5 }}></Box>
      <SearchWrapper
        onChange={handleSearchValChange}
        onKeyUp={handleSearchKeypress}
        onSearchIconClick={handleSearchIconClick}
        value={searchVal}
      />
      {fetchedClaims && (
        <>
          <Button onClick={() => setFetchedClaims(null)} variant='text' size='medium' sx={{ marginTop: '20px' }}>
            Clear results
          </Button>
          <ClaimWrapper>
            {fetchedClaims.map(claim => (
              <Claim {...claim} />
            ))}
          </ClaimWrapper>
        </>
      )}
      {!fetchedClaims && <Form {...homeProps} />}
    </>
  )
}

export default Home
