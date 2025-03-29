import React, { useState } from 'react'
import {
  Box,
  Typography,
  styled,
  Card,
  CardContent,
  Theme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Link as MuiLink
} from '@mui/material'
import badge from '../assets/images/badge.svg'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import html2pdf from 'html2pdf.js'

const CertificateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  backgroundColor: '#FFFFFF',
  borderRadius: '20px',
  boxShadow: '0px 2px 14px rgba(0, 0, 0, 0.25)',
  position: 'relative'
}))

const CertificateTitle = styled(Typography)(({ theme }) => ({
  fontSize: '36px',
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  textAlign: 'center',
  color: '#2D6A4F'
}))

const CertificateSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  color: '#666',
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '2px'
}))

const RecipientName = styled(Typography)(({ theme }) => ({
  fontSize: '32px',
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 500,
  marginBottom: theme.spacing(3),
  textAlign: 'center',
  color: '#2D6A4F'
}))

const SkillTitle = styled(Typography)(({ theme }) => ({
  fontSize: '20px',
  fontWeight: 500,
  marginBottom: theme.spacing(3),
  textAlign: 'center',
  color: '#333'
}))

const Description = styled(Typography)(({ theme }) => ({
  fontSize: '16px',
  color: '#666',
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  maxWidth: '600px',
  lineHeight: '1.6'
}))

const EndorsementSection = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1036px',
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
  backgroundColor: 'transparent',
  position: 'relative'
}))

const EndorsementTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  width: '133px',
  height: '26px',
  margin: '0 auto',
  color: '#212529',
  fontFamily: 'Roboto, var(--default-font-family)',
  fontSize: '22px',
  fontWeight: 600,
  lineHeight: '25.781px',
  textAlign: 'center',
  whiteSpace: 'nowrap'
}))

const EndorsementGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  width: '100%',
  gap: '20px',
  margin: '30px auto'
}))

const EndorsementCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  width: '284px',
  height: '168px',
  backgroundColor: '#FFFFFF',
  boxShadow: '0px 2px 14px rgba(0, 0, 0, 0.25)',
  borderRadius: '8px',
  padding: '20px',
  border: '1px solid #dee2e6',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
  }
}))

const EndorsementAuthor = styled(Typography)(({ theme }) => ({
  position: 'relative',
  width: '160px',
  height: '23px',
  color: '#2D6A4F',
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '20px',
  lineHeight: '23px',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '10px'
}))

const EndorsementStatement = styled(Typography)(({ theme }) => ({
  position: 'relative',
  width: '196px',
  height: '60px',
  color: '#212529',
  fontFamily: 'Montserrat',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '16px',
  lineHeight: '20px',
  display: 'flex',
  alignItems: 'center',
  marginBottom: '10px'
}))

const SeeAllLink = styled('button')(({ theme }) => ({
  position: 'relative',
  width: '45px',
  height: '17px',
  color: '#2D6A4F',
  fontFamily: 'Montserrat',
  fontStyle: 'normal',
  fontWeight: 500,
  fontSize: '14px',
  lineHeight: '17px',
  display: 'flex',
  alignItems: 'center',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  textDecoration: 'underline',
  '&:hover': {
    color: '#1b4332'
  }
}))

const ValidationDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: '#2D6A4F',
  fontSize: '24px',
  fontWeight: 600,
  textAlign: 'center',
  padding: theme.spacing(3)
}))

const ValidationDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(3)
}))

const ValidationDialogCard = styled(Card)(({ theme }) => ({
  width: '100%',
  height: '168px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 2px 14px 0 rgba(0, 0, 0, 0.25)',
  padding: '20px',
  position: 'relative'
}))

const ValidationDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    borderRadius: '12px',
    backgroundColor: theme.palette.background.paper,
    overflowY: 'auto'
  }
}))

const ValidationDetailsDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    borderRadius: '12px',
    backgroundColor: theme.palette.background.paper,
    overflowY: 'auto'
  }
}))

const ValidationDetailsContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  '& .validation-header': {
    marginBottom: theme.spacing(3)
  },
  '& .validation-subject': {
    fontSize: '20px',
    fontWeight: 500,
    color: '#2D6A4F',
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '& a': {
      textDecoration: 'none',
      color: 'inherit',
      '&:hover': {
        textDecoration: 'underline'
      }
    }
  },
  '& .validation-author': {
    fontSize: '24px',
    fontWeight: 500,
    color: '#2D6A4F',
    marginBottom: theme.spacing(2)
  },
  '& .validation-statement': {
    fontSize: '16px',
    color: '#212529',
    marginBottom: theme.spacing(2),
    lineHeight: 1.6
  },
  '& .validation-date': {
    fontSize: '14px',
    color: '#495057',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  '& .validation-details': {
    marginTop: theme.spacing(3),
    '& .detail-item': {
      marginBottom: theme.spacing(2),
      '& .detail-label': {
        fontWeight: 500,
        color: '#495057',
        minWidth: '150px',
        display: 'inline-block'
      },
      '& .detail-value': {
        color: '#212529'
      }
    }
  }
}))

interface CertificateProps {
  curator: string
  subject: string
  statement?: string
  validations?: Array<{
    author: string
    statement: string
    subject?: string
    effectiveDate?: string
    howKnown?: string
    sourceURI?: string
    confidence?: number
  }>
  onExport?: (format: 'json' | 'pdf') => void
}

