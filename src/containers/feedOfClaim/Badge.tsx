import { Chip } from '@mui/material'
import { ShieldCheck, TrendingUp, Link as LinkIcon, Star, Award } from 'lucide-react'
import { lightColors, darkColors, neutralColors } from '../../theme/colors'

// Same hue per claim kind as the graph edges (edgeColors): validation green, impact amber,
// rating cyan, relationship purple; anything else neutral.
const kinds = {
  validation: { bg: lightColors.green[10], fg: darkColors.green, Icon: ShieldCheck, label: 'Validation' },
  impact: { bg: lightColors.amber[10], fg: darkColors.amber, Icon: TrendingUp, label: 'Impact' },
  relationship: { bg: lightColors.purple[10], fg: darkColors.purple, Icon: LinkIcon, label: 'Relationship' },
  rated: { bg: lightColors.cyan[10], fg: darkColors.cyan, Icon: Star, label: 'Rated' },
  other: { bg: neutralColors.gray[100], fg: neutralColors.gray[700], Icon: Award, label: 'Claim' }
}

const validationTypes = ['is_vouched_for', 'agree', 'verified', 'validated']
const impactTypes = ['funds_for_purpose', 'helped', 'impact']
const relationshipTypes = ['same_as', 'related_to', 'owns']

const Badge = ({ claim }: { claim: string }) => {
  const kind = validationTypes.includes(claim)
    ? kinds.validation
    : impactTypes.includes(claim)
    ? kinds.impact
    : relationshipTypes.includes(claim)
    ? kinds.relationship
    : claim === 'rated'
    ? kinds.rated
    : kinds.other
  // For any other claim types, use the claim name as label
  const label =
    kind === kinds.other && claim ? claim.charAt(0).toUpperCase() + claim.slice(1).replace(/_/g, ' ') : kind.label
  const { Icon } = kind

  return (
    <Chip
      size='small'
      icon={<Icon size={16} color={kind.fg} />}
      label={label}
      sx={{ backgroundColor: kind.bg, color: kind.fg, fontWeight: 600, '& .MuiChip-icon': { color: kind.fg } }}
    />
  )
}

export default Badge
