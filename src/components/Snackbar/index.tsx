import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

const CustomSnackbar = ({ isSnackbarOpen, snackbarMessage, toggleSnackbar }: any) => (
  <Snackbar
    open={isSnackbarOpen}
    autoHideDuration={3000}
    onClose={() => toggleSnackbar(false)}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center'
    }}
  >
    <Alert onClose={() => toggleSnackbar(false)} severity='info' sx={{ width: '100%' }}>
      {snackbarMessage}
    </Alert>
  </Snackbar>
)

export default CustomSnackbar
