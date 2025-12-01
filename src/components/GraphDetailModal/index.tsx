import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Button,
  Divider,
  useTheme
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import FeedOutlinedIcon from '@mui/icons-material/FeedOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import { Link } from 'react-router-dom'
import { BACKEND_BASE_URL } from '../../utils/settings'
import { checkAuth } from '../../utils/authUtils'
import Badge from '../../containers/feedOfClaim/Badge'
import { EntityType } from '../../types/entities'

interface GraphDetailModalProps {
  open: boolean
  onClose: () => void
  type: 'node' | 'edge'
  data: any
  startNode?: any
  endNode?: any
  onCenterNode?: (nodeId: string) => void
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

  if (!data) return null

  const renderNodeDetails = () => {
    // Clean image URL by removing query parameters
    const imageUrl = (data.image || data.thumbnail || '').replace(/\?.+$/, '')
    const isClaimNode = data.entType === EntityType.CLAIM || data.entityType === EntityType.CLAIM

    // For CLAIM nodes, get claim data from raw or nested claim object
    const claimData = data.raw?.claim || data.claim || data.raw || {}
    const claimId = data.claimId || data.raw?.claimId

    return (
      <>
        <Box sx={{ mb: 3 }}>
          {imageUrl && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box
                component='img'
                src={imageUrl}
                alt={data.name}
                sx={{
                  width: 120,
                  height: isClaimNode ? 'auto' : 120,
                  borderRadius: isClaimNode ? '8px' : '50%',
                  objectFit: 'cover',
                  boxShadow: 2
                }}
              />
            </Box>
          )}

          {/* For CLAIM nodes, show badge */}
          {isClaimNode && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Badge claim={claimData.claim || data.name || 'claim'} />
            </Box>
          )}

          <Typography variant='h6' align='center' gutterBottom>
            {data.name || data.label || 'Unknown'}
          </Typography>

          {data.entType && (
            <Typography variant='body2' color='text.secondary' align='center'>
              Type: {data.entType}
            </Typography>
          )}

