import { useEffect, useState } from "react";
import Form from "../Form";
import Auth from "../Auth";

const Home = () => {
  const [isAuth, setAuth] = useState(false);
  return isAuth ? <Form setAuth={setAuth} /> : <Auth setAuth={setAuth} />;
};

export default Home;
