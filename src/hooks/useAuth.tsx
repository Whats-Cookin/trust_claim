import { createContext, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";

const AuthContext = createContext({
  user: null,
  login: (data: any) => {},
  logout: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage("user", null);
  const [accessToken, setAccessToken] = useLocalStorage("accessToken", "");
  const [refreshToken, setRefreshToken] = useLocalStorage("refreshToken", "");
  const navigate = useNavigate();

  const login = async (data: any) => {
    setUser(data);
    data.accessToken && setAccessToken(data.accessToken);
    data.refreshToken && setRefreshToken(data.refreshToken);
    const origin = location.state?.from?.pathname || '/';
    navigate(origin);
  };

  const logout = () => {
    console.info('logging out');
    setUser(null);
    setAccessToken();
    setRefreshToken();
    navigate("/", { replace: true });
  };

  //const value = useMemo(
    //() => ({
      //user,
      //login,
      //logout
    //}),
    //[user]
  //);

  const value = {
    user,
    accessToken,
    refreshToken,
    login,
    logout
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

