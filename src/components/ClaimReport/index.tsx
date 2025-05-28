// ClaimReport.tsx - Clean, minimal design focused on content
import React, { useEffect, useState } from 'react'
import * as api from '../../api'
import { Link as RouterLink, useParams } from 'react-router-dom'
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  useTheme,
  useMediaQuery,
  Button,
  Chip
} from '@mui/material'
import { BACKEND_BASE_URL } from '../../utils/settings'
import backSvg from '../../assets/images/back.svg'
import type { Claim } from '../../api/types'

interface ReportData {
  claim: any
  validations: any[]
  validationSummary: {
    total: number
  }
  relatedClaims: any[]
  subjectNode?: any
}

const ClaimReport: React.FC = () => {
  const theme = useTheme()
  const { claimId } = useParams<{ claimId: string }>()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true)
      try {
        const response = await api.getClaimReport(claimId!)
        setReportData(response.data as any)
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
      <Container maxWidth='md' sx={{ mt: 4 }}>
        <Typography variant='body1' sx={{ color: theme.palette.texts }}>
          {error || 'Report data is not available.'}
        </Typography>
      </Container>
    )
  }

  const { claim, validations, relatedClaims, subjectNode } = reportData

  return (
    <Container maxWidth="md" sx={{ py: 4, px: isMobile ? 2 : 3 }}>
      {/* Simple back button */}
      <Button
        component={RouterLink}
        to='/feed'
        sx={{
          color: theme.palette.link,
          mb: 3,
          p: 0,
          minWidth: 'auto',
          '&:hover': {
            backgroundColor: 'transparent',
            textDecoration: 'underline'
          }
        }}
      >
        <img src={backSvg} alt='back' style={{ width: '16px', marginRight: '8px' }} />
        Back
      </Button>

      {/* Subject Node Info */}
      {(subjectNode || claim.subjectNode) && (
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Typography variant="overline" sx={{ color: theme.palette.text.secondary, mb: 1, display: 'block' }}>
            About
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {(subjectNode?.image || claim.subjectNode?.image) && (
              <Box
                component="img"
                src={subjectNode?.image || claim.subjectNode?.image}
                alt="Subject"
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            )}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {subjectNode?.name || claim.subjectNode?.name || 'Subject'}
              </Typography>
              {(subjectNode?.entType || claim.subjectNode?.entType) && (
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {subjectNode?.entType || claim.subjectNode?.entType}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Main Claim */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, color: theme.palette.texts }}>
          {claim.claim}
        </Typography>
        
        {claim.statement && (
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3,
              lineHeight: 1.8,
              color: theme.palette.texts,
              whiteSpace: 'pre-wrap'
            }}
          >
            {claim.statement}
          </Typography>
        )}

        {/* Main claim image */}
        {claim.image && (
          <Box sx={{ mb: 3 }}>
            <img 
              src={claim.image} 
              alt="Claim" 
              style={{ 
                width: '100%',
                maxWidth: '600px',
                height: 'auto',
                borderRadius: '8px',
                display: 'block'
              }} 
            />
          </Box>
        )}

        {/* Metadata in a subtle way */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          fontSize: '0.875rem',
          color: theme.palette.text.secondary
        }}>
          {claim.effectiveDate && (
            <span>
              {new Date(claim.effectiveDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          )}
          {claim.howKnown && (
            <span>• {claim.howKnown.replace(/_/g, ' ').toLowerCase()}</span>
          )}
          {claim.confidence && (
            <span>• {Math.round(claim.confidence * 100)}% confidence</span>
          )}
        </Box>
      </Box>

      {/* Validations */}
      {validations.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3,
              fontWeight: 500,
              color: theme.palette.texts 
            }}
          >
            Validations ({validations.length})
          </Typography>

          {validations.map((validation) => (
            <Box 
              key={validation.id} 
              sx={{ 
                mb: 3,
                pb: 3,
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip 
                  label={validation.claim} 
                  size="small"
                  sx={{ 
                    fontSize: '0.75rem',
                    height: '24px'
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {validation.effectiveDate && new Date(validation.effectiveDate).toLocaleDateString()}
                </Typography>
              </Box>
              
              {validation.statement && (
                <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {validation.statement}
                </Typography>
              )}
              
              {validation.image && (
                <img 
                  src={validation.image} 
                  alt="Validation" 
                  style={{ 
                    width: '100%',
                    maxWidth: '400px',
                    height: 'auto',
                    borderRadius: '8px',
                    display: 'block'
                  }} 
                />
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Related Claims */}
      {relatedClaims.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3,
              fontWeight: 500,
              color: theme.palette.texts 
            }}
          >
            Other Claims About This Subject
          </Typography>

          {relatedClaims.map((relatedClaim) => (
            <Box 
              key={relatedClaim.id} 
              sx={{ 
                mb: 2,
                p: 2,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              <RouterLink 
                to={`/report/${relatedClaim.id}`} 
                style={{ 
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {relatedClaim.claim}
                </Typography>
                {relatedClaim.statement && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {relatedClaim.statement}
                  </Typography>
                )}
              </RouterLink>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  )
}

export default ClaimReport
