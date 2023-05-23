import { useState, useRef, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import NewClaim from '../../components/NewClaim/AddNewClaim'
import axios from '../../axiosInstance'
import Modal from '../../components/Modal'
import IHomeProps from './types'
import styles from './styles'
import SearchIcon from '@mui/icons-material/Search'
import { parseNode, parseNodes } from './graph.utils'
import { TextField } from '@mui/material'

const Feed = (homeProps: IHomeProps) => {
  const navigate = useNavigate()
  const searchquery = useLocation().search
  const { setLoading, setSnackbarMessage, toggleSnackbar } = homeProps
  const ref = useRef<any>(null)
  const query = new URLSearchParams(searchquery).get('query')
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [openNewClaim, setOpenNewClaim] = useState<boolean>(false)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const page = useRef(1)
  const [searchVal, setSearchVal] = useState<string>(query || '')
  const claimsPageMemo: any[] = []

  const updateClaims = (search: boolean, newClaims: any) => {
    const parsedClaims = parseNodes(newClaims)
    // do something else here to update the feed TODO
  }

  // lets please refactor this out into a function do NOT duplicate between search and feed
  const fetchClaims = async (query: string, search: boolean, page: number) => {
    setLoading(true)
    try {
      if (search) {
        const res = await axios.get(`/api/node?page=${page}&limit=5`, {
          params: { search: query }
        })

        if (res.data.nodes.length > 0) {
          updateClaims(search, res.data.nodes)
        } else {
          setSnackbarMessage('No results found')
          toggleSnackbar(true)
        }
      } else {
        // this needs to be encapsulated in a function so we can switch to mock api based on env
        const res = await axios.get(`/api/node/${query}?page=${page}&limit=5`)

        if (res.data) {
          let newNodes: any[] = []
          let newEdges: any[] = []
          parseNode(newNodes, newEdges, res.data)

          // here is where we can dtry to display the nodes and edges in a feed TODO here
  
        } else {
          setSnackbarMessage('No results found')
          toggleSnackbar(true)
        }
      }
    } catch (err: any) {
      toggleSnackbar(true)
      setSnackbarMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    window.localStorage.removeItem('claims')
    if (searchVal.trim() !== '') {
      navigate({
        pathname: '/feed',
        search: `?query=${searchVal}`
      })

    await fetchClaims(encodeURIComponent(searchVal), true, page.current)
      //page.current = 2
    }
  }


  const reset = () => {
    navigate('/feed')
    setSearchVal('')
    const ref = useRef<any>(null)
    const page = useRef(1)
    page.current = 1
  }

  const handleNodeClick = async (event: any) => {
    event.preventDefault()
    await fetchClaims(event.target.data('id'), false, page.current)
    //page.current = page.current + 1
  }

  const handleEdgeClick = (event: any) => {
    event.preventDefault()
    const currentClaim = event?.target?.data('raw')?.claim

    if (currentClaim) {
      setSelectedClaim(currentClaim)
      setOpenModal(true)
    }
  }


  return (
    <Container sx={styles.container} maxWidth={false}>
      <Modal open={openModal} setOpen={setOpenModal} selectedClaim={selectedClaim} />
      <NewClaim
        open={openNewClaim}
        setOpen={setOpenNewClaim}
        selectedClaim={selectedClaim}
        setLoading={setLoading}
        setSnackbarMessage={setSnackbarMessage}
        toggleSnackbar={toggleSnackbar}
      />

      <Box ref={ref} sx={styles.cy} />
    </Container>
  )
}

export default Feed
