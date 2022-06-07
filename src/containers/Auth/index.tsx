import { useState } from "react";
import axios from "axios";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import styles from "./styles";
import { AuthProps } from "./types";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const Auth = ({ setAuth }: AuthProps) => {
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");

  const [emailRegister, setEmailRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");

  const handleLogin = async () => {
    try {
      if (!emailLogin || !passwordLogin) {
        throw new Error("Both email and password are required fields.");
      }
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
      setAuth(true);
    } catch (err: any) {
      console.error("Error: ", err?.message);
    }
  };

  const handleRegister = async () => {
    try {
      if (!emailRegister || !passwordRegister) {
        throw new Error("Both email and password are required fields.");
      }
      const signupUrl = `${BACKEND_BASE_URL}/auth/signup`;
      const data = { email: emailRegister, password: passwordRegister };
      await axios.post(signupUrl, data);
    } catch (err: any) {
      console.error("Error: ", err?.message);
    }
  };

  return (
    <Box sx={styles.authWrap}>
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
      </Box>
      <Box sx={styles.authContainer}>
        <Typography component="div" variant="h5">
          Register
        </Typography>
        <TextField
          value={emailRegister}
          fullWidth
          label="Email"
          sx={styles.inputField}
          variant="filled"
          onChange={(e: any) => setEmailRegister(e.currentTarget.value)}
          type="email"
        />
        <TextField
          value={passwordRegister}
          fullWidth
          label="Password"
          sx={styles.inputField}
          variant="filled"
          onChange={(e: any) => setPasswordRegister(e.currentTarget.value)}
          type="password"
        />
        <Box sx={styles.submitButtonWrap}>
          <Button
            onClick={handleRegister}
            variant="contained"
            size="medium"
            sx={styles.submitButton}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
export default Auth;
