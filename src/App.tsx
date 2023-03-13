import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Loader from "./components/Loader";
import Snackbar from "./components/Snackbar";
import Navbar from "./components/Navbar";
import Login from "./containers/Login";
import Register from "./containers/Register";
import Form from "./containers/Form";
import Search from "./containers/Search";
import Claims from "./containers/Claims";

import "./App.css";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [isSnackbarOpen, toggleSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [metaNav, setMetaNav] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const checkAuth = () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const ethAddress = localStorage.getItem("ethAddress");
    if (ethAddress || (accessToken && refreshToken)) return true;
    return false;
  };

  useEffect(() => {
    const isAuthenticated = checkAuth();
    if (!isAuthenticated && location.pathname === "/") {
      navigate("/login");
    }
  }, []);

  const commonProps = {
    toggleSnackbar,
    setSnackbarMessage,
    setLoading,
    setMetaNav,
  };

  return (
    <>
      <Navbar isAuth={checkAuth()} />
      <div className="container">
        <Snackbar
          snackbarMessage={snackbarMessage}
          isSnackbarOpen={isSnackbarOpen}
          toggleSnackbar={toggleSnackbar}
        />
        <Loader open={loading} />
        <Routes>
          <Route path="/" element={<Form {...commonProps} />} />
          <Route path="login" element={<Login {...commonProps} />} />
          <Route path="register" element={<Register {...commonProps} />} />
          <Route path="search" element={<Search {...commonProps} />} />
          <Route path="claims" element={<Claims {...commonProps} />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