const Certificate = ({ curator, subject, statement, validations, onExport }: CertificateProps) => {
  const [validationDialogOpen, setValidationDialogOpen] = useState(false)
  const [claimDialogOpen, setClaimDialogOpen] = useState(false)
  const [selectedValidation, setSelectedValidation] = useState<any>(null)

  const handleValidationDialogOpen = () => {
    setValidationDialogOpen(true)
  }

  const handleValidationDialogClose = () => {
    setValidationDialogOpen(false)
  }

  const handleClaimClick = (validation: any) => {
    setSelectedValidation(validation)
    setClaimDialogOpen(true)
  }

  const handleClaimDialogClose = () => {
    setClaimDialogOpen(false)
    setSelectedValidation(null)
  }

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return `${text.substring(0, length)}...`
  }

  return (
    <Card
      sx={{
        minHeight: '200px',
        width: '100%',
        borderRadius: '20px',
        backgroundColor: '#FFFFFF',
        backgroundImage: 'none',
        color: '#212529',
        marginBottom: '2rem',
        position: 'relative'
      }}
    >
      <CardContent>
        <Stack spacing={3}>
          <CertificateContainer id='certificate-container'>
            <Box
              component='img'
              src={badge}
              alt='Certificate Badge'
              sx={{
                width: '150px',
                height: '150px',
                display: 'block',
                margin: '0 auto',
                marginBottom: '30px',
                filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            />

            <CertificateTitle>Certificate</CertificateTitle>
            <CertificateSubtitle>OF SKILL VALIDATION</CertificateSubtitle>

            <RecipientName>{curator}</RecipientName>
            <SkillTitle>{subject || 'Claim Subject'}</SkillTitle>

            <Description>
              {statement || 'This certificate validates the skills and expertise demonstrated by the recipient.'}
            </Description>

            {validations && validations.length > 0 && (
              <EndorsementSection id='validation-section'>
                <EndorsementTitle>Endorsed by:</EndorsementTitle>
                <EndorsementGrid>
                  {validations.slice(0, 2).map((validation, index) => (
                    <EndorsementCard
                      key={index}
                      id={`validation-${index}`}
                      onClick={() => handleClaimClick(validation)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <EndorsementAuthor>{validation.author}</EndorsementAuthor>
                      <EndorsementStatement>{truncateText(validation.statement || '', 50)}</EndorsementStatement>
                      <SeeAllLink
                        onClick={e => {
                          e.stopPropagation()
                          handleClaimClick(validation)
                        }}
                      >
                        see all
                      </SeeAllLink>
                    </EndorsementCard>
                  ))}
                </EndorsementGrid>
                {validations.length > 2 && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mt: 2
                    }}
                  >
                    <Button
                      onClick={handleValidationDialogOpen}
                      sx={{
                        color: '#2D6A4F',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(45, 106, 79, 0.04)'
                        }
                      }}
                    >
                      See more validations ({validations.length - 2} more)
                    </Button>
                  </Box>
                )}
              </EndorsementSection>
            )}
          </CertificateContainer>

          {/* Validation Dialog */}
          <ValidationDialog open={validationDialogOpen} onClose={handleValidationDialogClose} maxWidth='md' fullWidth>
            <ValidationDialogTitle>All Validations</ValidationDialogTitle>
            <ValidationDialogContent>
              {validations?.map((validation, index) => (
                <ValidationDialogCard
                  key={index}
                  onClick={() => handleClaimClick(validation)}
                  sx={{ cursor: 'pointer' }}
                >
                  <EndorsementAuthor>{validation.author}</EndorsementAuthor>
                  <EndorsementStatement>{validation.statement || ''}</EndorsementStatement>
                  <SeeAllLink
                    onClick={e => {
                      e.stopPropagation()
                      handleClaimClick(validation)
                    }}
                  >
                    see all
                  </SeeAllLink>
                </ValidationDialogCard>
              ))}
            </ValidationDialogContent>
            <DialogActions sx={{ padding: '16px 24px' }}>
              <Button
                onClick={handleValidationDialogClose}
                sx={{
                  color: '#2D6A4F',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(45, 106, 79, 0.04)'
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </ValidationDialog>

          {/* Validation Details Dialog */}
          <ValidationDetailsDialog open={claimDialogOpen} onClose={handleClaimDialogClose} maxWidth={false}>
            <DialogContent sx={{ p: 0, position: 'relative' }}>
              <IconButton
                onClick={handleClaimDialogClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: '#212529',
                  zIndex: 1
                }}
              >
                <CloseIcon />
              </IconButton>
              {selectedValidation && (
                <ValidationDetailsContent>
                  <div className='validation-header'>
                    {selectedValidation.subject && (
                      <div className='validation-subject'>
                        <MuiLink
                          href={selectedValidation.subject}
                          target='_blank'
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {selectedValidation.subject}
                          <OpenInNewIcon sx={{ fontSize: 20 }} />
                        </MuiLink>
                      </div>
                    )}
                    <Typography className='validation-author'>{selectedValidation.author}</Typography>
                    <Typography className='validation-statement'>{selectedValidation.statement}</Typography>
                    <Typography className='validation-date'>
                      {selectedValidation.effectiveDate &&
                        new Date(selectedValidation.effectiveDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                    </Typography>
                  </div>
                  <div className='validation-details'>
                    {selectedValidation.howKnown && (
                      <div className='detail-item'>
                        <span className='detail-label'>How Known:</span>
                        <span className='detail-value'>{selectedValidation.howKnown.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    {selectedValidation.sourceURI && (
                      <div className='detail-item'>
                        <span className='detail-label'>Source:</span>
                        <span className='detail-value'>
                          <MuiLink
                            href={selectedValidation.sourceURI}
                            target='_blank'
                            sx={{ color: '#2D6A4F', textDecoration: 'none' }}
                          >
                            {selectedValidation.sourceURI}
                          </MuiLink>
                        </span>
                      </div>
                    )}
                    {selectedValidation.confidence !== undefined && (
                      <div className='detail-item'>
                        <span className='detail-label'>Confidence:</span>
                        <span className='detail-value'>{selectedValidation.confidence}</span>
                      </div>
                    )}
                  </div>
                </ValidationDetailsContent>
              )}
            </DialogContent>
          </ValidationDetailsDialog>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default Certificate
