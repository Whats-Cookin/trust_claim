
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MUIModal from "@mui/material/Modal";

import { camelCaseToSimpleString } from "../../utils/string.utils";

import styles from "./styles";

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

  const getTopicFromDomain = (url: string) => {
    if (url.includes("trustclaims.whatscookin.us")) {
      return url.split("/").at(-1);
    } else {
      return url;
    }
  };
console.log()
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
      <Box sx={{ ...styles.container, overflowY: 'auto', maxHeight: '80vh' }}>
        <Typography variant="h4" component="h2" sx={{ marginBottom: 4 }}>
          Claim
        </Typography>
        {selectedClaim &&
          Object.keys(selectedClaim).map((key: string) =>
            excludedFields.includes(key) ? null : (
              <Box sx={styles.detailField} key={key}>
                <Typography component="h2">
                  {camelCaseToSimpleString(key)}
                </Typography>
                {isValidHttpUrl(selectedClaim[key]) ? (
                  <a
                    href={
                      key === "source"
                        ? selectedClaim[key]
                        : `/search?query=${getTopicFromDomain(
                            selectedClaim[key]
                          )}`
                    }
                    rel="noreferrer"
                    target="_blank"
                  >
                    {selectedClaim[key]}
                  </a>
                ) : (
                  <Typography component="p" sx={styles.fieldContent}>
                    {selectedClaim[key]}
                  </Typography>
                )}
              </Box>
            )
          )}
      </Box>
    </MUIModal>
  );
};

export default Modal;
