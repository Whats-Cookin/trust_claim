// ClaimReport.tsx - Clean, minimal design focused on content
import React, { useEffect, useState } from 'react'
import * as api from '../../api'
import { Link as RouterLink, useParams } from 'react-router-dom'
import {
  Typography,
  CircularProgress,
  Box,
  useTheme,
  useMediaQuery,
  Button,
  Chip,
  Card,
  CardContent,
  Grid
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
        console.log('Report data received:', response.data)
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error || !reportData) {
    return (
      <Box sx={{ mt: 4, px: 4 }}>
        <Typography variant='body1' sx={{ color: theme.palette.texts }}>
          {error || 'Report data is not available.'}
        </Typography>
      </Box>
    )
  }

  const { claim, validations, relatedClaims, subjectNode } = reportData

  return (
    <Box sx={{ py: 4, px: { xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }, width: '100%' }}>
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

      {/* Subject - What this report is about */}
      {(subjectNode || claim.subjectNode || claim.subject) && (
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: 2,
          border: `1px solid ${theme.palette.divider}`
        }}>
          {(subjectNode || claim.subjectNode) ? (
            // Full subject node info if available
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
              {(subjectNode?.image || claim.subjectNode?.image) && (
                <Box
                  component="img"
                  src={subjectNode?.image || claim.subjectNode?.image}
                  alt="Subject"
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    boxShadow: 1
                  }}
                />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {subjectNode?.name || claim.subjectNode?.name || 'Subject'}
                </Typography>
                {(subjectNode?.entType || claim.subjectNode?.entType) && (
                  <Chip 
                    label={subjectNode?.entType || claim.subjectNode?.entType}
                    size="small"
                    sx={{ mb: 2 }}
                  />
                )}
                {(subjectNode?.descrip || claim.subjectNode?.descrip) && (
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    {subjectNode?.descrip || claim.subjectNode?.descrip}
                  </Typography>
                )}
                {(subjectNode?.nodeUri || claim.subjectNode?.nodeUri) && (
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                    URI: {subjectNode?.nodeUri || claim.subjectNode?.nodeUri}
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            // Just the subject URI if that's all we have
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, color: theme.palette.text.secondary }}>
                Report about:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                <a 
                  href={claim.subject} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: theme.palette.link || theme.palette.primary.main,
                    textDecoration: 'none'
                  }}
                >
                  {claim.subject}
                </a>
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Main Claim - now secondary to the subject */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, color: theme.palette.texts }}>
          Claim: {claim.claim}
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
        
        {/* Source URI */}
        {claim.sourceURI && (
          <Typography 
            variant="caption" 
            sx={{ 
              display: 'block',
              mt: 1,
              color: theme.palette.text.secondary,
              wordBreak: 'break-all'
            }}
          >
            Source: <a 
              href={claim.sourceURI} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: theme.palette.text.secondary,
                textDecoration: 'underline'
              }}
            >
              {claim.sourceURI}
            </a>
          </Typography>
        )}
      </Box>

      {/* Validations */}
      {validations.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 2,
              fontWeight: 500,
              color: theme.palette.texts 
            }}
          >
            Validations ({validations.length})
          </Typography>

          {validations.map((validation) => (
            <Card
              key={validation.id}
              sx={{
                mb: 3,
                backgroundColor: theme.palette.background.paper,
                boxShadow: 1,
                borderRadius: 2
              }}
            >
              <CardContent>
                <Grid container spacing={3}>
                  {validation.image && (
                    <Grid item xs={12} md={5}>
                      <Box
                        component="img"
                        src={validation.image}
                        alt="Validation"
                        sx={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: 1,
                          objectFit: 'cover'
                        }}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} md={validation.image ? 7 : 12}>
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
                    
                    {/* Source URI for validation */}
                    {validation.sourceURI && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block',
                          color: theme.palette.text.secondary,
                          wordBreak: 'break-all'
                        }}
                      >
                        Source: <a 
                          href={validation.sourceURI} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: theme.palette.text.secondary,
                            textDecoration: 'underline'
                          }}
                        >
                          {validation.sourceURI}
                        </a>
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
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
                {/* Source URI for related claims */}
                {relatedClaim.sourceURI && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      mt: 0.5,
                      color: theme.palette.text.secondary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Source: {relatedClaim.sourceURI}
                  </Typography>
                )}
              </RouterLink>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default ClaimReport
