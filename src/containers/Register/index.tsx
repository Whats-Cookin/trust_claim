import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import IRegisterProps from "./types";
import styles from "./styles";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const Register = ({
  toggleSnackbar,
  setSnackbarMessage,
  setLoading,
}: IRegisterProps) => {
  const [emailRegister, setEmailRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      if (!emailRegister || !passwordRegister) {
        toggleSnackbar(true);
        setSnackbarMessage("Both email and password are required fields.");
      } else {
        setLoading(true);
        const signupUrl = `${BACKEND_BASE_URL}/auth/signup`;
        const data = { email: emailRegister, password: passwordRegister };
        await axios.post(signupUrl, data);
        setLoading(false);
        navigate("/login");
      }
    } catch (err: any) {
      setLoading(false);
      toggleSnackbar(true);
      setSnackbarMessage(err.response.data.message);
      console.error("Error: ", err.response.data.message);
    }
  };

  return (
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
      <Link to="/login" style={{ textDecoration: "none" }}>
        <Typography variant="body1" color="white">
          Click here to Login
        </Typography>
      </Link>
    </Box>
  );
};
export default Register;
