import { useState, useRef, useEffect } from 'react'
import styles from './styles'
import IHomeProps from './types'
import Cytoscape from 'cytoscape'
import cyConfig from './cyConfig'
import axios from '../../axiosInstance'
import Modal from '../../components/Modal'
import { useLocation } from 'react-router-dom'
import { useTheme, useMediaQuery, Container, Box } from '@mui/material'
import GraphinfButton from './GraphInfButton'
import NewClaim from './AddNewClaim'
import { parseSingleNode, parseMultipleNodes } from './graph.utils'
import 'cytoscape-node-html-label'
import './CustomNodeStyles.css'
import MainContainer from '../../components/MainContainer'

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
  const isMediumUp = useMediaQuery(theme.breakpoints.up('md'))

  const layoutName = isMediumUp ? 'circle' : 'breadthfirst'
  const layoutOptions = {
    directed: !isMediumUp,
    fit: true,
    spacingFactor: isMediumUp ? 0.7 : 1.1,
    padding: isMediumUp ? 80 : 0
  }

  const runCy = (cyInstance: Cytoscape.Core | undefined) => {
    if (!cyInstance) return
    const layout = cyInstance.layout({
      name: layoutName,
      ...layoutOptions
    })
    layout.run()
    cyInstance.animate({
      fit: { eles: cyInstance.elements(), padding: 20 },
      duration: 1000
    })
  }

  const fetchQueryClaims = async (query: string, page: number) => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/node/search?page=${page}&limit=5`, {
        params: { search: query }
      })

      if (res.data.nodes.length > 0 && cy) {
        const parsedClaims = parseMultipleNodes(res.data.nodes)
        cy.elements().remove()
        cy.add(parsedClaims)
      } else {
        setSnackbarMessage('No results found')
        toggleSnackbar(true)
      }
    } catch (err: any) {
      toggleSnackbar(true)
      setSnackbarMessage(err.message)
    } finally {
      setLoading(false)
      runCy(cy)
    }
  }

  const fetchRelatedClaims = async (id: string, page: number) => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/node/${id}?page=${page}&limit=5`)
      if (res.data) {
        let newNodes: any[] = []
        let newEdges: any[] = []
        parseSingleNode(newNodes, newEdges, res.data)
        if (!cy) return
        cy.add({ nodes: newNodes, edges: newEdges } as any)
      } else {
        setSnackbarMessage('No results found')
        toggleSnackbar(true)
      }
    } catch (err: any) {
      toggleSnackbar(true)
      setSnackbarMessage(err.message)
    } finally {
      setLoading(false)
      runCy(cy)
    }
  }

  const handleNodeClick = async (event: any) => {
    const originalEvent = event.originalEvent
    event.preventDefault()
    if (originalEvent) {
      const currentClaim = event.target.data('raw')

      if (currentClaim) {
        setSelectedClaim(currentClaim)
        fetchRelatedClaims(event.target.data('id'), page.current)
      }
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
      fetchQueryClaims(encodeURIComponent(query), page.current)
    }
  }, [query, cy])

  useEffect(() => {
    if (!cy) {
      setCy(Cytoscape(cyConfig(ref.current, theme, layoutName, layoutOptions)))
    }
  }, [theme, isMediumUp])

  useEffect(() => {
    document.addEventListener('contextmenu', event => event.preventDefault())
    return () => {
      document.removeEventListener('contextmenu', event => event.preventDefault())
    }
  }, [])

  return (
    <>
      <MainContainer>
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
      </MainContainer>
      <GraphinfButton />
    </>
  )
}

export default Search
