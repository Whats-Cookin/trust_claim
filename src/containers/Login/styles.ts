const styles = {
  authContainer: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 2,
    width: '100%',
    padding: '2rem',
    maxWidth: '430px',
    marginTop: 2,
    background: '#FFFFFF',
    boxShadow: '0px 1px 20px rgba(0, 0, 0, 0.25)',
    zIndex: 20,
    borderRadius: '10px'
  },
  inputField: {
    backgroundColor: 'white'
  },
  submitButtonWrap: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%'
  },
  authbtn: {
    display: 'flex',
    cursor: 'pointer',
    backgroundColor: 'white',
    gap: '2%',
    width: '100%',

    alignItems: 'center',
    justifyContent: 'center'
    // padding: "1rem",
  },
  submitButton: {
    backgroundColor: '#80B8BD',
    color: 'black',
    width: '100%',

    '&:hover': {
      backgroundColor: 'grey.300'
    }
  },
  ETHButton: {
    textDecoration: 'none',
    backgroundColor: 'white',
    color: 'black',
    margin: 'auto',
    width: '100%',
    borderRadius: '7px',
    border: '2px solid #80B8BD',
    padding: '0.5rem',

    fontSize: '16px'
    // display: "flex",
  },
  authLinkButton: {
    textDecoration: 'none',
    margin: 'auto',
    backgroundColor: 'white',
    color: 'black',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '7px',
    border: '2px solid #80B8BD',

    '&:hover': {
      backgroundColor: 'grey.300'
    },
    padding: '10px 15px',
    fontSize: '16px'
  },
  authIcon: {
    marginLeft: '10px'
  }
}
export default styles
