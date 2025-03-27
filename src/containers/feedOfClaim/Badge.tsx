import { Box, Typography } from '@mui/material'
import { Medal, ShieldCheck, CircleCheck } from 'lucide-react'

const Badge = ({ claim }: { claim: string }) => {
  const bgColor = claim === 'credential' ? '#cce6ff' : claim === 'validated' ? '#f8e8cc' : '#c0efd7'

  const color = claim === 'credential' ? '#0052e0' : claim === 'validated' ? '#e08a00' : '#2d6a4f'

  const icon =
    claim === 'credential' ? (
      <Medal size={22} style={{ marginRight: 5 }} />
    ) : claim === 'validated' ? (
      <ShieldCheck size={22} style={{ marginRight: 5 }} />
    ) : (
      <CircleCheck size={22} style={{ marginRight: 5 }} />
    )

  const label = claim === 'validated' ? 'Validation' : claim.charAt(0).toUpperCase() + claim.slice(1) || 'Claim'

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        minWidth: 110,
        borderRadius: 20,
        px: 2,
        backgroundColor: bgColor,
        color,
        fontWeight: 500,
        overflow: 'hidden'
      }}
    >
      {icon}
      <Typography
        variant='body2'
        sx={{
          fontWeight: 600,
          fontSize: '16px',
          fontFamily: 'Roboto',
          color
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

export default Badge
