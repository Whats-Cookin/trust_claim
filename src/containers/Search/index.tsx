import { useState, useRef, useMemo, useEffect } from 'react'
import Cytoscape from 'cytoscape'
import { useLocation, useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import NewClaim from '../../components/NewClaim/AddNewClaim'
import axios from '../../axiosInstance'
import Modal from '../../components/Modal'
import cyConfig from './cyConfig'
import IHomeProps from './types'
import styles from './styles'
import SearchIcon from '@mui/icons-material/Search'
import { parseNode, parseNodes } from './graph.utils'
import { TextField } from '@mui/material'

const Search = (homeProps: IHomeProps) => {
  const search = useLocation().search
  const navigate = useNavigate()

  const { setLoading, setSnackbarMessage, toggleSnackbar } = homeProps
  const ref = useRef<any>(null)
  const query = new URLSearchParams(search).get('query')
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [openNewClaim, setOpenNewClaim] = useState<boolean>(false)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [cy, setCy] = useState<Cytoscape.Core>()
  const page = useRef(1)
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
        const res = await axios.get(`/api/node/${query}?page=${page}&limit=5`)

        if (res.data) {
          let newNodes: any[] = []
          let newEdges: any[] = []
          parseNode(newNodes, newEdges, res.data)
          if (!cy) return
          cy.add({ nodes: newNodes, edges: newEdges } as any)
          // this was supposed to add thumbnail images but it doesn't work
          /*
          cy.nodes().forEach(function(node) {
             var thumbnailUrl = node.data('raw').thumbnail;
             if (thumbnailUrl) {
                var imageHtml = '<img src="' + thumbnailUrl + '" width="50" height="50">';
                node.style('content', imageHtml);
             }
          });
          */
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

      await fetchClaims(encodeURIComponent(searchVal), true, page.current)
      //page.current = 2
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
    const ref = useRef<any>(null)
    const page = useRef(1)
    page.current = 1
    if (!cy) return
    cy.elements().remove()
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

  const handleMouseOver = (event: any) => {
    const container = event?.cy?.container()
    if (container) {
      container.style.cursor = 'pointer'
    }
  }

  const handleMouseOut = (event: any) => {
    const container = event?.cy?.container()
    if (container) {
      container.style.cursor = 'default'
    }
  }

  const handleMouseRightClick = (event: any) => {
    event.preventDefault()
    const claim = event.target
    const currentClaim = claim.data('raw')

    if (currentClaim) {
      setSelectedClaim(currentClaim)
      setOpenNewClaim(true)
    }
  }

  useEffect(() => {
    if (cy) {
      cy.on('tap', 'node', handleNodeClick)
      cy.on('tap', 'edge', handleEdgeClick)
      cy.on('cxttap', 'node,edge', handleMouseRightClick)
      cy.on('mouseover', 'edge,node', handleMouseOver)
      cy.on('mouseout', 'edge,node', handleMouseOut)
      return () => {
        if (!cy) return
        cy.off('tap', 'node', handleNodeClick)
        cy.off('tap', 'edge', handleEdgeClick)
        cy.off('cxttap', 'node,edge', handleMouseRightClick)
        cy.off('mouseover', 'edge,node', handleMouseOver)
        cy.off('mouseout', 'edge,node', handleMouseOut)
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

  //remove contextmenu
  useEffect(() => {
    document.addEventListener('contextmenu', event => event.preventDefault())
    return () => {
      document.removeEventListener('contextmenu', event => event.preventDefault())
    }
  }, [])

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
      <Box sx={{ position: 'absolute', top: '90px', left: '2%', zIndex: 20 }}>
        <Box
          component='div'
          sx={{
            borderRadius: '0.3em',
            width: '500px',
            display: 'flex',
            alignItems: 'center',
            borderColor: 'black',
            borderWidth: '2px',
            height: '50px'
          }}
        >
          <TextField
            type='search'
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyUp={handleSearchKeypress}
            sx={{ width: '100%' }}
          />
          <Button
            style={{
              backgroundColor: '#333',
              fontWeight: 'bold',
              color: 'white',
              height: '100%',
              width: '60px',
              borderTopLeftRadius: '0.1em',
              borderBottomLeftRadius: '0.1em'
            }}
            onClick={handleSearch}
          >
            <SearchIcon />
          </Button>
        </Box>
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
      </Box>
      <Box ref={ref} sx={styles.cy} />
    </Container>
  )
}

export default Search
