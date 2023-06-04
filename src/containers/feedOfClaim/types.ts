import { IconButtonProps } from '@mui/material'

export interface IHomeProps {
  toggleSnackbar: (toggle: boolean) => void
  setSnackbarMessage: (message: string) => void
  setLoading: (isLoading: boolean) => void
}
export interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}
