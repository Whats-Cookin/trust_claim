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
  Tooltip
} from '@mui/material'
import IHomeProps from '../../containers/Form/types'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import { composeClient } from '../../composedb'
import { PromiseTimeoutError, timeoutPromise } from '../../utils/promise.utils'
import ImageUploader from './imageUploading'
import MainContainer from '../MainContainer'
import { checkAuth } from '../../utils/authUtils'
import SignInAlert from './SignInAlert'
import CircleIcon from '@mui/icons-material/Circle'

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
      claim: '',
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
  const did = localStorage.getItem('did')

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const tooltipPlacement = isMobile ? 'top' : 'left'

  // State to manage visibility of additional info section
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false); // State to manage visibility

  const toggleAdditionalInfo = () => {
    setShowAdditionalInfo((prev) => !prev); // Toggle the state
  };

  // Fetch initial data when the component mounts
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

  // Handle form submission
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
          issuerId: did,
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
      'quality:self-improvement',
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

  let titleText = 'Create claim'

  const displayHowKnownText = {
    first_hand: 'First Hand',
    second_hand: 'Second Hand',
    website: 'Website',
    physical_document: 'Physical Document'
  }

  const displayClaimText = {
    related_to: 'Related To',
    impact: 'Impact',
    rated: 'Rated',
    report: 'Report'
  }

  if (selectedClaim) {
    titleText = selectedClaim.entType === 'CLAIM' ? 'Do you want to validate?' : 'What do you have to say about'
  }

  return (
    <MainContainer
      flexRowOnDesktop={true}
      sx={{
        background: isMobile ? theme.palette.cardBackground : theme.palette.menuBackground,
        display: 'flex',
        flexDirection: 'column',
        width: isMobile ? '100%' : '95%',

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
        <DialogTitle sx={{ p: isMobile ? 1 : 2 }}>
          <Typography
            variant='h4'
            sx={{
              fontSize: isMobile ? '20px' : '14px',
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
                width: isMobile ? '64px' : '100px'
              }}
            />
          </Typography>
          {selectedClaim?.name && selectedClaim?.entType !== 'CLAIM' && <Typography>{selectedClaim.name}</Typography>}
        </DialogTitle>
      </Box>

      <Box
        sx={{
          backgroundColor: theme.palette.cardBackground,
          borderBottom: `0 0 30px ${theme.palette.shadows}`,
          borderRadius: '20px',
          width: isMobile ? '358px' : '800px',
          margin: isMobile ? 0 : '0 auto',
          padding: isMobile ? 0 : '20px',

        }}
      >

        <form onSubmit={onSubmit}>
          <ImageUploader fieldArray={imageFieldArray} control={control} register={register} />
          {/* Basic Information Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', pb: 3 }}>
              <CircleIcon sx={{ width: isMobile ? '7px' : '10px', height: isMobile ? '8px' : '10px', mr: 1 }} />
              <Typography sx={{ fontSize: isMobile ? '12px' : '18px', fontWeight: 500 }}>Basic information</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '760px', pt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '30px' }}>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: 'Montserrat',
                      fontSize: isMobile ? '10px' : '16px',
                      fontWeight: 500,
                      lineHeight: isMobile ? '12.19px' : '19.5px',
                      ml: 1.5,
                      mb: 1
                    }}
                  >
                    Subject name
                  </Typography>
                  <Tooltip title='The person or entity involved in the claim' placement={tooltipPlacement} arrow>
                    <TextField
                      {...register('name', { required: { value: true, message: 'Name is required' } })}
                      sx={{
                        ml: 1,
                        mr: 1,
                        width: isMobile ? '326px' : '350px',
                        '& .MuiInputBase-input': {
                          backgroundColor: theme.palette.input,
                          height: isMobile ? '34px' : '44px',
                          padding: '0 12px',
                          border: 'none',
                          borderRadius: '6px'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: 'none'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                          outline: 'none'
                        }
                      }}
                      margin='dense'
                      variant='outlined'
                      fullWidth
                      disabled={Boolean(selectedClaim?.nodeUri)}
                      type='text'
                      error={Boolean(errors.name)}
                      helperText={errors.name ? errors.name.message : ''}
                    />
                  </Tooltip>
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: 'Montserrat',
                      fontSize: isMobile ? '10px' : '16px',
                      fontWeight: 500,
                      lineHeight: isMobile ? '12.19px' : '19.5px',
                      ml: 1.5,
                      mb: 1
                    }}
                  >
                    Claim
                  </Typography>
                  <Tooltip title='For evaluation being made' placement={tooltipPlacement} arrow>
                    <TextField
                      {...register('claim', { required: { value: true, message: 'claim is required' } })}
                      sx={{
                        ml: 1,
                        mr: 1,
                        width: isMobile ? '326px' : '350px',
                        '& .MuiInputBase-input': {
                          backgroundColor: theme.palette.input,
                          height: isMobile ? '34px' : '44px',
                          padding: '0 12px',
                          border: 'none',
                          borderRadius: '6px'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: 'none'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                          outline: 'none'
                        }
                      }}
                      margin='dense'
                      variant='outlined'
                      fullWidth
                      disabled={Boolean(selectedClaim?.nodeUri)}
                      type='text'
                      error={Boolean(errors.claim)}
                      helperText={errors.claim ? errors.claim.message : ''}
                    />
                  </Tooltip>
                </Box>
              </Box>
              <Box sx={{ pt: 4 }}>
                <Typography
                  sx={{
                    fontFamily: 'Montserrat',
                    fontSize: isMobile ? '10px' : '16px',
                    fontWeight: 500,
                    lineHeight: isMobile ? '12.19px' : '19.5px',
                    ml: 1.5,
                    mb: 1
                  }}
                >
                  Subject URL
                </Typography>
                <Tooltip title='The web link where the claim was created' placement={tooltipPlacement} arrow>
                  <TextField
                    {...register('subject', { required: { value: true, message: 'subject is required' } })}
                    sx={{
                      ml: 1,
                      mr: 1,
                      width: isMobile ? '326px' : '750px',
                      '& .MuiInputBase-input': {
                        backgroundColor: theme.palette.input,
                        height: isMobile ? '34px' : '44px',
                        padding: '0 12px',
                        border: 'none',
                        borderRadius: '6px'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                        outline: 'none'
                      }
                    }}
                    margin='dense'
                    variant='outlined'
                    fullWidth
                    disabled={Boolean(selectedClaim?.nodeUri)}
                    type='text'
                    error={Boolean(errors.subject)}
                    helperText={errors.subject ? errors.subject.message : ''}
                  />
                </Tooltip>
              </Box>
              <Box sx={{ pt: 4 }}>
                <Typography
                  sx={{
                    fontFamily: 'Montserrat',
                    fontSize: isMobile ? '10px' : '16px',
                    fontWeight: 500,
                    lineHeight: isMobile ? '12.19px' : '19.5px',
                    ml: 1.5,

                  }}
                >
                  Statement
                </Typography>
                <Tooltip title='Additional details or context about the claim' placement={tooltipPlacement} arrow>
                  <TextField
                    {...register('statement', { required: { value: true, message: 'statement is required' } })}
                    sx={{
                      ml: 1,
                      mr: 1,
                      mb: isMobile ? 1 : 2,
                      width: isMobile ? '326px' : '750px',
                      '& .MuiInputBase-input': {
                        backgroundColor: theme.palette.input,
                        height: isMobile ? '63px' : '115px',
                        padding: '0 12px',
                        border: 'none',
                        borderRadius: '6px'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        border: 'none'
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                        outline: 'none'
                      }
                    }}
                    margin='dense'
                    variant='outlined'
                    fullWidth
                    disabled={Boolean(selectedClaim?.nodeUri)}
                    type='text'
                    error={Boolean(errors.statement)}
                    helperText={errors.statement ? errors.statement.message : ''}
                  />
                </Tooltip>
              </Box>
            </Box>
            {!showAdditionalInfo && (
              <DialogActions
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',

                  columnGap: 3,

                }}
              >
                <Button
                  onClick={toggleAdditionalInfo}
                  variant='contained'
                  size='large'
                  sx={{
                    width: isMobile ? '35%' : 'auto',
                    hight: isMobile ? '10px' : '40px',
                    color: theme.palette.buttontext,
                    bgcolor: theme.palette.buttons,
                    borderRadius: '6px',
                    '&:hover': {
                      backgroundColor: theme.palette.buttonHover
                    }
                  }}
                >
                  <Typography

                    sx={{
                      fontSize: isMobile ? '8px' : '14px',
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 400,
                      lineHeight: isMobile ? '9.75px' : '17.07px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',

                    }}
                  >
                    {showAdditionalInfo ? ' Additional Information' : 'Additional Information'}
                  </Typography>
                </Button>
              </DialogActions>
            )}
          </Box>

          {/* Additional Information Section */}
          {showAdditionalInfo && (
            <Box sx={{ display: 'flex', flexDirection: 'column', pb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', pb: 3, pt: 3 }}>
                <CircleIcon sx={{ width: isMobile ? '7px' : '10px', height: isMobile ? '8px' : '10px', mr: 1 }} />
                <Typography sx={{ fontSize: isMobile ? '12px' : '18px', fontWeight: 500 }}>Additional information</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '760px', pt: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '30px' }}>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: 'Montserrat',
                        fontSize: isMobile ? '10px' : '16px',
                        fontWeight: 500,
                        lineHeight: isMobile ? '12.19px' : '19.5px',
                        ml: 1.5,
                        mb: 1
                      }}
                    >
                      How Known
                    </Typography>
                    <Tooltip title='The method or source of the claim' placement={tooltipPlacement} arrow>
                      <TextField
                        select
                        {...register('howKnown')}
                        sx={{
                          ml: 1,
                          mr: 1,
                          width: isMobile ? '326px' : '350px',
                          '& .MuiInputBase-input': {
                            backgroundColor: theme.palette.input,
                            padding: '10px 12px',
                            border: 'none',
                            borderRadius: '6px'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: 'none'
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                            outline: 'none'
                          }
                        }}
                        margin='dense'
                        variant='outlined'
                        fullWidth
                      >
                        {inputOptions.howKnown.map((howKnownText: string, index: number) => (
                          <MenuItem
                            sx={{
                              height: '44px',
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
                                {displayHowKnownText[howKnownText as keyof typeof displayHowKnownText] ||
                                  howKnownText}{' '}
                              </Box>
                            </Tooltip>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Tooltip>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: 'Montserrat',
                        fontSize: isMobile ? '10px' : '16px',
                        fontWeight: 500,
                        lineHeight: isMobile ? '12.19px' : '19.5px',
                        ml: 1.5,
                        mb: 1
                      }}
                    >
                      Confidence
                    </Typography>
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
                          width: isMobile ? '326px' : '350px',
                          '& .MuiInputBase-input': {
                            backgroundColor: theme.palette.input,
                            height: isMobile ? '34px' : '44px',
                            padding: '0 12px',
                            border: 'none',
                            borderRadius: '6px'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: 'none'
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                            outline: 'none'
                          }
                        }}
                        margin='dense'
                        variant='outlined'
                        fullWidth
                      />
                    </Tooltip>
                  </Box>
                </Box>
                <Box sx={{ pt: 4 }}>
                  <Typography
                    sx={{
                      fontFamily: 'Montserrat',
                      fontSize: isMobile ? '10px' : '16px',
                      fontWeight: 500,
                      lineHeight: isMobile ? '12.19px' : '19.5px',
                      ml: 1.5,
                      mb: 1
                    }}
                  >
                    Source URL
                  </Typography>
                  <Tooltip title='You should put your site here' placement={tooltipPlacement} arrow>
                    <TextField
                      {...register('sourceURI', { required: { value: true, message: 'sourceURI is required' } })}
                      sx={{
                        ml: 1,
                        mr: 1,
                        width: isMobile ? '326px' : '750px',
                        '& .MuiInputBase-input': {
                          backgroundColor: theme.palette.input,
                          height: isMobile ? '34px' : '44px',
                          padding: '0 12px',
                          border: 'none',
                          borderRadius: '6px'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          border: 'none'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none',
                          outline: 'none'
                        }
                      }}
                      margin='dense'
                      variant='outlined'
                      fullWidth
                      disabled={Boolean(selectedClaim?.nodeUri)}
                      type='text'
                      error={Boolean(errors.sourceURI)}
                      helperText={errors.sourceURI ? errors.sourceURI.message : ''}
                    />
                  </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '30px', pt: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: 'Montserrat',
                          fontSize: isMobile ? '10px' : '16px',
                          fontWeight: 500,
                          lineHeight: isMobile ? '12.19px' : '19.5px',
                          ml: 1.5,
                          mb: 1
                        }}
                      >
                        Aspect
                      </Typography>
                      <Tooltip
                        title='A specific dimension being evaluated or rated'
                        placement={tooltipPlacement}
                        arrow
                      >
                        <TextField
                          {...register('aspect')}
                          sx={{
                            ml: 1,
                            mr: 1,
                            width: isMobile ? '326px' : '350px',
                            '& .MuiInputBase-input': {
                              backgroundColor: theme.palette.input,
                              height: isMobile ? '34px' : '44px',
                              padding: '0 12px',
                              border: 'none',
                              borderRadius: '6px'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              border: 'none'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                              outline: 'none'
                            }
                          }}
                          margin='dense'
                          variant='outlined'
                          fullWidth
                        />
                      </Tooltip>
                    </Box>
                    <Box>
                      {/*  Rating*/}
                      {selectedClaim?.entType !== 'CLAIM' && (
                        <>
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
                                    mt: 1,
                                    width: isMobile ? '326px' : '350px',
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
                                    <Typography sx={{ color: theme.palette.texts }}>Review Rating</Typography>
                                    <Rating
                                      name='stars'
                                      value={value}
                                      onChange={(_e, newValue) => onChange(newValue)}
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
                    </Box>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: 'Montserrat',
                        fontSize: isMobile ? '10px' : '16px',
                        fontWeight: 500,
                        lineHeight: isMobile ? '12.19px' : '19.5px',
                        ml: 1.5,
                        mb: 1
                      }}
                    >
                      Effective Date
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={watchEffectiveDate}
                        onChange={(newValue: any) => setValue('effectiveDate', newValue)}
                        renderInput={(params: any) => (
                          <TextField
                            {...params}
                            sx={{
                              ml: 1,
                              mr: 1,
                              width: isMobile ? '326px' : '350px',
                              '& .MuiInputBase-input': {
                                backgroundColor: theme.palette.input,
                                height: isMobile ? '34px' : '44px',
                                padding: '0 12px',
                                border: 'none',
                                borderRadius: '6px'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                border: 'none'
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                                outline: 'none'
                              }
                            }}
                            margin='dense'
                            variant='outlined'
                            fullWidth
                          />
                        )}
                      />
                    </LocalizationProvider>
                  </Box>
                </Box>
              </Box>
              <DialogActions
                sx={{
                  display: 'flex',
                  justifyContent: isMobile ? 'center' : 'flex-end',
                  width: '100%',
                  columnGap: 3
                }}
              >
                <Button
                  onClick={onSubmit}
                  variant='contained'
                  size='medium'
                  sx={{
                    width: isMobile ? '100px' : '200px',
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
          )}
        </form>

      </Box>

    </MainContainer >
  )
}
