const styles = {
  authContainer: {
    display: "flex",
    flexDirection: "column",
    rowGap: 2,
    width:"100%",
    maxWidth:"350px",
    marginTop: 4,
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
