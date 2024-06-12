import {
  useTheme,
  TextField,
  Button,
  FormControl,
  MenuItem,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  FormHelperText
} from '@mui/material'
import React, { useEffect } from 'react'
import Box from '@mui/material/Box'
import { useNavigate } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import IHomeProps from '../../containers/Form/types'
import styles from '../../containers/Form/styles'
import { Controller, useForm } from 'react-hook-form'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import Tooltip from '@mui/material/Tooltip'
import { composeClient } from '../../composedb'
const tooltips = {
  claim: [
    'Indicates a claim about rating or evaluating a subject based on specific criteria or aspects',
    'Denotes a claim indicating that the subject created a positive impact to others',
    'Report about the subject, generally about negative or problematic behavior',
    'Indicates a relationship between the subject and some other entity.'
  ],
  aspect: [],
  howKnown: [
    'The information is known directly from personal experience or firsthand knowledge.',
    'The information is known from someone else who has firsthand knowledge or experience',
    'The information is known from a website as a source',
    'The information is known from a website that has been verified or authenticated.',
    'The information is known through a verified login or authentication process.',
    'The information is known through a signed claim or statement',
    'The information is known through a blockchain system, providing secure and transparent records',
    'The information is known from a physical document, such as a paper document or certificate',
    'The information is known through an integrated system or platform'
  ]
}

