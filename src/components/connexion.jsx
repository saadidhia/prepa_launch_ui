import React, { useState, useContext, useEffect} from "react"
import AuthContext from "./context/AuthContext"
import { authApi } from '../apis/AuthApi'
import { parseJwt, handleLogError } from '../misc/Helpers'
import { errors } from '../constants'
import { Navigate } from "react-router-dom"
import '../assets/css/login.css'
import { Typography } from "@mui/material"


export function Connexion() {
    const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [isError, setIsError] = useState(false)
  const Auth = useContext(AuthContext);

  useEffect(() => {
    const loggedIn = Auth.userIsAuthenticated();
    setIsLoggedIn(loggedIn);
  }, [Auth]);




  const handleSubmit = async event => {
      event.preventDefault();
      const user = { username: username, password: password };
      if (!(username && password)) {
        setIsError('Username and password are required')
        return
      }
      try {
        const response = await authApi.authenticate(user.username, user.password);
        const { accessToken } = response.data;

        if (accessToken) {
          // SUCCESS CASE: ACCESS TOKEN IS PRESENT
          const data = parseJwt(accessToken);
          const user = { data, accessToken };

          Auth.userLogin(user);

          setUsername('');
          setPassword('');
          setIsLoggedIn(true);
          setIsError(null); // Clear any previous error
        } else {
          // ERROR CASE: ACCESS TOKEN IS NULL
          setIsLoggedIn(false);
          setIsError(response.data.error || 'Authentication failed');
        }
      } catch (error) {
        // GENERAL ERROR CASE: HANDLE UNEXPECTED ERRORS
        setIsLoggedIn(false);
        setIsError(error.response.data.error);
      }
    }






  if (isLoggedIn) {
    if (Auth.getUser().data.rol[0]=='ADMIN') {
    return <Navigate to={'/dashboard/users'} />
    }else {
      return <Navigate to={'/dashboard/cours'} />
    }
  } else {

    return (
        (
            <div className="Auth-form-container">
              <form className="Auth-form" onSubmit={handleSubmit} >
                <div className="Auth-form-content">
                  <h3 className="Auth-form-title">
                    <img /*src={logo}*/ height="250" weight="300" alt="Prepa Launch Logo" />
                  </h3>
      
                  <div className="form-group mt-3">
                    <label >Nom</label>
                    <input
                      onChange={(e) => setUsername(e.target.value)}
                      type="text"
                      className="form-control mt-1"
                      placeholder="Nom"
                    />
                  </div>
                  <div className="form-group mt-3">
                    <label >mot de passe</label>
                    <input
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      className="form-control mt-1"
                      placeholder="Mot de passe"
                    />
                  </div>
                  <div className="d-grid gap-2 mt-3">
                    <button type="submit" className="btn btn-primary" >
                      Login
                    </button>
                    <div className="d-grid gap-2 mt-3" style={{marginTop:'1rem'}}>
                      {isError && <Typography sx={{fontWeight:700, fontSize:"13px", fontFamily:"Arial", fontStyle:'italic'}} variant="h6">{isError}</Typography>}
                    </div>
      
                  </div>
                </div>
              </form>
            </div>
          )
    )
}
}