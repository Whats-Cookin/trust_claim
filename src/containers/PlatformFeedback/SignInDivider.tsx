import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

/** Figma: horizontal rule with “Sign in to submit” centered on the line. */
const SignInDivider = () => (
  <Box sx={{ position: 'relative', width: '100%', height: 16, my: 2.5 }}>
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        borderTop: '0.8px solid #E2E8F0'
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        top: 0,
        bgcolor: '#fff',
        px: 1
      }}
    >
      <Typography sx={{ fontSize: '12px', lineHeight: '16px', color: '#62748E', whiteSpace: 'nowrap' }}>
        Sign in to submit
      </Typography>
    </Box>
  </Box>
)

export default SignInDivider
