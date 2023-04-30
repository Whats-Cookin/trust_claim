import React, { useState, useEffect, useRef } from 'react'
import { p5InstanceExtensions } from 'p5'
import { P5CanvasInstance, ReactP5Wrapper } from 'react-p5-wrapper'

import { P5Wrapper } from 'react-p5-wrapper'
import p5 from 'p5'

interface Props {
  width: number
  height: number
}

const AnimatedSVG: React.FC<Props> = ({ width, height }) => {
  const [rotation, setRotation] = useState(0)

  const svgRef = useRef<p5InstanceExtensions>()

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRotation(prevRotation => prevRotation + 1)
    }, 10)

    return () => clearInterval(intervalId)
  }, [])

  const sketch = (p: p5) => {
    const setup = (p: p5InstanceExtensions, canvasParentRef: Element) => {
      p.createCanvas(width, height).parent(canvasParentRef)
      svgRef.current = p
    }

    const draw = (p: p5InstanceExtensions) => {
      p.background('#000')
      p.push()
      p.translate(p.width / 2, p.height / 2)
      p.rotate((rotation * Math.PI) / 180)
      p.stroke(255)
      p.fill(255)
      p.ellipse(0, 0, 50, 50)
      p.line(0, 0, 0, 100)
      p.pop()
    }
  }

  return <P5Wrapper sketch={sketch} />
}

export default AnimatedSVG
