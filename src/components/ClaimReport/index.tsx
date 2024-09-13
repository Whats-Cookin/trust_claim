import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material'
import RenderClaimInfo from './RenderClaimInfo'
import { BACKEND_BASE_URL } from '../../utils/settings'
import StarIcon from '@mui/icons-material/Star'

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
        console.log('Fetched report data:', response.data)
      } catch (err) {
        setError('Failed to fetch report data')
        console.error('Error fetching report data:', err)
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
          padding: '20px'
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
          <Typography
            variant='h6'
            component='div'
            sx={{
              color: theme.palette.texts,
              textAlign: 'center',
              marginLeft: isMediumScreen ? '0' : '1rem',
              fontSize: '23px',
              fontWeight: 'bold',
              fontFamily: 'Montserrat'
            }}
          >
            Claim Report
            <Box
              sx={{
                height: '4px',
                backgroundColor: theme.palette.maintext,
                marginTop: '4px',
                borderRadius: '2px',
                width: '80%',
                fontFamily: 'Montserrat'
              }}
            />
          </Typography>
        </Box>
        <MyCard
          data={reportData.data.claim}
          theme={theme}
          isLargeScreen={isLargeScreen}
          setSelectedIndex={setSelectedIndex}
          handleMenuClose={() => setSelectedIndex(null)}
        />

        {reportData.data.validations.length > 0 && (
          <>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
              <Typography
                variant='h6'
                component='div'
                sx={{
                  color: theme.palette.texts,
                  textAlign: 'center',
                  marginLeft: isMediumScreen ? '0' : '1rem',
                  fontSize: '23px',
                  fontWeight: 'bold'
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
                variant='h6'
                component='div'
                sx={{
                  color: theme.palette.texts,
                  textAlign: 'center',
                  marginLeft: isMediumScreen ? '0' : '1rem',
                  fontSize: '23px',
                  fontWeight: 'bold'
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
                    theme={theme}
                    isLargeScreen={isLargeScreen}
                    setSelectedIndex={setSelectedIndex}
                    handleMenuClose={() => setSelectedIndex(null)}
                  />
                )
            )}
          </>
        )}
      </Box>
    </Box>
  )
}

function MyCard({
  data,
  theme,
  setSelectedIndex,
  handleMenuClose,
  isLargeScreen
}: Readonly<{
  data: any
  theme: any
  setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>
  handleMenuClose: () => void
  isLargeScreen: any
}>) {
  return (
    <Card
      sx={{
        minHeight: '200px',
        width: '100%',
        borderRadius: '20px',
        backgroundColor: theme.palette.cardBackground,
        backgroundImage: 'none',
        color: theme.palette.texts,
        marginBottom: '2rem',
        fontFamily: 'Montserrat'
      }}
    >
      {data.image ? (
        <Grid container spacing={isLargeScreen ? 4 : 2}>
          <Grid item xs={12} md={6}>
            <img src={data.image} alt={data.subject} style={{ width: '100%', height: 'auto' }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <CardContent>
              <RenderClaimInfo
                claim={data}
                index={-1}
                setSelectedIndex={setSelectedIndex}
                handleMenuClose={handleMenuClose}
              />
            </CardContent>

            {data.stars && <Stars stars={data.stars} theme={theme} />}
          </Grid>
        </Grid>
      ) : (
        <>
          <CardContent>
            <RenderClaimInfo
              claim={data}
              index={-1}
              setSelectedIndex={setSelectedIndex}
              handleMenuClose={handleMenuClose}
            />
          </CardContent>

          {data.stars && <Stars stars={data.stars} theme={theme} />}
        </>
      )}
    </Card>
  )
}

function Stars({ stars, theme }: Readonly<{ stars: number; theme: any }>) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        mt: '10px',
        mb: '10px',
        pl: '20px',
        pr: '20px',
        fontFamily: 'Montserrat'
      }}
    >
      <Box sx={{ flexGrow: 1 }} />
      <Box
        sx={{
          display: 'flex',
          p: '4px',
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }}
      >
        {Array.from({ length: stars }).map((_, index) => (
          <StarIcon
            key={`${stars}-${index}`}
            sx={{
              color: theme.palette.stars,
              width: '3vw',
              height: '3vw',
              fontSize: '3vw',
              minWidth: '18px',
              minHeight: '18px',
              maxWidth: '24px',
              maxHeight: '24px',
              fontFamily: 'Montserrat'
            }}
          />
        ))}
      </Box>
    </Box>
  )
}

export default DonationReport
