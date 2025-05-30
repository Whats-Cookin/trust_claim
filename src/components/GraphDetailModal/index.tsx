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
import { Link } from 'react-router-dom'
import { BACKEND_BASE_URL } from '../../utils/settings'

interface GraphDetailModalProps {
  open: boolean
  onClose: () => void
  type: 'node' | 'edge'
  data: any
  startNode?: any
  endNode?: any
}

const GraphDetailModal: React.FC<GraphDetailModalProps> = ({
  open,
  onClose,
  type,
  data,
  startNode,
  endNode
}) => {
  const theme = useTheme()

  if (!data) return null

  const renderNodeDetails = () => (
    <>
      <Box sx={{ mb: 3 }}>
        {data.image && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              component="img"
              src={data.image}
              alt={data.name}
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: 2
              }}
            />
          </Box>
        )}
        <Typography variant="h6" align="center" gutterBottom>
          {data.name || data.label || 'Unknown'}
        </Typography>
        {data.entType && (
          <Typography variant="body2" color="text.secondary" align="center">
            Type: {data.entType}
          </Typography>
        )}
        {data.nodeUri && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            URI: {data.nodeUri}
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          component={Link}
          to={`/claim`}
          variant="outlined"
          onClick={onClose}
        >
          View Details
        </Button>
      </Box>
    </>
  )

  const renderEdgeDetails = () => {
    const claim = data.claim || data
    const isSourceEdge = data.label === 'source' || claim.claim === 'source'
    
    return (
      <>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom align="center">
            {claim.claim || data.label || 'Relationship'}
          </Typography>
          
          {/* Source URL at top ONLY if this is a 'source' edge */}
          {isSourceEdge && claim.sourceURI && (
            <Box sx={{ 
              mb: 2, 
              p: 1.5, 
              backgroundColor: theme.palette.action.hover,
              borderRadius: 1,
              textAlign: 'center'
            }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Source URL
              </Typography>
              <Typography 
                variant="body2" 
                component="a" 
                href={claim.sourceURI} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {claim.sourceURI}
              </Typography>
            </Box>
          )}
          
          {claim.aspect && (
            <Typography variant="subtitle2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Aspect: {claim.aspect}
            </Typography>
          )}
          
          {claim.statement && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {claim.statement}
            </Typography>
          )}

          {/* Rating information */}
          {(claim.stars !== undefined || claim.score !== undefined) && (
            <Box sx={{ textAlign: 'center', my: 2 }}>
              {claim.stars !== undefined && (
                <Typography variant="h6" sx={{ color: '#FCD34D', mb: 1 }}>
                  {'★'.repeat(claim.stars)}{'☆'.repeat(5 - claim.stars)}
                </Typography>
              )}
              {claim.score !== undefined && claim.score !== null && (
                <Typography variant="body2" color="text.secondary">
                  Score: {claim.score.toFixed(2)} / 1.00
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">From</Typography>
              <Typography variant="body2">{startNode?.name || 'Unknown'}</Typography>
            </Box>
            <Typography variant="h6" sx={{ mx: 2 }}>→</Typography>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">To</Typography>
              <Typography variant="body2">{endNode?.name || 'Unknown'}</Typography>
            </Box>
          </Box>

          {claim.confidence !== undefined && (
            <Typography variant="body2" sx={{ mt: 2 }} align="center">
              Confidence: {Math.round(claim.confidence * 100)}%
            </Typography>
          )}

          {claim.effectiveDate && (
            <Typography variant="body2" sx={{ mt: 1 }} align="center">
              Date: {new Date(claim.effectiveDate).toLocaleDateString()}
            </Typography>
          )}

          {/* Source URL at bottom for non-source edges */}
          {!isSourceEdge && claim.sourceURI && (
            <Typography variant="body2" sx={{ mt: 1 }} align="center">
              Source: <a href={claim.sourceURI} target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.primary?.main || '#1976d2' }}>{claim.sourceURI}</a>
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            component={Link}
            to={`/validate?subject=${BACKEND_BASE_URL}/claims/${claim.id || data.claimId}`}
            variant="outlined"
            onClick={onClose}
          >
            Validate
          </Button>
          <Button
            component={Link}
            to={`/report/${claim.id || data.claimId}`}
            variant="contained"
            onClick={onClose}
          >
            View Evidence
          </Button>
        </Box>
      </>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
      
      <DialogTitle sx={{ pr: 6 }}>
        {type === 'node' ? 'Node Details' : 'Claim Details'}
      </DialogTitle>
      
      <DialogContent>
        {type === 'node' ? renderNodeDetails() : renderEdgeDetails()}
      </DialogContent>
    </Dialog>
  )
}

export default GraphDetailModal
