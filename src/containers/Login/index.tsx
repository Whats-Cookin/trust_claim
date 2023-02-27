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
import { BACKEND_BASE_URL, GITHUB_CLIENT_ID } from "../../utils/settings";

const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`;

const Login = ({
  toggleSnackbar,
  setSnackbarMessage,
  setLoading,
  isLoggedIn, // receive the isLoggedIn prop
  setIsLoggedIn // receive the setIsLoggedIn prop
}: ILoginProps) => {
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [ethAccountId, setEthAccountId] = useState("");

  const loginButton = document.getElementById("loginButton");
  const metamaskLink = document.getElementById("metamaskLink");

  const handleAuth = useCallback(
    (accessToken: string, refreshToken: string) => {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
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
          handleAuth(accessToken, refreshToken);
        })
        .catch((err) => {
          setLoading(false);
          toggleSnackbar(true);
          setSnackbarMessage(err.message);
          console.error(err.message);
        });
    }
  }, []);

  const handleWalletAuth = async () => {
     const ethProvider = window.ethereum; // import/get your web3 eth provider
     const addresses = await ethProvider.request({
        method: "eth_requestAccounts",
     });
     const accountId = await getAccountId(ethProvider, addresses[0]);
     
     if (accountId) {
        // User address is found, start session & navigate to home page
        const authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId) 
        // prepare the session with the ceramic client resources
        const session = await LoadSession(authMethod)
       
       
        isLoggedIn(true);
 
        // now we should be ready to publish claims, go to the form 
        navigate('/')
     } else {
         // User address is not found, navigate to login page
         navigate("/login");
     }

    // const localStorageKey = "walletAuth";
    // const localStorageData = localStorage.getItem(localStorageKey);

    // if (localStorageData) {
    //   const { address, timestamp } = JSON.parse(localStorageData);
    //   const currentTime = new Date().getTime();
    //   const expirationTime = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

    //   if (currentTime - timestamp < expirationTime) {
    //     setEthAccountId(address);
    //     navigate("/");
    //     return;
    //   }
    // }

    // if (window.ethereum && window.ethereum.selectedAddress) {
    //   setEthAccountId(window.ethereum.selectedAddress);
    //   // Store the selected address and timestamp in locale storage
    //   const currentTime = new Date().getTime();
    //   const data = {
    //     address: window.ethereum.selectedAddress,
    //     timestamp: currentTime,
    //   };
    //   localStorage.setItem(localStorageKey, JSON.stringify(data));
    //   // Navigate to a different page after successful authentication
    //   navigate("/");
    // } else {
    //   navigate("/login"); // Navigate to login page if the user is not authenticated
    // }
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
