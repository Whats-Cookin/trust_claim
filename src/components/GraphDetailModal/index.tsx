import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import { Link } from 'react-router-dom'
import { checkAuth } from '../../utils/authUtils'
import Badge from '../../containers/feedOfClaim/Badge'
import { EntityType } from '../../types/entities'
import axios from '../../axiosInstance'

interface GraphDetailModalProps {
  open: boolean
  onClose: () => void
  type: 'node' | 'edge'
  data: any
  startNode?: any
  endNode?: any
  onCenterNode?: (nodeId: string) => void
}

// Truncate text to fit popup
const truncateText = (text: string, maxLength: number = 150): string => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Format field name for display
const formatFieldName = (field: string): string => {
  const fieldLabels: Record<string, string> = {
    howKnown: 'How Known',
    effectiveDate: 'Effective Date',
    sourceURI: 'Source',
    amt: 'Amount',
    dateObserved: 'Date Observed',
    howMeasured: 'How Measured',
    intendedAudience: 'Intended Audience',
    respondAt: 'Respond At'
  }
  return fieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1)
}

// Check if a value is displayable (non-null, non-empty)
const isDisplayable = (value: any): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string' && value.trim() === '') return false
  return true
}

const GraphDetailModal: React.FC<GraphDetailModalProps> = ({
  open,
  onClose,
  type,
  data,
  startNode,
  endNode,
  onCenterNode
}) => {
  const theme = useTheme()
  const [claimData, setClaimData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Get claimId from node data
  const claimId = data?.claimId || data?.raw?.claimId

  // Fetch claim data when modal opens for a CLAIM node
  useEffect(() => {
    const isClaimNode = data?.entType === EntityType.CLAIM || data?.entityType === EntityType.CLAIM

    if (open && type === 'node' && isClaimNode && claimId && !claimData) {
      setLoading(true)
      axios
        .get(`/api/claims/${claimId}`)
        .then(res => {
          setClaimData(res.data)
        })
        .catch(err => {
          console.error('Failed to fetch claim data:', err)
        })
        .finally(() => {
          setLoading(false)
        })
    }

    // Reset claim data when modal closes
    if (!open) {
      setClaimData(null)
    }
  }, [open, type, data, claimId])

  if (!data) return null

  const renderNodeDetails = () => {
    // Clean image URL by removing query parameters
    const imageUrl = (data.image || data.thumbnail || '').replace(/\?.+$/, '')
    const isClaimNode = data.entType === EntityType.CLAIM || data.entityType === EntityType.CLAIM

    // Use fetched claim data, or fall back to what's available on the node
    const displayClaimData = claimData || data.claim || data.raw?.claim || {}

    // Fields to display for CLAIM nodes (in order of priority)
    const claimFields = [
      { key: 'statement', label: 'Statement' },
      { key: 'subject', label: 'Subject' },
      { key: 'object', label: 'Object' },
      { key: 'aspect', label: 'Aspect' },
      { key: 'confidence', label: 'Confidence', format: (v: number) => `${Math.round(v * 100)}%` },
      { key: 'stars', label: 'Rating', format: (v: number) => '★'.repeat(v) + '☆'.repeat(5 - v) },
      { key: 'howKnown', label: 'How Known' },
      { key: 'effectiveDate', label: 'Date', format: (v: string) => new Date(v).toLocaleDateString() },
      { key: 'amt', label: 'Amount', format: (v: number, d: any) => `$${v}${d.unit ? ' ' + d.unit : ''}` },
      { key: 'sourceURI', label: 'Source', format: (v: string) => truncateText(v, 50) },
      { key: 'author', label: 'Author' },
      { key: 'score', label: 'Score', format: (v: number) => v.toFixed(2) }
    ]

    return (
      <>
        <Box sx={{ mb: 2 }}>
          {/* Image for non-claim nodes */}
          {imageUrl && !isClaimNode && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box
                component='img'
                src={imageUrl}
                alt={data.name}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: 2
                }}
              />
            </Box>
          )}

          {/* For CLAIM nodes, show badge with claim type */}
          {isClaimNode && isDisplayable(displayClaimData.claim) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Badge claim={displayClaimData.claim} />
            </Box>
          )}

          {/* Node name/title */}
          <Typography variant='h6' align='center' gutterBottom sx={{ fontSize: '1.1rem' }}>
            {truncateText(data.name || data.label || displayClaimData.claim || 'Unknown', 80)}
          </Typography>

          {/* Entity type for non-claim nodes */}
          {!isClaimNode && data.entType && (
            <Typography variant='body2' color='text.secondary' align='center' sx={{ mb: 1 }}>
              {data.entType}
            </Typography>
          )}

          {/* CLAIM node: show loading or fields */}
          {isClaimNode && loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {/* CLAIM node: show available fields dynamically */}
          {isClaimNode && !loading && (
            <Box sx={{ mt: 2 }}>
              {claimFields.map(({ key, label, format }) => {
                const value = displayClaimData[key]
                if (!isDisplayable(value)) return null

                const displayValue = format ? format(value, displayClaimData) : truncateText(String(value), 100)

                return (
                  <Typography
                    key={key}
                    variant='body2'
                    sx={{ mb: 0.5, fontSize: '0.85rem' }}
                  >
                    <Box component='span' sx={{ color: 'text.secondary' }}>{label}:</Box>{' '}
                    {key === 'stars' ? (
                      <Box component='span' sx={{ color: '#FCD34D' }}>{displayValue}</Box>
                    ) : (
                      displayValue
                    )}
                  </Typography>
                )
              })}
            </Box>
          )}

          {/* URI link for non-claim nodes */}
          {!isClaimNode && data.nodeUri && (
            <Typography
              variant='body2'
              align='center'
              sx={{
                mt: 1,
                fontSize: '0.8rem',
                '& a': {
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }
              }}
            >
              <a href={data.nodeUri} target='_blank' rel='noopener noreferrer'>
                {truncateText(data.nodeUri, 60)}
              </a>
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            onClick={() => {
              if (onCenterNode && data.id) {
                onCenterNode(data.id)
              }
              onClose()
            }}
            variant='text'
            size='small'
            sx={{
              fontSize: '11px',
              p: '3px 8px',
              color: theme.palette.sidecolor || '#666',
              '&:hover': { backgroundColor: theme.palette.cardsbuttons || '#f5f5f5' }
            }}
          >
            Center
          </Button>

          {/* CLAIM nodes: Evidence and Graph View buttons */}
          {isClaimNode && claimId && (
            <>
              <Button
                component={Link}
                to={`/report/${claimId}`}
                startIcon={<FeedOutlinedIcon sx={{ fontSize: 14 }} />}
                variant='text'
                size='small'
                onClick={onClose}
                sx={{
                  fontSize: '11px',
                  p: '3px 8px',
                  color: theme.palette.sidecolor || '#666',
                  '&:hover': { backgroundColor: theme.palette.cardsbuttons || '#f5f5f5' }
                }}
              >
                Details
              </Button>
              <Button
                component={Link}
                to={`/explore/${claimId}`}
                startIcon={<ShareOutlinedIcon sx={{ fontSize: 14 }} />}
                variant='text'
                size='small'
                onClick={onClose}
                sx={{
                  fontSize: '11px',
                  p: '3px 8px',
                  color: theme.palette.sidecolor || '#666',
                  '&:hover': { backgroundColor: theme.palette.cardsbuttons || '#f5f5f5' }
                }}
              >
                Explore
              </Button>
            </>
          )}

          {checkAuth() && (
            <Button
              component={Link}
              to={
                isClaimNode
                  ? `/validate?subject=${encodeURIComponent(data.nodeUri || '')}`
                  : `/claim?subject=${encodeURIComponent(data.nodeUri || '')}&name=${encodeURIComponent(
                      data.name || data.label || ''
                    )}`
              }
              onClick={onClose}
              variant='text'
              size='small'
              sx={{
                fontSize: '11px',
                p: '3px 8px',
                color: theme.palette.sidecolor || '#666',
                '&:hover': { backgroundColor: theme.palette.cardsbuttons || '#f5f5f5' }
              }}
            >
              {isClaimNode ? 'Validate' : 'Add Claim'}
            </Button>
          )}
        </Box>
      </>
    )
  }

  const renderEdgeDetails = () => {
    // Edges are now structural relationships only: subject, object, source
    // They connect a CLAIM node to an entity node
    const edgeLabel = data.label || 'relationship'

    // The startNode is the CLAIM node, endNode is the entity
    const claimNode = startNode
    const entityNode = endNode

    // Human-readable description of the relationship
    const getRelationshipDescription = () => {
      const entityName = entityNode?.name || entityNode?.label || 'Entity'
      const claimName = claimNode?.name || claimNode?.label || 'Claim'

      switch (edgeLabel.toLowerCase()) {
        case 'subject':
          return `"${truncateText(entityName, 40)}" is the subject of this claim`
        case 'object':
          return `"${truncateText(entityName, 40)}" is the object of this claim`
        case 'source':
          return `"${truncateText(entityName, 40)}" is the source of this claim`
        default:
          return `"${truncateText(entityName, 40)}" is connected to "${truncateText(claimName, 40)}"`
      }
    }

    // Get a more descriptive label
    const getLabelDisplay = () => {
      switch (edgeLabel.toLowerCase()) {
        case 'subject':
          return 'Subject'
        case 'object':
          return 'Object'
        case 'source':
          return 'Source'
        default:
          return edgeLabel
      }
    }

    return (
      <>
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          {/* Relationship type badge */}
          <Box
            sx={{
              display: 'inline-block',
              px: 2,
              py: 0.5,
              mb: 2,
              borderRadius: 1,
              backgroundColor: theme.palette.mode === 'dark' ? '#374151' : '#E5E7EB',
              color: theme.palette.text.primary
            }}
          >
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              {getLabelDisplay()} Relationship
            </Typography>
          </Box>

          {/* Human-readable description */}
          <Typography variant='body1' sx={{ mb: 2, fontStyle: 'italic' }}>
            {getRelationshipDescription()}
          </Typography>

          {/* Show entity info */}
          {entityNode && (
            <Box sx={{ mt: 2, p: 1.5, borderRadius: 1, backgroundColor: theme.palette.action?.hover || '#f5f5f5' }}>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
                {entityNode.entType || 'Entity'}
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                {truncateText(entityNode.name || entityNode.label || 'Unknown', 60)}
              </Typography>
              {entityNode.nodeUri && (
                <Typography
                  variant='caption'
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    color: 'text.secondary',
                    wordBreak: 'break-all'
                  }}
                >
                  {truncateText(entityNode.nodeUri, 50)}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button
            onClick={onClose}
            variant='text'
            size='small'
            sx={{
              fontSize: '11px',
              p: '3px 8px',
              color: theme.palette.sidecolor || '#666',
              '&:hover': { backgroundColor: theme.palette.cardsbuttons || '#f5f5f5' }
            }}
          >
            Close
          </Button>
        </Box>
      </>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          position: 'relative'
        }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'text.secondary'
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogTitle sx={{ pr: 6 }}>{type === 'node' ? 'Node Details' : 'Claim'}</DialogTitle>

      <DialogContent>{type === 'node' ? renderNodeDetails() : renderEdgeDetails()}</DialogContent>
    </Dialog>
  )
}

export default GraphDetailModal
