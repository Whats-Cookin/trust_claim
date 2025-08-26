/// <reference types="vite/client" />

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.svg?react' {
  import { FunctionComponent, SVGProps } from 'react'
  const SVG: FunctionComponent<SVGProps<SVGSVGElement>>
  export default SVG
}
