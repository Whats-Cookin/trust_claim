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
    padding: '0.5rem',
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
    marginLeft: '10px'
  }
}
export default styles
