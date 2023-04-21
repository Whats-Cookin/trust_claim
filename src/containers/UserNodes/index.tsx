import { useState, useRef, useMemo, useEffect } from 'react'
import Cytoscape from 'cytoscape'
import { useLocation, useNavigate } from 'react-router-dom'
import Container from '@mui/material/Container'
import NewClaim from '../../components/NewClaim/AddNewClaim'
import axios from '../../axiosInstance'
import Modal from '../../components/Modal'
import cyConfig from '../Search/cyConfig'
import IUserNodesProps from './types'
import styles from './styles'
import { parseNode, parseNodes } from '../Search/graph.utils'

const UserNodes = (userProps: IUserNodesProps) => {
  const search = useLocation().search
  const navigate = useNavigate()

  const { setLoading, setSnackbarMessage, toggleSnackbar } = userProps
  const ref = useRef<any>(null)
  const query = new URLSearchParams(search).get('query')
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [openNewClaim, setOpenNewClaim] = useState<boolean>(false)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [cy, setCy] = useState<Cytoscape.Core>()
  const page = useRef(1)

  const updateClaims = (newClaims: any) => {
    if (!cy) return
    const parsedClaims = parseNodes(newClaims)
    cy.elements().remove()
    cy.add(parsedClaims)
  }

  console.log('this component is being rendered')
  const fetchClaims = async (page: number) => {
    console.log('fetchClaims function called')
    setLoading(true)
    try {
      const response = await axios.get(`/api/my-node?page=${page}&limit=5`)
      console.log('API response data:', response.data)
      if (response.data.nodes?.length > 0) {
        updateClaims(response.data.nodes)
      } else {
        setSnackbarMessage('You have no created Claims')
        toggleSnackbar(true)
      }
    } catch (err: any) {
      console.error(err)
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

  console.log(fetchClaims)

  useEffect(() => {
    fetchClaims(page.current)
  }, [cy])

  const handleNodeClick = async (event: any) => {
    event.preventDefault()
    await fetchClaims(page.current)
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
    if (!cy) {
      setCy(Cytoscape(cyConfig(ref.current)))
    }
  }, [])

  return (
    <Container maxWidth={false}>
      <h1>My Nodes</h1>

      <Modal open={openModal} setOpen={setOpenModal} selectedClaim={selectedClaim} />
      <NewClaim
        open={openNewClaim}
        setOpen={setOpenNewClaim}
        setLoading={setLoading}
        setSnackbarMessage={setSnackbarMessage}
        toggleSnackbar={toggleSnackbar}
      />
    </Container>
  )
}

export default UserNodes
