import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link as MuiLink,
  Popover,
  Snackbar,
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material';
import badge from '../../assets/images/badge.svg';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShareIcon from '@mui/icons-material/Share';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

interface Validation {
  author: string;
  statement: string;
  date?: string;
  confidence?: number;
  howKnown?: string;
  sourceURI?: string;
  image?: string;
  mediaUrl?: string;
  subject?: string;
  effectiveDate?: string;
}

interface CertificateProps {
  curator: string;
  subject: string;
  statement?: string;
  effectiveDate?: string;
  sourceURI?: string;
  validations: Validation[];
  claimId?: string;
  image?: string;
}

const Certificate: React.FC<CertificateProps> = ({
  curator,
  subject,
  statement,
  effectiveDate,
  sourceURI,
  validations,
  claimId,
  image
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [selectedValidation, setSelectedValidation] = useState<Validation | null>(null);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleExport = () => {
    const element = document.getElementById('certificate-content');
    if (element) {
      const opt = {
        margin: 1,
        filename: `certificate${claimId ? `_${claimId}` : ''}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      html2pdf().set(opt).from(element).save();
    }
  };

  const handleValidationDialogOpen = () => {
    setValidationDialogOpen(true);
  };

  const handleValidationDialogClose = () => {
    setValidationDialogOpen(false);
  };

  const handleClaimClick = (validation: Validation) => {
    setSelectedValidation(validation);
    setClaimDialogOpen(true);
  };

  const handleClaimDialogClose = () => {
    setClaimDialogOpen(false);
    setSelectedValidation(null);
  };

  const handleShareClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget as unknown as HTMLButtonElement);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setSnackbarOpen(true);
      handleClose();
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const generateLinkedInShareUrl = (credentialName: string, url: string) => {
    const encodedUrl = encodeURIComponent(url);
    const message = encodeURIComponent(
      `Excited to share my verified ${credentialName} credential from LinkedTrust! Check it out here: ${url} Thanks to my validators for confirming my skills!`
    );
    return `https://www.linkedin.com/feed/?shareActive=true&shareUrl=${encodedUrl}&text=${message}`;
  };

  const handleLinkedInPost = () => {
    let credentialName = 'a new';
    if (subject && !subject.includes('https')) {
      credentialName = subject;
    }
    const linkedInShareUrl = generateLinkedInShareUrl(credentialName, currentUrl);
    window.open(linkedInShareUrl, '_blank');
    handleClose();
  };

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text;
    return `${text.substring(0, length)}...`;
  };

  // Function to render media content
  const renderMedia = () => {
    if (!image) return null;

    const isVideoUrl = (url: string): boolean => {
      try {
        const parsedUrl = new URL(url);
        const extension = parsedUrl.pathname.split('.').pop()?.toLowerCase();
        return ['mp4', 'webm', 'ogg'].includes(extension || '');
      } catch {
        return false;
      }
    };

    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: isLargeScreen ? '800px' : '600px',
          margin: '0 auto',
          marginTop: 3,
          marginBottom: 3,
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        {isVideoUrl(image) ? (
          <video controls style={{ width: '100%', maxHeight: isLargeScreen ? '500px' : '400px' }}>
            <source src={image} type='video/mp4' />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={image}
            alt='Certificate media content'
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: isLargeScreen ? '500px' : '400px',
              objectFit: 'contain'
            }}
            loading='lazy'
          />
        )}
      </Box>
    );
  };

  return (
    <Container maxWidth={isLargeScreen ? "lg" : "md"} sx={{ py: 4 }}>
      <Card
        sx={{
          minHeight: isMobile ? 'auto' : 'auto',
          width: '100%',
          borderRadius: '20px',
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          color: '#212529',
          marginBottom: '2rem',
          position: 'relative',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Box id='certificate-content' sx={{ px: { xs: 1, sm: 2, md: 4 } }}>
              <IconButton 
                onClick={() => navigate(-1)} 
                sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16,
                  zIndex: 10
                }}
              >
                <CloseIcon />
              </IconButton>

              <Box
                component='img'
                src={badge}
                alt='Certificate Badge'
                sx={{
                  width: isMobile ? '120px' : isTablet ? '140px' : '150px',
                  height: isMobile ? '120px' : isTablet ? '140px' : '150px',
                  display: 'block',
                  margin: '0 auto',
                  marginTop: isMobile ? 2 : 3,
                  marginBottom: isMobile ? 2 : '30px',
                  filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              />

              <Typography
                variant='h4'
                sx={{
                  fontSize: isMobile ? '28px' : isTablet ? '32px' : '36px',
                  fontWeight: 600,
                  marginBottom: 1,
                  textAlign: 'center',
                  color: '#2D6A4F'
                }}
              >
                Certificate
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  fontSize: isMobile ? '14px' : '16px',
                  color: '#666',
                  marginBottom: isMobile ? 3 : 4,
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '2px'
                }}
              >
                OF SKILL VALIDATION
              </Typography>

              <Typography
                variant='h3'
                sx={{
                  fontSize: isMobile ? '24px' : isTablet ? '28px' : '32px',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  marginBottom: 3,
                  textAlign: 'center',
                  color: '#2D6A4F'
                }}
              >
                {curator}
              </Typography>

              <Typography
                variant='h3'
                sx={{
                  fontSize: isMobile ? '24px' : isTablet ? '28px' : '32px',
                  fontFamily: "'Roboto', sans-serif",
                  fontWeight: 500,
                  marginBottom: 3,
                  textAlign: 'center',
                  color: '#2D6A4F'
                }}
              >
                {subject}
              </Typography>
              
              <Typography
                sx={{
                  fontSize: isMobile ? '15px' : '16px',
                  color: '#666',
                  marginBottom: isMobile ? 3 : 4,
                  textAlign: 'center',
                  maxWidth: isLargeScreen ? '800px' : '600px',
                  margin: '0 auto',
                  lineHeight: '1.6',
                  padding: isMobile ? '0 8px' : 0
                }}
              >
                {statement || 'This certificate validates the skills and expertise demonstrated by the recipient.'}
              </Typography>

              {renderMedia()}

              {validations && validations.length > 0 && (
                <Box sx={{ width: '100%', mt: 4 }}>
                  <Typography variant='h6' color='#2D6A4F' textAlign='center' marginBottom={3}>
                    Endorsed by:
                  </Typography>

                  <Stack 
                    direction={isMobile ? 'column' : 'row'} 
                    spacing={isMobile ? 2 : 3} 
                    justifyContent='center'
                    alignItems='center'
                  >
                    {validations.slice(0, isMobile ? 1 : 2).map((validation, index) => (
                      <Card
                        key={index}
                        sx={{
                          width: isMobile ? '100%' : isTablet ? '260px' : '284px',
                          height: '168px',
                          p: 2.5,
                          boxShadow: '0px 2px 14px rgba(0, 0, 0, 0.25)',
                          borderRadius: 2,
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)'
                          }
                        }}
                        onClick={() => handleClaimClick(validation)}
                      >
                        <Typography color='#2D6A4F' fontWeight={500} fontSize={20} marginBottom={1}>
                          {validation.author}
                        </Typography>
                        <Typography color='#212529' fontSize={16}>
                          {truncateText(validation.statement || '', 50)}
                        </Typography>
                        <Button
                          onClick={e => {
                            e.stopPropagation();
                            handleClaimClick(validation);
                          }}
                          sx={{
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                            color: '#2D6A4F',
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '14px',
                            padding: 0,
                            minWidth: 'auto',
                            '&:hover': {
                              backgroundColor: 'transparent',
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          see all
                        </Button>
                      </Card>
                    ))}
                  </Stack>

                  {validations.length > (isMobile ? 1 : 2) && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
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
                        See more validations ({validations.length - (isMobile ? 1 : 2)} more)
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
              {effectiveDate && (
                <Typography variant='body2' color='#495057' textAlign='center' mt={3}>
                  Issued on:{' '}
                  {new Date(effectiveDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              )}
              {claimId && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}
                  >
                    <Typography variant='body2' color='#495057'>
                      Certificate ID:
                    </Typography>
                    <MuiLink
                      href={`/certificate/${claimId}`}
                      onClick={e => {
                        e.preventDefault();
                        window.location.href = `/certificate/${claimId}`;
                      }}
                      sx={{
                        color: '#2D6A4F',
                        textDecoration: 'none',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {claimId}
                    </MuiLink>
                  </Box>
                </Box>
              )}
            </Box>

            <Box 
              sx={{ 
                width: '100%',
                maxWidth: '740px',
                height: { xs: 'auto', sm: '61px' },
                background: '#FEFEFF',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: { xs: '16px', sm: '0 20px' },
                margin: '20px auto',
                position: 'relative',
                transition: 'all 0.3s ease',
                gap: { xs: '12px', sm: 0 },
                '&:hover': {
                  boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.2)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box
                onClick={handleExport}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: { xs: '12px 20px', sm: '8px 16px' },
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  '&:hover': {
                    backgroundColor: 'rgba(45, 106, 79, 0.08)',
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <SystemUpdateAltIcon sx={{ color: '#2D6A4F', fontSize: 24 }} />
                <Typography
                  sx={{
                    fontFamily: 'Roboto',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    fontSize: { xs: '14px', sm: '16px' },
                    lineHeight: '19px',
                    color: '#2D6A4F',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Export Certificate
                </Typography>
              </Box>
              
              <Box
                onClick={handleShareClick}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: { xs: '12px 20px', sm: '8px 16px' },
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  '&:hover': {
                    backgroundColor: 'rgba(45, 106, 79, 0.08)',
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <ShareIcon sx={{ color: '#2D6A4F', fontSize: 24 }} />
                <Typography
                  sx={{
                    fontFamily: 'Roboto',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    fontSize: { xs: '14px', sm: '16px' },
                    lineHeight: '19px',
                    color: '#2D6A4F',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Share
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>

        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              startIcon={<LinkedInIcon />}
              onClick={handleLinkedInPost}
              sx={{ color: '#2D6A4F', justifyContent: 'flex-start' }}
            >
              Share on LinkedIn
            </Button>
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLink}
              sx={{ color: '#2D6A4F', justifyContent: 'flex-start' }}
            >
              Copy Link
            </Button>
          </Box>
        </Popover>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message='Link copied to clipboard!'
        />

        {/* Validation Dialog */}
        <Dialog
          open={validationDialogOpen}
          onClose={handleValidationDialogClose}
          maxWidth='md'
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              overflowY: 'auto'
            }
          }}
        >
          <DialogTitle
            sx={{
              color: '#2D6A4F',
              fontSize: '24px',
              fontWeight: 600,
              textAlign: 'center',
              padding: 3
            }}
          >
            All Validations
          </DialogTitle>
          <DialogContent
            sx={{
              padding: 3,
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 3
            }}
          >
            {validations?.map((validation, index) => (
              <Card
                key={index}
                onClick={() => handleClaimClick(validation)}
                sx={{
                  width: '100%',
                  height: '168px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 2px 14px 0 rgba(0, 0, 0, 0.25)',
                  padding: '20px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)'
                  }
                }}
              >
                <Typography color='#2D6A4F' fontWeight={500} fontSize={20} marginBottom={1}>
                  {validation.author}
                </Typography>
                <Typography color='#212529' fontSize={16}>
                  {truncateText(validation.statement || '', 50)}
                </Typography>
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    handleClaimClick(validation);
                  }}
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    color: '#2D6A4F',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '14px',
                    padding: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  see all
                </Button>
              </Card>
            ))}
          </DialogContent>
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
        </Dialog>

        {/* Validation Details Dialog */}
        <Dialog
          open={claimDialogOpen}
          onClose={handleClaimDialogClose}
          maxWidth={false}
          sx={{
            '& .MuiDialog-paper': {
              width: isMobile ? '95%' : '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              overflowY: 'auto'
            }
          }}
        >
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
              <Box sx={{ padding: isMobile ? 2 : 3 }}>
                <Box sx={{ marginBottom: 3 }}>
                  {selectedValidation.subject && (
                    <Box
                      sx={{
                        fontSize: isMobile ? '18px' : '20px',
                        fontWeight: 500,
                        color: '#2D6A4F',
                        marginBottom: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <MuiLink
                        href={selectedValidation.subject}
                        target='_blank'
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'inherit',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          },
                          wordBreak: 'break-word'
                        }}
                      >
                        {selectedValidation.subject}
                        <OpenInNewIcon sx={{ fontSize: 20 }} />
                      </MuiLink>
                    </Box>
                  )}
                  <Typography
                    sx={{
                      fontSize: isMobile ? '22px' : '24px',
                      fontWeight: 500,
                      color: '#2D6A4F',
                      marginBottom: 2
                    }}
                  >
                    {selectedValidation.author}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      color: '#212529',
                      marginBottom: 2,
                      lineHeight: 1.6
                    }}
                  >
                    {selectedValidation.statement}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      color: '#495057',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {selectedValidation.effectiveDate &&
                      new Date(selectedValidation.effectiveDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                  </Typography>
                </Box>
                <Box sx={{ marginTop: 3 }}>
                  {selectedValidation.howKnown && (
                    <Box sx={{ marginBottom: 2 }}>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          color: '#495057',
                          minWidth: '150px',
                          display: 'inline-block'
                        }}
                      >
                        How Known:
                      </Typography>
                      <Typography sx={{ color: '#212529' }}>{selectedValidation.howKnown.replace(/_/g, ' ')}</Typography>
                    </Box>
                  )}
                  {selectedValidation.sourceURI && (
                    <Box sx={{ marginBottom: 2 }}>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          color: '#495057',
                          minWidth: '150px',
                          display: 'inline-block'
                        }}
                      >
                        Source:
                      </Typography>
                      <Typography>
                        <MuiLink
                          href={selectedValidation.sourceURI}
                          target='_blank'
                          sx={{
                            color: '#2D6A4F',
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            },
                            wordBreak: 'break-word'
                          }}
                        >
                          {selectedValidation.sourceURI}
                        </MuiLink>
                      </Typography>
                    </Box>
                  )}
                  {selectedValidation.confidence !== undefined && (
                    <Box sx={{ marginBottom: 2 }}>
                      <Typography
                        sx={{
                          fontWeight: 500,
                          color: '#495057',
                          minWidth: '150px',
                          display: 'inline-block'
                        }}
                      >
                        Confidence:
                      </Typography>
                      <Typography sx={{ color: '#212529' }}>{selectedValidation.confidence}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </Container>
  );
};

export default Certificate;