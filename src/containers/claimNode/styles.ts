const styles = {
    formContainer: {
      color: "	#000000",
  
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "800px",
      width: "30%",
      height: "60%",
      maxHeight: "450px",
      bgcolor: "background.paper",
      border: "2px solid #004",
      borderRadius: "4px",
      boxShadow: 20,
      p: 4,
      mt: 10,
      mb: 10,
      background: "#FFFFFF",
      zIndex: 20,
      padding: "1rem 0.5rem",
      overflow: "hidden",
      overflowY: "auto",
    },
    formHeading: {
      mb: 3,
      textAlign: "center",
      fontSize: "20px",
      color: "#80B8BD",
      textTransform: "uppercase",
      fontWeight: "bold",
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
  };
  
  export default styles;
  