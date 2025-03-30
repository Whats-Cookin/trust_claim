import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Grid,
  CircularProgress,
  Box,
  useTheme,
  Button,
  Divider,
  Paper,
  Popover
} from '@mui/material'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import { BACKEND_BASE_URL } from '../../utils/settings'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ShareIcon from '@mui/icons-material/Share'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import DataObjectIcon from '@mui/icons-material/DataObject'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import HubOutlinedIcon from '@mui/icons-material/HubOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { LinkedIn, ContentCopy } from '@mui/icons-material'
import Snackbar from '../Snackbar'

interface Claim {
  statement: string | null
  subject: string
  id: string
  effectiveDate?: string
  author?: string
  sourceURI?: string
  howKnown?: string
  confidence?: number
  [key: string]: any
}

interface ReportData {
  data: {
    claim: Claim
    validations: Claim[]
    attestations: Claim[]
  }
}

const DonationReport: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { claimId } = useParams<{ claimId: string }>()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [expanded, setExpanded] = useState<boolean>(false)
  const [expandedAttestations, setExpandedAttestations] = useState<{ [key: string]: boolean }>({})
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [currentUrl, setCurrentUrl] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [anchorExportEl, setAnchorExportEl] = useState<HTMLButtonElement | null>(null)

  const url = `${BACKEND_BASE_URL}/api/report/${claimId}`
  const CLAIM_ROOT_URL = 'https://live.linkedtrust.us/claims'

  const handleValidation = (id: number) => {
    navigate({
      pathname: '/validate',
      search: `?subject=${CLAIM_ROOT_URL}/${id}`
    })
  }

  const handleSchema = async (claim: any) => {
    navigate({
      pathname: `/explore/${claim.id}`
    })
  }

  // Share functionality
  const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleShareClose = () => {
    setAnchorEl(null)
  }

  const generateLinkedInShareUrl = (url: string) => {
    const encodedUrl = encodeURIComponent(url)
    const message = encodeURIComponent(`Check out this verified credential from LinkedTrust! ${url}`)
    return `https://www.linkedin.com/feed/?shareActive=true&shareUrl=${encodedUrl}&text=${message}`
  }

  const handleLinkedInShare = () => {
    const linkedInShareUrl = generateLinkedInShareUrl(currentUrl)
    window.open(linkedInShareUrl, '_blank')
    handleShareClose()
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setSnackbarOpen(true)
      handleShareClose()
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const open = Boolean(anchorEl)

  // Export functionality
  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorExportEl(event.currentTarget)
  }

  const handleExportClose = () => {
    setAnchorExportEl(null)
  }

  const exportClaimData = (claimData: any, format: 'json' | 'pdf') => {
    if (!claimData) {
      console.error('exportClaimData: claimData is null or undefined.')
      return
    }

    if (!claimData.id) {
      console.error('exportClaimData: claimData.id is unknown. Export is not allowed.')
      return
    }

    try {
      if (format === 'json') {
        const jsonString = JSON.stringify(claimData, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `claim_${claimData.id}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else if (format === 'pdf') {
        // For PDF export, we would normally use html2pdf or jsPDF
        // Since we don't have html2pdf imported in this file, we'll just create a simple PDF
        const { jsPDF } = require('jspdf')
        const doc = new jsPDF()

        // Add claim data to PDF

        console.log('claimData', claimData)
        doc.setFontSize(16)
        doc.text('Claim Report', 20, 20)

        doc.setFontSize(12)
        doc.text(`ID: ${claimData.id}`, 20, 30)
        doc.text(`Subject: ${claimData.subject || 'N/A'}`, 20, 40)
        doc.text(`Author: ${claimData.author || 'Unknown'}`, 20, 50)
        doc.text(`Date: ${new Date(claimData.effectiveDate).toLocaleDateString()}`, 20, 60)

        if (claimData.statement) {
          doc.text('Statement:', 20, 70)
          const textLines = doc.splitTextToSize(claimData.statement, 170)
          doc.text(textLines, 20, 80)
        }

        doc.save(`claim_${claimData.id}.pdf`)
      }
      handleExportClose()
    } catch (error) {
      console.error('Error exporting claim data:', error)
    }
  }

  const openExport = Boolean(anchorExportEl)

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(url)
        setReportData(response.data)
      } catch (err) {
        setError('Failed to fetch report data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchReportData()
  }, [claimId])

  if (isLoading) {
    return (
      <Container
        maxWidth='sm'
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Container>
    )
  }

  if (error || !reportData) {
    return (
      <Container maxWidth='sm' sx={{ mt: 50 }}>
        <Typography variant='body1' color='text.secondary'>
          {error || 'Report data is not available.'}
        </Typography>
      </Container>
    )
  }

  const claim = reportData.data.claim.claim

  console.log('reportData', claim)
  console.log('reportData', reportData)

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant='h6' fontWeight='bold' sx={{ mb: 3 }}>
            Claim Report
          </Typography>

          <Paper elevation={1} sx={{ borderRadius: '12px', overflow: 'hidden', mb: 3 }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant='body1'>{claim.subject || 'Unknown'}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarTodayIcon fontSize='small' sx={{ mr: 1 }} />
                <Typography variant='subtitle2'>Issued On </Typography>
                <Typography variant='subtitle2' sx={{ ml: 1 }}>
                  {new Date(claim.effectiveDate || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>

              {claim.statement && (
                <Typography variant='body2' sx={{ mb: 2 }}>
                  {expanded
                    ? claim.statement
                    : claim.statement?.split(' ').slice(0, 30).join(' ') +
                      (claim.statement?.split(' ').length > 30 ? '...' : '')}
                  {claim.statement && claim.statement.split(' ').length > 30 && !expanded && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        onClick={() => setExpanded(true)}
                        endIcon={<ChevronRightIcon />}
                        sx={{
                          color: 'teal',
                          p: 0,
                          textTransform: 'none',
                          '&:hover': {
                            background: 'none'
                          }
                        }}
                      >
                        See More
                      </Button>
                    </Box>
                  )}
                </Typography>
              )}

              {expanded && (
                <Typography variant='body2' color='primary' sx={{ mb: 2 }}>
                  {claim.sourceURI}
                </Typography>
              )}

              <Divider sx={{ width: '100%' }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  onClick={() => handleValidation(reportData.data.claim.claim.id)}
                  startIcon={<VerifiedOutlinedIcon sx={{ color: '#2D6A4F' }} />}
                  variant='text'
                  sx={{ color: 'teal' }}
                >
                  Validate
                </Button>
                <Button
                  onClick={() => handleSchema(claim)}
                  startIcon={<HubOutlinedIcon sx={{ color: '#2D6A4F' }} />}
                  variant='text'
                  sx={{ color: 'teal' }}
                >
                  Graph
                </Button>
                <Button onClick={handleShareClick} startIcon={<ShareIcon />} variant='text' sx={{ color: 'teal' }}>
                  Share
                </Button>
                <Link to={'/report/' + reportData.data.claim.claim.id} style={{ textDecoration: 'none' }}>
                  <Button
                    startIcon={<WorkspacePremiumIcon sx={{ color: '#2D6A4F' }} />}
                    variant='text'
                    sx={{ color: 'teal' }}
                    onClick={() => console.log('Share button clicked, navigating to:', `/ClaimDetails/${claimId}`)}
                  >
                    Certificate
                  </Button>
                </Link>
                <Button
                  onClick={handleExportClick}
                  startIcon={<PictureAsPdfIcon />}
                  variant='text'
                  sx={{ color: 'teal' }}
                >
                  Export
                </Button>
                {/* Export Popover */}
                <Popover
                  id='export-popover'
                  open={openExport}
                  anchorEl={anchorExportEl}
                  onClose={handleExportClose}
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
                      startIcon={<DataObjectIcon />}
                      onClick={() => {
                        reportData && exportClaimData(reportData.data.claim.claim, 'json')
                      }}
                      sx={{ color: '#2D6A4F', justifyContent: 'flex-start' }}
                    >
                      Export as JSON
                    </Button>
                    <Button
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => {
                        reportData && exportClaimData(reportData.data.claim.claim, 'pdf')
                      }}
                      sx={{ color: '#2D6A4F', justifyContent: 'flex-start' }}
                    >
                      Export as PDF
                    </Button>
                  </Box>
                </Popover>
                {/* Share Popover */}
                <Popover
                  id='share-popover'
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleShareClose}
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
                      startIcon={<LinkedIn />}
                      onClick={handleLinkedInShare}
                      sx={{ color: '#2D6A4F', justifyContent: 'flex-start' }}
                    >
                      Share on LinkedIn
                    </Button>
                    <Button
                      startIcon={<ContentCopy />}
                      onClick={handleCopyLink}
                      sx={{ color: '#2D6A4F', justifyContent: 'flex-start' }}
                    >
                      Copy Link
                    </Button>
                  </Box>
                </Popover>

                {/* Snackbar for copy notification */}
                <Snackbar
                  open={snackbarOpen}
                  autoHideDuration={3000}
                  onClose={() => setSnackbarOpen(false)}
                  message='Link copied to clipboard!'
                />
              </Box>
            </Box>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='h6' fontWeight='bold'>
              Related Attestations
            </Typography>

            <Button
              variant='outlined'
              size='small'
              sx={{
                borderRadius: '20px',
                borderColor: 'teal',
                color: 'teal',
                '&:hover': {
                  borderColor: 'teal'
                }
              }}
            >
              View all
            </Button>
          </Box>

          <Grid container spacing={2}>
            {reportData.data.attestations.map((attestation, index) => {
              const uniqueKey = `attestation-${index}`
              return (
                <Grid item xs={12} md={6} key={`${uniqueKey}`}>
                  <Paper
                    elevation={1}
                    sx={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                      height: '100%'
                    }}
                  >
                    <Box sx={{ p: 3, mt: 1, fontSize: '12px' }}>
                      {new Date(attestation.effectiveDate || '').toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}

                      <Typography sx={{ mb: 2, fontSize: '23px', mt: 2 }}>
                        {expandedAttestations[uniqueKey]
                          ? attestation.statement || 'No statement available'
                          : attestation.statement && attestation.statement.split(' ').length > 30
                          ? attestation.statement.split(' ').slice(0, 30).join(' ') + '...'
                          : attestation.statement || 'No statement available'}
                      </Typography>

                      {attestation.statement && attestation.statement.split(' ').length > 30 && (
                        <Button
                          endIcon={<ChevronRightIcon />}
                          onClick={() => {
                            setExpandedAttestations(prev => {
                              const newState = { ...prev }
                              newState[uniqueKey] = !prev[uniqueKey]
                              return newState
                            })
                          }}
                          sx={{
                            color: 'teal',
                            p: 0,
                            textTransform: 'none',
                            '&:hover': {
                              background: 'none'
                            }
                          }}
                        >
                          {expandedAttestations[uniqueKey] ? 'Show Less' : 'Read More'}
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              )
            })}
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button
              component={Link}
              to='/feed'
              startIcon={<ArrowBackIcon />}
              sx={{
                color: 'teal',
                textTransform: 'none',
                fontWeight: 'regular',
                '&:hover': {
                  background: 'none'
                }
              }}
            >
              BACK
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default DonationReport
