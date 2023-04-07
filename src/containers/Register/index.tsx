import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import IRegisterProps from "./types";
import styles from "./styles";
import { BACKEND_BASE_URL } from "../../utils/settings";
import polygon1 from '../../assets/circle.png';
import polygon2 from '../../assets/Polygon 2.png';
import polygon3 from '../../assets/Polygon 3.png'

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
    <>
    <img src={polygon1} alt="" className="absolute top-[3%] left-[-10%]"/>
    <img src={polygon2}alt="" className="absolute top-[50%] right-[20%]"/>
    <img src={polygon3}alt="" className="absolute right-[20%] top-[5%] w-[200px]"/>
    <Box sx={styles.authContainer}>
      <Typography component="div" variant="h5" color='#80B8BD' >
       <p className='text-center'>
        Register
       </p>
      
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
        <Typography variant="body1" color="black">
          Click here to Login
        </Typography>
      </Link>
    </Box>
    </>
  );
};
export default Register;
