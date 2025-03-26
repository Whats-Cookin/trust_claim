import React, { useEffect, useState } from 'react'
import axios from 'axios'
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
  Button
} from '@mui/material'
import RenderClaimInfo from './RenderClaimInfo'
import { BACKEND_BASE_URL } from '../../utils/settings'
import StarIcon from '@mui/icons-material/Star'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import backSvg from '../../assets/images/back.svg'
import ClaimDetails from './ClaimDetails'

interface Claim {
  statement: string | null
  subject: string
  id: string
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
  const { claimId } = useParams<{ claimId: string }>()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [selectedIndex, setSelectedIndex] = useState<null | number>(null)
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'))

  const url = `${BACKEND_BASE_URL}/api/report/${claimId}`

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
        <Typography variant='body1' sx={{ color: theme.palette.texts }}>
          {error || 'Report data is not available.'}
        </Typography>
      </Container>
    )
  }

  return (
    <Box sx={{ width: '80%', py: '2rem', px: '8px', pl: isMediumScreen ? '8px' : '60px' }}>
      <Box
        id='report-container'
        sx={{
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          mt: '5%',
          flexDirection: 'column',
          backgroundColor: theme.palette.menuBackground,
          borderRadius: '20px',
          padding: '25px',
          right: '3%'
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
          <Typography
            variant='body1'
            sx={{
              color: theme.palette.texts,
              textAlign: 'center',
              marginLeft: isMediumScreen ? '0' : '1rem'
            }}
          >
            Claim Report
            <Box
              sx={{
                height: '4px',
                backgroundColor: theme.palette.maintext,
                borderRadius: '2px',
                width: '80%'
              }}
            />
          </Typography>
        </Box>

        <ClaimDetails theme={theme} data={reportData.data} />

        {reportData.data.validations.some((validation: Claim) => validation.statement !== null) && (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
              <Typography
                variant='body2'
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
                    marginTop: '4px',
                    borderRadius: '2px',
                    width: '80%'
                  }}
                />
              </Typography>
            </Box>

            {reportData.data.validations.map(
              (validation: Claim) =>
                validation.statement && (
                  <MyCard
                    key={validation.id}
                    data={validation}
                    img={validation.image}
                    theme={theme}
                    isLargeScreen={isLargeScreen}
                    setSelectedIndex={setSelectedIndex}
                    handleMenuClose={() => setSelectedIndex(null)}
                  />
                )
            )}
          </>
        )}

        {reportData.data.attestations.length > 0 && (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
              <Typography
                variant='body2'
                sx={{
                  color: theme.palette.texts,
                  textAlign: 'center',
                  marginLeft: isMediumScreen ? '0' : '1rem',
                  fontSize: '20px',
                  fontWeight: 600
                }}
              >
                Related Attestations
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

            {reportData.data.attestations.map(
              (attestation: Claim) =>
                attestation.statement && (
                  <MyCard
                    key={attestation.id}
                    data={attestation}
                    img={attestation.image}
                    theme={theme}
                    isLargeScreen={isLargeScreen}
                    setSelectedIndex={setSelectedIndex}
                    handleMenuClose={() => setSelectedIndex(null)}
                  />
                )
            )}
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

function MyCard({
  data,
  img,
  theme,
  setSelectedIndex,
  handleMenuClose,
  isLargeScreen
}: Readonly<{
  data: any
  img: any
  theme: any
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>
  handleMenuClose: () => void
  isLargeScreen: any
}>) {
  return (
    <Card
      sx={{
        maxWidth: 'fit-content',
        height: 'fit-content',
        borderRadius: '20px',
        display: isLargeScreen ? 'column' : 'row',
        backgroundColor: theme.palette.cardBackground,
        backgroundImage: 'none',
        color: theme.palette.texts,
        boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.2)',
        mb: '10px'
      }}
    >
      <Box sx={{ display: 'block', position: 'relative', width: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box>
              {data.name && (
                <Typography variant='body2' sx={{ color: theme.palette.texts, mt: 1 }}>
                  {data.name}
                </Typography>
              )}
              <Typography variant='body1' sx={{ color: theme.palette.texts, fontWeight: 500 }}>
                {data.curator}
              </Typography>
            </Box>
          </Box>
          <Typography variant='body1' sx={{ marginBottom: '10px', color: theme.palette.text1 }}>
            {`Created by: ${data.author ? data.author : 'Unknown'}, ${new Date(data.effectiveDate).toLocaleDateString(
              'en-US',
              {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }
            )}`}
          </Typography>

          {data.statement && (
            <Typography
              variant='body1'
              sx={{
                padding: '5px 1 1 5px',
                wordBreak: 'break-word',
                marginBottom: '1px',
                color: theme.palette.claimtext
              }}
            >
              {data.statement}
            </Typography>
          )}
        </CardContent>

        {img && (
          <Box sx={{ display: 'flex', justifyContent: 'center', m: '20px' }}>
            {img.includes('.mp4') ? (
              <video controls style={{ width: '100%', maxWidth: '500px', height: 'auto' }}>
                <source src={img} type='video/mp4' />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={img} alt={data.subject} style={{ width: '100%', maxWidth: '500px', height: 'auto' }} />
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', m: '20px' }}>
          {data.stars && (
            <Box
              sx={{
                display: 'flex',
                p: '4px',
                flexWrap: 'wrap',
                justifyContent: 'flex-end'
              }}
            >
              {Array.from({ length: data.stars }).map((_, index) => (
                <StarIcon
                  key={index}
                  sx={{
                    color: '#FFC107',
                    width: '3vw',
                    height: '3vw',
                    fontSize: '3vw',
                    maxWidth: '24px',
                    maxHeight: '24px'
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        <Box
          sx={{
            height: '1px',
            backgroundColor: '#E0E0E0',
            marginTop: '4px',
            borderRadius: '2px',
            width: '750px',
            mb: '10px'
          }}
        />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            position: 'relative',
            mt: '10px',
            mb: '10px',
            pl: '20px',
            pr: '20px'
          }}
        >
          <Box sx={{ flexGrow: 1 }}>
            {data.howKnown && (
              <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                How Known: {data.howKnown.replace(/_/g, ' ')}
              </Typography>
            )}
            {data.sourceURI && (
              <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                Source:{' '}
                <a
                  href={data.sourceURI}
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ color: theme.palette.link }}
                >
                  {data.sourceURI}
                </a>
              </Typography>
            )}
            {data.confidence !== undefined && (
              <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                Confidence: {data.confidence}
              </Typography>
            )}
            {data.amt && (
              <Typography variant='body2' sx={{ color: theme.palette.texts }}>
                Amount: ${data.amt}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  )
}

export default DonationReport
