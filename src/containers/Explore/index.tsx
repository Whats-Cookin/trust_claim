import { useEffect, useRef, useState } from 'react'
import styles from './styles'
import IHomeProps from './types'
import Cytoscape from 'cytoscape'
import cyConfig from './cyConfig'
import * as api from '../../api'
import { BACKEND_BASE_URL } from '../../utils/settings'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Box, useMediaQuery, useTheme, Fab, Tooltip } from '@mui/material'
import GraphinfButton from './GraphInfButton'
import { parseMultipleNodes, parseSingleNode } from './graph.utils'
import cytoscapeNodeHtmlLabel from 'cytoscape-node-html-label'
import './CustomNodeStyles.css'
import NodeDetails from '../../components/NodeDetails'
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'

// Register the extension
if (typeof cytoscapeNodeHtmlLabel === 'function') {
  Cytoscape.use(cytoscapeNodeHtmlLabel)
}

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
  const isMediumUp = useMediaQuery(theme.breakpoints.up('md'))

  const navigate = useNavigate()

  const layoutName = isMediumUp ? 'circle' : 'breadthfirst'
  const layoutOptions = {
    directed: !isMediumUp,
    fit: true,
    spacingFactor: isMediumUp ? 1 : 1.1,
    padding: isMediumUp ? 150 : 0
  }

  const handleFitToScreen = () => {
    if (cy && cy.elements().length > 0) {
      cy.fit(cy.elements(), 50)
      
      // Apply same zoom constraints as initial load
      const nodeCount = cy.nodes().length
      if (nodeCount <= 3 && cy.zoom() > 1) {
        cy.zoom(1)
        cy.center()
      } else if (cy.zoom() > 1.5) {
        cy.zoom(1.5)
        cy.center()
      }
    }
  }

  const runCy = (cyInstance: Cytoscape.Core | undefined, shouldFit: boolean = false) => {
    if (!cyInstance) return
    const layout = cyInstance.layout({
      name: layoutName,
      ...layoutOptions
    })
    layout.run()
    
    // Only fit to viewport on initial load or when explicitly requested
    if (shouldFit) {
      const nodeCount = cyInstance.nodes().length
      
      // For small graphs, don't zoom in too much
      if (nodeCount <= 3) {
        cyInstance.zoom(1) // Keep at default zoom
        cyInstance.center() // Just center the graph
      } else {
        // For larger graphs, fit but with constraints
        cyInstance.fit(cyInstance.elements(), 50)
        
        // Limit max zoom to prevent giant nodes
        if (cyInstance.zoom() > 1.5) {
          cyInstance.zoom(1.5)
          cyInstance.center()
        }
      }
    } else {
      // When not auto-fitting, check if new nodes are outside viewport
      const extent = cyInstance.extent()
      const elements = cyInstance.elements()
      let needsAdjustment = false
      
      // Check if any nodes are outside the current viewport
      elements.nodes().forEach((node: any) => {
        const pos = node.position()
        if (pos.x < extent.x1 || pos.x > extent.x2 || 
            pos.y < extent.y1 || pos.y > extent.y2) {
          needsAdjustment = true
        }
      })
      
      // If nodes are outside viewport, zoom out just enough to include them
      if (needsAdjustment) {
        const currentZoom = cyInstance.zoom()
        cyInstance.fit(elements, 100) // Fit with padding
        
        // But try to preserve some of the current zoom if possible
        const newZoom = cyInstance.zoom()
        if (newZoom < currentZoom * 0.7) {
          // Only zoom out to 70% of current zoom at most per expansion
          cyInstance.zoom(currentZoom * 0.7)
          cyInstance.center()
        }
      }
    }
  }

  const fetchRelatedClaims = async (id: string, page: number) => {
    setLoading(true)
    try {
      const res = await api.getNodeNeighbors(id, page, 5)
      if (res.data) {
        let newNodes: any[] = []
        let newEdges: any[] = []
        parseSingleNode(newNodes, newEdges, res.data)
        if (!cy) return
        
        // Check current node count before adding
        const currentNodeCount = cy.nodes().length
        if (currentNodeCount >= 30) {
          setSnackbarMessage('Graph size limit reached. Please start a new exploration.')
          toggleSnackbar(true)
          return
        }
        
        // Limit new nodes to add
        const maxNodesToAdd = Math.min(5, 30 - currentNodeCount)
        if (newNodes.length > maxNodesToAdd) {
          newNodes = newNodes.slice(0, maxNodesToAdd)
          // Only include edges that connect to included nodes
          const nodeIds = new Set([...cy.nodes().map(n => n.id()), ...newNodes.map(n => n.data.id)])
          newEdges = newEdges.filter(edge => 
            nodeIds.has(edge.data.source) && nodeIds.has(edge.data.target)
          )
        }
        
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
      runCy(cy, false) // Don't auto-fit when adding new nodes
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
    if (!claimId || claimId === 'undefined') {
      console.error('Invalid claim ID:', claimId)
      setSnackbarMessage('Invalid claim ID')
      toggleSnackbar(true)
      return
    }
    
    setLoading(true)
    try {
      // Use claim ID directly - backend expects numeric ID
      console.log('Fetching graph for claim ID:', claimId)
      const claimRes = await api.getGraph(claimId)
      console.log('Graph API response:', claimRes.data)
      
      if (!cy) {
        console.error('Cytoscape instance not initialized')
        return
      }

      cy.elements().remove() // Clear any existing elements

      const { nodes, edges } = parseMultipleNodes(claimRes.data.nodes || claimRes.data)
      console.log('Parsed nodes:', nodes.length, 'edges:', edges.length)
      
      // Limit initial nodes to 7
      let limitedNodes = nodes
      let limitedEdges = edges
      if (nodes.length > 7) {
        // Keep the central node and closest 6 nodes
        limitedNodes = nodes.slice(0, 7)
        const nodeIds = new Set(limitedNodes.map((n: any) => n.data.id))
        limitedEdges = edges.filter((edge: any) => 
          nodeIds.has(edge.data.source) && nodeIds.has(edge.data.target)
        )
      }
      
      cy.add({ nodes: limitedNodes, edges: limitedEdges } as any)
    } catch (err: any) {
      toggleSnackbar(true)
      setSnackbarMessage(err.message || 'Failed to load graph')
      console.error('Graph rendering error: ', err)
      console.trace()
    } finally {
      setLoading(false)
      runCy(cy, true) // Fit on initial load
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
      try {
        console.log('Initializing Cytoscape...')
        const newCy = Cytoscape(cyConfig(ref.current, theme, layoutName, layoutOptions))
        setCy(newCy)
        cyRef.current = newCy
        console.log('Cytoscape initialized successfully')
      } catch (err) {
        console.error('Failed to initialize Cytoscape:', err)
      }
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
      <Box sx={{ width: '100%', height: '100vh', position: 'relative' }}>
        <Box ref={ref} sx={{ ...styles.cy, display: showDetails ? 'none' : 'block' }} />
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
      </Box>
      <GraphinfButton />
      <Tooltip title="Fit to Screen" placement="left">
        <Fab
          color="primary"
          size="small"
          onClick={handleFitToScreen}
          sx={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark
            }
          }}
        >
          <CenterFocusStrongIcon />
        </Fab>
      </Tooltip>
    </>
  )
}

export default Explore
