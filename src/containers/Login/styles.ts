import { neutralColors, uiColors, linkedTrustTheme } from '../../theme/colors'

const styles = {
  authContainer: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: 2,
    width: '100%',
    padding: '2rem',
    maxWidth: '430px',
    marginTop: 2,
    background: neutralColors.white,
    boxShadow: linkedTrustTheme.shadows.lg,
    zIndex: 20,
    borderRadius: '10px'
  },
  inputField: {
    backgroundColor: 'transparent'
  },
  authbtn: {
    display: 'flex',
    cursor: 'pointer',
    backgroundColor: neutralColors.white,
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
    color: uiColors.textPrimary,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    borderRadius: '7px',

    '&:hover': {
      backgroundColor: 'grey.300'
    },
    padding: '10px 15px',
    fontSize: '16px'
  }
}
export default styles
