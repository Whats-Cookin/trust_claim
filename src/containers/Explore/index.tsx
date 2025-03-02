import { useEffect, useRef, useState } from 'react'
import styles from './styles'
import IHomeProps from './types'
import Cytoscape from 'cytoscape'
import cyConfig from './cyConfig'
import axios from '../../axiosInstance'
import { BACKEND_BASE_URL } from '../../utils/settings'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, useMediaQuery, useTheme } from '@mui/material'
import GraphinfButton from './GraphInfButton'
import { parseMultipleNodes, parseSingleNode } from './graph.utils'
import 'cytoscape-node-html-label'
import './CustomNodeStyles.css'
import MainContainer from '../../components/MainContainer'
import NodeDetails from '../../components/NodeDetails'

const Explore = (homeProps: IHomeProps) => {
  const { nodeId } = useParams<{ nodeId: string }>()
  const theme = useTheme()
  const { setLoading, setSnackbarMessage, toggleSnackbar, isDarkMode } = homeProps
  const ref = useRef<any>(null)
  const cyRef = useRef<Cytoscape.Core | null>(null)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [startNode, setStartNode] = useState<any>(null)
  const [endNode, setEndNode] = useState<any>(null)
  const [cy, setCy] = useState<Cytoscape.Core>()
  const page = useRef(1)

  const navigate = useNavigate()

  const layoutName = 'concentric'
  const layoutOptions = {
    fit: true,
    avoidOverlap: true,
    nodeSpacing: 50,
    concentric: (node: any) => node.degree(),
    levelWidth: (nodes: any) => nodes.maxDegree() / 2,
    minNodeSpacing: 50
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
      console.error('Graph rendering error: ', err)
      console.trace()
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
    const endNode = event?.target?.data('raw')?.endNode
    const startNode = event?.target?.data('raw')?.claim

    if (currentClaim) {
      setSelectedClaim(currentClaim)
      setShowDetails(true)
      setStartNode(startNode)
      setEndNode(endNode)
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

    if (claim.isNode() && currentClaim) {
      setSelectedClaim(currentClaim)
      navigate('/claim')
    } else if (claim.isEdge() && currentClaim) {
      setSelectedClaim(currentClaim)
      navigate({
        pathname: '/validate',
        search: `?subject=${BACKEND_BASE_URL}/claims/${currentClaim.claimId}`
      })
    } else {
      console.warn('Right-click target is neither a node nor a valid edge with claimId')
    }
  }

  const initializeGraph = async (claimId: string) => {
    setLoading(true)
    try {
      // First fetch the central node
      const claimRes = await axios.get(`/api/claim_graph/${claimId}`)
      if (!cy) return

      cy.elements().remove() // Clear any existing elements

      //      let nodes: any[] = []
      //      let edges: any[] = []
      console.log('Result was : ' + JSON.stringify(claimRes.data))
      //      parseSingleNode(nodes, edges, claimRes.data)
      const { nodes, edges } = parseMultipleNodes(claimRes.data.nodes)
      console.log('Adding nodes: ' + nodes)
      cy.add({ nodes, edges } as any)
    } catch (err: any) {
      toggleSnackbar(true)
      setSnackbarMessage(err.message)
      console.error('Graph rendering error: ', err)
      console.trace()
    } finally {
      setLoading(false)
      runCy(cy)
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

  // Replace the removed useEffect with this one
  useEffect(() => {
    if (nodeId && cy) {
      initializeGraph(nodeId)
    }
  }, [nodeId, cy])

  useEffect(() => {
    if (!cyRef.current && ref.current) {
      const newCy = Cytoscape(cyConfig(ref.current, theme, layoutName, layoutOptions))
      setCy(newCy)
      cyRef.current = newCy
    }
  }, [theme, layoutName, layoutOptions])

  useEffect(() => {
    document.addEventListener('contextmenu', event => event.preventDefault())
    return () => {
      document.removeEventListener('contextmenu', event => event.preventDefault())
    }
  }, [])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDetails(false)
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [showDetails])

  return (
    <>
      <MainContainer>
        <Box ref={ref} sx={{ ...styles.cy, display: showDetails ? 'none' : 'block' }} />{' '}
        {showDetails && (
          <NodeDetails
            open={showDetails}
            setOpen={setShowDetails}
            selectedClaim={selectedClaim}
            isDarkMode={isDarkMode}
            claimImg={selectedClaim.img || ''}
            startNode={startNode}
            endNode={endNode}
          />
        )}
      </MainContainer>
      <GraphinfButton />
    </>
  )
}

export default Explore
