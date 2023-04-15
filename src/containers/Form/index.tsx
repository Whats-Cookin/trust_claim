import axios from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { PublishClaim } from '../../composedb/compose'
import Form, { IFormData, IFormProps } from '../useForm'

const Form1 = ({ toggleSnackbar, setSnackbarMessage, setLoading }: IFormProps) => {
  return (
    <>
      <Form toggleSnackbar={toggleSnackbar} setSnackbarMessage={setSnackbarMessage} setLoading={setLoading} />
    </>
  )
}

export default Form1
