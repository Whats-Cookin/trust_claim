import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Typography from '@mui/material/Typography'
import IRegisterProps from './types'
import styles from './styles'
import { BACKEND_BASE_URL } from '../../utils/settings'
import polygon1 from '../../assets/circle.png'
import polygon2 from '../../assets/Polygon 2.png'
import polygon3 from '../../assets/Polygon 3.png'
import {TextField, Box, Button, FormControlLabel, Checkbox} from '@mui/material'


const Register = ({ toggleSnackbar, setSnackbarMessage, setLoading }: IRegisterProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm()

  const navigate = useNavigate()
  
  const onSubmit = handleSubmit( async ({email,password}) => {
    try {
      if (!email || !password) {
        toggleSnackbar(true)
        setSnackbarMessage('Both email and password are required fields.')
      } else {
        const signupUrl = `${BACKEND_BASE_URL}/auth/signup`
        const data = { email , password }
        await axios.post(signupUrl, data)
        setLoading(false)
        navigate('/login')
        
      }
    } catch (err: any) {
      setLoading(false)
      toggleSnackbar(true)
      setSnackbarMessage(err.response.data.message)
      console.error('err', err.response.data.message)
    }
  }
  )
  return (
    <>
      <img src={polygon1} alt='' style={{ position: 'absolute', top: '3%', left: '-10%' }} />
      <img src={polygon2} alt='' style={{ position: 'absolute', top: '50%', right: '20%' }} />
      <img src={polygon3} alt='' style={{ position: 'absolute', right: '20%', top: '5%', width: '200px' }} />
      <Box sx={styles.authContainer} >
        <form onSubmit={onSubmit}>
        <Typography variant='h5' style={{ color: '#80B8BD', textAlign: 'center' }}>
          Register
        </Typography>
        <TextField 
         {...register('email' ,{
          required:true,
        })}
          fullWidth
          label='Email'
          sx={styles.inputField}
          variant='filled'
          type='email'
        />
        <TextField
        {...register('password', {
          required:true,
        })}
          fullWidth
          label='Password'
          sx={styles.inputField}
          variant='filled'
          type='password'
        />
        <Box sx={styles.submitButtonWrap}>
          <Button  type="submit" variant='contained' size='medium' sx={styles.submitButton}>
            Register
          </Button>
        </Box>
        <Link to='/login' style={{ textDecoration: 'none' }}>
          <Typography variant='body1' style={{ color: 'black' }}>
            Click here to Login
          </Typography>
        </Link>
        </form>
      </Box>
    </>
  )
}
export default Register
