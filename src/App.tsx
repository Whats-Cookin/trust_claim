import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import Loader from "./components/Loader";

import Login from "./containers/Login";
import Register from "./containers/Register";
import Home from "./containers/Home";

import "./App.css";

const App = () => {
  const [isAuth, setAuth] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isSnackbarOpen, toggleSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (accessToken && refreshToken) return true;
    return false;
  };

  useEffect(() => {
    const isAuthenticated = checkAuth();
    if (!isAuthenticated && location.pathname === "/") {
      navigate("/login");
    }
    setAuth(isAuthenticated);
  }, []);

  const commonProps = { toggleSnackbar, setSnackbarMessage, setLoading };

  return (
    <div className="App">
      <header className="App-header">
        <Snackbar
          open={isSnackbarOpen}
          autoHideDuration={3000}
          onClose={() => toggleSnackbar(false)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
        >
          <Alert
            onClose={() => toggleSnackbar(false)}
            severity="info"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Loader open={loading} />
        <Routes>
          <Route path="/" element={<Home {...commonProps} />} />
          <Route path="login" element={<Login {...commonProps} />} />
          <Route path="register" element={<Register {...commonProps} />} />
        </Routes>
      </header>
    </div>
  );
};

export default App;
