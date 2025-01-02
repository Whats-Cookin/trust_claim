import { BaseEdge, EdgeProps, getStraightPath } from '@xyflow/react'

const Edge = ({ sourceX, sourceY, targetX, targetY, style = {}, markerEnd }: EdgeProps) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY
  })

  return (
    <BaseEdge
      path={edgePath}
      style={{
        ...style,
        strokeWidth: 2,
        stroke: '#888'
      }}
      markerEnd={markerEnd}
    />
  )
}

export default Edge
