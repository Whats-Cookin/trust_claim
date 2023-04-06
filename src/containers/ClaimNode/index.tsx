import React, { useState } from "react";
import { Box, Button, TextField, Typography, Slider } from "@mui/material";
import { styled } from "@mui/material/styles";
import { PublishClaim } from "../../composedb/compose";
import { useTheme } from "@mui/material/styles";

interface Props {
  open: boolean;
  onClose: () => void;
}

const Container = styled(Box)({
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#fff",
  padding: "32px",
  borderRadius: "8px",
  zIndex: 9999,
});

const NewClaimPopup: React.FC<Props> = ({ open, onClose }) => {
  const [subject, setSubject] = useState("");
  const [claim, setClaim] = useState("");
  const [object, setObject] = useState("");
  const [statement, setStatement] = useState("");
  const [sourceURI, setSourceURI] = useState("");

  const theme = useTheme();

  const handleSubmission = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (subject && claim) {
      try {
        const payload = {
          subject,
          claim,
          object,
          statement,
          sourceURI,
        };
        const res = await PublishClaim(payload);
        if (res.status === 201) {
          onClose();
        }
      } catch (err: any) {
        console.error("err", err.response.data.message);
      }
    }
  };

  const inputFieldLabelArr = [
    {
      label: "Subject",
      value: subject,
      setter: setSubject,
      type: "text",
    },
    {
      label: "Claim",
      value: claim,
      setter: setClaim,
      type: "text",
    },
    {
      label: "Object",
      value: object,
      setter: setObject,
      type: "text",
    },
    {
      label: "Statement",
      value: statement,
      setter: setStatement,
      type: "text",
    },
    {
      label: "Source URI",
      value: sourceURI,
      setter: setSourceURI,
      type: "text",
    },
  ];

  if (!open) {
    return null;
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ marginBottom: "16px" }}>
        New Claim
      </Typography>
      {inputFieldLabelArr.map(({ label, value, setter, type }, i) => (
        <TextField
          key={i}
          value={value}
          fullWidth
          margin="normal"
          label={label}
          type={type}
          onChange={(event) => setter(event.target.value)}
        />
      ))}
      <Button
        onClick={handleSubmission}
        variant="contained"
        size="large"
        sx={{
          marginTop: "16px",
          backgroundColor: theme.palette.success.main,
          color: "#fff",
          "&:hover": {
            backgroundColor: theme.palette.success.dark,
          },
        }}
      >
        Submit
      </Button>
    </Container>
  );
};

export default NewClaimPopup;
