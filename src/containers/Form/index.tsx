import React from 'react'
import IHomeProps from './types'
import polygon1 from '../../assets/circle.png'
import polygon2 from '../../assets/Polygon 2.png'
import polygon3 from '../../assets/Polygon 3.png'
import { Form } from '../../components/Form'
import { Paper } from '@mui/material'
import { CardMedia, useTheme } from '@mui/material'

const FormPage = ({ toggleSnackbar, setSnackbarMessage, setLoading }: IHomeProps) => {
  return (
    <>
      <CardMedia
        component='img'
        image={polygon1}
        sx={{ width: { xs: '50%', md: '700px' }, position: 'absolute', top: '3%', left: '-10%' }}
      />
      <CardMedia
        component='img'
        image={polygon2}
        sx={{ width: { xs: '50%', md: '381px' }, position: 'absolute', top: '50%', right: '20%' }}
      />
      <CardMedia
        component='img'
        image={polygon3}
        sx={{ width: { xs: '50%', md: '200px' }, position: 'absolute', right: { xs: '10%', md: '20%' }, top: '5%' }}
      />
      <Paper sx={{ zIndex: 20, my: 10 }}>
        <Form toggleSnackbar={toggleSnackbar} setSnackbarMessage={setSnackbarMessage} setLoading={setLoading} />
      </Paper>
    </>
  )
}

export default FormPage
