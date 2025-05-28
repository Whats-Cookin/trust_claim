// ClaimReport.tsx - Updated to work with new backend
import React, { useEffect, useState } from 'react'
import * as api from '../../api'
import { Link as RouterLink, useParams } from 'react-router-dom'
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
  Chip,
  Link
} from '@mui/material'
import RenderClaimInfo from './RenderClaimInfo'
import { BACKEND_BASE_URL } from '../../utils/settings'
import StarIcon from '@mui/icons-material/Star'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import backSvg from '../../assets/images/back.svg'
import EntityBadge from '../EntityBadge'
import type { Claim } from '../../api/types'

interface ClaimWithEntities extends Claim {
  subjectEntity?: any
  objectEntity?: any
  edges?: Array<{
    id: number
    startNode?: {
      id: number
      nodeUri: string
      name: string
      entType: string
      descrip: string
      image?: string | null
      thumbnail?: string | null
    }
    endNode?: {
      id: number
      nodeUri: string
      name: string
      entType: string
      descrip: string
      image?: string | null
      thumbnail?: string | null
    }
    label: string
    claimId: number
  }>
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

// Helper function to convert claim to format expected by RenderClaimInfo
function claimToStringRecord(claim: any): { [key: string]: string } {
  const result: { [key: string]: string } = {}
  
  for (const [key, value] of Object.entries(claim)) {
    // Skip complex objects that can't be rendered directly
    if (key === 'edges' || key === 'subjectEntity' || key === 'objectEntity') {
      continue
    }
    
    // Convert values to strings
    if (value === null || value === undefined) {
      continue
    } else if (typeof value === 'object') {
      // For dates and other objects, convert to string
      result[key] = value instanceof Date ? value.toISOString() : JSON.stringify(value)
    } else {
      result[key] = String(value)
    }
  }
  
  return result
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
        {claim.image && (
          <Box sx={{ mb: 2 }}>
            <img 
              src={claim.image} 
              alt="Claim" 
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                borderRadius: '8px'
              }} 
            />
          </Box>
        )}
        
        <Box sx={{ mb: 3 }}>
          <RenderClaimInfo 
            claim={claimToStringRecord(claim)} 
            index={0}
            setSelectedIndex={setSelectedIndex}
            handleMenuClose={() => {}}
          />
        </Box>



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

            {validations.map((validation, index) => (
              <Box key={validation.id} sx={{ mb: 3 }}>
                {/* Show validation image if present */}
                {validation.image && (
                  <Box sx={{ mb: 2 }}>
                    <img 
                      src={validation.image} 
                      alt="Validation" 
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto',
                        borderRadius: '8px'
                      }} 
                    />
                  </Box>
                )}
                <RenderClaimInfo 
                  claim={claimToStringRecord(validation)} 
                  index={index}
                  setSelectedIndex={setSelectedIndex}
                  handleMenuClose={() => {}}
                />
              </Box>
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

            {relatedClaims.map((relatedClaim, index) => (
              <Box key={relatedClaim.id} sx={{ mb: 3 }}>
                {/* Show related claim image if present */}
                {relatedClaim.image && (
                  <Box sx={{ mb: 2 }}>
                    <img 
                      src={relatedClaim.image} 
                      alt="Related claim" 
                      style={{ 
                        maxWidth: '100%', 
                        height: 'auto',
                        borderRadius: '8px'
                      }} 
                    />
                  </Box>
                )}
                <RenderClaimInfo 
                  claim={claimToStringRecord(relatedClaim)} 
                  index={index}
                  setSelectedIndex={setSelectedIndex}
                  handleMenuClose={() => {}}
                />
              </Box>
            ))}
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: '15px' }}>
          <Button
            component={RouterLink}
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

export default ClaimReport
