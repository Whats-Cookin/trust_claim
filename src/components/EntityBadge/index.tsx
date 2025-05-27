import React from 'react'
import { Chip, Tooltip, Box, useTheme } from '@mui/material'
import { 
  EntityType, 
  getEntityColor, 
  getEntityLabel,
  EntityMetadata 
} from '../../types/entities'

interface EntityBadgeProps {
  type: EntityType | string
  size?: 'small' | 'medium'
  variant?: 'filled' | 'outlined'
  onClick?: () => void
}

export const EntityBadge: React.FC<EntityBadgeProps> = ({
  type,
  size = 'small',
  variant = 'filled',
  onClick
}) => {
  const theme = useTheme()
  
  // Handle string types from API
  const entityType = type as EntityType
  if (!EntityMetadata[entityType]) {
    return null
  }
  
  const metadata = EntityMetadata[entityType]
  
  const chipStyle = {
    backgroundColor: variant === 'filled' ? getEntityColor(entityType) : 'transparent',
    color: variant === 'filled' ? 'white' : getEntityColor(entityType),
    border: variant === 'outlined' ? `1px solid ${getEntityColor(entityType)}` : 'none',
    fontWeight: 600,
    fontSize: size === 'small' ? '0.7rem' : '0.8rem',
    height: size === 'small' ? 20 : 24,
    '& .MuiChip-label': {
      padding: '0 8px'
    },
    '&:hover': onClick ? {
      backgroundColor: variant === 'filled' 
        ? theme.palette.mode === 'dark' 
          ? theme.palette.grey[700]
          : theme.palette.grey[300]
        : `${getEntityColor(entityType)}20`,
      cursor: 'pointer'
    } : {}
  }

  return (
    <Tooltip title={metadata.description} arrow>
      <Chip 
        label={getEntityLabel(entityType)}
        size={size}
        sx={chipStyle}
        onClick={onClick}
      />
    </Tooltip>
  )
}

export default EntityBadge
