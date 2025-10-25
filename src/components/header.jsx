import React from "react";
import { Box, Container, Typography, Button, useTheme, useMediaQuery } from "@mui/material";
import { ArrowForward as ArrowForwardIcon, School as SchoolIcon } from "@mui/icons-material";

export const Header = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLearnMore = (e) => {
    e.preventDefault();
    const element = document.querySelector("#features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box
      id="header"
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("img/intro-bg.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 50% 50%, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.4) 100%)",
          zIndex: 0,
        },
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
            top: "-100px",
            left: "-100px",
            animation: "float 20s ease-in-out infinite",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
            bottom: "-80px",
            right: "-80px",
            animation: "float 15s ease-in-out infinite reverse",
          }}
        />
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: isMobile ? "40px 20px" : "60px 20px",
        }}
      >
        <Box
          sx={{
            animation: "fadeInUp 1s ease-out",
          }}
        >
          {/* Icon Badge */}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              marginBottom: "32px",
              animation: "pulse 2s ease-in-out infinite",
            }}
          >
            <SchoolIcon sx={{ fontSize: 40, color: "white" }} />
          </Box>

          {/* Title */}
          <Typography
            variant={isMobile ? "h3" : "h1"}
            component="h1"
            sx={{
              color: "white",
              fontWeight: "700",
              fontSize: isMobile ? "36px" : "56px",
              lineHeight: 1.2,
              marginBottom: "24px",
              textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
              animation: "fadeInUp 1s ease-out 0.2s both",
            }}
          >
            {props.data ? props.data.title : "Loading"}
          </Typography>

          {/* Paragraph */}
          <Typography
            variant={isMobile ? "body1" : "h5"}
            sx={{
              color: "rgba(255, 255, 255, 0.95)",
              fontSize: isMobile ? "16px" : "20px",
              lineHeight: 1.6,
              marginBottom: "40px",
              maxWidth: "800px",
              margin: "0 auto 40px",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
              animation: "fadeInUp 1s ease-out 0.4s both",
            }}
          >
            {props.data ? props.data.paragraph : "Loading"}
          </Typography>

          {/* CTA Button */}
          <Button
            component="a"
            href="#features"
            onClick={handleLearnMore}
            endIcon={<ArrowForwardIcon />}
            size="large"
            sx={{
              padding: isMobile ? "14px 32px" : "16px 48px",
              borderRadius: "50px",
              background: "white",
              color: "#667eea",
              fontWeight: "700",
              fontSize: isMobile ? "15px" : "18px",
              textTransform: "none",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
              border: "2px solid transparent",
              animation: "fadeInUp 1s ease-out 0.6s both",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.95)",
                transform: "translateY(-4px)",
                boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)",
                border: "2px solid rgba(255, 255, 255, 0.5)",
              },
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            En savoir plus
          </Button>

          {/* Decorative Elements */}
          <Box
            sx={{
              marginTop: "60px",
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              animation: "fadeInUp 1s ease-out 0.8s both",
            }}
          >
            {[1, 2, 3].map((item) => (
              <Box
                key={item}
                sx={{
                  width: isMobile ? "40px" : "60px",
                  height: "4px",
                  borderRadius: "2px",
                  background: "rgba(255, 255, 255, 0.3)",
                  animation: `pulse ${1 + item * 0.5}s ease-in-out infinite`,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Scroll Indicator */}
        <Box
          sx={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            animation: "bounce 2s ease-in-out infinite",
          }}
        >
          <Box
            sx={{
              width: "30px",
              height: "50px",
              border: "2px solid rgba(255, 255, 255, 0.5)",
              borderRadius: "20px",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                width: "6px",
                height: "10px",
                backgroundColor: "white",
                borderRadius: "3px",
                top: "8px",
                left: "50%",
                transform: "translateX(-50%)",
                animation: "scroll 2s ease-in-out infinite",
              },
            }}
          />
        </Box>
      </Container>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(0.95);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translate(0, 0) rotate(0deg);
            }
            33% {
              transform: translate(30px, -30px) rotate(120deg);
            }
            66% {
              transform: translate(-20px, 20px) rotate(240deg);
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateX(-50%) translateY(0);
            }
            50% {
              transform: translateX(-50%) translateY(-10px);
            }
          }

          @keyframes scroll {
            0% {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
            100% {
              opacity: 0;
              transform: translateX(-50%) translateY(20px);
            }
          }
        `}
      </style>
    </Box>
  );
};