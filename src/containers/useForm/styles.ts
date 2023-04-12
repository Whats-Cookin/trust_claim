const styles = {
  formContainer: {
    mt: 10,
    mb: 10,
    height: 'auto',
    background: '#FFFFFF',
    boxShadow: '0px 1px 20px rgba(0, 0, 0, 0.25)',
    zIndex: 20,
    borderRadius: '10px',
    padding: '1rem 0.5rem'
  },
  formHeading: {
    mb: 3,
    textAlign: 'center',
    fontSize: '20px',
    color: '#80B8BD',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  inputFieldWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    textAlign: 'left',
    maxWidth: 600,
    rowGap: 3,
    mb: 4
  },
  inputField: {
    '& .MuiFilledInput-input ': {
      backgroundColor: 'white'
    },
    '& .MuiInputBase-root ': {
      '&:hover': {
        backgroundColor: 'white'
      },
      backgroundColor: 'white'
    },

    width: '48%',
    '@media screen and (max-width: 712px)': {
      width: '100%'
    }
  },
  dropdownField: {
    '& .MuiSelect-select': {
      '&:hover': {
        backgroundColor: 'white'
      },
      '&:focus': {
        backgroundColor: 'white'
      },

      backgroundColor: 'white'
    },
    width: '48%',
    '@media screen and (max-width: 712px)': {
      width: '100%'
    }
  },
  sliderField: {
    width: '48%',
    '@media screen and (max-width: 712px)': {
      width: '100%'
    }
  },
  submitButtonWrap: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    columnGap: 3,
    ml: 1,
    mr: 1,
    padding: '8px',
    backgroundColor: '#80B8BD',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#80B8BD'
    }
  }
}

export default styles
