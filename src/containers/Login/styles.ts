const styles = {
  authContainer: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 2,
    width: '100%',
    padding: '2rem',
    maxWidth: '430px',
    marginTop: 2,
    background: '#ffffff',
    boxShadow: '0px 1px 20px #00000040',
    zIndex: 20,
    borderRadius: '10px'
  },
  inputField: {
    backgroundColor: '#00000000'
  },
  authbtn: {
    display: 'flex',
    cursor: 'pointer',
    backgroundColor: 'white',
    gap: '2%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ETHButton: {
    width: '100%',
    borderRadius: '7px',
    fontSize: '16px'
  },
  authLinkButton: {
    textDecoration: 'none',
    color: 'black',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    borderRadius: '7px',

    '&:hover': {
      backgroundColor: 'grey.300'
    },
    padding: '10px 15px',
    fontSize: '16px'
  },
  authIcon: {
    fontSize: '2rem'
  }
}
export default styles
