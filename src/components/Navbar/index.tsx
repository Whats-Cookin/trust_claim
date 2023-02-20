import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const Navbar = ({ isAuth }: any) => {
  console.log(isAuth)
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
        sx={{ backgroundColor: "#607360", color: "white" }}
      >
        <Toolbar>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            Trust Claims
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", columnGap: 3 }}>
            { isAuth  ? (
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
                  sx={{
                    backgroundColor: "#445744",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#445744",
                      color: "#fff",
                    },
                  }}
                  disableElevation
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