          {/* CLAIM node specific details */}
          {isClaimNode && (
            <>
              {/* Statement */}
              {(claimData.statement || data.descrip) && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant='body1' sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                    "{claimData.statement || data.descrip}"
                  </Typography>
                </Box>
              )}

              {/* Rating stars if applicable */}
              {claimData.stars !== undefined && (
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Typography variant='h6' sx={{ color: theme.palette.stars || '#FCD34D' }}>
                    {'★'.repeat(claimData.stars)}
                    {'☆'.repeat(5 - claimData.stars)}
                  </Typography>
                </Box>
              )}

              {/* Metadata */}
              <Box sx={{ mt: 2 }}>
                {claimData.aspect && (
                  <Typography variant='body2' color='text.secondary' align='center'>
                    Aspect: {claimData.aspect}
                  </Typography>
                )}
                {claimData.confidence !== undefined && claimData.confidence !== null && (
                  <Typography variant='body2' color='text.secondary' align='center'>
                    Confidence: {claimData.confidence === 0 ? '0%' : `${Math.round(claimData.confidence * 100)}%`}
                  </Typography>
                )}
                {claimData.howKnown && (
                  <Typography variant='body2' color='text.secondary' align='center'>
                    How Known: {claimData.howKnown}
                  </Typography>
                )}
                {claimData.amt !== undefined && claimData.amt !== null && (
                  <Typography variant='body2' color='text.secondary' align='center'>
                    Amount: ${claimData.amt} {claimData.unit || ''}
                  </Typography>
                )}
              </Box>
            </>
          )}

          {data.nodeUri && (
            <Typography
              variant='body2'
              align='center'
              sx={{
                mt: 1,
                '& a': {
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }
              }}
            >
              URI:{' '}
              <a href={data.nodeUri} target='_blank' rel='noopener noreferrer'>
                {data.nodeUri}
              </a>
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            onClick={() => {
              if (onCenterNode && data.id) {
                onCenterNode(data.id)
              }
              onClose()
            }}
            variant='text'
            sx={{
              fontSize: '12px',
              p: '4px 8px',
              color: theme.palette.sidecolor || '#666',
              '&:hover': {
                backgroundColor: theme.palette.cardsbuttons || '#f5f5f5'
              }
            }}
          >
            Center this Node
          </Button>
          <Button
            onClick={onClose}
            variant='text'
            sx={{
              fontSize: '12px',
              p: '4px 8px',
              color: theme.palette.sidecolor || '#666',
              '&:hover': {
                backgroundColor: theme.palette.cardsbuttons || '#f5f5f5'
              }
            }}
          >
            Return to Graph
          </Button>

          {/* CLAIM nodes get Evidence and Graph View buttons */}
          {isClaimNode && claimId && (
            <>
              <Button
                component={Link}
                to={`/report/${claimId}`}
                startIcon={<FeedOutlinedIcon />}
                variant='text'
                onClick={onClose}
                sx={{
                  fontSize: '12px',
                  p: '4px 8px',
                  color: theme.palette.sidecolor || '#666',
                  '&:hover': {
                    backgroundColor: theme.palette.cardsbuttons || '#f5f5f5'
                  }
                }}
              >
                Evidence
              </Button>
              <Button
                component={Link}
                to={`/explore/${claimId}`}
                startIcon={<ShareOutlinedIcon />}
                variant='text'
                onClick={onClose}
                sx={{
                  fontSize: '12px',
                  p: '4px 8px',
                  color: theme.palette.sidecolor || '#666',
                  '&:hover': {
                    backgroundColor: theme.palette.cardsbuttons || '#f5f5f5'
                  }
                }}
              >
                Graph View
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
              sx={{
                fontSize: '12px',
                p: '4px 8px',
                color: theme.palette.sidecolor || '#666',
                '&:hover': {
                  backgroundColor: theme.palette.cardsbuttons || '#f5f5f5'
                }
              }}
            >
              {isClaimNode ? 'Validate/Reject' : 'Add Attestation'}
            </Button>
          )}
        </Box>
      </>
    )
  }

  const renderEdgeDetails = () => {
    const claim = data.claim || data
    const claimType = claim.claim || data.label || 'claim'

    // Helper to extract name from URI
    const extractName = (uri: string) => {
      const regex = /linkedin\.com\/(?:in|company)\/([^\\/]+)(?:\/.*)?/
      const match = regex.exec(uri)
      return match ? match[1].replace(/-/g, ' ') : uri
    }

    // Export function
    const handleExport = () => {
      const exportData = {
        ...claim,
        _metadata: {
          exportedAt: new Date().toISOString(),
          claimId: claim.id || data.claimId
        }
      }
      const jsonString = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `claim_${claim.id || data.claimId}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    return (
      <>
        <Box sx={{ mb: 3 }}>
          {/* Claim Type Badge */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Badge claim={claimType} />
          </Box>

          {/* Subject */}
          <Box sx={{ mb: 2 }}>
            <Typography variant='caption' color='text.secondary'>
              Subject
            </Typography>
            <Typography variant='body1'>{startNode?.name || extractName(claim.subject || '')}</Typography>
          </Box>

          {/* Statement */}
          {claim.statement && (
            <Box sx={{ mb: 2 }}>
              <Typography variant='body1' sx={{ fontStyle: 'italic' }}>
                "{claim.statement}"
              </Typography>
            </Box>
          )}

          {/* Rating stars if applicable */}
          {claim.stars !== undefined && (
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Typography variant='h6' sx={{ color: theme.palette.stars || '#FCD34D' }}>
                {'★'.repeat(claim.stars)}
                {'☆'.repeat(5 - claim.stars)}
              </Typography>
            </Box>
          )}

          {/* Source - subtle style like in feed */}
          {claim.sourceURI && (
            <Typography
              variant='body2'
              sx={{
                fontSize: '12px',
                color: theme.palette.date || '#666',
                fontFamily: 'Roboto, sans-serif',
                mb: 2
              }}
            >
              source: {extractName(claim.sourceURI)}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Metadata section */}
          <Box sx={{ mb: 2 }}>
            {claim.aspect && (
              <Typography variant='body2' sx={{ mb: 0.5 }}>
                Aspect: {claim.aspect}
              </Typography>
            )}
            {claim.confidence !== undefined && claim.confidence !== null && (
              <Typography variant='body2' sx={{ mb: 0.5 }}>
                Confidence: {claim.confidence === 0 ? '0%' : `${Math.round(claim.confidence * 100)}%`}
              </Typography>
            )}
            {claim.effectiveDate && (
              <Typography variant='body2' sx={{ mb: 0.5 }}>
                Date:{' '}
                {new Date(claim.effectiveDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            )}
            {claim.howKnown && (
              <Typography variant='body2' sx={{ mb: 0.5 }}>
                How Known: {claim.howKnown}
              </Typography>
            )}
            {claim.score !== undefined && claim.score !== null && (
              <Typography variant='body2' sx={{ mb: 0.5 }}>
                Score: {claim.score}
              </Typography>
            )}
            {claim.amt !== undefined && claim.amt !== null && (
              <Typography variant='body2' sx={{ mb: 0.5 }}>
                Amount: ${claim.amt} {claim.unit || ''}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Action buttons - same style as feed */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          {checkAuth() && (
            <Button
              component={Link}
              to={`/validate?subject=${BACKEND_BASE_URL}/claims/${claim.id || data.claimId}`}
              startIcon={<VerifiedOutlinedIcon />}
              variant='text'
              onClick={onClose}
              sx={{
                fontSize: '12px',
                p: '4px 8px',
                color: theme.palette.sidecolor || '#666',
                '&:hover': {
                  backgroundColor: theme.palette.cardsbuttons || '#f5f5f5'
                }
              }}
            >
              Validate
            </Button>
          )}
          <Button
            component={Link}
            to={`/report/${claim.id || data.claimId}`}
            startIcon={<FeedOutlinedIcon />}
            variant='text'
            onClick={onClose}
            sx={{
              fontSize: '12px',
              p: '4px 8px',
              color: theme.palette.sidecolor || '#666',
              '&:hover': {
                backgroundColor: theme.palette.cardsbuttons || '#f5f5f5'
              }
            }}
          >
            Evidence
          </Button>
          <Button
            component={Link}
            to={`/explore/${claim.id || data.claimId}`}
            startIcon={<ShareOutlinedIcon />}
            variant='text'
            onClick={onClose}
            sx={{
              fontSize: '12px',
              p: '4px 8px',
              color: theme.palette.sidecolor || '#666',
              '&:hover': {
                backgroundColor: theme.palette.cardsbuttons || '#f5f5f5'
              }
            }}
          >
            Graph View
          </Button>
          <Button
            startIcon={<SystemUpdateAltIcon />}
            variant='text'
            onClick={handleExport}
            sx={{
              fontSize: '12px',
              p: '4px 8px',
              color: theme.palette.sidecolor || '#666',
              '&:hover': {
                backgroundColor: theme.palette.cardsbuttons || '#f5f5f5'
              }
            }}
          >
            Export
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
