import { useEffect, useState } from "react";
import Form from "../Form";
import Auth from "../Auth";

const Home = () => {
  const [isAuth, setAuth] = useState(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (accessToken && refreshToken) return true;
    return false;
  });

  return isAuth ? <Form setAuth={setAuth} /> : <Auth setAuth={setAuth} />;
};

export default Home;
