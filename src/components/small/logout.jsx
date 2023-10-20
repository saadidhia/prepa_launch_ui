import { useNavigate } from "react-router-dom"
import { useContext } from "react";
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';



import AuthContext from "../../components/context/AuthContext"

export default function Logout() {
  const Auth = useContext(AuthContext);
  const navigate = useNavigate();

  function logout() {
    Auth.userLogout();
    navigate("/")
  }

  return (

    <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />} sx={{ fontSize: '18px', color: 'white' }}>
      Logout
    </Button>
  )
}