import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const Navbar = ({ isAuth }: any) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <Box sx={{ flexGrow: 1, width: "100%", overflow: "hidden" }}>
      <AppBar
        position="static"
        sx={{ backgroundColor: "#823e3e", color: "#280606" }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Trust Claims
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", columnGap: 3 }}>
            {isAuth ? (
              <>
                <Button color="inherit" onClick={() => navigate("/")}>
                  Create Claim
                </Button>
                <Button color="inherit" onClick={() => navigate("/search")}>
                  Search
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="contained"
                  size="large"
                  color="error"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button color="inherit" onClick={() => navigate("/register")}>
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
