import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Card, useMediaQuery, useTheme } from '@mui/material'
import RenderClaimDetails from '../../containers/ClaimDetails/RenderClaimDetails'

interface EndNodeProps {
  selectedClaim: any
  claimImg: string
}

export default function EndNode({ selectedClaim, claimImg }: EndNodeProps) {
  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))
  return (
    <Box sx={{ width: { sm: '50%' }, mt: { xs: '10px', sm: '0px' } }}>
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'left', mb: '20px' }}>
        <Typography
          variant='body1'
          sx={{
            color: theme.palette.texts,
            textAlign: 'center',
            marginLeft: isMediumScreen ? '0' : '1rem'
          }}
        >
          Node Details
          <Box
            sx={{
              width: '96px',
              height: '5px',
              backgroundColor: theme.palette.maintext,
              marginTop: '4px',
              borderRadius: '4px'
            }}
          />
        </Typography>
      </Box>
      <Card
        sx={{
          borderRadius: '20px',
          display: isMediumScreen ? 'column' : 'row',
          backgroundColor: theme.palette.cardBackground,
          color: theme.palette.texts
        }}
      >
        {claimImg && (
          <Box
            sx={{
              border: '20px ',
              borderRadius: '20px',
              height: { xs: '130px', sm: '270px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.palette.input,
              textWrap: 'wrap',
              margin: '15px'
            }}
          >
            <Box
              component='img'
              src={claimImg}
              alt='claim image'
              sx={{ maxWidth: { xs: '40%', sm: '100%' }, maxHeight: { xs: '40%', sm: '100%' } }}
            />
          </Box>
        )}
        <Box
          sx={{
            width: { lg: '98%', md: '98%', sm: '98%', xs: '95%' },
            height: claimImg ? 150 : 450,
            m: '10px',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '10px'
            },
            '&::-webkit-scrollbar-track': {
              background: theme.palette.pageBackground,
              borderRadius: '10px'
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.menuBackground,
              borderRadius: '10px'
            }
          }}
        >
          <Typography variant='body2'>
            {selectedClaim && <RenderClaimDetails claimData={selectedClaim} theme={theme} />}
          </Typography>
        </Box>
      </Card>
    </Box>
  )
}
