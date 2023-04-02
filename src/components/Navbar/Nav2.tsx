import { useNavigate } from "react-router-dom"
import { Button } from "@mui/material"

const Nav2 = () => {
    const navigate = useNavigate()
  return (
    <div className="flex items-center justify-between p-[2rem] z-10 fixed w-full ">
        <p className="text-[#fff] font-bold text-4xl">TrustClaim</p>
        
        <Button color="inherit" style={{background:'#80B8BD', padding: ' 0.5rem 1rem'}} onClick={() => navigate("/search")}>
                  Search
        </Button>
    </div>
  )
}

export default Nav2