import "../../composedb/init"
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";
import GitHubIcon from "@mui/icons-material/GitHub";
import metaicon from "./metamask-icon.svg";

import styles from "./styles";
import ILoginProps from "./types";
import { useQueryParams } from "../../hooks";
// can change this if LoadSession intended to be private
import { LoadSession } from "../../composedb/compose";
import { useAuth } from "../../hooks/useAuth";
import { BACKEND_BASE_URL, GITHUB_CLIENT_ID } from "../../utils/settings";

const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`;

const Login = ({
  toggleSnackbar,
  setSnackbarMessage,
  setLoading,
  setIsLoggedIn,
  }: ILoginProps) => {
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  // const [ethAccountId, setEthAccountId] = useState("");
  const [ethAccountId, setEthAccountId] = useState("");
  const { login } = useAuth();

  // const loginButton = document.getElementById("loginButton");
  // const metamaskLink = document.getElementById("metamaskLink");

  const handleAuth = useCallback(
    (accessToken: string, refreshToken: string) => {
      login({
        accessToken,
        refreshToken,
      });
      //localStorage.setItem("accessToken", accessToken);
      //localStorage.setItem("refreshToken", refreshToken);
      setLoading(false);
      setIsLoggedIn(true); // set the isLoggedIn state to true
      navigate("/");
    },
    []
  );

  // name this later handleWalletAuth
  const handleFromWalletAuth = useCallback(
    (session: string) => {  // maybe also account id or wallet id or something? 
// TODO add address id please
      login({
        session,
      });
      //localStorage.setItem("accessToken", accessToken);
      //localStorage.setItem("refreshToken", refreshToken);
      setLoading(false);
      setIsLoggedIn(true); // set the isLoggedIn state to true
      navigate("/");
    },
    []
  );


  const navigate = useNavigate();
  const queryParams = useQueryParams();
  const githubAuthCode = queryParams.get("code");

  useEffect(() => {
    if (githubAuthCode) {
      const githubAuthUrl = `${BACKEND_BASE_URL}/auth/github`;
      axios
        .post<{ accessToken: string; refreshToken: string }>(githubAuthUrl, {
          githubAuthCode,
        })
        .then((res) => {
          const { accessToken, refreshToken } = res.data;
          login({
            accessToken,
            refreshToken,
          });
        })
        .catch((err) => {
          setLoading(false);
          toggleSnackbar(true);
          setSnackbarMessage(err.message);
          console.error(err.message);
        });
    }
  }, []);




  // please change this name to handleWalletLogin
  const handleWalletAuth = async () => {
    const ethProvider = window.ethereum; // import/get your web3 eth provider
  
    // Request user account addresses
    console.log("Requesting user account addresses...");
    const addresses = await ethProvider.request({
      method: "eth_requestAccounts",
    });
    console.log("User account addresses:", addresses);
  
    // Get user account ID
    console.log("Getting user account ID...");
    const accountId = await getAccountId(ethProvider, addresses[0]);
    console.log("User account ID:", accountId);
  
    if (accountId) {
      // User address is found, start session & navigate to home page
      console.log("User is logged in. Starting session...");
      const authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId);
      console.log("Authentication method:", authMethod);
  
      // Prepare the session with the ceramic client resources
      console.log("Preparing session with ceramic client resources...");
      const session = await LoadSession(authMethod);
      console.log("Session:", session);
      console.log("setLoading:", setLoading);
 
  
  
      // Check if session exists before navigating to home page
      if (session) {
          handleFromWalletAuth(session);
      } else {
        console.log("Session does not exist");
      }
    } else {
      // User address is not found, navigate to login page
      console.log("User is not logged in. Navigating to login page...");
      navigate("/login"); 

      // Set the user as logged out
      setIsLoggedIn(false);
    }
  };
  
  

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

        handleAuth(accessToken, refreshToken);
      }
    } catch (err: any) {
      setLoading(false);
      toggleSnackbar(true);
      setSnackbarMessage("User not Found!");
      console.error("Error: ", err?.message);
    }
  };

  // Check if Metamask is installed
  let ethLoginOpt;
  if (typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask) {
    ethLoginOpt = (
      <button
        id="loginButton"
        onClick={handleWalletAuth}
        style={styles.authbtn}
      > 
        Log in with Metamask{" "}
        <span>
          <img src={metaicon} alt="" style={{ width: "30px" }} />
        </span>
      </button>
    );
  } else {
    ethLoginOpt = (
      <p id="metamaskLink">
        To login with Ethereum{" "}
        <a href="https://metamask.io/" target="_blank">
          Install Metamask
        </a>
      </p>
    );
  }

  return (
    <Box sx={styles.authContainer}>
      <Box>
        <MuiLink href={githubUrl} sx={styles.authLinkButton}>
          Login with Github <GitHubIcon sx={styles.authIcon} />
        </MuiLink>
      </Box>
      <Box>{ethLoginOpt}</Box>
      <Typography component="div" >
        Or, Login with email and password
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
