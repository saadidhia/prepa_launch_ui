import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

// Target date: Session Principale Bac Tunisia 2026 (typically early June)
const TARGET_DATE = new Date("2026-06-03T08:00:00");

// School year: Sept 2025 → June 2026
const YEAR_START = new Date("2025-09-01");
const YEAR_END = new Date("2026-06-30");

function getTimeLeft(target) {
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function getYearProgress() {
  const now = new Date();
  const total = YEAR_END - YEAR_START;
  const elapsed = now - YEAR_START;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

const pad = (n) => String(n).padStart(2, "0");

const CountdownCard = ({ value, label, isMobile }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: isMobile ? "calc(50% - 8px)" : "140px",
      maxWidth: isMobile ? "calc(50% - 8px)" : "200px",
      background: "rgba(255,255,255,0.55)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderRadius: "24px",
      border: "1px solid rgba(255,255,255,0.8)",
      boxShadow:
        "0 8px 32px rgba(100,130,240,0.10), 0 1.5px 8px rgba(100,130,240,0.07)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: isMobile ? "28px 12px 20px" : "44px 24px 32px",
      transition: "transform 0.2s, box-shadow 0.2s",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 16px 48px rgba(100,130,240,0.18)",
      },
    }}
  >
    <Typography
      sx={{
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 800,
        fontSize: isMobile ? "52px" : "72px",
        lineHeight: 1,
        background: "linear-gradient(135deg, #3b5bdb 0%, #4c6ef5 60%, #5c7cfa 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        letterSpacing: "-2px",
        mb: 1.5,
      }}
    >
      {pad(value)}
    </Typography>
    <Typography
      sx={{
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 700,
        fontSize: isMobile ? "10px" : "12px",
        letterSpacing: "3px",
        color: "#8c9cc4",
        textTransform: "uppercase",
      }}
    >
      {label}
    </Typography>
  </Box>
);

export const Baccalaureat = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const [timeLeft, setTimeLeft] = useState(getTimeLeft(TARGET_DATE));
  const [progress] = useState(getYearProgress());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(TARGET_DATE));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      id="baccalaureat"
      sx={{
        minHeight: "100vh",
        padding: isMobile ? "60px 0 80px" : "100px 0 120px",
        background:
          "radial-gradient(ellipse at 60% 0%, #dce8ff 0%, #eaf0fb 40%, #f0f4ff 70%, #f7f9ff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Soft decorative blobs */}
      <Box
        sx={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "340px",
          height: "340px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,130,255,0.13) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "0",
          left: "-60px",
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(118,75,162,0.09) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Title */}
        <Box
          sx={{
            textAlign: "center",
            mb: isMobile ? "48px" : "70px",
            animation: "fadeInUp 0.8s ease-out both",
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: isSmall ? "38px" : isMobile ? "52px" : "72px",
              lineHeight: 1.05,
              mb: "12px",
            }}
          >
            <Box
              component="span"
              sx={{
                color: "#1a1f3c",
              }}
            >
              موعد {" "}
            </Box>
            <Box
              component="span"
              sx={{
                background:
                  "linear-gradient(135deg, #4c6ef5 0%, #7c3aed 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
          بكالوريا 
            </Box>
            
            <br />
            <Box
              component="span"
              sx={{
                color: "#1a1f3c",
              }}
            >
              2026
            </Box>
          </Typography>

         
        </Box>

        {/* Session Badge */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: isMobile ? "36px" : "52px" }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              border: "1.5px solid #c5d0f0",
              borderRadius: "50px",
              padding: "10px 28px",
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(8px)",
              color: "#3b5bdb",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              boxShadow: "0 2px 12px rgba(60,91,219,0.08)",
            }}
          >
            <SchoolIcon sx={{ fontSize: "18px" }} />
             الدورة الرئيسية

          </Box>
        </Box>

        {/* Countdown Cards */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: isMobile ? "12px" : "20px",
            justifyContent: "center",
            mb: isMobile ? "52px" : "72px",
          }}
        >
          <CountdownCard value={timeLeft.days} label="الأيام" isMobile={isMobile} />
          <CountdownCard value={timeLeft.hours} label="الساعات" isMobile={isMobile} />
          <CountdownCard value={timeLeft.minutes} label="الدقائق" isMobile={isMobile} />
          <CountdownCard value={timeLeft.seconds} label="الثواني" isMobile={isMobile} />
        </Box>

        {/* Progress Bar */}
        <Box sx={{ maxWidth: "800px", mx: "auto" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: "12px",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "#8c9cc4",
              }}
            >
              التقدم السنوي
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                color: "#3b5bdb",
              }}
            >
              {progress}%  من الوقت مضى
            </Typography>
          </Box>
          <Box
            sx={{
              width: "100%",
              height: "8px",
              background: "rgba(180,200,255,0.25)",
              borderRadius: "100px",
              overflow: "hidden",
              border: "1px solid rgba(180,200,255,0.3)",
            }}
          >
            <Box
              sx={{
                width: `${progress}%`,
                height: "100%",
                background:
                  "linear-gradient(90deg, #4c6ef5 0%, #7c3aed 100%)",
                borderRadius: "100px",
                transition: "width 1s ease",
                boxShadow: "0 0 12px rgba(76,110,245,0.4)",
              }}
            />
          </Box>
        </Box>
      </Container>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Nunito:wght@400;500;600&display=swap');

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default Baccalaureat;