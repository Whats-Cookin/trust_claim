import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MUIModal from "@mui/material/Modal";

import { camelCaseToSimpleString } from "../../utils/string.utils";

import styles from "./styles";

const Modal = ({ open, setOpen, selectedNode }: any) => {
  const navigate = useNavigate();

  const handleClose = () => setOpen(false);
  if (!selectedNode) return null;

  const excludedFields = [
    "id",
    "userId",
    "issuerId",
    "issuerIdType",
    "createdAt",
    "lastUpdatedAt",
    "effectiveDate",
  ];

  const handleOnCreateClaim = () => {
    navigate(`/${selectedNode.id}`);
  };

  const isValidHttpUrl = (string: string) => {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  };

  return (
    <MUIModal open={open} onClose={handleClose}>
      <Box sx={styles.container}>
        <Typography variant="h4" component="h2" sx={{ marginBottom: 4 }}>
          Claim
        </Typography>
        {selectedNode &&
          Object.keys(selectedNode).map((key: string) =>
            excludedFields.includes(key) ? null : (
              <Box sx={styles.detailField} key={key}>
                <Typography component="h2">
                  {camelCaseToSimpleString(key)}
                </Typography>
                {isValidHttpUrl(selectedNode[key]) ? (
                  <a href={selectedNode[key]} rel="noreferrer" target="_blank">
                    {selectedNode[key]}
                  </a>
                ) : (
                  <Typography component="p" sx={styles.fieldContent}>
                    {selectedNode[key]}
                  </Typography>
                )}
              </Box>
            )
          )}
        <Button
          variant="contained"
          sx={styles.createClaimBtn}
          onClick={handleOnCreateClaim}
        >
          Create Claim
        </Button>
      </Box>
    </MUIModal>
  );
};

export default Modal;
