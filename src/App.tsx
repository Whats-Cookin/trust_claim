import { useState, useEffect, ReactNode, FC } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";

import Loader from "./components/Loader";
import Snackbar from "./components/Snackbar";
import Navbar from "./components/Navbar";
import Login from "./containers/Login";
import Register from "./containers/Register";
import Form from "./containers/Form";
import Search from "./containers/Search";
import Claims from "./containers/Claims";
import { AuthProvider } from "./hooks/useAuth";

import { useAuth } from "./hooks/useAuth";

import "./App.css";

type Props = {
  children?: React.ReactNode
};

const ProtectedRoute: FC<Props> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [isSnackbarOpen, toggleSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // new state variable
  const [metaNav, setMetaNav] = useState(false)

  const location = useLocation();
  const navigate = useNavigate();

  const commonProps = { toggleSnackbar, setSnackbarMessage, setLoading, setIsLoggedIn, setMetaNav };

  return (
    <AuthProvider>
      <Navbar />
      <div className="container">
        <Snackbar
          snackbarMessage={snackbarMessage}
          isSnackbarOpen={isSnackbarOpen}
          toggleSnackbar={toggleSnackbar}
          isLoggedIn = {isLoggedIn}
        />
        <Loader open={loading} />
        <Routes>
          <Route path="/" element={<ProtectedRoute>
            <Form {...commonProps} />
          </ProtectedRoute>} />
          <Route path="login" element={<Login {...commonProps}/>} />
          <Route path="register" element={<Register {...commonProps} />} />
          <Route path="search" element={<Search {...commonProps} />} />
          <Route path="claims" element={<Claims {...commonProps} />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
