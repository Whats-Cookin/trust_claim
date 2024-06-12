import { useTheme } from '@mui/material/styles'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'

import ILoaderTypes from './types'

const Loader = ({ open }: ILoaderTypes) => {
  const theme = useTheme()
  return (
    <div>
      <Backdrop sx={{ color: theme.palette.texts, zIndex: theme => theme.zIndex.drawer + 1 }} open={open}>
        <CircularProgress color='inherit' data-testid='loader' />
      </Backdrop>
    </div>
  )
}

export default Loader
