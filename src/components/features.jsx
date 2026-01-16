import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  MenuBook as MenuBookIcon,
  Timer as TimerIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  EmojiEvents as TrophyIcon,
  Groups as GroupsIcon,
  LocalLibrary as LibraryIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";

// Icon mapping for Font Awesome to Material-UI
const getIconComponent = (iconClass) => {
  const iconMap = {
    "fa-book": MenuBookIcon,
    "fa-clock": TimerIcon,
    "fa-graduation-cap": SchoolIcon,
    "fa-chart-bar": AssessmentIcon,
    "fa-trophy": TrophyIcon,
    "fa-users": GroupsIcon,
    "fa-university": LibraryIcon,
    "fa-calendar": CalendarIcon,
  };

  // Extract the icon name from class string
  const iconName = iconClass?.split(" ").find((cls) => cls.startsWith("fa-"));
  const IconComponent = iconMap[iconName] || SchoolIcon;

  return IconComponent;
};

export const Features = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      id="features"
      sx={{
        padding: isMobile ? "60px 0" : "100px 0",
        background: "#f8f9fa",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "300px",
          background: "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)",
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Section Title */}
        <Box
          sx={{
            textAlign: "center",
            marginBottom: isMobile ? "40px" : "60px",
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
            الميزات
          </Typography>
          <Box
            sx={{
              width: "80px",
              height: "4px",
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "2px",
              margin: "0 auto",
            }}
          />
        </Box>

        {/* Features Grid */}
        <Grid container spacing={isMobile ? 3 : 4}>
          {props.data
            ? props.data.map((d, i) => {
                const IconComponent = getIconComponent(d.icon);
                return (
                  <Grid item xs={12} sm={6} md={3} key={`${d.title}-${i}`}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: "20px",
                        boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        border: "1px solid #e5e7eb",
                        background: "white",
                        position: "relative",
                        overflow: "hidden",
                        animation: `fadeInUp 0.8s ease-out ${i * 0.1}s both`,
                        "&:hover": {
                          transform: "translateY(-12px)",
                          boxShadow: "0 12px 32px rgba(102, 126, 234, 0.2)",
                          "& .icon-wrapper": {
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            transform: "scale(1.1) rotate(5deg)",
                          },
                          "& .feature-icon": {
                            color: "white",
                          },
                          "&::before": {
                            opacity: 1,
                          },
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "4px",
                          background:
                            "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                          opacity: 0,
                          transition: "opacity 0.4s ease",
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          padding: isMobile ? "28px 20px" : "32px 24px",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        {/* Icon */}
                        <Box
                          className="icon-wrapper"
                          sx={{
                            width: isMobile ? 64 : 72,
                            height: isMobile ? 64 : 72,
                            borderRadius: "16px",
                            background: "rgba(102, 126, 234, 0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                            border: "2px solid rgba(102, 126, 234, 0.2)",
                          }}
                        >
                          <IconComponent
                            className="feature-icon"
                            sx={{
                              fontSize: isMobile ? 32 : 36,
                              color: "#667eea",
                              transition: "color 0.4s ease",
                            }}
                          />
                        </Box>

                        {/* Title */}
                        <Typography
                          variant="h5"
                          component="h3"
                          sx={{
                            fontWeight: "700",
                            fontSize: isMobile ? "18px" : "20px",
                            color: "#1a1a1a",
                            marginBottom: "4px",
                          }}
                        >
                          {d.title}
                        </Typography>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#6b7280",
                            fontSize: isMobile ? "13px" : "14px",
                            lineHeight: 1.6,
                          }}
                        >
                          {d.text}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
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
                    Loading...
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
        `}
      </style>
    </Box>
  );
};