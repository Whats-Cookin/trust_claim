import React, { Dispatch, SetStateAction, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  Button,
  MenuItem,
  FormControl,
  useTheme,
  Card,
  Select,
  TextField,
  useMediaQuery,
  IconButton,
  CardMedia
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { CloudUpload } from '@mui/icons-material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
interface MobileIndexProps {
  toggleSnackbar: (toggle: boolean) => void
  setSnackbarMessage: (message: string) => void
  setLoading: Dispatch<SetStateAction<boolean>>
  toggleTheme: () => void // Assuming toggleTheme is a function
  isDarkMode: boolean // Assuming isDarkMode is a boolean
}
const MobileIndex: React.FC<MobileIndexProps> = ({
  toggleSnackbar,
  setSnackbarMessage,
  setLoading,
  toggleTheme,
  isDarkMode
}) => {
  const [subjectValue, setSubjectValue] = useState('')
  const [statementValue, setStatementValue] = useState('')
  const [amtValue, setAmtValue] = useState('')
  const [effectiveDateValue, setEffectiveDateValue] = useState('')

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const { control } = useForm({
    defaultValues: {
      effectiveDate: new Date()
    }
  })

  const handleHowKnownChange = () => {
    // Handler for howKnown change
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        mt: '5vh',
        width: '100%',
        backgroundColor: theme.palette.menuBackground,
        borderRadius: '20px',
        padding: '3px',
        height: 'auto' // Use auto height for responsiveness
      }}
    >
      <form onSubmit={() => {}} style={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <Box sx={{ flex: 1, p: 2 }}>
            <Typography
              sx={{
                fontFamily: 'Montserrat',
                fontSize: '23px',
                fontWeight: '800',
                textAlign: 'left'
              }}
            >
              {`There’s a claim that`}
              <Box
                sx={{
                  height: '4px',
                  backgroundColor: theme.palette.maintext,
                  marginTop: '4px',
                  borderRadius: '2px',
                  width: '70%'
                }}
              />
            </Typography>
            <Card
              sx={{
                backgroundColor: theme.palette.cardBackground,
                padding: '20px',
                marginTop: '20px',
                borderRadius: '20px'
              }}
            >
              <Box
                sx={{
                  borderRadius: '8px',
                  height: '328px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#425655',
                  p: 3,
                  marginBottom: '45px'
                }}
              >
                {/* <CloudUpload sx={{ color: '#fff', fontSize: '3rem' }} /> */}
                <CardMedia component='img' image='/' />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '20px' }}>
                  <strong>Issuer:</strong>
                </Typography>
                <Typography sx={{ fontSize: '20px' }}>
                  <strong>Subject:</strong> {subjectValue}
                </Typography>
                <Typography sx={{ fontSize: '20px' }}>
                  <strong>Aspect:</strong> impact
                </Typography>
                <Typography sx={{ fontSize: '20px' }}>
                  <strong>Confidence:</strong> 0.9
                </Typography>
                <Typography sx={{ fontSize: '20px' }}>
                  <strong>Amount of claim:</strong> 50 $
                </Typography>
                <Typography sx={{ fontSize: '20px' }}>
                  <strong>Date:</strong> {effectiveDateValue}
                </Typography>
                <Typography sx={{ fontSize: '18px' }}>
                  <strong>Statement :</strong> {statementValue}
                  <a href='./' style={{ color: theme.palette.buttons }}>
                    ...View more
                  </a>
                </Typography>
              </Box>
            </Card>
          </Box>
          <Box sx={{ flex: 1, p: 2 }}>
            <Typography
              sx={{
                fontFamily: 'Montserrat',
                fontSize: '19px',
                fontWeight: '600',
                textAlign: 'left'
              }}
            >
              {`Do you know anything about that?`}
              <Box
                sx={{
                  height: '4px',
                  backgroundColor: theme.palette.maintext,
                  marginTop: '4px',
                  borderRadius: '2px',
                  width: '60%'
                }}
              />
            </Typography>
            <Card
              sx={{
                backgroundColor: theme.palette.cardBackground,
                padding: '20px',
                marginTop: '20px',
                borderRadius: '20px'
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography
                  sx={{
                    fontFamily: 'Montserrat',
                    fontSize: '20px',
                    fontWeight: '800'
                  }}
                >
                  How Known
                </Typography>
                <FormControl
                  fullWidth
                  margin='normal'
                  sx={{
                    backgroundColor: theme.palette.input,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'transparent' // Remove border
                      },
                      '&:hover fieldset': {
                        borderColor: 'transparent' // Transparent on hover
                      }
                    }
                  }}
                >
                  <Select
                    sx={{
                      color: theme.palette.input, // Set the text color of the Select to red
                      '& .MuiSelect-icon': {
                        color: '#0A1C1D'
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                      }
                    }}
                    onChange={handleHowKnownChange}
                    defaultValue=''
                  >
                    <MenuItem value='option1'>First Hand 1</MenuItem>
                    <MenuItem value='option2'>Second Hand</MenuItem>
                    <MenuItem value='option3'>Website</MenuItem>
                    <MenuItem value='option4'>Physical Document</MenuItem>
                  </Select>
                </FormControl>
                <Typography
                  sx={{
                    fontFamily: 'Montserrat',
                    fontSize: '20px',
                    fontWeight: '800'
                  }}
                >
                  Effective Date
                </Typography>
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <Controller
                    name='effectiveDate'
                    control={control}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          {...field}
                          renderInput={params => (
                            <TextField
                              {...params}
                              sx={{
                                backgroundColor: theme.palette.input,
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderColor: 'transparent'
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'transparent'
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: 'transparent'
                                  }
                                },
                                '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                                  color: '#0A1C1D'
                                },
                                '& .MuiInputBase-input': {
                                  color: 'transparent' // Make the text inside the input transparent
                                }
                              }}
                              margin='normal'
                            />
                          )}
                          value={field.value}
                          onChange={date => field.onChange(date)}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </FormControl>
                <Typography
                  sx={{
                    fontFamily: 'Montserrat',
                    fontSize: '20px',
                    fontWeight: '800'
                  }}
                >
                  Explain here
                </Typography>
                <TextField
                  multiline
                  rows={4}
                  sx={{
                    width: '100%',
                    height: '179px',
                    backgroundColor: theme.palette.input,
                    border: 'none',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'transparent'
                      },
                      '&:hover fieldset': {
                        borderColor: 'transparent'
                      }
                    }
                  }}
                  margin='normal'
                />
                <Typography
                  sx={{
                    fontFamily: 'Montserrat',
                    fontSize: '20px',
                    fontWeight: '800',
                    margin: '10px 0'
                  }}
                >
                  Upload image
                </Typography>
                <Box
                  sx={{
                    border: `5px dashed ${theme.palette.input}`,
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    height: '304px',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                >
                  <IconButton component='label' sx={{ mt: 2 }}>
                    <CloudUpload sx={{ color: theme.palette.input, fontSize: '4.2rem' }} />
                    <input type='file' hidden />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </form>

      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Button
          variant='contained'
          size='large'
          sx={{
            mt: 4,
            height: '8%',
            margin: '46px auto',
            minHeight: '50px',
            maxHeight: '63px',
            width: '15%',
            minWidth: '100px',
            maxWidth: '229px',
            color: theme.palette.buttontext,
            borderRadius: '30px',
            bgcolor: theme.palette.buttons,
            '&:hover': {
              backgroundColor: theme.palette.buttonHover
            }
          }}
        >
          Submit
        </Button>
      </Box>
    </Box>
  )
}

export default MobileIndex
