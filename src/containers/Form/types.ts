interface IHomeProps {
  toggleSnackbar: (toggle: boolean) => void;
  setSnackbarMessage: (message: string) => void;
  setLoading: (isLoading: boolean) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => any;
}

export default IHomeProps;
