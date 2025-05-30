import { Box, Typography } from '@mui/material'
import { ShieldCheck, TrendingUp, Link as LinkIcon, Star, Award } from 'lucide-react'

const Badge = ({ claim }: { claim: string }) => {
  // Validation types
  const validationTypes = ['is_vouched_for', 'agree', 'verified', 'validated']
  // Impact types
  const impactTypes = ['funds_for_purpose', 'helped', 'impact']
  // Relationship types
  const relationshipTypes = ['same_as', 'related_to', 'owns']

  let bgColor = '#c0efd7' // default green
  let color = '#2d6a4f' // default green text
  let icon = <Award size={18} style={{ marginRight: 5 }} /> // default icon
  let label = 'Claim'

  if (validationTypes.includes(claim)) {
    bgColor = '#f8e8cc' // amber/yellow
    color = '#e08a00'
    icon = <ShieldCheck size={18} style={{ marginRight: 5 }} />
    label = 'Validation'
  } else if (impactTypes.includes(claim)) {
    bgColor = '#cce6ff' // blue
    color = '#0052e0'
    icon = <TrendingUp size={18} style={{ marginRight: 5 }} />
    label = 'Impact'
  } else if (relationshipTypes.includes(claim)) {
    bgColor = '#e8d4f8' // purple
    color = '#6b21a8'
    icon = <LinkIcon size={18} style={{ marginRight: 5 }} />
    label = 'Relationship'
  } else if (claim === 'rated') {
    bgColor = '#fff4d4' // yellow
    color = '#d97706'
    icon = <Star size={18} style={{ marginRight: 5 }} />
    label = 'Rated'
  } else if (claim) {
    // For any other claim types, use the claim name as label
    label = claim.charAt(0).toUpperCase() + claim.slice(1).replace(/_/g, ' ')
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 32,
        minWidth: 100,
        borderRadius: 16,
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
          fontSize: '14px',
          color
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

export default Badge
