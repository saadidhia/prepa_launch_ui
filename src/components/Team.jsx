import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Email as EmailIcon,
} from "@mui/icons-material";

export const Team = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      id="team"
      sx={{
        padding: isMobile ? "60px 0" : "100px 0",
        background: "white",
        position: "relative",
        direction: "rtl", // Added for RTL support
      }}
    >
      <Container maxWidth="lg">
        {/* Section Title */}
        <Box
          sx={{
            textAlign: "center",
            marginBottom: isMobile ? "40px" : "60px",
            maxWidth: "800px",
            margin: "0 auto",
            animation: "fadeInUp 0.8s ease-out",
          }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: "700",
              fontSize: isMobile ? "32px" : "42px",
              marginBottom: "16px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            تعرف على الفريق
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#6b7280",
              fontSize: isMobile ? "15px" : "16px",
              lineHeight: 1.6,
              marginBottom: isMobile ? "40px" : "0",
            }}
          >
            اكتشف فريقنا الموهوب والشغوف الذي يعمل معك لتحقيق أهدافك. تعرف على الوجوه وراء مركزنا.
          </Typography>
        </Box>

        {/* Team Grid */}
        <Grid container spacing={isMobile ? 3 : 4} justifyContent="center">
          {props.data
            ? props.data.map((d, i) => (
                <Grid item xs={12} sm={6} md={3} key={`${d.name}-${i}`}>
                  <Card
                    sx={{
                      borderRadius: "24px",
                      boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
                      border: "2px solid #e5e7eb",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      animation: `fadeInUp 0.8s ease-out ${i * 0.1}s both`,
                      overflow: "hidden",
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-12px)",
                        boxShadow: "0 16px 40px rgba(102, 126, 234, 0.2)",
                        "& .team-avatar": {
                          transform: "scale(1.1)",
                        },
                        "& .team-overlay": {
                          opacity: 1,
                        },
                        "& .social-icons": {
                          transform: "translateY(0)",
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    {/* Avatar Container */}
                    <Box
                      sx={{
                        position: "relative",
                        paddingTop: "24px",
                        display: "flex",
                        justifyContent: "center",
                        background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)",
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: 120,
                          height: 120,
                          marginBottom: "16px",
                        }}
                      >
                        {/* Avatar with gradient border */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: -4,
                            left: -4,
                            right: -4,
                            bottom: -4,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            animation: "rotate 3s linear infinite",
                          }}
                        />
                        <Avatar
                          className="team-avatar"
                          src={d.img}
                          alt={d.name}
                          sx={{
                            width: 120,
                            height: 120,
                            border: "4px solid white",
                            position: "relative",
                            zIndex: 1,
                            transition: "transform 0.4s ease",
                          }}
                        />

                        {/* Online indicator */}
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 8,
                            right: 8,
                            width: 16,
                            height: 16,
                            backgroundColor: "#10b981",
                            borderRadius: "50%",
                            border: "3px solid white",
                            zIndex: 2,
                            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                          }}
                        />
                      </Box>

                      {/* Hover Overlay for Social Icons */}
                      <Box
                        className="team-overlay"
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "linear-gradient(180deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)",
                          opacity: 0,
                          transition: "opacity 0.4s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 3,
                        }}
                      >
                        <Box
                          className="social-icons"
                          sx={{
                            display: "flex",
                            gap: "12px",
                            transform: "translateY(20px)",
                            opacity: 0,
                            transition: "all 0.4s ease 0.1s",
                          }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              backgroundColor: "rgba(255, 255, 255, 0.2)",
                              backdropFilter: "blur(10px)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              border: "2px solid rgba(255, 255, 255, 0.3)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                backgroundColor: "white",
                                transform: "scale(1.1)",
                                "& .MuiSvgIcon-root": {
                                  color: "#667eea",
                                },
                              },
                            }}
                          >
                            <LinkedInIcon sx={{ fontSize: 20, color: "white", transition: "color 0.3s" }} />
                          </Box>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              backgroundColor: "rgba(255, 255, 255, 0.2)",
                              backdropFilter: "blur(10px)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              border: "2px solid rgba(255, 255, 255, 0.3)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                backgroundColor: "white",
                                transform: "scale(1.1)",
                                "& .MuiSvgIcon-root": {
                                  color: "#667eea",
                                },
                              },
                            }}
                          >
                            <TwitterIcon sx={{ fontSize: 20, color: "white", transition: "color 0.3s" }} />
                          </Box>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              backgroundColor: "rgba(255, 255, 255, 0.2)",
                              backdropFilter: "blur(10px)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              border: "2px solid rgba(255, 255, 255, 0.3)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                backgroundColor: "white",
                                transform: "scale(1.1)",
                                "& .MuiSvgIcon-root": {
                                  color: "#667eea",
                                },
                              },
                            }}
                          >
                            <EmailIcon sx={{ fontSize: 20, color: "white", transition: "color 0.3s" }} />
                          </Box>
                        </Box>
                      </Box>
                    </Box>

                    {/* Card Content */}
                    <CardContent
                      sx={{
                        padding: "20px 24px 28px",
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "700",
                          fontSize: isMobile ? "18px" : "20px",
                          color: "#1a1a1a",
                          marginBottom: "6px",
                        }}
                      >
                        {d.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                          border: "1px solid rgba(102, 126, 234, 0.2)",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#667eea",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                        >
                          {d.job}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : <Grid item xs={12}>
                <Box
                  sx={{
                    textAlign: "center",
                    padding: "40px",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#9ca3af",
                      fontWeight: "600",
                    }}
                  >
                    جاري التحميل...
                  </Typography>
                </Box>
              </Grid>}
        </Grid>
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

          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </Box>
  );
};