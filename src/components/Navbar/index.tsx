import {useNavigate} from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ProfileDropdown from "../profileDropDown/index";
import Nav2 from "./Nav2";
import Search from '../../containers/Search/index';


const Navbar = ({isAuth} : any) => {
    const navigate = useNavigate();
   
    // const handleLogout = () => {
    // localStorage.removeItem("accessToken");
    // localStorage.removeItem("refreshToken");
    // navigate("/login");
    // };
    const isSearch = window.location.pathname === "/search";
    return (
        <>

            <Box sx={
                {
                    flexGrow: 1,
                    width: "100%",
                    overflow: "hidden"
                }
            }>
                <AppBar position="fixed"
                    sx={
                        {
                            backgroundColor: "#eeeeee",
                            color: "#280606",
                            top: 0,
                            width: '100%'
                        }
                }>
                    <Toolbar>
                        <Typography variant="h5" component="div"
                            sx={
                                {
                                    flexGrow: 1,
                                    fontWeight: "bold"
                                }
                        }>
                            Trust Claims
                        </Typography>
                        {/* <Button color="inherit"
                            style={
                                {
                                    background: '#80B8BD',
                                    padding: ' 0.5rem 1rem',
                                    display: "flex",
                                    columnGap: 3,
                                    marginRight:"20px",
                                }
                            }
                            onClick={
                                () => navigate("/search")
                        }>
                            Search
                        </Button> */}
                        <Box sx={
                            {
                                display: "flex",
                                justifyContent: "center",
                                columnGap: 3
                            }
                        }>
                            {
                            isAuth ? (
                                <>

                                    <ProfileDropdown/>
                                </>
                            ) : (
                                <>
                                    <Nav2/>
                                </>
                            )
                        } </Box>
                    </Toolbar>
                </AppBar>
            </Box>
        </>
    );
};

export default Navbar;
