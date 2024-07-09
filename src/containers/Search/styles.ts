const styles = {
  container: {
    padding: '0',
    '@media (min-width: 600px)': {
      padding: '0'
    }
  },
  cy: {
    width: '100vw',
    height: '100vh',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
   inputFieldWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    maxWidth: 1000,
    rowGap: 4,
    mb: 4
  }
}

export default styles
