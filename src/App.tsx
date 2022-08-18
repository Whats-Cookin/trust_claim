import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Loader from "./components/Loader";
import Snackbar from "./components/Snackbar";
import Login from "./containers/Login";
import Register from "./containers/Register";
import Form from "./containers/Form";
import Search from "./containers/Search";

import "./App.css";

const App = () => {
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
  }, []);

  const commonProps = { toggleSnackbar, setSnackbarMessage, setLoading };

  return (
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
      </Routes>
    </div>
  );
};

export default App;
