import Box from '@mui/material/Box'
import { useNavigate } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import { TextField, Button, FormControl, MenuItem, Rating, FormHelperText } from '@mui/material'
import IHomeProps from '../../containers/Form/types'
import { Controller, useForm } from 'react-hook-form'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import Tooltip from '@mui/material/Tooltip'
import { useQueryParams } from '../../hooks'
import Dialog from '@mui/material/Dialog'
import DialogContentText from '@mui/material/DialogContentText'
import React, { useState } from 'react'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

const Rate = ({ toggleSnackbar, setSnackbarMessage, setLoading }: IHomeProps) => {
  const queryParams = useQueryParams()
  const subject = queryParams.get('subject')
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
    setValue
  } = useForm({
    defaultValues: {
      subject: subject as string,
      claim: 'rated',
      statement: '' as string,
      aspect: '' as string,
      howKnown: '' as string,
      effectiveDate: new Date(),
      stars: null as number | null
    }
  })

  const { createClaim } = useCreateClaim()
  const navigate = useNavigate()

  const onSubmit = handleSubmit(async ({ subject, claim, statement, aspect, howKnown, effectiveDate, stars }) => {
    if (subject && claim) {
      const starsAsNumber = Number(stars)
      const effectiveDateAsString = effectiveDate.toISOString()

      const payload = {
        subject,
        claim,
        statement,
        aspect,
        howKnown,
        effectiveDate: effectiveDateAsString,
        stars: starsAsNumber
      }

      setLoading(true)

      const { message, isSuccess } = await createClaim(payload) // Change this line

      setLoading(false)
      toggleSnackbar(true)
      setSnackbarMessage(message)
      if (isSuccess) {
        setDialogOpen(true)
        setIsFormSubmitted(true)
        setTimeout(() => {
          setDialogOpen(false)
          navigate('/feed')
        }, 3000)
        reset()
      } else {
        setLoading(false)
        toggleSnackbar(true)
        setSnackbarMessage('Subject and Claims are required fields.')
      }
    }
  })

  const watchEffectiveDate = watch('effectiveDate')

  const inputOptions = {
    aspect: ['fast turnaround', 'good value', 'responsive', ' quality'],
    howKnown: [
      'first_hand',
      'second_hand',
      'website',
      'verified_website',
      'verified_login',
      'signed_claim',
      'blockchain',
      'physical_document',
      'integration'
    ]
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: 2,
        width: '100%',
        padding: '2rem',
        maxWidth: '430px',
        marginTop: { xs: 15, md: 8 },
        background: '#FFFFFF',
        boxShadow: '0px 1px 20px rgba(0, 0, 0, 0.25)',
        zIndex: 20,
        borderRadius: '10px',
        margin: '0'
      }}
    >
      <Box sx={{}}>
        <Typography
          variant='h4'
          sx={{
            textAlign: 'center',
            fontSize: '20px',
            color: 'primary.main',
            fontWeight: 'bold'
          }}
        >
          {`Welcome!  Rate your experience with `}
          <strong
            style={{
              fontWeight: 1000
            }}
          >
            {`${subject || 'this company'}`}
          </strong>
        </Typography>
      </Box>
      <form onSubmit={onSubmit}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 600, rowGap: 1, m: 1 }}>
          <Tooltip title='Tell about your experience ' placement='right' arrow>
            <TextField
              {...register('statement')}
              sx={{ ml: 1, mr: 1, width: '40ch' }}
              margin='dense'
              variant='outlined'
              fullWidth
              label='Statement'
              key='statement'
              type='text'
              multiline={true}
              rows={4}
              maxRows={6}
            />
          </Tooltip>
          {
            <>
              <Tooltip title='What aspect is this rating about?' placement='right' arrow>
                <TextField
                  select
                  label='Aspect'
                  {...register('aspect')}
                  sx={{ ml: 1, mr: 1, maxWidth: 600 }}
                  margin='dense'
                  variant='outlined'
                  fullWidth
                >
                  {inputOptions.aspect.map((aspectText: string, index: number) => (
                    <MenuItem value={aspectText} key={aspectText}>
                      <Box sx={{ width: '100%', height: '100%' }}>{aspectText}</Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Tooltip>

              <Controller
                name='stars'
                control={control}
                rules={{ required: { value: true, message: 'rating is required' } }}
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <Tooltip title='Your rating' placement='right' arrow>
                    <FormControl sx={{ ml: 1, mr: 1, width: 'fit-content' }} fullWidth error={!!error}>
                      <Typography>Your Rating</Typography>
                      <Rating
                        name='stars'
                        value={value}
                        onChange={(e, newValue) => onChange(newValue)}
                        precision={1}
                        size='large'
                      />

                      <FormHelperText>{error?.message}</FormHelperText>
                      <Dialog
                        open={dialogOpen}
                        onClose={() => {
                          setDialogOpen(false)
                          if (isFormSubmitted) {
                            navigate('/feed')
                          }
                        }}
                      >
                        <DialogContentText sx={{ p: '30px' }}>Thank you for your submission!</DialogContentText>
                      </Dialog>
                    </FormControl>
                  </Tooltip>
                )}
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label='Effective Date'
                  value={watchEffectiveDate}
                  onChange={(newValue: any) => setValue('effectiveDate', newValue)}
                  renderInput={(params: any) => (
                    <TextField {...params} sx={{ ml: 1, mr: 1, width: 600 }} variant='filled' />
                  )}
                />
              </LocalizationProvider>
            </>
          }

          <input type='hidden' value='first_hand' {...register('howKnown')} />
        </Box>
      </form>

      <Button
        onClick={onSubmit}
        type='submit'
        variant='contained'
        size='large'
        sx={{
          ml: 1,
          mr: 1,
          width: '50%',
          bgcolor: 'praimary.main',
          margin: '0 auto',
          '&:hover': {
            backgroundColor: '#00695f'
          }
        }}
      >
        Submit
      </Button>
    </Box>
  )
}

export default Rate
