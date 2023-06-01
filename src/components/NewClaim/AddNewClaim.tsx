import React, { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import IHomeProps from '../../containers/Form/types'
import { Form } from '../Form'
const FormDialog = ({
  open,
  setOpen,
  toggleSnackbar,
  setSnackbarMessage,
  selectedClaim,
  setLoading
}: IHomeProps & { open: boolean; setOpen: (open: boolean) => void; selectedClaim: any }) => {
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
          selectedClaim={selectedClaim}
          onCancel={handleClose}
        />
      </Dialog>
    </div>
  )
}
export default FormDialog
