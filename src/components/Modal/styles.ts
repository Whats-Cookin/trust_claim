const styles = {
  container: {
    position: 'absolute',
    top: '80%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '800px',
    width: '100%',
    height: '60%',
    maxHeight: '450px',
    bgcolor: 'footerBackground',
    
    borderRadius: '4px',
    p: 4,
    overflow: 'hidden',
    overflowY: 'auto'
  },
  detailField: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    columnGap: '40px',
    padding: '10px'
  },
  fieldContent: {
    overflow: 'hidden',
    overflowWrap: 'break-word'
  },
  createClaimBtn: {
    display: 'block',
    margin: '20px 0 5px auto'
  }
}

export default styles
