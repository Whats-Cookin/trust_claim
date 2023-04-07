interface IHomeProps {
  toggleSnackbar: (toggle: boolean) => void
  setSnackbarMessage: (message: string) => void
  setLoading: (isLoading: boolean) => void
}

export default IHomeProps
