const styles = {
  formContainer: {
    mt: 5,
    mb: 10,
  },
  formHeading: {
    mb: 3,
  },
  inputFieldWrap: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    maxWidth: 600,
    rowGap: 3,
    mb: 4,
  },
  inputField: {
    backgroundColor: "white",
    width: "48%",
  },
  sliderField: {
    width: "48%",
  },
  submitButtonWrap: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
    columnGap: 3,
  },
  submitButton: {
    backgroundColor: "white",
    color: "black",

    "&:hover": {
      backgroundColor: "grey.300",
    },
  },
};

export default styles;
