import { Handle, Position } from '@xyflow/react'
import { Box, Typography, Avatar, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const Node = ({ data }: any) => {
  const theme = useTheme()
  
  return (
    <Box
      sx={{
        padding: '15px',
        borderRadius: '12px',
        background: theme.palette.menuBackground,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        minWidth: '180px',
        maxWidth: '250px',
      }}
    >
      <Handle type='target' position={Position.Top} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        {data.image && (
          <Avatar 
            src={data.image}
            alt={data.label}
            sx={{ width: 40, height: 40, border: `2px solid ${theme.palette.primary.main}` }}
          />
        )}
        <Tooltip title={data.raw?.descrip || ''}>
          <Typography 
            variant='h6'
            sx={{
              color: theme.palette.texts,
              fontSize: '0.9rem',
              fontWeight: 600,
              wordWrap: 'break-word',
              lineHeight: 1.2
            }}
          >
            {data.label}
          </Typography>
        </Tooltip>
      </Box>

      {data.raw?.entType && (
        <Typography
          variant='caption'
          sx={{
            color: theme.palette.maintext,
            backgroundColor: theme.palette.action.hover,
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.7rem'
          }}
        >
          {data.raw.entType}
        </Typography>
      )}

      <Handle type='source' position={Position.Bottom} />
    </Box>
  )
}

export default Node
