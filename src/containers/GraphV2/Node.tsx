import { Handle, Position } from '@xyflow/react'
import { Box, Typography, Avatar } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const PersonNode = ({ data }: any) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Handle type='target' position={Position.Top} />
      <Avatar
        src={data.image}
        alt={data.label}
        sx={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          marginBottom: '8px',
          border : '2px solid #96B1AC', // Teal border for avatar
        }}
      />
      <Box
        sx={{
          padding: '8px 15px',
          borderRadius: '8px',
          backgroundColor: "#96B1AC", // Teal background for text box
          textAlign: 'center',
        }}
      >
        <Typography
          variant='subtitle1'
          sx={{
            color: theme.palette.texts, // White text
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {data.label}
        </Typography>
        <Typography
          variant='caption'
          sx={{
            color: theme.palette.maintext, // Lighter text for job title
            fontSize: '0.75rem',
          }}
        >
          {data.jobTitle}
        </Typography>
      </Box>
      <Handle type='source' position={Position.Bottom} />
    </Box>
  )
}

export default PersonNode