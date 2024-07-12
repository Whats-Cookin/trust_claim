import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import MUIModal from '@mui/material/Modal'
import { camelCaseToSimpleString } from '../../utils/string.utils'
import { useTheme } from '@mui/material'

interface ModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  selectedClaim: any
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const Modal: React.FC<ModalProps> = ({ open, setOpen, selectedClaim }) => {
  const handleClose = () => setOpen(false)
  const theme = useTheme()
  if (!selectedClaim) return null
  const excludedFields = ['id', 'userId', 'issuerId', 'issuerIdType', 'createdAt', 'lastUpdatedAt']

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return text.slice(0, length) + '...'
  }

  const [showFullText, setShowFullText] = useState(false)

  return (
    <MUIModal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          height: 'auto',
          maxHeight: '58.233vh',
          backgroundColor: theme.palette.pageBackground,
          color: theme.palette.texts,
          borderRadius: '30px 30px 0 0',
          padding: '3vh 3vw 3vh 3vw',
          overflow: 'auto'
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
          <Typography
            variant='h6'
            component='div'
            sx={{
              color: theme.palette.texts,
              textAlign: 'center',
              fontSize: 'clamp(14px, 5vw, 32px)',
              fontWeight: 'bold'
            }}
          >
            Claim Details
            <Box
              sx={{
                height: '4px',
                backgroundColor: theme.palette.maintext,
                marginTop: '4px',
                borderRadius: '2px',
                width: '100%'
              }}
            />
          </Typography>
        </Box>

        {selectedClaim &&
          Object.keys(selectedClaim).map((key: string) => {
            let value = selectedClaim[key]
            if (excludedFields.includes(key) || value == null || value === '') return null
            if (key === 'effectiveDate') value = formatDate(value) // Format the date
            const displayText = key === 'statement' && !showFullText ? truncateText(value, 60) : value

            return (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  columnGap: '2vw',
                  padding: '5px 10px',
                  flexGrow: 1
                }}
                gap={0}
                key={key}
              >
                <Typography
                  sx={{ fontWeight: 'bold', paddingRight: '13.25px 15px', fontSize: 'clamp(10px, 5vw, 28px)' }}
                >
                  {camelCaseToSimpleString(key)}:
                </Typography>
                <Typography
                  component='p'
                  sx={{
                    overflow: 'hidden',
                    overflowWrap: 'break-word',
                    width: '80%',
                    fontSize: 'clamp(10px, 5vw, 26px)'
                  }}
                >
                  {displayText}
                  {key === 'statement' && value.length > 60 && (
                    <Typography
                      component='span'
                      onClick={() => setShowFullText(!showFullText)}
                      sx={{ color: theme.palette.maintext, cursor: 'pointer', fontSize: 'clamp(10px, 5vw, 26px)' }}
                    >
                      {showFullText ? ' See less' : ' See more'}
                    </Typography>
                  )}
                </Typography>
              </Box>
            )
          })}
      </Box>
    </MUIModal>
  )
}

export default Modal
