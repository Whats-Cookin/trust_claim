import {useNavigate} from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {
  Menu,
  IconButton,
  Fade,
  Tooltip
} from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import ProfileDropdown from "../ProfileDropdown";

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
        sx={{ backgroundColor: "grey.300", color: "black" }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Trust Claims
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", columnGap: 3 }}>
            {isAuth ? (
              <>
              <ProfileDropdown />
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
