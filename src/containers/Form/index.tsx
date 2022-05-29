import React, { useEffect, useState, useMemo } from "react";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { useViewerConnection } from "@self.id/framework";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import styles from "./styles";

const Form = () => {
  const ceramic = useMemo(
    () => new CeramicClient("https://ceramic-clay.3boxlabs.com"),
    []
  );
  const [connection] = useViewerConnection();

  useEffect(() => {
    if (connection.status === "connected") {
      const did = connection.selfID.did;
      did.authenticate().then(() => {
        ceramic.did = connection.selfID.did;
      });
    }
  }, [ceramic, connection]);

  const [source, setSource] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(null);
  const handleSourceChange = (e: React.FormEvent<HTMLInputElement>) => {
    setSource(e.currentTarget.value);
  };

  const handleSubmission = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    // console.log("we do something");
    if (source) {
      const doc = await TileDocument.create(ceramic, { source });
      // console.log("doc", doc);
    }
  };

  // console.log("source", source);

  /**
   * NOTE: Integration and data Handling is left,
   * once design gets adjusted
   */

  const inputFieldLabelArr = [
    { label: "Subject" },
    { label: "Claim" },
    { label: "Object" },
    { label: "Qualifier" },
    { label: "Aspect" },
    { label: "How Known" },
    { label: "Source" },
  ];

  return (
    <form className="Form">
      <Container sx={styles.formContainer}>
        <Typography variant="h4" sx={styles.formHeading}>
          Polling Form
        </Typography>
        <Box sx={styles.inputFieldWrap}>
          {inputFieldLabelArr.map(({ label }: any) => (
            <TextField
              fullWidth
              label={label}
              sx={styles.inputField}
              variant="filled"
            />
          ))}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Effective Date"
              value={effectiveDate}
              onChange={(newValue: any) => setEffectiveDate(newValue)}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  sx={styles.inputField}
                  variant="filled"
                />
              )}
            />
          </LocalizationProvider>
        </Box>
        {/* <label htmlFor="objcet" className="Label">
        Object:
      </label>
      <br />
      <input
        id="object"
        type="text"
        value={source}
        onChange={handleSourceChange}
        className="Input"
      /> */}
        <Box sx={styles.submitButtonWrap}>
          <Button
            onClick={async (event) => await handleSubmission(event)}
            variant="contained"
            size="large"
            sx={styles.submitButton}
          >
            Submit
          </Button>
        </Box>
      </Container>
    </form>
  );
};

export default Form;
