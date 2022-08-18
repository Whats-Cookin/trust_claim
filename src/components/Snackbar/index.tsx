import MUISnackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const Snackbar = ({ isSnackbarOpen, snackbarMessage, toggleSnackbar }: any) => (
  <MUISnackbar
    open={isSnackbarOpen}
    autoHideDuration={3000}
    onClose={() => toggleSnackbar(false)}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
  >
    <Alert
      onClose={() => toggleSnackbar(false)}
      severity="info"
      sx={{ width: "100%" }}
    >
      {snackbarMessage}
    </Alert>
  </MUISnackbar>
);

export default Snackbar;
