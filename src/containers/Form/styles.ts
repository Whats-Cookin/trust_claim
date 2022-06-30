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
    textAlign: "left",
    maxWidth: 600,
    rowGap: 3,
    mb: 4,
  },
  inputField: {
    "& .MuiFilledInput-input ": {
      backgroundColor: "white",
    },
    "& .MuiInputBase-root ": {
      "&:hover": {
        backgroundColor: "white",
      },
      backgroundColor: "white",
    },

    width: "48%",
    "@media screen and (max-width: 712px)": {
      width: "100%",
    },
  },
  dropdownField: {
    "& .MuiSelect-select": {
      "&:hover": {
        backgroundColor: "white",
      },
      "&:focus": {
        backgroundColor: "white",
      },

      backgroundColor: "white",
    },
    width: "48%",
    "@media screen and (max-width: 712px)": {
      width: "100%",
    },
  },
  sliderField: {
    width: "48%",
    "@media screen and (max-width: 712px)": {
      width: "100%",
    },
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
