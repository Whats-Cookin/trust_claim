const styles = {
  authWrap: {
    display: "flex",
    columnGap: 4,
  },
  authContainer: {
    display: "flex",
    flexDirection: "column",
    rowGap: 2,
  },
  inputField: {
    backgroundColor: "white",
  },
  submitButtonWrap: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
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
