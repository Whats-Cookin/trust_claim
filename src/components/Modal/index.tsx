import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import MUIModal from '@mui/material/Modal'
import { camelCaseToSimpleString } from '../../utils/string.utils'
import styles from './styles'

const Modal = ({ open, setOpen, selectedClaim }: any) => {
  const handleClose = () => setOpen(false)
  if (!selectedClaim) return null

  const excludedFields = ['id', 'userId', 'issuerId', 'issuerIdType', 'createdAt', 'lastUpdatedAt', 'effectiveDate']

  return (
    <MUIModal open={open} onClose={handleClose}>
      <Box sx={{ ...styles.container, maxHeight: '80vh' }}>
        <Typography variant='h4' component='h2' sx={{ marginBottom: 4 }}>
          Claim
        </Typography>
        {selectedClaim &&
          Object.keys(selectedClaim).map(key =>
            excludedFields.includes(key) ? null : (
              <Box sx={styles.detailField} key={key}>
                <Typography component='h2' sx={{ fontWeight: 'bold' }}>
                  {camelCaseToSimpleString(key)}
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
