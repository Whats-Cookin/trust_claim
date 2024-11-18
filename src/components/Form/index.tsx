import {
  Box,
  Button,
  DialogActions,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  ListSubheader,
  MenuItem,
  Rating,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material'
import IHomeProps from '../../containers/Form/types'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { composeClient } from '../../composedb'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import { checkAuth } from '../../utils/authUtils'
import { PromiseTimeoutError, timeoutPromise } from '../../utils/promise.utils'
import MainContainer from '../MainContainer'
import ImageUploader from './imageUploading'
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
  const did = localStorage.getItem('did')

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const tooltipPlacement = isMobile ? 'top' : 'left'

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
        const validImages = images.filter(img => img.url && img.url.trim() !== '')
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
          images: validImages
        }

        setLoading(true)

        try {
          const { message, isSuccess } = await timeoutPromise(createClaim(payload), 10_000)

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
  type DisplayClaimText = {
    [key: string]: string
  }
  const displayClaimText: DisplayClaimText = {
    related_to: 'Related to',
    impact: 'Impact',
    rated: 'Rated',
    report: 'Report'
  }

  if (selectedClaim) {
    titleText = selectedClaim.entType === 'CLAIM' ? 'Do you want to validate?' : 'What do you have to say about'
  }
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)
  const toggleAdditionalInfo = () => {
    setShowAdditionalInfo(!showAdditionalInfo)
  }

  return (
    <MainContainer
      flexRowOnDesktop={true}
      sx={{
        background: isMobile ? theme.palette.cardBackground : theme.palette.menuBackground,
        display: 'flex',
        flexDirection: 'column',
        width: isMobile ? '100%' : '95%'
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
          padding: isMobile ? 0 : '20px'
        }}
      >
        <form onSubmit={onSubmit}>
          <ImageUploader fieldArray={imageFieldArray} control={control} register={register} />
          {/* Basic Information Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', pb: 3, paddingLeft: '12px' }}>
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
                          borderRadius: '6px',
                          fontSize: isMobile ? '12px' : '16px',
                          fontFamily: 'Montserrat'
                        },

                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none'
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
                      select
                      {...register('claim', { required: { value: true, message: 'claim is required' } })}
                      sx={{
                        ml: 1,
                        mr: 1,
                        width: isMobile ? '326px' : '350px',
                        height: isMobile ? '34px' : '45px',
                        '& .MuiInputBase-input': {
                          color: theme.palette.texts,
                          backgroundColor: theme.palette.input,
                          border: 'none',
                          borderRadius: '6px',
                          p: '6px 12px',
                          fontSize: isMobile ? '12px' : '16px',
                          fontFamily: 'Montserrat'
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
                      error={Boolean(errors.claim)}
                      helperText={errors.claim?.message}
                    >
                      {inputOptions.claim.map((claimText: string, index: number) => (
                        <MenuItem
                          sx={{
                            backgroundColor: theme.palette.menuBackground,
                            color: theme.palette.texts,
                            fontSize: isMobile ? '10px' : '16px',

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
                        borderRadius: '6px',
                        fontSize: isMobile ? '12px' : '16px',
                        fontFamily: 'Montserrat'
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
                    ml: 1.5
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
                        borderRadius: '6px',

                        fontSize: isMobile ? '12px' : '16px',
                        fontFamily: 'Montserrat'
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

                  columnGap: 3
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
                    left: isMobile ? '-5%' : 0,
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
                      textTransform: 'none'
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
              <Box
                sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', pb: 3, pt: 3, paddingLeft: '12px' }}
              >
                <CircleIcon sx={{ width: isMobile ? '7px' : '10px', height: isMobile ? '8px' : '10px', mr: 1 }} />
                <Typography sx={{ fontSize: isMobile ? '12px' : '18px', fontWeight: 500 }}>
                  Additional information
                </Typography>
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
                          height: isMobile ? '34px' : '45px',
                          '& .MuiInputBase-input': {
                            color: theme.palette.texts,
                            backgroundColor: theme.palette.input,
                            border: 'none',
                            borderRadius: '6px',
                            p: '6px 12px',
                            fontSize: isMobile ? '12px' : '16px',
                            fontFamily: 'Montserrat'
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
                              fontSize: 16,
                              '&:hover': {
                                backgroundColor: theme.palette.input
                              },
                              '&.Mui-selected': {
                                backgroundColor: theme.palette.input,
                                '&:hover': {
                                  backgroundColor: theme.palette.input
                                }
                              },
                              '& .MuiInputBase-input': {
                                color: theme.palette.texts,
                                fontWeight: '500',
                                fontSize: 16
                              },
                              '&:active': {
                                backgroundColor: theme.palette.input
                              },
                              '::selection': {
                                backgroundColor: theme.palette.input
                              },
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            value={howKnownMapping[howKnownText]}
                            key={howKnownText}
                          >
                            <Tooltip title={tooltips.howKnown[index]} placement={tooltipPlacement} arrow>
                              <Box sx={{ width: '100%', height: '100%' }}>
                                {displayHowKnownText[howKnownText as keyof typeof displayHowKnownText] || howKnownText}{' '}
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
                            borderRadius: '6px',
                            fontSize: isMobile ? '12px' : '16px',
                            fontFamily: 'Montserrat'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: 'none'
                          },
                          '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                            outline: 'none'
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
                        variant='outlined'
                        fullWidth
                        type='number'
                        key='confidence'
                        inputProps={{
                          min: 0.0,
                          max: 1.0,
                          step: 0.1
                        }}
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
                          borderRadius: '6px',
                          fontSize: isMobile ? '12px' : '16px',
                          fontFamily: 'Montserrat'
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
                  {selectedClaim?.entType !== 'CLAIM' && (
                    <>
                      {watchClaim === 'rated' && (
                        <>
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
                                select
                                {...register('aspect')}
                                sx={{
                                  ml: 1,
                                  mr: 1,
                                  width: isMobile ? '326px' : '350px',
                                  height: isMobile ? '34px' : '45px',
                                  '& .MuiInputBase-input': {
                                    color: theme.palette.texts,
                                    backgroundColor: theme.palette.input,
                                    border: 'none',
                                    borderRadius: '6px',
                                    p: '6px 12px',
                                    fontSize: isMobile ? '12px' : '16px',
                                    fontFamily: 'Montserrat'
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
                                        justifyContent: isMobile ? 'flex-start' : 'space-between',
                                        mb: 1,
                                        overflow: 'hidden',
                                        mt: 1
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          color: theme.palette.texts,
                                          fontFamily: 'Montserrat',
                                          fontSize: isMobile ? '10px' : '16px',
                                          fontWeight: 500,
                                          lineHeight: isMobile ? '12.19px' : '19.5px',
                                          mr: isMobile ? 5 : 0
                                        }}
                                      >
                                        Review Rating{' '}
                                      </Typography>
                                      <Rating
                                        name='stars'
                                        value={value}
                                        onChange={(e, newValue) => onChange(newValue)}
                                        precision={1}
                                        sx={{
                                          color: theme.palette.stars,
                                          '& .MuiRating-icon': { color: theme.palette.stars },
                                          fontSize: '1.3rem',
                                          lineHeight: '1.2'
                                        }}
                                        size='small'
                                      />
                                    </Box>
                                    <FormHelperText>{error?.message}</FormHelperText>
                                  </FormControl>
                                </Tooltip>
                              )}
                            />
                          </Box>
                        </>
                      )}
                      {watchClaim === 'impact' && (
                        <Box sx={{}}>
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
                            Value
                          </Typography>
                          <TextField
                            {...register('amt')}
                            fullWidth
                            variant='outlined'
                            sx={{
                              ml: 1,
                              mr: 1,
                              width: isMobile ? '326px' : '350px',
                              '& .MuiInputBase-root': {
                                backgroundColor: theme.palette.input,
                                height: isMobile ? '34px' : '44px',
                                padding: '0 12px',
                                borderRadius: '6px',
                                fontSize: isMobile ? '12px' : '16px',
                                fontFamily: 'Montserrat'
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none' // Removes border on the outline
                              }
                            }}
                            margin='dense'
                            InputProps={{
                              startAdornment: <InputAdornment position='start'>$</InputAdornment>
                            }}
                            error={Boolean(errors.amt)}
                            helperText={errors.amt?.message}
                          />
                        </Box>
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
                            variant='outlined'
                            fullWidth
                            label='Object'
                            key='object'
                            type='text'
                          />
                        </Tooltip>
                      )}
                    </>
                  )}
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
                                borderRadius: '6px',
                                fontSize: isMobile ? '12px' : '16px',
                                fontFamily: 'Montserrat'
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

              <DialogActions>
                <Button
                  onClick={onSubmit}
                  variant='contained'
                  sx={{
                    width: isMobile ? 'auto' : '180px',

                    color: theme.palette.buttontext,
                    bgcolor: theme.palette.buttons,
                    borderRadius: '24px',
                    m: 'auto',
                    textTransform: 'none',
                    fontSize: isMobile ? '16px' : '20px',
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
    </MainContainer>
  )
}
