import moment from "moment";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MUIModal from "@mui/material/Modal";
import styles from "./styles";

const Modal = ({ open, setOpen, selectedNode }: any) => {
  const handleClose = () => setOpen(false);
  if (!selectedNode) return null;

  const dateFields = ["createdAt", "lastUpdatedAt", "effectiveDate"];

  return (
    <MUIModal open={open} onClose={handleClose}>
      <Box sx={styles.container}>
        <Typography variant="h4" component="h2" sx={{ marginBottom: 4 }}>
          Claim
        </Typography>
        {selectedNode &&
          Object.keys(selectedNode).map((key: string) => (
            <Box sx={styles.detailField}>
              <Typography component="h2">{key}</Typography>
              <Typography component="p" sx={styles.fieldContent}>
                {dateFields.includes(key)
                  ? moment(selectedNode[key]).format("LL")
                  : selectedNode[key]}
              </Typography>
            </Box>
          ))}
        <Button variant="contained" sx={styles.createClaimBtn}>
          Create Claim
        </Button>
      </Box>
    </MUIModal>
  );
};

export default Modal;
