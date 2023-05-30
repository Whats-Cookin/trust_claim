import React from 'react'
import Backdrop from '@mui/material/Backdrop'
import CircularProgress from '@mui/material/CircularProgress'

import ILoaderTypes from './types'

const Loader = ({ open }: ILoaderTypes) => {
  return (
    <div>
      <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={open}>
        <CircularProgress color='inherit' data-testid='loader' />
      </Backdrop>
    </div>
  )
}

export default Loader
