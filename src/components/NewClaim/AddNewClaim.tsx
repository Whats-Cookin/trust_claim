import React, { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import IHomeProps from '../../containers/Form/types'
import { Form } from '../Form'

const FormDialog = ({
  open,
  setOpen,
  toggleSnackbar,
  setSnackbarMessage,
  setLoading
}: IHomeProps & { open: boolean; setOpen: (open: boolean) => void }) => {
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <Form
          toggleSnackbar={toggleSnackbar}
          setSnackbarMessage={setSnackbarMessage}
          setLoading={setLoading}
          simple={true}
          onCancel={handleClose}
        />
      </Dialog>
    </div>
  )
}
export default FormDialog
