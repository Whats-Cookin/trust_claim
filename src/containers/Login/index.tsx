import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import styles from "./styles";
import ILoginProps from "./types";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const Login = ({
  toggleSnackbar,
  setSnackbarMessage,
  setLoading,
}: ILoginProps) => {
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      if (!emailLogin || !passwordLogin) {
        toggleSnackbar(true);
        setSnackbarMessage("Both email and password are required fields.");
      } else {
        setLoading(true);
        const loginUrl = `${BACKEND_BASE_URL}/auth/login`;
        const data = { email: emailLogin, password: passwordLogin };
        const {
          data: { accessToken, refreshToken },
        } = await axios.post<{ accessToken: string; refreshToken: string }>(
          loginUrl,
          data
        );
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setLoading(false);
        navigate("/");
      }
    } catch (err: any) {
      setLoading(false);
      toggleSnackbar(true);
      setSnackbarMessage("User not Found!");
      console.error("Error: ", err?.message);
    }
  };

  return (
    <Box sx={styles.authContainer}>
      <Typography component="div" variant="h5">
        Login
      </Typography>
      <TextField
        value={emailLogin}
        fullWidth
        label="Email"
        sx={styles.inputField}
        variant="filled"
        onChange={(e: any) => setEmailLogin(e.currentTarget.value)}
        type="email"
      />
      <TextField
        value={passwordLogin}
        fullWidth
        label="Password"
        sx={styles.inputField}
        variant="filled"
        onChange={(e: any) => setPasswordLogin(e.currentTarget.value)}
        type="password"
      />
      <Box sx={styles.submitButtonWrap}>
        <Button
          onClick={handleLogin}
          variant="contained"
          size="medium"
          sx={styles.submitButton}
        >
          Login
        </Button>
      </Box>
      <Link to="/register" style={{ textDecoration: "none" }}>
        <Typography variant="body1" color="white">
          Click here to register
        </Typography>
      </Link>
    </Box>
  );
};
export default Login;
