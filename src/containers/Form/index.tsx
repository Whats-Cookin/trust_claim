import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import  {TextField,Grid,Button,Slider} from "@mui/material";
import { DatePicker,LocalizationProvider  } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "../../axiosInstance";
import Dropdown from "../../components/Dropdown";
import IHomeProps from "./types";
import styles from "./styles";

const Form = ({
  toggleSnackbar,
  setSnackbarMessage,
  setLoading,
}: IHomeProps) => {
  const [subject, setSubject] = useState("");
  const [claim, setClaim] = useState("");
  const [object, setObject] = useState("");
  const [qualifier, setQualifier] = useState("");
  const [aspect, setAspect] = useState("");
  const [howKnown, setHowKnow] = useState("");
  const [source, setSource] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(new Date());
  const [confidence, setConfidence] = useState(0.0);
  const [reviewRating, setReviewRating] = useState(0);
  

  const navigate = useNavigate();

  const handleSubmission = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (subject && claim) {
      try {
        const effectiveDateAsString = effectiveDate.toISOString();
        const confidenceAsNumber = Number(confidence);
        const reviewRatingAsNumber = Number(reviewRating);

        const payload = {
          subject,
          claim,
          object,
          qualifier,
          aspect,
          howKnown,
          source,
          effectiveDate: effectiveDateAsString,
          confidence: confidenceAsNumber,
          reviewRating: reviewRatingAsNumber,
        };

        setLoading(true);
        const res = await axios.post(`/api/claim`, payload);
        if (res.status === 201) {
          setLoading(false);
          toggleSnackbar(true);
          setSnackbarMessage("Claim submitted successfully!");

          setSubject("");
          setClaim("");
          setObject("");
          setQualifier("");
          setAspect("");
          setHowKnow("");
          setSource("");
          setEffectiveDate(new Date());
          setConfidence(1);
          setReviewRating(0);
        } else {
          setLoading(false);
          toggleSnackbar(true);
          setSnackbarMessage("Something went wrong!");
        }
      } catch (err: any) {
        setLoading(false);
        toggleSnackbar(true);
        setSnackbarMessage(err.response.data.message);
        console.error("err", err.response.data.message);
      }
    } else {
      setLoading(false);
      toggleSnackbar(true);
      setSnackbarMessage("Subject and Claims are required fields.");
    }
  };

  const inputFieldLabelArr = [
    {
      label: "Subject",
      value: subject,
      setter: setSubject,
      type: "text",
      fieldType: "inputField",
    },
    {
      label: "Subject Name",
      value: subject,
      setter: setSubject,
      type: "text",
      fieldType: "inputField",
    },

    {
      label: "Claim",
      value: claim,
      setter: setClaim,
      type: "text",
      fieldType: "dropdown",
      options: [
        "rated",
        "same_as",
        "performed",
        "helped",
        "harmed",
        "scam",
        "owns",
        "related_to",
      ],
    },
    {
      label: "Aspect",
      value: aspect,
      setter: setAspect,
      type: "text",
      fieldType: "dropdown",
      options: [
        "impact:social",
        "impact:climate",
        "impact:work",
        "impact:financial",
        "impact:educational",
        "quality:technical",
        "quality:asthetic",
        "quality:taste",
        "quality:journalistic",
        "quality:academic",
        "quality:fun",
        "quality:usefulness",
        "quality:literary",
        "quality:relevance",
        "quality:self-improvment",
        "quality:historical",
        "quality:theological",
        "quality:adventure",
        "quality:biographical",
        "quality:scientific",
        "risk:scam",
        "risk:justice",
        "risk:safety",
        "risk:reliability",
        "relationship:works-for",
        "relationship:same-as",
      ],
    },
    {
      label: "How Known",
      value: howKnown,
      setter: setHowKnow,
      type: "text",
      fieldType: "dropdown",
      options: [
        "first_hand",
        "second_hand",
        "website",
        "verified_website",
        "verified_login",
        "signed_claim",
        "blockchain",
        "physical_document",
        "integration",
      ],
    },
    {
      label: "Object",
      value: object,
      setter: setObject,
      type: "text",
      fieldType: "inputField",
    },
    {
      label: "Statement",
      value: qualifier,
      setter: setQualifier,
      type: "text",
      fieldType: "inputField",
    },
    {
      label: "Source",
      value: source,
      setter: setSource,
      type: "text",
      fieldType: "inputField",
    },
    {
      label: "Confidence",
      value: confidence,
      setter: setConfidence,
      type: "number",
      min: 0.0,
      max: 1.0,
      fieldType: "inputField",
      step: 0.01,
    },
  ];

  return (
    <form className="Form">
      <Container sx={styles.formContainer}>
        <Typography variant="h4" sx={styles.formHeading}>
          Enter a Claim
        </Typography>
        <Box sx={styles.inputFieldWrap}>
          {inputFieldLabelArr.map(
            (
              { label, value, setter, options, type, fieldType, ...rest }: any,
              i
            ) =>
              fieldType === "inputField" ? (
                <TextField
                  value={value}
                  sx={{ml: 1, mr: 1, width: '22ch'}}
                  margin="dense"
                  variant="outlined"
                  fullWidth
                  label={label}
                  key={i}
                  onChange={(event: any) => setter(event.currentTarget.value)}
                  type={type}
                  inputProps={{ ...rest }}
                />
              ) : (
                <Dropdown
                  key={i}
                  label={label}
                  value={value}
                  setter={setter}
                  options={options}                  
                  variant="outlined"
                  sx={{ml: 1, mr: 1,mb:.5 ,mt:1 ,width: '22ch'}}
                />
              )
          )}
          {claim === "rated" && aspect.includes("quality:") ? (
            <Box sx={styles.sliderField}>
              <Box display="flex" flexDirection="column">
                <Typography variant="body2">Review Rating</Typography>
                <Slider
                  getAriaLabel={() => "Review rating"}
                  value={reviewRating}
                  onChange={(_: Event, rating: number | number[]): void =>
                    setReviewRating(Number(rating))
                  }
                  min={0}
                  max={5}
                  valueLabelDisplay="auto"
                />
              </Box>
              <Typography variant="body2">{reviewRating}</Typography>
            </Box>
          ) : (
            <TextField
              value={reviewRating}
              fullWidth
              label="Review Rating"
              variant="filled"
              sx={{ml: 1, mr: 1, width: '22ch'}}
              onChange={(event: any) =>
              setReviewRating(event.currentTarget.value)
              }
              type="number"
            />
          )}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Effective Date"
              value={effectiveDate}
              onChange={(newValue: any) => setEffectiveDate(newValue)}
              renderInput={(params: any) => (
                <TextField
                  {...params}
                  sx={{ml: 1, mr: 1, width: '22ch'}}
                  variant="filled"
                />
              )}
            />
          </LocalizationProvider>
        </Box>
        <Box sx={styles.submitButtonWrap}>
          <Button
            onClick={async (event: any) => await handleSubmission(event)}
            variant="contained"
            size="large"
            sx={{ml: 1, mr: 1, width: '22ch',
             backgroundColor: "#eeeeee",
            "&:hover": {
              backgroundColor: "rgb(37, 3, 3)",
            }}}
          >
            Submit
          </Button>
        </Box>
      </Container>
    </form>
  );
};

export default Form;
