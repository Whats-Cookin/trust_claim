import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MUIModal from "@mui/material/Modal";
// import { useState } from ß"react";

import { camelCaseToSimpleString } from "../../utils/string.utils";

import styles from "./styles";
import Comment from "../comment/Comment";

const Modal = ({ open, setOpen, selectedClaim }: any) => {
  const handleClose = () => setOpen(false);
  if (!selectedClaim) return null;

  const excludedFields = [
    "id",
    "userId",
    "issuerId",
    "issuerIdType",
    "createdAt",
    "lastUpdatedAt",
    "effectiveDate",
  ];
//const [commentData, setCommentData] = useState(comments)
  return (
   
    <MUIModal open={open} onClose={handleClose}>
       <div className="h-[80vh] absolute left-[50%] top-[50%] w-full" style={{transform: 'translate(-50%, -50%)',maxWidth:'800px'}}>
      <Box sx={{ ...styles.container }}>
        <Typography variant="h4" component="h2" sx={{ marginBottom: 4 }}>
          Claim
        </Typography>
        {selectedClaim &&
          Object.keys(selectedClaim).map((key: string) =>
            excludedFields.includes(key) ? null : (
              <Box sx={styles.detailField} key={key}>
                <Typography component="h2" sx={{ fontWeight: "bold" }}>
                  {camelCaseToSimpleString(key)}
                </Typography>
                <Typography component="p" sx={styles.fieldContent}>
                  {selectedClaim[key]}
                </Typography>
              </Box>
            )
          )}
      
      </Box>
      <Comment />
      </div>

    </MUIModal>
   
  );
};

export default Modal;
