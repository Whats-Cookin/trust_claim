import { useState, useEffect } from 'react'
import dagre from '@dagrejs/dagre'
import axios from '../../axiosInstance'
import { parseMultipleNodes } from '../Explore/graph.utils'

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
const nodeWidth = 172;
const nodeHeight = 36;

export const useClaimGraph = (claimId: string) => {
  const [initialNodes, setInitialNodes] = useState(null)
  const [initialEdges, setInitialEdges] = useState(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGraphData = async () => {
      setIsLoading(true)
      try {
        const { data } = await axios.get(`/api/claim_graph/${claimId}`)
        const { nodes, edges } = transformData(data?.nodes || [])
        setInitialNodes(nodes as any)
        setInitialEdges(edges as any)
      } catch (err) {
        setError('Failed to fetch graph data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGraphData()
  }, [claimId])

  return { initialEdges, initialNodes, isLoading, error }
}

const transformNodes = (nodes: any[]) => { 
  const uniqueNodes = Array.from(new Map(nodes.map(node => [node.data.id, node])).values())

  return uniqueNodes.map((node) => {
    return {
      id: node.data.id,
      type: 'custom',
      data: {
        label: node.data.label,
        image: node.data.image,
        raw: node.data.raw
      },
      style: {
        color: '#1a192b',
        width: '200px',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        textAlign: 'center'
      }
    }
  })
}

const transformEdges = (edges: any[]) => {
  const uniqueEdges = Array.from(new Map(edges.map(edge => [edge.data.id, edge])).values())

  return uniqueEdges.map(edge => ({
    id: edge.data.id.toString(),
    source: edge.data.source.toString(),
    target: edge.data.target.toString(),
    type: 'straight',
    label: edge.data.relation,
    style: {
      stroke: '#888',
      strokeWidth: 2
    },
    data: {
      relation: edge.data.relation,
      raw: edge.data.raw
    }
  }))
}

const transformData = (graphData: any[]) => {
  const { nodes, edges } = parseMultipleNodes(graphData)
  const initialNodes = transformNodes(nodes)
  const initialEdges = transformEdges(edges)

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges)

  return { nodes: layoutedNodes, edges: layoutedEdges }
}

const getLayoutedElements = (nodes: any, edges: any, direction = 'TB') => {
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 250, 
    ranksep: 250, 
    edgesep: 220, 
    marginx: 250, 
    marginy: 250, 
  });

  nodes.forEach((node: any) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge: any) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const newNodes = nodes.map((node: any) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',

      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2
      }
    }

    return newNode
  })

  return { nodes: newNodes, edges }
}