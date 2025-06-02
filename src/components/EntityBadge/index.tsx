import React from 'react'
import { Chip, Tooltip, Box, useTheme } from '@mui/material'
import { EntityType, getEntityColor, getEntityLabel, EntityMetadata } from '../../types/entities'

interface EntityBadgeProps {
  entityType?: EntityType | string
  type?: EntityType | string // For backward compatibility
  size?: 'small' | 'medium'
  variant?: 'filled' | 'outlined'
  onClick?: () => void
  label?: string
}

export const EntityBadge: React.FC<EntityBadgeProps> = ({
  entityType,
  type,
  size = 'small',
  variant = 'filled',
  onClick,
  label
}) => {
  const theme = useTheme()

  // Handle string types from API
  const typeValue = (entityType || type) as EntityType
  if (!EntityMetadata[typeValue]) {
    return null
  }

  const metadata = EntityMetadata[typeValue]

  const chipStyle = {
    backgroundColor: variant === 'filled' ? getEntityColor(typeValue) : 'transparent',
    color: variant === 'filled' ? 'white' : getEntityColor(typeValue),
    border: variant === 'outlined' ? `1px solid ${getEntityColor(typeValue)}` : 'none',
    fontWeight: 600,
    fontSize: size === 'small' ? '0.7rem' : '0.8rem',
    height: size === 'small' ? 20 : 24,
    '& .MuiChip-label': {
      padding: '0 8px'
    },
    '&:hover': onClick
      ? {
          backgroundColor:
            variant === 'filled'
              ? theme.palette.mode === 'dark'
                ? theme.palette.grey[700]
                : theme.palette.grey[300]
              : `${getEntityColor(typeValue)}20`,
          cursor: 'pointer'
        }
      : {}
  }

  return (
    <Tooltip title={metadata.description} arrow>
      <Chip label={label || getEntityLabel(typeValue)} size={size} sx={chipStyle} onClick={onClick} />
    </Tooltip>
  )
}

export default EntityBadge
