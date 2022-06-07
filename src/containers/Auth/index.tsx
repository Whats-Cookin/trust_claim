import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import styles from "./styles";
import { AuthProps } from "./types";

const Auth = ({ setAuth }: AuthProps) => {
  const [usernameLogin, setUsernameLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");

  const [usernameRegister, setUsernameRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");

  const handleLogin = () => {
    setAuth(true);
  };
  const handleRegister = () => {
    setAuth(true);
  };

  return (
    <Box sx={styles.authWrap}>
      <Box sx={styles.authContainer}>
        <Typography component="div" variant="h5">
          Login
        </Typography>
        <TextField
          value={usernameLogin}
          fullWidth
          label="Username"
          sx={styles.inputField}
          variant="filled"
          onChange={(e: any) => setUsernameLogin(e.currentTarget.value)}
          type="text"
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
          value={usernameRegister}
          fullWidth
          label="Username"
          sx={styles.inputField}
          variant="filled"
          onChange={(e: any) => setUsernameRegister(e.currentTarget.value)}
          type="text"
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
