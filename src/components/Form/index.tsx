import React, { useEffect } from 'react'
import Box from '@mui/material/Box'
import { useNavigate } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import {
  TextField,
  Button,
  FormControl,
  MenuItem,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  FormHelperText
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import IHomeProps from '../../containers/Form/types'
import styles from '../../containers/Form/styles'
import { Controller, useForm } from 'react-hook-form'
import { useCreateClaim } from '../../hooks/useCreateClaim'
import Tooltip from '@mui/material/Tooltip'
const tooltips = {
  claim: [
    'Indicates a claim about rating or evaluating a subject based on based on specific criteria or aspects',
    'Represents a claim that asserts the subject is identical or equivalent to another entity or object',
    'Refers to a claim stating that the subject has carried out or performed a specific action or task ',
    ' Denotes a claim indicating that the subject provided assistance, aid, or support to another entity or individual',
    '  Represents a claim asserting that the subject caused harm, damage, or negative consequences to another entity or individual',
    ' Indicates a claim suggesting that the subject is involved in fraudulent or deceptive activities.',
    'Represents a claim asserting ownership or possession of the subject by an individual, organization, or entity',
    'Represents a claim asserting ownership or possession of the subject by an individual, organization, or entity'
  ],
  aspect: [
    ' Refers to the social impact or influence of the subject.',
    'Relates to the impact on climate or environmental factors.',
    ' Relates to the impact on work or employment-related aspects',
    ' Relates to the impact on financial aspects or economic factors.',
    'Relates to the impact on education or learning.',
    'Relates to the technical quality or performance.',
    ' Relates to the aesthetic or visual quality.',
    ' Relates to the taste or flavor quality.',
    'Relates to the journalistic quality or integrity.',
    'Relates to the academic or educational quality.',
    'Relates to the fun or entertainment value.',
    'Relates to the usefulness or practical value.',
    ' Relates to the literary quality or artistic value.',
    ' Relates to the relevance or significance.',
    ' Relates to self-improvement or personal development.',
    ' Relates to historical significance or relevance.',
    ' Relates to theological or religious aspects.',
    ' Relates to adventure or excitement',
    ' Relates to biographical or personal aspects.',
    ' Relates to scientific accuracy or validity.',
    ' Relates to the risk of safety or security concerns.',
    ' Relates to the risk of reliability or trustworthiness.',
    ' Indicates a relationship where the subject works for another entity.',
    'Indicates a relationship where the subject is the same as another entity.'
  ],
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
      stars: null as number | null
    }
  })

  const { createClaim } = useCreateClaim()
  const navigate = useNavigate()

  const onSubmit = handleSubmit(
    async ({ subject, claim, object, statement, aspect, howKnown, sourceURI, effectiveDate, confidence, stars }) => {
      if (subject && claim) {
        const effectiveDateAsString = effectiveDate.toISOString()
        const confidenceAsNumber = Number(confidence)
        const starsAsNumber = Number(stars)

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
          stars: starsAsNumber
        }

        setLoading(true)

        const { message, isSuccess } = await createClaim(payload)

        setLoading(false)
        toggleSnackbar(true)
        setSnackbarMessage(message)
        if (isSuccess) {
          navigate('search')
          reset()
        }
      } else {
        setLoading(false)
        toggleSnackbar(true)
        setSnackbarMessage('Subject and Claims are required fields.')
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

  const inputOptions = {
    claim:
      selectedClaim?.entType === 'CLAIM'
        ? ['agree', 'disagree']
        : ['rated', 'same_as', 'performed', 'helped', 'harmed', 'scam', 'owns', 'related_to'],
    aspect: [
      'impact:social',
      'impact:climate',
      'impact:work',
      'impact:financial',
      'impact:educational',
      'quality:technical',
      'quality:asthetic',
      'quality:taste',
      'quality:journalistic',
      'quality:academic',
      'quality:fun',
      'quality:usefulness',
      'quality:literary',
      'quality:relevance',
      'quality:self-improvment',
      'quality:historical',
      'quality:theological',
      'quality:adventure',
      'quality:biographical',
      'quality:scientific',
      'risk:scam',
      'risk:justice',
      'risk:safety',
      'risk:reliability',
      'relationship:works-for',
      'relationship:same-as'
    ],
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
    <>
      <DialogTitle>
        <Typography
          variant='h4'
          sx={{
            mb: 3,
            textAlign: 'center',
            fontSize: '20px',
            color: 'primary.main',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}
        >
          {selectedClaim
            ? selectedClaim?.entType === 'CLAIM'
              ? 'do you want to validate ?'
              : 'what do you have to say about'
            : 'Enter a Claim'}
        </Typography>
        {selectedClaim?.name && selectedClaim?.entType !== 'CLAIM' && <Typography>{selectedClaim.name}</Typography>}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <Box sx={styles.inputFieldWrap}>
            <Tooltip
              title='You should put your site or social media '
              placement='right'
              arrow
              sx={{ backgroundColor: '#009688' }}
            >
              <TextField
                {...register('subject', { required: { value: true, message: 'subject is required' } })}
                sx={{ ml: 1, mr: 1, width: '22ch' }}
                margin='dense'
                variant='outlined'
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
                sx={{ ml: 1, mr: 1, width: '22ch' }}
                margin='dense'
                variant='outlined'
                fullWidth
                error={Boolean(errors.claim)}
                helperText={errors.claim?.message}
              >
                {inputOptions.claim.map((claimText: string, index: number) => (
                  <MenuItem value={claimText} key={claimText}>
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
                sx={{ ml: 1, mr: 1, width: '22ch' }}
                margin='dense'
                variant='outlined'
                fullWidth
              >
                {inputOptions.howKnown.map((howKnownText: string, index: number) => (
                  <MenuItem value={howKnownText}>
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
                sx={{ ml: 1, mr: 1, width: '22ch' }}
                margin='dense'
                variant='outlined'
                fullWidth
                label='Statement'
                key='statement'
                type='text'
                multiline={true}
                maxRows={4}
              />
            </Tooltip>
            <Tooltip title='You should put the another site you made claim for' placement='right' arrow>
              <TextField
                {...register('sourceURI')}
                sx={{ ml: 1, mr: 1, width: '22ch' }}
                margin='dense'
                variant='outlined'
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
                sx={{ ml: 1, mr: 1, width: '22ch' }}
                margin='dense'
                variant='outlined'
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
            {!(selectedClaim?.entType === 'CLAIM') && (
              <>
                {watchClaim === 'rated' ? (
                  <>
                    <Tooltip title='A specific dimension being evaluated or rated' placement='right' arrow>
                      <TextField
                        select
                        label='Aspect'
                        {...register('aspect')}
                        sx={{ ml: 1, mr: 1, width: '22ch' }}
                        margin='dense'
                        variant='outlined'
                        fullWidth
                      >
                        {inputOptions.aspect.map((aspectText: string, index: number) => (
                          <MenuItem value={aspectText} key={aspectText}>
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
                            <Typography>Review Rating</Typography>
                            <Rating
                              name='stars'
                              value={value}
                              onChange={(e, newValue) => onChange(newValue)}
                              precision={1}
                              size='large'
                            />

                            <FormHelperText>{error?.message}</FormHelperText>
                          </FormControl>
                        </Tooltip>
                      )}
                    />
                  </>
                ) : (
                  <Tooltip title='If you want to add any additional site belongs to you' placement='right' arrow>
                    <TextField
                      {...register('object')}
                      sx={{ ml: 1, mr: 1, width: '22ch' }}
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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label='Effective Date'
                value={watchEffectiveDate}
                onChange={(newValue: any) => setValue('effectiveDate', newValue)}
                renderInput={(params: any) => (
                  <TextField {...params} sx={{ ml: 1, mr: 1, width: '100%' }} variant='filled' />
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
            bgcolor: 'praimary.main',
            margin: '0 auto',
            '&:hover': {
              backgroundColor: '#00695f'
            }
          }}
        >
          Submit
        </Button>
        {!!onCancel && <Button onClick={onCancel}>Cancel</Button>}
      </DialogActions>
    </>
  )
}
