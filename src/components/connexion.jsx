import React, { useState, useContext, useEffect } from "react";
import AuthContext from "./context/AuthContext";
import { authApi } from '../apis/AuthApi';
import { parseJwt, handleLogError } from '../misc/Helpers';
import { Navigate } from "react-router-dom";
import '../assets/css/login.css';
import { Typography, CircularProgress } from "@mui/material";
import logo from "../assets/logo/logo.png"; 
import { Eye, EyeOff } from "lucide-react";

export function Connexion() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const Auth = useContext(AuthContext);

  useEffect(() => {
    const loggedIn = Auth.userIsAuthenticated();
    setIsLoggedIn(loggedIn);
  }, [Auth]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const user = { username: username, password: password };

    if (!(username && password)) {
      setIsError("يُرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.authenticate(user.username, user.password);
      const { accessToken } = response.data;

      if (accessToken) {
        const data = parseJwt(accessToken);
        const user = { data, accessToken };

        Auth.userLogin(user);
        setUsername("");
        setPassword("");
        setIsLoggedIn(true);
        setIsError(null);
      } else {
        setIsLoggedIn(false);
        setIsError(response.data.error || "Authentication failed");
      }
    } catch (error) {
      setIsLoggedIn(false);
      setIsError(error.response?.data?.error || "Error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    if (Auth.getUser().data.rol[0] === "ADMIN") {
      return <Navigate to={"/dashboard/users"} />;
    } else {
      return <Navigate to={"/dashboard/cours"} />;
    }
  } else {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
      }}>
        <div style={{
          background: "white",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          width: "100%",
          maxWidth: "440px",
          padding: "48px 40px",
          animation: "slideUp 0.5s ease-out"
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <img 
                src={logo} 
                alt="Grintta Logo" 
                style={{ 
                  width: "280px", 
                  height: "auto", 
                  marginBottom: "16px",
                  filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))"
                }} 
              />
              <Typography 
                variant="h5" 
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#1a1a1a",
                  marginTop: "8px"
                }}
              >
                مرحباً
              </Typography>
              <Typography 
                variant="body2" 
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginTop: "4px"
                }}
              >
                قم بتسجيل الدخول إلى حسابك
              </Typography>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ 
                fontWeight: "600", 
                fontSize: "14px", 
                color: "#374151",
                display: "block",
                marginBottom: "8px"
              }}>
                إسم المستخدم
              </label>
              <input
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder="Entrez votre nom"
                value={username}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                  fontSize: "15px",
                  transition: "all 0.3s ease",
                  outline: "none",
                  backgroundColor: "#f9fafb",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.backgroundColor = "white";
                  e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                  e.target.style.backgroundColor = "#f9fafb";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ 
                fontWeight: "600", 
                fontSize: "14px", 
                color: "#374151",
                display: "block",
                marginBottom: "8px"
              }}>
                كلمة السر
              </label>
              <div style={{ position: "relative" }}>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  style={{
                    width: "100%",
                    padding: "12px 48px 12px 16px",
                    borderRadius: "12px",
                    border: "2px solid #e5e7eb",
                    fontSize: "15px",
                    transition: "all 0.3s ease",
                    outline: "none",
                    backgroundColor: "#f9fafb",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.backgroundColor = "white";
                    e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.backgroundColor = "#f9fafb";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "12px",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    background: "none",
                    border: "none",
                    padding: "8px",
                    transition: "color 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#667eea"}
                  onMouseLeave={(e) => e.target.style.color = "#6b7280"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isError && (
              <div style={{
                padding: "12px 16px",
                borderRadius: "12px",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                marginBottom: "24px",
                animation: "shake 0.5s ease"
              }}>
                <Typography
                  style={{
                    fontWeight: "600",
                    fontSize: "13px",
                    color: "#dc2626",
                    margin: 0
                  }}
                >
                  {isError}
                </Typography>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                fontSize: "16px",
                fontWeight: "700",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                opacity: isLoading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
              }}
            >
              {isLoading ? <CircularProgress size={24} style={{ color: "white" }} /> : "تسجيل الدخول"}
            </button>
          </form>
        </div>

        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
        `}</style>
      </div>
    );
  }
}
