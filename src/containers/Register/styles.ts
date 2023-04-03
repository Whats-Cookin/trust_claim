const styles = {
  authContainer: {
    display: "flex",
    flexDirection: "column",
    rowGap: 2,
    width: "100%",
    padding:'2rem',
    maxWidth: "430px",
    marginTop: 2,
    background: "#FFFFFF",
    boxShadow: "0px 1px 20px rgba(0, 0, 0, 0.25)",
    zIndex:20,
    borderRadius: "10px",
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
    backgroundColor: "#80B8BD",
    color: "black",
    width:'100%',

    "&:hover": {
      backgroundColor: "grey.300",
    },
  },
};
export default styles;
