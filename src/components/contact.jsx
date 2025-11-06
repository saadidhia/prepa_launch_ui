import { useState } from "react";
import emailjs from "@emailjs/browser";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Send as SendIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
} from "@mui/icons-material";

const initialState = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export const Contact = (props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const [{ name, email, phone, message }, setState] = useState(initialState);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };

  const clearState = () => setState({ ...initialState });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    emailjs
      .sendForm(
        props.data.SERVICE_ID,
        props.data.TEMPLATE_ID,
        e.target,
        props.data.PUBLIC_ID
      )
      .then(
        (result) => {
          setSuccessMessage("Votre message a été envoyé avec succès");
          clearState();
          e.target.reset();
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        },
        (error) => {
          setSuccessMessage("Une erreur s'est produite. Veuillez réessayer.");
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);
        }
      );
  };

  return (
    <Box>
      {/* Contact Section */}
      <Box
        id="contact"
        sx={{
          padding: isMobile ? "60px 0" : "100px 0",
          background: "#f8f9fa",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={isMobile ? 4 : 6}>
            {/* Form Section */}
            <Grid item xs={12} md={8}>
              <Box
                sx={{
                  animation: "fadeInLeft 0.8s ease-out",
                }}
              >
                {/* Section Title */}
                <Box sx={{ marginBottom: "32px" }}>
                  <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                      fontWeight: "700",
                      fontSize: isMobile ? "28px" : "36px",
                      marginBottom: "12px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    ENVOYEZ VOTRE MESSAGE
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#6b7280",
                      fontSize: isMobile ? "14px" : "15px",
                      lineHeight: 1.6,
                    }}
                  >
                    Veuillez remplir le formulaire ci-dessous pour nous envoyer un e-mail, et nous vous répondrons dans les plus brefs délais.
                  </Typography>
                </Box>

                {/* Form */}
                <Box
                  component="form"
                  name="sentMessage"
                  onSubmit={handleSubmit}
                  sx={{
                    background: "white",
                    padding: isMobile ? "28px" : "40px",
                    borderRadius: "24px",
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
                    border: "2px solid #e5e7eb",
                  }}
                >
                  <Grid container spacing={3}>
                    {/* Name Field */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="name"
                        name="name"
                        label="Nom"
                        placeholder="Votre nom"
                        required
                        value={name}
                        onChange={handleChange}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                          },
                        }}
                      />
                    </Grid>

                    {/* Email Field */}
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="email"
                        id="email"
                        name="email"
                        label="Email"
                        placeholder="votre@email.com"
                        required
                        value={email}
                        onChange={handleChange}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                          },
                        }}
                      />
                    </Grid>

                    {/* Phone Field */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="tel"
                        id="phone"
                        name="phone"
                        label="Numéro WhatsApp"
                        placeholder="+216 55555555"
                        required
                        value={phone}
                        onChange={handleChange}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                          },
                        }}
                      />
                    </Grid>

                    {/* Message Field */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        id="message"
                        name="message"
                        label="Message"
                        placeholder="Votre message..."
                        required
                        value={message}
                        onChange={handleChange}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                          },
                        }}
                      />
                    </Grid>

                    {/* Success Message */}
                    {successMessage && (
                      <Grid item xs={12}>
                        <Alert
                          severity={successMessage.includes("succès") ? "success" : "error"}
                          sx={{
                            borderRadius: "12px",
                            animation: "slideDown 0.4s ease-out",
                          }}
                        >
                          {successMessage}
                        </Alert>
                      </Grid>
                    )}

                    {/* Submit Button */}
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        endIcon={<SendIcon />}
                        fullWidth
                        sx={{
                          padding: "14px 32px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          fontWeight: "700",
                          fontSize: "16px",
                          textTransform: "uppercase",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 16px rgba(102, 126, 234, 0.4)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        ENVOYER
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>

            {/* Contact Info Section */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  animation: "fadeInRight 0.8s ease-out",
                }}
              >
                {/* Contact Info Card */}
                <Box
                  sx={{
                    background: "white",
                    padding: isMobile ? "28px" : "32px",
                    borderRadius: "24px",
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
                    border: "2px solid #e5e7eb",
                    marginBottom: "24px",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "700",
                      fontSize: isMobile ? "20px" : "24px",
                      marginBottom: "24px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Contact Info
                  </Typography>

                  <List sx={{ padding: 0 }}>
                    {/* Address */}
                    <ListItem
                      sx={{
                        padding: "12px 0",
                        alignItems: "flex-start",
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: "40px", marginTop: "2px" }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <LocationIcon sx={{ color: "#667eea", fontSize: 20 }} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary="Address"
                        secondary={props.data ? props.data.address : "loading"}
                        primaryTypographyProps={{
                          sx: {
                            fontWeight: "700",
                            fontSize: "13px",
                            color: "#1a1a1a",
                            marginBottom: "4px",
                          },
                        }}
                        secondaryTypographyProps={{
                          sx: {
                            color: "#6b7280",
                            fontSize: "14px",
                            lineHeight: 1.6,
                          },
                        }}
                      />
                    </ListItem>

                    {/* Phone */}
                    <ListItem
                      sx={{
                        padding: "12px 0",
                        alignItems: "flex-start",
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: "40px", marginTop: "2px" }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PhoneIcon sx={{ color: "#667eea", fontSize: 20 }} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary="Phone"
                        secondary={props.data ? props.data.phone : "loading"}
                        primaryTypographyProps={{
                          sx: {
                            fontWeight: "700",
                            fontSize: "13px",
                            color: "#1a1a1a",
                            marginBottom: "4px",
                          },
                        }}
                        secondaryTypographyProps={{
                          sx: {
                            color: "#6b7280",
                            fontSize: "14px",
                            lineHeight: 1.6,
                          },
                        }}
                      />
                    </ListItem>

                    {/* Email */}
                    <ListItem
                      sx={{
                        padding: "12px 0",
                        alignItems: "flex-start",
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: "40px", marginTop: "2px" }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <EmailIcon sx={{ color: "#667eea", fontSize: 20 }} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={props.data ? props.data.email : "loading"}
                        primaryTypographyProps={{
                          sx: {
                            fontWeight: "700",
                            fontSize: "13px",
                            color: "#1a1a1a",
                            marginBottom: "4px",
                          },
                        }}
                        secondaryTypographyProps={{
                          sx: {
                            color: "#6b7280",
                            fontSize: "14px",
                            lineHeight: 1.6,
                          },
                        }}
                      />
                    </ListItem>
                  </List>
                </Box>

                {/* Social Media Card */}
                <Box
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: isMobile ? "24px" : "28px",
                    borderRadius: "24px",
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "white",
                      fontWeight: "700",
                      marginBottom: "16px",
                    }}
                  >
                    Suivez-nous
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: "12px",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      component="a"
                      href={props.data ? props.data.facebook : "/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        "&:hover": {
                          backgroundColor: "white",
                          transform: "translateY(-4px)",
                          "& .MuiSvgIcon-root": {
                            color: "#667eea",
                          },
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <FacebookIcon sx={{ color: "white", transition: "color 0.3s" }} />
                    </IconButton>

                    <IconButton
                      component="a"
                      href={props.data ? props.data.twitter : "/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        "&:hover": {
                          backgroundColor: "white",
                          transform: "translateY(-4px)",
                          "& .MuiSvgIcon-root": {
                            color: "#667eea",
                          },
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <TwitterIcon sx={{ color: "white", transition: "color 0.3s" }} />
                    </IconButton>

                    <IconButton
                      component="a"
                      href={props.data ? props.data.youtube : "/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(10px)",
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                        "&:hover": {
                          backgroundColor: "white",
                          transform: "translateY(-4px)",
                          "& .MuiSvgIcon-root": {
                            color: "#667eea",
                          },
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <YouTubeIcon sx={{ color: "white", transition: "color 0.3s" }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        id="footer"
        sx={{
          padding: "24px 0",
          background: "#1a1a1a",
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="body2"
            sx={{
              color: "#9ca3af",
              fontSize: "14px",
            }}
          >
            &copy; 2023 Dhia Saadi Design by{" "}
            <Box
              component="a"
              href="https://www.facebook.com/dhiasaady20"
              target="_blank"
              rel="nofollow noopener noreferrer"
              sx={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "600",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Dhia Saadi
            </Box>
          </Typography>
        </Container>
      </Box>

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

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
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