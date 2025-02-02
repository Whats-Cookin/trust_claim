import { Handle, Position } from '@xyflow/react'
import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const CentralNode = ({ data }: any) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 25px',
        borderRadius: '12px',
        backgroundColor: '#96B1AC',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        minWidth: '200px',
        textAlign: 'center'
      }}
    >
      <Handle type='target' position={Position.Top} />
      <Typography
        variant='h6'
        sx={{
          color: theme.palette.texts,
          fontWeight: 600,
          fontSize: '1.1rem',
          marginBottom: '8px'
        }}
      >
        {data.mainLabel}
      </Typography>
      <Typography
        variant='body1'
        sx={{
          color: theme.palette.maintext,
          fontSize: '0.9rem'
        }}
      >
        {data.subLabel}
      </Typography>
      {data.metrics && (
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Typography variant='caption' sx={{ color: theme.palette.texts, fontWeight: 'bold' }}>
            {data.metrics[0]}
          </Typography>
          <Typography variant='caption' sx={{ color: theme.palette.texts }}>
            {data.metrics[1]}
          </Typography>
        </Box>
      )}
      <Handle type='source' position={Position.Bottom} />
    </Box>
  )
}

export default CentralNode
