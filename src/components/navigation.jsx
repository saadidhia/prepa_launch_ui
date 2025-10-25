import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Container,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Login as LoginIcon,
} from "@mui/icons-material";

export const Navigation = (props) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Livres", href: "#livres" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Team", href: "#team" },
    { label: "Contact", href: "#contact" },
  ];

  const handleNavClick = (href) => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
    
    // Smooth scroll to section
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Mobile drawer content
  const drawer = (
    <Box
      sx={{
        width: 280,
        height: "100%",
        background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "700",
            color: "white",
            letterSpacing: "1px",
          }}
        >
          TIME4PREPA
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component="a"
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              sx={{
                borderRadius: "12px",
                marginBottom: "8px",
                padding: "12px 16px",
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: "600",
                    fontSize: "15px",
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}

        <ListItem disablePadding sx={{ marginTop: "20px" }}>
          <Button
            component="a"
            href="/connexion"
            fullWidth
            startIcon={<LoginIcon />}
            sx={{
              padding: "12px 20px",
              borderRadius: "12px",
              background: "white",
              color: "#667eea",
              fontWeight: "700",
              fontSize: "14px",
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              "&:hover": {
                background: "rgba(255, 255, 255, 0.9)",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Connexion
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: scrolled
            ? "rgba(255, 255, 255, 0.95)"
            : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          boxShadow: scrolled
            ? "0 4px 20px rgba(0, 0, 0, 0.1)"
            : "none",
          transition: "all 0.3s ease",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px 0",
            }}
          >
            {/* Logo */}
            <Typography
              component="a"
              href="#page-top"
              sx={{
                fontWeight: "700",
                fontSize: "24px",
                letterSpacing: "1px",
                background: scrolled
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "white",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              TIME4PREPA
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {navItems.map((item) => (
                  <Button
                    key={item.label}
                    component="a"
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
                    sx={{
                      color: scrolled ? "#374151" : "white",
                      fontWeight: "600",
                      fontSize: "14px",
                      textTransform: "none",
                      padding: "8px 16px",
                      borderRadius: "10px",
                      "&:hover": {
                        backgroundColor: scrolled
                          ? "rgba(102, 126, 234, 0.1)"
                          : "rgba(255, 255, 255, 0.15)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {item.label}
                  </Button>
                ))}

                <Button
                  component="a"
                  href="/connexion"
                  startIcon={<LoginIcon />}
                  sx={{
                    marginLeft: "12px",
                    padding: "10px 24px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "14px",
                    textTransform: "none",
                    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Connexion
                </Button>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  color: scrolled ? "#667eea" : "white",
                  "&:hover": {
                    backgroundColor: scrolled
                      ? "rgba(102, 126, 234, 0.1)"
                      : "rgba(255, 255, 255, 0.15)",
                  },
                }}
              >
                <MenuIcon sx={{ fontSize: 28 }} />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: 280,
          },
        }}
      >
        {drawer}
      </Drawer>

      <style>
        {`
          /* Override bootstrap styles if needed */
          .navbar-fixed-top {
            position: relative !important;
          }
        `}
      </style>
    </>
  );
};