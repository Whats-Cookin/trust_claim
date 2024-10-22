import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Card, useMediaQuery, useTheme } from '@mui/material'
import placeholderWhite from '../../assets/imgplaceholderwhite.svg'
import RenderClaimDetails from '../ClaimDetails/RenderClaimDetails'

interface StartNodeProps {
  selectedClaim: any
  claimImg: string
}

export default function StartNode({ selectedClaim, claimImg }: StartNodeProps) {
  const theme = useTheme()
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'))
  return (
    <Box sx={{ marginRight: { sm: '20px' }, width: { sm: '50%' } }}>
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
          Claim Details
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
      <Card
        sx={{
          maxWidth: 'fit',
          height: 'fit',
          borderRadius: '20px',
          display: isMediumScreen ? 'column' : 'row',
          backgroundColor: theme.palette.cardBackground,
          backgroundImage: 'none',
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
          {selectedClaim && <RenderClaimDetails claimData={selectedClaim} theme={theme} />}
        </Box>
      </Card>
    </Box>
  )
}
