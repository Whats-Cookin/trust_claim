import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { ComposeClient } from "@composedb/client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";
import GitHubIcon from "@mui/icons-material/GitHub";
import metamask from "./metamask-icon.svg";

import styles from "./styles";
import ILoginProps from "./types";
import { useQueryParams } from "../../hooks";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const githubUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`;

const Login = ({
  toggleSnackbar,
  setSnackbarMessage,
  setLoading,
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
    // User address is found, navigate to home page
    // window.location.href = "/";
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
          <img src={metamask} alt="" style={{ width: "30px" }} />
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
      <Box></Box>
      <Box>
        <MuiLink href={githubUrl} sx={styles.authLinkButton}>
          Login with Github <GitHubIcon sx={styles.authIcon} />
        </MuiLink>
      </Box>
      <Box>{ethLoginOpt}</Box>
      <Typography component="div" variant="h6">
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
