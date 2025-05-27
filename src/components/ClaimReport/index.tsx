// ClaimReport.tsx - Updated to work with new backend
import React, { useEffect, useState } from 'react'
import * as api from '../../api'
import { Link, useParams } from 'react-router-dom'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Box,
  useTheme,
  useMediaQuery,
  Button,
  Chip
} from '@mui/material'
import RenderClaimInfo from './RenderClaimInfo'
import { BACKEND_BASE_URL } from '../../utils/settings'
import StarIcon from '@mui/icons-material/Star'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import backSvg from '../../assets/images/back.svg'
import ClaimDetails from './ClaimDetails'
import type { Claim } from '../../api/types'

interface ClaimWithEntities extends Claim {
  subjectEntity?: any
  objectEntity?: any
}

interface ReportData {
  claim: ClaimWithEntities
  validations: Claim[]
  validationSummary: {
    total: number
    agrees: number
    disagrees: number
    confirms: number
    refutes: number
  }
  relatedClaims: Claim[]
  issuerReputation: {
    totalClaims: number
    recentClaims: Claim[]
  }
}

const ClaimReport: React.FC = () => {
  const theme = useTheme()
  const { claimId } = useParams<{ claimId: string }>()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null)
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'))

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
      <Container maxWidth='sm' sx={{ mt: 50 }}>
        <Typography variant='body1' sx={{ color: theme.palette.texts }}>
          {error || 'Report data is not available.'}
        </Typography>
      </Container>
    )
  }

  const { claim, validations, validationSummary, relatedClaims } = reportData

  return (
    <Box sx={{ width: '100%', py: '2rem', px: '8px', pl: isMediumScreen ? '8px' : '60px' }}>
      <Box
        id='report-container'
        sx={{
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          mt: '5vh',
          flexDirection: 'column',
          backgroundColor: theme.palette.menuBackground,
          borderRadius: '20px',
          padding: '25px'
        }}
      >
        {/* Main Claim Details */}
        <ClaimDetails theme={theme} data={{ claim }} />

        {/* Validation Summary */}
        {validationSummary.total > 0 && (
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            <Chip 
              label={`${validationSummary.agrees} Agree`} 
              color="success" 
              variant={validationSummary.agrees > 0 ? "filled" : "outlined"}
            />
            <Chip 
              label={`${validationSummary.disagrees} Disagree`} 
              color="error"
              variant={validationSummary.disagrees > 0 ? "filled" : "outlined"}
            />
            <Chip 
              label={`${validationSummary.confirms} Confirm`} 
              color="info"
              variant={validationSummary.confirms > 0 ? "filled" : "outlined"}
            />
            <Chip 
              label={`${validationSummary.refutes} Refute`} 
              color="warning"
              variant={validationSummary.refutes > 0 ? "filled" : "outlined"}
            />
          </Box>
        )}

        {/* Validations */}
        {validations.length > 0 && (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
              <Typography
                variant='h6'
                sx={{
                  color: theme.palette.texts,
                  textAlign: 'center',
                  marginLeft: isMediumScreen ? '0' : '1rem'
                }}
              >
                Validations
                <Box
                  sx={{
                    height: '4px',
                    backgroundColor: theme.palette.maintext,
                    borderRadius: '2px',
                    width: '80%',
                    mt: 1
                  }}
                />
              </Typography>
            </Box>

            {validations.map((validation) => (
              <ValidationCard
                key={validation.id}
                validation={validation}
                theme={theme}
                isLargeScreen={isLargeScreen}
              />
            ))}
          </>
        )}

        {/* Related Claims */}
        {relatedClaims.length > 0 && (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px', mt: 4 }}>
              <Typography
                variant='h6'
                sx={{
                  color: theme.palette.texts,
                  textAlign: 'center',
                  marginLeft: isMediumScreen ? '0' : '1rem'
                }}
              >
                Other Claims About This Subject
                <Box
                  sx={{
                    height: '4px',
                    backgroundColor: theme.palette.maintext,
                    marginTop: '4px',
                    borderRadius: '2px',
                    width: '80%'
                  }}
                />
              </Typography>
            </Box>

            {relatedClaims.map((relatedClaim) => (
              <RelatedClaimCard
                key={relatedClaim.id}
                claim={relatedClaim}
                theme={theme}
                isLargeScreen={isLargeScreen}
              />
            ))}
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '15px' }}>
          <Button
            component={Link}
            to='/feed'
            sx={{
              color: theme.palette.link,
              fontWeight: 400,
              borderRadius: '24px',
              fontSize: 'clamp(0.875rem, 2.5vw, 1.1rem)',
              px: '2rem'
            }}
          >
            <img src={backSvg} alt='arrow' style={{ width: '10px', marginRight: '10px' }} />
            BACK
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

function ValidationCard({
  validation,
  theme,
  isLargeScreen
}: {
  validation: Claim
  theme: any
  isLargeScreen: boolean
}) {
  const getValidationColor = (claimType: string) => {
    switch (claimType) {
      case 'AGREES_WITH':
      case 'CONFIRMS':
        return 'success.main'
      case 'DISAGREES_WITH':
      case 'REFUTES':
        return 'error.main'
      default:
        return 'text.primary'
    }
  }

  return (
    <Card
      sx={{
        minHeight: '120px',
        width: '100%',
        borderRadius: '20px',
        backgroundColor: theme.palette.cardBackground,
        backgroundImage: 'none',
        color: theme.palette.texts,
        marginBottom: '1rem',
        borderLeft: `4px solid`,
        borderLeftColor: getValidationColor(validation.claim)
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant='subtitle2' color={getValidationColor(validation.claim)}>
              {validation.claim.replace('_', ' ')}
            </Typography>
            {validation.statement && (
              <Typography variant='body1' sx={{ mt: 1 }}>
                {validation.statement}
              </Typography>
            )}
            <Typography variant='caption' sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
              By: {validation.issuerId || 'Unknown'} • 
              {validation.effectiveDate && new Date(validation.effectiveDate).toLocaleDateString()}
            </Typography>
          </Box>
          {validation.confidence && (
            <Chip 
              label={`${Math.round(validation.confidence * 100)}% confident`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

function RelatedClaimCard({
  claim,
  theme,
  isLargeScreen
}: {
  claim: Claim
  theme: any
  isLargeScreen: boolean
}) {
  return (
    <Card
      sx={{
        minHeight: '100px',
        width: '100%',
        borderRadius: '20px',
        backgroundColor: theme.palette.cardBackground,
        backgroundImage: 'none',
        color: theme.palette.texts,
        marginBottom: '1rem'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle2' color='primary'>
              {claim.claim}
            </Typography>
            {claim.statement && (
              <Typography variant='body2' sx={{ mt: 1 }}>
                {claim.statement}
              </Typography>
            )}
            <Typography variant='caption' sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
              {claim.effectiveDate && new Date(claim.effectiveDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
            {claim.stars && <Stars stars={claim.stars} theme={theme} />}
            <Link to={`/report/${claim.id}`} style={{ textDecoration: 'none' }}>
              <Button size="small" variant="outlined">
                View
              </Button>
            </Link>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function Stars({ stars, theme }: { stars: number; theme: any }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon
          key={index}
          sx={{
            color: index < stars ? theme.palette.stars : theme.palette.action.disabled,
            width: '16px',
            height: '16px'
          }}
        />
      ))}
    </Box>
  )
}

export default ClaimReport
