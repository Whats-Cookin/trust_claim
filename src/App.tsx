import { useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import { useEffect } from "react";

import Home from "./containers/Form";
import Login from "./containers/Login";
import Register from "./containers/Register";

import "./App.css";

const App = () => {
  const [isAuth, setAuth] = useState(false);

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

  return (
    <div className="App">
      <header className="App-header">
        <Routes>
          {isAuth && <Route path="/" element={<Home />} />}
          {!isAuth && (
            <>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </>
          )}
        </Routes>
      </header>
    </div>
  );
};

export default App;
