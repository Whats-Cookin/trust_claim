import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import MUIModal from '@mui/material/Modal'
import { camelCaseToSimpleString } from '../../utils/string.utils'
import { Divider } from '@mui/material'
import { useTheme } from '@mui/material'

const Modal = ({ open, setOpen, selectedClaim }: any) => {
  const handleClose = () => setOpen(false)
  if (!selectedClaim) return null
  const theme = useTheme()
  const excludedFields = ['id', 'userId', 'issuerId', 'issuerIdType', 'createdAt', 'lastUpdatedAt', 'effectiveDate']

  return (
    <MUIModal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '80%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          height: '760px',
          maxHeight: '550px',
          backgroundColor: theme.palette.pageBackground,
          borderRadius: '30px',
          p: 4,
          overflow: 'hidden',
          overflowY: 'auto',
          
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
          <Typography variant='h5' component='h2'>
            Claim
          </Typography>
          <Divider variant='middle' sx={{ width: '10%', bgcolor: '#009688', mt: 1 }} />
        </Box>

        {selectedClaim &&
          Object.keys(selectedClaim).map((key: string) =>
            excludedFields.includes(key) ? null : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  columnGap: '40px',
                  padding: '5px 10px'
                }}
                key={key}
              >
                <Typography component='h2' sx={{ fontWeight: 'bold', padding: '5px 10px' }}>
                  {camelCaseToSimpleString(key)} :
                </Typography>
                <Typography component='p' sx={{ overflow: 'hidden', overflowWrap: 'break-word' }}>
                  {selectedClaim[key]}
                </Typography>
              </Box>
            )
          )}
      </Box>
    </MUIModal>
  )
}

export default Modal
