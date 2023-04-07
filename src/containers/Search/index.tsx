import { useState, useRef, useMemo, useEffect } from 'react'
import Cytoscape from 'cytoscape'
import { useLocation, useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

import axios from '../../axiosInstance'
import Modal from '../../components/Modal'
import cyConfig from './cyConfig'
import IHomeProps from './types'
import styles from './styles'
import SearchIcon from '@mui/icons-material/Search'
import { parseNodes } from './graph.utils'

const Search = (homeProps: IHomeProps) => {
  const search = useLocation().search
  const navigate = useNavigate()

  const { setLoading, setSnackbarMessage, toggleSnackbar } = homeProps
  const ref = useRef<any>(null)
  const query = new URLSearchParams(search).get('query')
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [cy, setCy] = useState<Cytoscape.Core>()
  const [searchVal, setSearchVal] = useState<string>(query || '')
  const claimsPageMemo: any[] = []

  const updateClaims = (search: boolean, newClaims: any) => {
    if (!cy) return
    const parsedClaims = parseNodes(newClaims)
    if (search) {
      cy.elements().remove()
      cy.add(parsedClaims)
    } else {
      cy.add(parsedClaims)
    }
  }

  const fetchClaims = async (query: string, search: boolean, page: number) => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/nodes?page=${page}&limit=5`, {
        params: { search: query }
      })

      if (res.data.claims.length > 0) {
        updateClaims(search, res.data.claims)
      } else {
        setSnackbarMessage('No results found')
        toggleSnackbar(true)
      }
    } catch (err: any) {
      toggleSnackbar(true)
      setSnackbarMessage(err.message)
    } finally {
      setLoading(false)
      if (!cy) return
      cy.layout({
        name: 'circle',
        directed: true,
        padding: 30,
        animate: true,
        animationDuration: 1000
      }).run()
      cy.center()
    }
  }

  const handleSearch = async () => {
    window.localStorage.removeItem('claims')
    if (searchVal.trim() !== '') {
      navigate({
        pathname: '/search',
        search: `?query=${searchVal}`
      })

      await fetchClaims(encodeURIComponent(searchVal), true, 1)
    }
  }

  const handleSearchKeypress = async (event: any) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  const reset = () => {
    navigate('/search')
    setSearchVal('')
    if (!cy) return
    cy.elements().remove()
  }

  // handle node click to fetch further connected nodes
  const handleNodeClick = async (event: any) => {
    event.preventDefault()
    const claim = event.target
    const foundIndex = claimsPageMemo.findIndex(item => item.id == claim.id())
    if (foundIndex === -1) {
      claimsPageMemo.push({ id: claim.id(), page: 1 })
      await fetchClaims(claim.id(), false, 1)
    } else {
      claimsPageMemo[foundIndex].page++
      claimsPageMemo.push({
        id: claim.id(),
        page: claimsPageMemo[foundIndex].page
      })
      await fetchClaims(claim.id(), false, claimsPageMemo[foundIndex].page)
    }
  }

  const handleEdgeClick = (event: any) => {
    event.preventDefault()
    const claim = event.target
    const currentClaim = claim.data('raw')
    if (currentClaim) {
      setSelectedClaim(currentClaim)
      setOpenModal(true)
    }
  }

  const addCyEventHandlers = (cy: any) => {
    cy.on('tap', 'node', handleNodeClick)
    cy.on('tap', 'edge', handleEdgeClick)

    // add hover state pointer cursor on node
    cy.on('mouseover', 'edge,node', (event: any) => {
      const container = event?.cy?.container()
      if (container) {
        container.style.cursor = 'pointer'
      }
    })

    cy.on('mouseout', 'edge,node', (event: any) => {
      const container = event?.cy?.container()
      if (container) {
        container.style.cursor = 'default'
      }
    })
  }

  const removeCyEventHandlers = (cy: any) => {
    cy.off('tap', 'node', handleNodeClick)
    cy.off('tap', 'edge', handleEdgeClick)
    cy.off('mouseover', 'edge,node')
    cy.off('mouseout', 'edge,node')
  }

  useEffect(() => {
    if (cy) {
      addCyEventHandlers(cy)
      return () => {
        removeCyEventHandlers(cy)
      }
    }
  }, [cy])

  useMemo(() => {
    if (cy && query) handleSearch()
  }, [cy])

  useEffect(() => {
    if (!cy) {
      setCy(Cytoscape(cyConfig(ref.current)))
    }
  }, [])

  return (
    <Container sx={styles.container} maxWidth={false}>
      <Modal open={openModal} setOpen={setOpenModal} selectedClaim={selectedClaim} />
      <section className='absolute top-[90px] left-[2%] z-20'>
        <div className=' rounded-lg w-[500px]  flex items-center border-[black] border-[2px] h-[50px]'>
          <input
            type='search'
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyUp={handleSearchKeypress}
            className='w-full  p-[0.5rem] rounded-lg border-none outline-none'
          />
          <button className='bg-[#333] font-bold text-white h-full w-[60px]' onClick={handleSearch}>
            <SearchIcon />
          </button>
        </div>
        <Button
          variant='outlined'
          onClick={reset}
          sx={{
            backgroundColor: '#fff',
            color: '#333333',
            marginTop: '1rem',
            fontWeight: 'bold',
            border: '2px solid #333333',
            '&:hover': {
              backgroundColor: '#fff',
              border: '2px solid #333333',
              color: '#333333'
            }
          }}
          disableElevation
        >
          Reset
        </Button>
      </section>
      <Box sx={styles.searchFieldContainer}>
      </Box>
      <Box ref={ref} sx={styles.cy} />
    </Container>
  )
}

export default Search
