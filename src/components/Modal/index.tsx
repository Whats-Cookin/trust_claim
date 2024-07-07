import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import MUIModal from '@mui/material/Modal'
import { camelCaseToSimpleString } from '../../utils/string.utils'
import styles from './styles'
import Divider from '@mui/material/Divider'

const Modal = ({ open, setOpen, selectedClaim }: any) => {
  const handleClose = () => setOpen(false)
  if (!selectedClaim) return null

  const excludedFields = ['id', 'userId', 'issuerId', 'issuerIdType', 'createdAt', 'lastUpdatedAt', 'effectiveDate']

  return (
    <MUIModal open={open} onClose={handleClose}>
      <Box sx={{ ...styles.container, maxHeight: '80vh', minWidth: '50vw' }}>
        <Box
          sx={{
            display: 'block'
          }}
        >
          {' '}
          <Typography variant='h6' component='h6' sx={{ marginBottom: 1, display: 'flex', justifyContent: 'center' }}>
            Claim
          </Typography>
          <Divider
            variant='middle'
            sx={{ display: 'flex', borderColor: ' #009688', width: '10%', justifyContent: 'center' ,m: 'auto' }}
          />
        </Box>

        {selectedClaim &&
          Object.keys(selectedClaim).map((key: string) =>
            excludedFields.includes(key) ? null : (
              <Box sx={styles.detailField} key={key}>
                <Typography component='h2' sx={{ fontWeight: 'bold' }}>
                  {camelCaseToSimpleString(key)}:
                </Typography>
                <Typography component='p' sx={styles.fieldContent}>
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
