import '@xyflow/react/dist/style.css'
import { ReactFlow, useNodesState, useEdgesState, Background } from '@xyflow/react'
import { Box } from '@mui/material'
import IHomeProps from '../Form/types'
import { useClaimGraph } from './hooks'
import styles from './styles'
import Node from './Node'
import Edge from './Edge'
import { useEffect } from 'react'

const GraphV2 = (homeProps: IHomeProps) => {
  const { initialNodes, initialEdges, isLoading, error }: any = useClaimGraph('118550')

  const [nodes, _setNodes, onNodesChange] = useNodesState([])
  const [edges, _setEdges, onEdgesChange] = useEdgesState([])

  return (<>
      {!isLoading && (
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          fitView
          fitViewOptions={{ padding: 0.8 }}
        //   nodeTypes={{
        //     custom: Node
        //   }}
        //   edgeTypes={{ custom: Edge }}
        nodesConnectable={false}
        >
          <Background />
        </ReactFlow>
      )}
  </>)
  
}

export default GraphV2