export const Form = ({
  toggleSnackbar,
  setSnackbarMessage,
  setLoading,
  selectedClaim,
  onCancel
}: IHomeProps & { onCancel?: () => void; selectedClaim?: any }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    control
  } = useForm({
    defaultValues: {
      subject: (selectedClaim?.nodeUri as string) || null,
      claim: 'rated',
      object: '' as string,
      statement: '' as string,
      aspect: '' as string,
      howKnown: '' as string,
      sourceURI: '' as string,
      effectiveDate: new Date(),
      confidence: null as number | null,
      stars: null as number | null,
      amt: null as number | null
    }
  })

  const { createClaim } = useCreateClaim()
  const navigate = useNavigate()
  const did = localStorage.getItem('did')

  // querying composeDB
  useEffect(() => {
    const QUERY = `
      query{
        linkedClaimIndex(last: 3) {
          edges {
            node {
              statement
              effectiveDate
              confidence
              rating { stars, aspect }
              source { howKnown }
            }
          }
        }
      }
    `
    const getData = async () => {
      const data = await composeClient.executeQuery(QUERY)
      console.log(data)
    }
    getData()
  }, [])

  const onSubmit = handleSubmit(
    async ({
      subject,
      claim,
      object,
      statement,
      aspect,
      howKnown,
      sourceURI,
      effectiveDate,
      confidence,
      stars,
      amt
    }) => {
      if (subject && claim) {
        const effectiveDateAsString = effectiveDate.toISOString()
        const confidenceAsNumber = Number(confidence)
        const starsAsNumber = Number(stars)
        console.log('Normalizing to number amt: ' + amt)
        const amtAsNumber = Number(amt)

        const payload = {
          subject,
          claim,
          object,
          statement,
          aspect,
          howKnown,
          sourceURI,
          effectiveDate: effectiveDateAsString,
          confidence: confidenceAsNumber,
          stars: starsAsNumber,
          amt: amtAsNumber,
          issuerId: did
        }

        setLoading(true)

        const { message, isSuccess } = await createClaim(payload)

        setLoading(false)
        toggleSnackbar(true)
        setSnackbarMessage(message)
        if (isSuccess) {
          navigate('/feed')
          reset()
        }
      } else {
        setLoading(false)
        toggleSnackbar(true)
        setSnackbarMessage('Subject and Claim are required fields.')
      }
    }
  )

  const watchClaim = watch('claim')
  const watchEffectiveDate = watch('effectiveDate')

  useEffect(() => {
    if (watchClaim === 'rated') {
      setValue('object', '')
    } else {
      setValue('stars', null)
      setValue('aspect', '')
    }
  }, [watchClaim, setValue])

  const howKnownMapping: { [key: string]: string } = {
    first_hand: 'FIRST_HAND',
    second_hand: 'SECOND_HAND',
    website: 'WEB_DOCUMENT',
    physical_document: 'PHYSICAL_DOCUMENT'
  }

  const inputOptions = {
    claim: selectedClaim?.entType === 'CLAIM' ? ['agree', 'disagree'] : ['rated', 'impact', 'report', 'related_to'],
    aspect: [
      'impact:social',
      'impact:climate',
      'impact:work',
      'impact:financial',
      'impact:educational',
      'quality:speed',
      'quality:excellence',
      'quality:affordable',
      'quality:technical',
      'quality:asthetic',
      'quality:usefulness',
      'quality:taste',
      'quality:journalistic',
      'quality:academic',
      'quality:fun',
      'quality:literary',
      'quality:relevance',
      'quality:self-improvment',
      'quality:historical',
      'quality:theological',
      'quality:adventure',
      'quality:biographical',
      'quality:scientific',
      'report:scam',
      'report:spam',
      'report:misinfo',
      'report:abuse',
      'report:dangerous',
      'relationship:owns',
      'relationship:works-for',
      'relationship:works-with',
      'relationship:worked-on',
      'relationship:same-as'
    ],
    howKnown: ['first_hand', 'second_hand', 'website', 'physical_document']
  }
  let titleText = 'Enter a Claim'

  if (selectedClaim) {
    titleText = selectedClaim.entType === 'CLAIM' ? 'do you want to validate ?' : 'what do you have to say about'
  }
  const theme = useTheme()
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.formBackground,
        boxShadow: `0 0 30px ${theme.palette.shadows}`,
        borderRadius: '10px',
        border: `1px solid ${theme.palette.borderColor}`
      }}
    >
      <DialogTitle>
        <Typography
          variant='h4'
          sx={{
            mb: 3,
            textAlign: 'center',
            fontSize: '20px',
            color: theme.palette.maintext,
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}
        >
          {titleText}
        </Typography>
        {selectedClaim?.name && selectedClaim?.entType !== 'CLAIM' && <Typography>{selectedClaim.name}</Typography>}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <Box sx={styles.inputFieldWrap}>
            <Tooltip
              title='You should put the link to the site or social media account where the claim was created  '
              placement='right'
              arrow
              sx={{ backgroundColor: theme.palette.maintext }}
            >
              <TextField
                {...register('subject', { required: { value: true, message: 'subject is required' } })}
                sx={{
                  ml: 1,
                  mr: 1,
                  width: '22ch',
                  '& .MuiInputBase-input': {
                    color: theme.palette.texts
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiFormHelperText-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiSvgIcon-root': {
                    color: theme.palette.icons
                  }
                }}
                margin='dense'
                variant='standard'
                fullWidth
                label='Subject'
                key='subject'
                disabled={!!selectedClaim?.nodeUri}
                type='text'
                error={Boolean(errors.subject)}
                helperText={errors.subject?.message}
              />
            </Tooltip>
            <Tooltip title='For evaluation being made ' placement='right' arrow>
              <TextField
                select
                label='Claim'
                {...register('claim', { required: { value: true, message: 'claim is required' } })}
                sx={{
                  ml: 1,
                  mr: 1,
                  width: '22ch',
                  '& .MuiInputBase-input': {
                    color: theme.palette.texts
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiFormHelperText-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiSvgIcon-root': {
                    color: theme.palette.texts
                  }
                }}
                margin='dense'
                variant='standard'
                fullWidth
                error={Boolean(errors.claim)}
                helperText={errors.claim?.message}
              >
                {inputOptions.claim.map((claimText: string, index: number) => (
                  <MenuItem
                    sx={{
                      backgroundColor: theme.palette.menuBackground,
                      color: theme.palette.texts,
                      '&:hover': {
                        backgroundColor: theme.palette.formBackground
                      },
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.formBackground,
                        '&:hover': {
                          backgroundColor: theme.palette.formBackground
                        }
                      },
                      '&:active': {
                        backgroundColor: theme.palette.formBackground
                      },
                      '::selection': {
                        backgroundColor: theme.palette.formBackground
                      }
                    }}
                    value={claimText}
                    key={claimText}
                  >
                    <Tooltip title={tooltips.claim[index]} placement='right' arrow>
                      <Box sx={{ width: '100%', height: '100%' }}>{claimText}</Box>
                    </Tooltip>
                  </MenuItem>
                ))}
              </TextField>
            </Tooltip>
            <Tooltip title='The method or source of the claim ' placement='right' arrow>
              <TextField
                select
                label='How Known'
                {...register('howKnown')}
                sx={{
                  ml: 1,
                  mr: 1,
                  width: '22ch',
                  '& .MuiInputBase-input': {
                    color: theme.palette.texts
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiFormHelperText-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiSvgIcon-root': {
                    color: theme.palette.icons
                  }
                }}
                margin='dense'
                variant='standard'
                fullWidth
              >
                {inputOptions.howKnown.map((howKnownText: string, index: number) => (
                  <MenuItem
                    sx={{
                      backgroundColor: theme.palette.menuBackground,
                      color: theme.palette.texts,
                      '&:hover': {
                        backgroundColor: theme.palette.formBackground
                      },
                      '&.Mui-selected': {
                        backgroundColor: theme.palette.formBackground,
                        '&:hover': {
                          backgroundColor: theme.palette.formBackground
                        }
                      },
                      '&:active': {
                        backgroundColor: theme.palette.formBackground
                      },
                      '::selection': {
                        backgroundColor: theme.palette.formBackground
                      }
                    }}
                    value={howKnownMapping[howKnownText]}
                    key={howKnownText}
                  >
                    <Tooltip title={tooltips.howKnown[index]} placement='right' arrow>
                      <Box sx={{ width: '100%', height: '100%' }}>{howKnownText}</Box>
                    </Tooltip>
                  </MenuItem>
                ))}
              </TextField>
            </Tooltip>
            <Tooltip title='Additional details or context about the claim ' placement='right' arrow>
              <TextField
                {...register('statement')}
                sx={{
                  ml: 1,
                  mr: 1,
                  width: '22ch',
                  '& .MuiInputBase-input': {
                    color: theme.palette.texts
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiFormHelperText-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiSvgIcon-root': {
                    color: theme.palette.icons
                  }
                }}
                margin='dense'
                variant='standard'
                fullWidth
                label='Statement'
                key='statement'
                type='text'
                multiline={true}
                maxRows={4}
              />
            </Tooltip>
            <Tooltip title='You should put your site here' placement='right' arrow>
              <TextField
                {...register('sourceURI')}
                sx={{
                  ml: 1,
                  mr: 1,
                  width: '22ch',
                  '& .MuiInputBase-input': {
                    color: theme.palette.texts
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiFormHelperText-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiSvgIcon-root': {
                    color: theme.palette.icons
                  }
                }}
                margin='dense'
                variant='standard'
                fullWidth
                label='Source URI'
                key='sourceURI'
                type='text'
              />
            </Tooltip>
            <Tooltip
              title='Option is used to express the level of confidence associated with the claim, providing an indication of its reliability or certainty.'
              placement='right'
              arrow
            >
              <TextField
                {...register('confidence')}
                sx={{
                  ml: 1,
                  mr: 1,
                  width: '22ch',
                  '& .MuiInputBase-input': {
                    color: theme.palette.texts
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiFormHelperText-root': {
                    color: theme.palette.texts
                  },
                  '& .MuiSvgIcon-root': {
                    color: theme.palette.icons
                  }
                }}
                margin='dense'
                variant='standard'
                fullWidth
                label='Confidence'
                key='confidence'
                type='number'
                inputProps={{
                  min: 0.0,
                  max: 1.0,
                  step: 0.1
                }}
              />
            </Tooltip>

            {selectedClaim?.entType !== 'CLAIM' && (
              <>
                {watchClaim === 'rated' && (
                  <>
                    <Tooltip title='A specific dimension being evaluated or rated' placement='right' arrow>
                      <TextField
                        select
                        label='Aspect'
                        {...register('aspect')}
                        sx={{
                          ml: 1,
                          mr: 1,
                          width: '22ch',
                          '& .MuiInputBase-input': {
                            color: theme.palette.texts
                          },
                          '& .MuiInputLabel-root': {
                            color: theme.palette.texts
                          },
                          '& .MuiFormHelperText-root': {
                            color: theme.palette.texts
                          },
                          '& .MuiSvgIcon-root': {
                            color: theme.palette.icons
                          }
                        }}
                        margin='dense'
                        variant='standard'
                        fullWidth
                      >
                        {inputOptions.aspect.map((aspectText: string, index: number) => (
                          <MenuItem
                            sx={{
                              backgroundColor: theme.palette.menuBackground,
                              color: theme.palette.texts,
                              '&:hover': {
                                backgroundColor: theme.palette.formBackground
                              },
                              '&.Mui-selected': {
                                backgroundColor: theme.palette.formBackground,
                                '&:hover': {
                                  backgroundColor: theme.palette.formBackground
                                }
                              },
                              '&:active': {
                                backgroundColor: theme.palette.formBackground
                              },
                              '::selection': {
                                backgroundColor: theme.palette.formBackground
                              }
                            }}
                            value={aspectText}
                            key={aspectText}
                          >
                            <Tooltip title={tooltips.aspect[index]} placement='right' arrow>
                              <Box sx={{ width: '100%', height: '100%' }}>{aspectText}</Box>
                            </Tooltip>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Tooltip>

                    <Controller
                      name='stars'
                      control={control}
                      rules={{ required: { value: true, message: 'rating is required' } }}
                      render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <Tooltip title='A rating associated with the claim' placement='right' arrow>
                          <FormControl sx={{ ml: 1, mr: 1, width: '22ch' }} fullWidth error={!!error}>
                            <Typography sx={{ mb: 1, color: theme.palette.texts }}>Review Rating</Typography>
                            <Rating
                              name='stars'
                              value={value}
                              onChange={(e, newValue) => onChange(newValue)}
                              precision={1}
                              sx={{
                                color: theme.palette.stars,
                                '& .MuiRating-icon': { color: theme.palette.stars }
                              }}
                              size='large'
                            />

                            <FormHelperText>{error?.message}</FormHelperText>
                          </FormControl>
                        </Tooltip>
                      )}
                    />
                  </>
                )}
                {watchClaim === 'impact' && (
                  <FormControl fullWidth sx={{ mt: 1, width: '100%' }}>
                    <InputLabel htmlFor='outlined-adornment-amount'>Value</InputLabel>
                    <OutlinedInput
                      {...register('amt')}
                      id='outlined-adornment-amount'
                      startAdornment={<InputAdornment position='start'>$</InputAdornment>}
                      label='Amount'
                    />
                  </FormControl>
                )}
                {watchClaim === 'related' && (
                  <Tooltip title='What entity is the subject related to?' placement='right' arrow>
                    <TextField
                      {...register('object')}
                      sx={{
                        ml: 1,
                        mr: 1,
                        width: '22ch',
                        '& .MuiInputBase-input': {
                          color: theme.palette.texts
                        },
                        '& .MuiInputLabel-root': {
                          color: theme.palette.texts
                        },
                        '& .MuiFormHelperText-root': {
                          color: theme.palette.texts
                        },
                        '& .MuiSvgIcon-root': {
                          color: theme.palette.icons
                        }
                      }}
                      margin='dense'
                      variant='standard'
                      fullWidth
                      label='Object'
                      key='object'
                      type='text'
                    />
                  </Tooltip>
                )}
              </>
            )}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='Effective Date'
                value={watchEffectiveDate}
                onChange={(newValue: any) => setValue('effectiveDate', newValue)}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    sx={{
                      ml: 1,
                      mr: 1,
                      width: '100%',
                      '& .MuiInputBase-input': {
                        color: theme.palette.texts
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.palette.texts
                      },
                      '& .MuiFormHelperText-root': {
                        color: theme.palette.texts
                      },
                      '& .MuiSvgIcon-root': {
                        color: theme.palette.icons
                      }
                    }}
                    variant='standard'
                  />
                )}
              />
            </LocalizationProvider>
          </Box>
        </form>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', columnGap: 3 }}>
        <Button
          onClick={onSubmit}
          variant='contained'
          size='large'
          sx={{
            ml: 1,
            mr: 1,
            width: '50%',
            color: theme.palette.buttontext,
            bgcolor: theme.palette.buttons,
            margin: '0 auto',
            '&:hover': {
              backgroundColor: theme.palette.buttonHover
            }
          }}
        >
          Submit
        </Button>
        {!!onCancel && <Button onClick={onCancel}>Cancel</Button>}
      </DialogActions>
    </Box>
  )
}
