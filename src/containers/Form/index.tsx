import React from 'react'
import IHomeProps from './types'
import polygon1 from '../../assets/circle.png'
import polygon2 from '../../assets/Polygon 2.png'
import polygon3 from '../../assets/Polygon 3.png'
import { Form } from '../../components/Form'
import { Paper } from '@mui/material'

const FormPage = ({ toggleSnackbar, setSnackbarMessage, setLoading }: IHomeProps) => {
  return (
    <>
      <img src={polygon1} alt='' style={{ position: 'absolute', top: '3%', left: '-10%' }} />
      <img
        src={polygon2}
        alt=''
        style={{
          position: 'absolute',
          top: '50%',
          right: '20%',
          transform: 'translateY(-50%)'
        }}
      />
      <img
        src={polygon3}
        alt=''
        style={{
          position: 'absolute',
          right: '20%',
          top: '5%',
          width: '200px'
        }}
      />
      <Paper sx={{ zIndex: 20, my: 10 }}>
        <Form
          toggleSnackbar={toggleSnackbar}
          setSnackbarMessage={setSnackbarMessage}
          setLoading={setLoading}
          simple={false}
        />
      </Paper>
    </>
  )
}

export default FormPage
