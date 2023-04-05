const styles = {
  container: {
    color: "#000000",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "800px",
    width: "100%",
    height: "60%",
    maxHeight: "450px",
    bgcolor: "background.paper",
    border: "2px solid #004",
    borderRadius: "4px",
    boxShadow: 20,
    p: 4,
    overflow: "hidden",
    overflowY: "auto",
  },
  detailField: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: "40px",
    borderBottom: "1px solid #000",
    padding: "5px 10px",
    backgroud: "#eeeeee",
  },
  fieldContent: {
    overflow: "hidden",
    overflowWrap: "break-word",
  },
  createClaimBtn: {
    display: "block",
    margin: "20px 0 5px auto",
  },
};

export default styles;
