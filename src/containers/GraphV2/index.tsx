import '@xyflow/react/dist/style.css'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ReactFlow, useNodesState, useEdgesState, Background } from '@xyflow/react'
import { Box } from '@mui/material'
import IHomeProps from '../Form/types'
import { useClaimGraph } from './hooks'
import styles from './styles'
import Node from './Node'
import Edge from './Edge'
import MainContainer from '../../components/MainContainer'

const GraphV2 = (homeProps: IHomeProps) => {
  const { nodeId } = useParams<{ nodeId: string }>()
  const { initialNodes, initialEdges, isLoading, error }: any = useClaimGraph(nodeId as string)

  const [nodes, _setNodes, onNodesChange] = useNodesState([])
  const [edges, _setEdges, onEdgesChange] = useEdgesState([])

  return (
    <>
    <MainContainer  sx={{height: '100vh'}}>
      {!isLoading && (
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          fitView
          fitViewOptions={{ padding: 0.8 }}
            nodeTypes={{
              custom: Node
            }}
            edgeTypes={{ custom: Edge }}
          nodesConnectable={false}

        >
         
        </ReactFlow>
      )}

</MainContainer>
    </>
  )
}

export default GraphV2
