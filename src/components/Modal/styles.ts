import { useTheme } from '@mui/material/styles'

let theme = useTheme()

const styles = () => {
  return {
    container: {},
    detailField: {},
    fieldContent: {
      overflow: 'hidden',
      overflowWrap: 'break-word'
    },
    createClaimBtn: {
      display: 'block',
      margin: '20px 0 5px auto'
    }
  }
}

export default styles
