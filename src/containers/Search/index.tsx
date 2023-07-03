import { useState, useRef, useEffect } from 'react'
import Cytoscape from 'cytoscape'
import { useLocation, useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import NewClaim from '../../components/NewClaim/AddNewClaim'
import axios from '../../axiosInstance'
import Modal from '../../components/Modal'
import cyConfig from './cyConfig'
import IHomeProps from './types'
import styles from './styles'
import { parseNode, parseNodes } from './graph.utils'
import { useTheme } from '@mui/material'
import { useMediaQuery } from '@mui/material'

const Search = (homeProps: IHomeProps) => {
  const search = useLocation().search
  const theme = useTheme()

  const { setLoading, setSnackbarMessage, toggleSnackbar } = homeProps
  const ref = useRef<any>(null)
  const query = new URLSearchParams(search).get('query')
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [openNewClaim, setOpenNewClaim] = useState<boolean>(false)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [cy, setCy] = useState<Cytoscape.Core>()
  const page = useRef(1)
  const isArange = useMediaQuery('(min-width:700px) and (max-width:800px)')
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const special = useMediaQuery('(width:540px)')

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
        padding: isArange ? 110 : isSmallScreen ? (special ? 90 : 10) : 70,
        animate: true,
        animationDuration: 1000
      }).run()
      cy.center()
    }
  }

  const handleNodeClick = async (event: any) => {
    const originalEvent = event.originalEvent;
    event.preventDefault()
    if (originalEvent.shiftKey) {
      console.log('Shift + click detected');
      // Your shift + click logic goes here...
      // TODO refactor with handleMouseRightClick
      const claim = event.target
      const currentClaim = claim.data('raw')

      if (currentClaim) {
        setSelectedClaim(currentClaim)
        setOpenNewClaim(true)
      }
    } else {
      await fetchClaims(event.target.data('id'), false, page.current)
      //page.current = page.current + 1
    }
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

  useEffect(() => {
    if (query && cy) {
      fetchClaims(encodeURIComponent(query), true, page.current)
    }
  }, [query, cy])

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

      <Box ref={ref} sx={styles.cy} />
    </Container>
  )
}

export default Search
