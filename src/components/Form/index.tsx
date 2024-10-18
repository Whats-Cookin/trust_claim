import {
  useTheme,
  useMediaQuery,
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
  FormHelperText,
  Box,
  Typography,
  Tooltip,
  ListSubheader,
  Divider
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import IHomeProps from '../../containers/Form/types'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import { composeClient } from '../../composedb'
import { PromiseTimeoutError, timeoutPromise } from '../../utils/promise.utils'
import ImageUploader from './imageUploading'
import MainContainer from '../MainContainer'
import { checkAuth } from '../../utils/authUtils'
import SignInAlert from './SignInAlert'

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

interface ImageI {
  url: string
  digestMultibase: string
  metadata: {
    description: string
    caption: string
  }
  effectiveDate: Date
  createdDate: Date
  owner: string
  signature: string
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
      amt: null as number | null,
      issuerId: null as string | null,
      name: null as string | null,
      images: [
        {
          url: '',
          digestMultibase: '',
          metadata: {
            description: '',
            caption: ''
          },
          effectiveDate: new Date(),
          createdDate: new Date(),
          owner: '',
          signature: ''
        }
      ] as ImageI[]
    }
  })

  const imageFieldArray = useFieldArray({
    control,
    name: 'images'
  })

  const { createClaim } = useCreateClaim()
  const isAuthenticated = checkAuth()
  const navigate = useNavigate()

  // Authantication
  const did = localStorage.getItem('did')
  const accessToken = localStorage.getItem('accessToken')

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const tooltipPlacement = isMobile ? 'top' : 'left'

  // querying composeDB
  useEffect(() => {
    const QUERY = `
      query {
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
      amt,
      name,
      images
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
          issuerId: did ?? accessToken,
          name,
          images: images.map(img => ({
            ...img
          }))
        }

        setLoading(true)

        try {
          const { message, isSuccess } = await timeoutPromise(createClaim(payload), 1000)

          if (message) {
            setSnackbarMessage(message)
            toggleSnackbar(true)
          }

          if (isSuccess) {
            navigate('/feed')
            reset()
          }
        } catch (e) {
          if (e instanceof PromiseTimeoutError) {
            navigate('/feed')
            reset()
          }
        } finally {
          setLoading(false)
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

  let titleText = 'Make a Claim'

  const displayHowKnownText = {
    first_hand: 'First Hand',
    second_hand: 'Second Hand',
    website: 'Website',
    physical_document: 'Physical Document'
  } as any

  const displayClaimText = {
    related_to: 'Related To',
    impact: 'Impact',
    rated: 'Rated',
    report: 'Report'
  } as any

  if (selectedClaim) {
    titleText = selectedClaim.entType === 'CLAIM' ? 'Do you want to validate?' : 'What do you have to say about'
  }

  return (
    <MainContainer
      flexRowOnDesktop={true}
      sx={{
        overflow: 'hidden',
        background: `linear-gradient(to bottom, ${theme.palette.menuBackground} 75%, ${theme.palette.buttons} 25%)`
      }}
    >
      {/* Alert for user to sign in */}
      {!isAuthenticated && <SignInAlert />}

      <Box
        sx={{
          textAlign: 'left',
          width: '32%'
        }}
      >
        <DialogTitle>
          <Typography
            variant='h4'
            sx={{
              fontSize: isMobile ? '40px' : '32px',
              color: theme.palette.texts,
              fontWeight: 'bold',
              textWrap: 'nowrap'
            }}
          >
            {titleText}
            <Box
              sx={{
                height: '5px',
                backgroundColor: theme.palette.maintext,
                marginTop: '2px',
                borderRadius: '2px',
                width: isMobile ? '220px' : '175px'
              }}
            />
          </Typography>
          {selectedClaim?.name && selectedClaim?.entType !== 'CLAIM' && <Typography>{selectedClaim.name}</Typography>}
        </DialogTitle>
        <Typography
          sx={{
            color: theme.palette.texts,
            marginTop: isMobile ? '32px' : '232px',
            lineHeight: isMobile ? '1.5' : '1.2',
            fontSize: isMobile ? '18px' : '40px',
            fontWeight: '500'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'row' : 'column',
              alignItems: 'flex-start',
              mb: '7px'
            }}
          >
            <Box
              sx={{
                lineHeight: isMobile ? '1.5em' : '2em',
                fontSize: isMobile ? '18px' : '40px',
                marginRight: '10px',
                color: theme.palette.texts
              }}
            >
              Strengthening
            </Box>
            <Box sx={{ lineHeight: isMobile ? '1.5em' : '2em' }}></Box>
            <span
              style={{
                backgroundColor: theme.palette.pageBackground,
                color: theme.palette.texts,
                fontSize: isMobile ? '23px' : '45px',
                fontWeight: '700',
                zIndex: 3,
                paddingRight: isMobile ? '603px' : '0'
              }}
            >
              Trust
            </span>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column' }}>
            <Box
              sx={{
                lineHeight: isMobile ? '1.5em' : '2em',
                fontSize: isMobile ? '18px' : '40px',
                marginRight: '10px',
                color: theme.palette.texts
              }}
            >
              Safeguarding
            </Box>
            <span
              style={{
                color: theme.palette.texts,
                display: isMobile ? 'inline-block' : 'none',
                fontSize: isMobile ? '18px' : '40px',
                marginRight: '10px'
              }}
            >
              {' '}
              your{' '}
            </span>
            <Box
              sx={{
                lineHeight: isMobile ? '1.5em' : '2em',
                fontSize: isMobile ? '18px' : '40px'
              }}
            >
              <span
                style={{
                  display: isMobile ? 'none' : 'inline-block',
                  color: theme.palette.texts,
                  fontSize: isMobile ? '18px' : '40px',
                  marginRight: '10px'
                }}
              >
                your{' '}
              </span>
              <span
                style={{
                  backgroundColor: theme.palette.pageBackground,
                  fontSize: isMobile ? '23px' : '45px',
                  fontWeight: '700',
                  paddingRight: isMobile ? '536px' : '0',
                  width: '100px',
                  color: theme.palette.texts
                }}
              >
                Future.
              </span>
            </Box>
          </Box>
        </Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: theme.palette.pageBackground,
          boxShadow: `0 0 30px ${theme.palette.shadows}`,
          borderRadius: '20px',
          width: '100%',
          marginRight: isMobile ? 0 : '0.972vw',
          marginLeft: isMobile ? 0 : '105px',
          marginTop: isMobile ? '41px' : '0',
          marginBottom: isMobile ? '83px' : '1.3vh',
          paddingTop: isMobile ? '4.123vh' : '3.5vh',
          paddingBottom: isMobile ? '0.965vh' : '1.3vh',
          paddingLeft: isMobile ? '4.6vw' : '3vw',
          paddingRight: isMobile ? '4.6vw' : '3vw'
        }}
      >
        <DialogContent>
          <form style={{ padding: '5px' }} onSubmit={onSubmit}>
            <ImageUploader fieldArray={imageFieldArray} control={control} register={register} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Tooltip title='Enter the name associated with the claim' placement={tooltipPlacement} arrow>
                <TextField
                  {...register('name', { required: { value: true, message: 'Name is required' } })}
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
                  margin='dense'
                  variant='standard'
                  fullWidth
                  label='Name *'
                  key='name'
                  disabled={!!selectedClaim?.nodeUri}
                  type='text'
                  error={Boolean(errors.name)}
                  helperText={errors.name ? errors.name.message : ''}
                />
              </Tooltip>
              <Tooltip
                title='You should put the link to the site or social media account where the claim was created'
                placement={tooltipPlacement}
                arrow
                sx={{ backgroundColor: theme.palette.maintext }}
              >
                <TextField
                  {...register('subject', { required: { value: true, message: 'subject is required' } })}
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
                  margin='dense'
                  variant='standard'
                  fullWidth
                  label='Subject *'
                  key='subject'
                  disabled={!!selectedClaim?.nodeUri}
                  type='text'
                  error={Boolean(errors.subject)}
                  helperText={errors.subject?.message}
                />
              </Tooltip>
              <Tooltip title='For evaluation being made' placement={tooltipPlacement} arrow>
                <TextField
                  select
                  label='Claim'
                  {...register('claim', { required: { value: true, message: 'claim is required' } })}
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
                      <Tooltip title={tooltips.claim[index]} placement={tooltipPlacement} arrow>
                        <Box sx={{ width: '100%', height: '100%' }}>{displayClaimText[claimText] || claimText}</Box>
                      </Tooltip>
                    </MenuItem>
                  ))}
                </TextField>
              </Tooltip>
              <Tooltip title='The method or source of the claim' placement={tooltipPlacement} arrow>
                <TextField
                  select
                  label='How Known'
                  {...register('howKnown')}
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
                      <Tooltip title={tooltips.howKnown[index]} placement={tooltipPlacement} arrow>
                        <Box sx={{ width: '100%', height: '100%' }}>
                          {displayHowKnownText[howKnownText] || howKnownText}
                        </Box>
                      </Tooltip>
                    </MenuItem>
                  ))}
                </TextField>
              </Tooltip>
              <Tooltip title='Additional details or context about the claim' placement={tooltipPlacement} arrow>
                <TextField
                  {...register('statement')}
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
              <Tooltip title='You should put your site here' placement={tooltipPlacement} arrow>
                <TextField
                  {...register('sourceURI')}
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
                placement={tooltipPlacement}
                arrow
              >
                <TextField
                  {...register('confidence')}
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
                      <Tooltip title='A specific dimension being evaluated or rated' placement={tooltipPlacement} arrow>
                        <TextField
                          select
                          label='Aspect'
                          {...register('aspect')}
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
                          margin='dense'
                          variant='standard'
                          fullWidth
                        >
                          {/* Impact Category */}
                          <ListSubheader
                            sx={{
                              backgroundColor: theme.palette.menuBackground,
                              color: theme.palette.texts,
                              textAlign: 'center',
                              '&:hover': {
                                backgroundColor: theme.palette.formBackground
                              }
                            }}
                          >
                            Impact
                          </ListSubheader>
                          <Divider sx={{ backgroundColor: theme.palette.divider }} />
                          {inputOptions.aspect
                            .filter(aspectText => aspectText.startsWith('impact:'))
                            .map((aspectText, index) => (
                              <MenuItem
                                sx={{
                                  backgroundColor: theme.palette.menuBackground,
                                  color: theme.palette.texts,
                                  '&:hover': {
                                    backgroundColor: theme.palette.primary.light, // Change this to the color you want on hover
                                    color: theme.palette.primary.contrastText // Adjust text color on hover
                                  },
                                  '&.Mui-selected': {
                                    backgroundColor: theme.palette.formBackground,
                                    '&:hover': {
                                      backgroundColor: theme.palette.primary.light // Maintain hover color when selected
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
                                <Tooltip title={tooltips.aspect[index]} placement={tooltipPlacement} arrow>
                                  <Box sx={{ width: '100%', height: '100%' }}>{aspectText.split(':')[1]}</Box>
                                </Tooltip>
                              </MenuItem>
                            ))}

                          {/* Quality Category */}
                          <ListSubheader
                            sx={{
                              backgroundColor: theme.palette.menuBackground,
                              color: theme.palette.texts,
                              textAlign: 'center',
                              '&:hover': {
                                backgroundColor: theme.palette.formBackground
                              }
                            }}
                          >
                            Quality
                          </ListSubheader>
                          <Divider sx={{ backgroundColor: theme.palette.divider }} />
                          {inputOptions.aspect
                            .filter(aspectText => aspectText.startsWith('quality:'))
                            .map((aspectText, index) => (
                              <MenuItem
                                sx={{
                                  backgroundColor: theme.palette.menuBackground,
                                  color: theme.palette.texts,
                                  '&:hover': {
                                    backgroundColor: theme.palette.primary.light, // Change this to the color you want on hover
                                    color: theme.palette.primary.contrastText // Adjust text color on hover
                                  },
                                  '&.Mui-selected': {
                                    backgroundColor: theme.palette.formBackground,
                                    '&:hover': {
                                      backgroundColor: theme.palette.primary.light // Maintain hover color when selected
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
                                <Tooltip title={tooltips.aspect[index]} placement={tooltipPlacement} arrow>
                                  <Box sx={{ width: '100%', height: '100%' }}>{aspectText.split(':')[1]}</Box>
                                </Tooltip>
                              </MenuItem>
                            ))}

                          {/* Report Category */}
                          <ListSubheader
                            sx={{
                              backgroundColor: theme.palette.menuBackground,
                              color: theme.palette.texts,
                              textAlign: 'center',
                              '&:hover': {
                                backgroundColor: theme.palette.formBackground
                              }
                            }}
                          >
                            Report
                          </ListSubheader>
                          <Divider sx={{ backgroundColor: theme.palette.divider }} />
                          {inputOptions.aspect
                            .filter(aspectText => aspectText.startsWith('report:'))
                            .map((aspectText, index) => (
                              <MenuItem
                                sx={{
                                  backgroundColor: theme.palette.menuBackground,
                                  color: theme.palette.texts,
                                  '&:hover': {
                                    backgroundColor: theme.palette.primary.light, // Change this to the color you want on hover
                                    color: theme.palette.primary.contrastText // Adjust text color on hover
                                  },
                                  '&.Mui-selected': {
                                    backgroundColor: theme.palette.formBackground,
                                    '&:hover': {
                                      backgroundColor: theme.palette.primary.light // Maintain hover color when selected
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
                                <Tooltip title={tooltips.aspect[index]} placement={tooltipPlacement} arrow>
                                  <Box sx={{ width: '100%', height: '100%' }}>{aspectText.split(':')[1]}</Box>
                                </Tooltip>
                              </MenuItem>
                            ))}
                        </TextField>
                      </Tooltip>

                      <Controller
                        name='stars'
                        control={control}
                        rules={{ required: { value: true, message: 'Rating is required' } }}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                          <Tooltip title='A rating associated with the claim' placement={tooltipPlacement} arrow>
                            <FormControl
                              sx={{
                                ml: 1,
                                mr: 1,
                                width: '100%',
                                '& .MuiInputBase-root': {
                                  borderBottom: `1px solid ${theme.palette.texts}`,
                                  overflow: 'hidden'
                                },
                                '& .MuiFormControl-root': {
                                  boxSizing: 'border-box'
                                }
                              }}
                              fullWidth
                              error={!!error}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  mb: 1,
                                  overflow: 'hidden'
                                }}
                              >
                                <Typography sx={{ color: theme.palette.texts }}>Review Rating *</Typography>
                                <Rating
                                  name='stars'
                                  value={value}
                                  onChange={(e, newValue) => onChange(newValue)}
                                  precision={1}
                                  sx={{
                                    color: theme.palette.stars,
                                    '& .MuiRating-icon': { color: theme.palette.stars },
                                    fontSize: '1.5rem',
                                    lineHeight: '1.2'
                                  }}
                                  size='large'
                                />
                              </Box>
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
                    <Tooltip title='What entity is the subject related to?' placement={tooltipPlacement} arrow>
                      <TextField
                        {...register('object')}
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
        <DialogActions
          sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'flex-end', width: '100%', columnGap: 3 }}
        >
          <Button
            onClick={onSubmit}
            variant='contained'
            size='medium'
            sx={{
              width: isMobile ? '50%' : '20%',
              color: theme.palette.buttontext,
              bgcolor: theme.palette.buttons,
              borderRadius: '80px',
              m: 'auto',
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
    </MainContainer>
  )
}
