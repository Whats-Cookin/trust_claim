import { neutralColors, uiColors, linkedTrustTheme } from '../../theme/colors'

const styles = {
  authContainer: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 2,
    padding: '2rem',
    maxWidth: '430px',
    margin: '0 auto',
    marginTop: 2,
    background: neutralColors.white,
    boxShadow: linkedTrustTheme.shadows.lg,
    zIndex: 20,
    borderRadius: '10px'
  },
  submitButton: {
    width: '100%'
  },
  inputField: {
    backgroundColor: 'transparent'
  }
}
export default styles
