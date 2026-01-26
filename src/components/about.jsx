import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

export const About = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      id="about"
      sx={{
        padding: isMobile ? "60px 0" : "100px 0",
        background: "white",
        position: "relative",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={isMobile ? 4 : 6} alignItems="center">
          {/* Image Section */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                position: "relative",
                animation: "fadeInLeft 1s ease-out",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: "-20px",
                  left: "-20px",
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "20px",
                  zIndex: 0,
                  opacity: 0.1,
                },
              }}
            >
              <Box
                component="img"
                src="img/about.jpg"
                alt="About Us"
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "auto",
                  borderRadius: "20px",
                  boxShadow: "0 12px 32px rgba(102, 126, 234, 0.2)",
                  zIndex: 1,
                }}
              />
              
              {/* Decorative Badge */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: "-20px",
                  right: "-20px",
                  width: "140px",
                  height: "140px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                  zIndex: 2,
                  animation: "pulse 2s ease-in-out infinite",
                }}
              >
                <Box sx={{ textAlign: "center", color: "white" }}>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: "700", lineHeight: 1 }}
                  >
                    #1
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: "600", fontSize: "11px" }}
                  >
                    Plateforme
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Content Section */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                animation: "fadeInRight 1s ease-out",
              }}
            >
              {/* Main Title */}
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: "700",
                  fontSize: isMobile ? "28px" : "36px",
                  marginBottom: "20px",
                  color: "#1a1a1a",
                }}
              >
                من نحن
              </Typography>

              {/* Paragraph */}
              <Typography
                variant="body1"
                sx={{
                  color: "#6b7280",
                  fontSize: isMobile ? "15px" : "16px",
                  lineHeight: 1.8,
                  marginBottom: "32px",
                }}
              >
                {props.data ? props.data.paragraph : "loading..."}
              </Typography>

              {/* Why Choose Us Section */}
              <Box
                sx={{
                  background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
                  padding: isMobile ? "24px" : "28px",
                  borderRadius: "16px",
                  border: "2px solid rgba(102, 126, 234, 0.1)",
                }}
              >
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    fontWeight: "700",
                    fontSize: isMobile ? "20px" : "24px",
                    marginBottom: "20px",
                    color: "#1a1a1a",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                علاش احنا؟
                </Typography>

                <Grid container spacing={2}>
                  {/* First Column */}
                  <Grid item xs={12} sm={6}>
                    <List sx={{ padding: 0 }}>
                      {props.data
                        ? props.data.Why.map((d, i) => (
                            <ListItem
                              key={`${d}-${i}`}
                              sx={{
                                padding: "6px 0",
                                alignItems: "flex-start",
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: "36px", marginTop: "2px" }}>
                                <CheckCircleIcon
                                  sx={{
                                    color: "#667eea",
                                    fontSize: 20,
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={d}
                                primaryTypographyProps={{
                                  sx: {
                                    color: "#374151",
                                    fontSize: isMobile ? "14px" : "15px",
                                    fontWeight: "500",
                                    lineHeight: 1.6,
                                  },
                                }}
                              />
                            </ListItem>
                          ))
                        : "loading"}
                    </List>
                  </Grid>

                  {/* Second Column */}
                  <Grid item xs={12} sm={6}>
                    <List sx={{ padding: 0 }}>
                      {props.data
                        ? props.data.Why2.map((d, i) => (
                            <ListItem
                              key={`${d}-${i}`}
                              sx={{
                                padding: "6px 0",
                                alignItems: "flex-start",
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: "36px", marginTop: "2px" }}>
                                <CheckCircleIcon
                                  sx={{
                                    color: "#764ba2",
                                    fontSize: 20,
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={d}
                                primaryTypographyProps={{
                                  sx: {
                                    color: "#374151",
                                    fontSize: isMobile ? "14px" : "15px",
                                    fontWeight: "500",
                                    lineHeight: 1.6,
                                  },
                                }}
                              />
                            </ListItem>
                          ))
                        : "loading"}
                    </List>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <style>
        {`
          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes fadeInRight {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.9;
              transform: scale(0.98);
            }
          }
        `}
      </style>
    </Box>
  );
};