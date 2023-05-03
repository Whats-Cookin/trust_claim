import React from 'react'
import IHomeProps from './types'
import Triangle from '../../components/SVGs/svg'
import { Form } from '../../components/Form'
import { Paper } from '@mui/material'

const FormPage = ({ toggleSnackbar, setSnackbarMessage, setLoading }: IHomeProps) => {
  return (
    <>
      <Triangle />
      <Paper sx={{ zIndex: 20, my: 10 }}>
        <Form toggleSnackbar={toggleSnackbar} setSnackbarMessage={setSnackbarMessage} setLoading={setLoading} />
      </Paper>
    </>
  )
}

export default FormPage
