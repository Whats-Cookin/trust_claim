const styles = {
  authContainer: {
    display: "flex",
    flexDirection: "column",
    rowGap: 2,
    width: "100%",
    maxWidth: "350px",
    marginTop: 2,
  },
  inputField: {
    backgroundColor: "white",
  },
  submitButtonWrap: {
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
  },
  authbtn: {
    display: "flex",
    cursor: "pointer",
    backgroundColor: "white",
    gap: "2%",
    width: "100%",
    padding: "1rem",
  },
  submitButton: {
    backgroundColor: "white",
    color: "black",

    "&:hover": {
      backgroundColor: "grey.300",
    },
  },
  authLinkButton: {
    textDecoration: "none",
    backgroundColor: "white",
    color: "black",

    "&:hover": {
      backgroundColor: "grey.300",
    },
    padding: "10px 15px",
    fontSize: "16px",
    display: "flex",
  },
  authIcon: {
    marginLeft: "10px",
  },
};
export default styles;
