import { padding } from '@mui/system'
import { Background } from '@xyflow/react'

const styles = {
  container: {
    padding: '10rem',
    '@media (min-width: 600px)': {
      padding: '0'
    }
  },
  graph: {
    width: '100vw',
    height: '100vh',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // marginX: '10rem',
    background: 'white'
  }
}

export default styles
