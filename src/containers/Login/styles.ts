const styles = {
  authContainer: {
    display: "flex",
    flexDirection: "column",
    rowGap: 2,
    width:"100%",
    maxWidth:"350px",
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
  authLinkButton: {
    textDecoration: "none",
    backgroundColor: "white",
    color: "black",

    "&:hover": {
      backgroundColor: "grey.300",
    },
    padding: "16px 20px",
    fontSize: "20px",
    display: "flex",
    justifyContent: "center",
  },
  authIcon: {
    marginLeft: "10px",
  },
};
export default styles;
