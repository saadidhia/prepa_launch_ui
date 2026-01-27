import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Wc as GenderIcon,
  School as SchoolIcon,
  MenuBook as BookIcon,
  WhatsApp as WhatsAppIcon,
  Close as CloseIcon,
  WorkspacePremium as PremiumIcon,
} from "@mui/icons-material";

export const Services = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const pricingData = [
    {
      plan: "سنة دراسية كاملة",
      price: "متاح حاليا للمتحصلين على كتاب Grintta بالباكالوريا 2026",
      features: [
        "دروس",
        "امتحانات",
        "ملخصات",
        "تحفيز",
        "تتبع وقت التحضير الخاص بك",
        "إدارة ملاحظاتك في شكل ملخصات أو قواعد", 
      ],
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [level, setLevel] = useState("");
  const [branch, setBranch] = useState("");

  const handleSelectPlan = (plan) => setSelectedPlan(plan);

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `مرحبا، أود الاشتراك في خطة ${selectedPlan.plan} (${selectedPlan.price}).
الاسم: ${name}, الهاتف: ${phone}, البريد الإلكتروني: ${email}, الجنس: ${gender}, المستوى: ${level}, الشعبة: ${branch}`;
    const whatsappNumber = "+21622609381";
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    // reset
    setSelectedPlan(null);
    setName("");
    setPhone("");
    setEmail("");
    setGender("");
    setLevel("");
    setBranch("");
  };

  return (
    <Box
      id="services"
      sx={{
        padding: isMobile ? "60px 0" : "100px 0",
        background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)",
        position: "relative",
        direction: "rtl",
      }}
    >
      <Container maxWidth="lg">
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
            عروضنا
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#6b7280",
              fontSize: isMobile ? "15px" : "16px",
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
          </Typography>
        </Box>

        {/* Centered Pricing Card */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: isMobile ? "100%" : isTablet ? "500px" : "600px",
            }}
          >
            {pricingData.map((plan, index) => (
              <Card
                key={index}
                sx={{
                  borderRadius: "24px",
                  boxShadow: "0 12px 40px rgba(102, 126, 234, 0.25)",
                  border: "3px solid #667eea",
                  position: "relative",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: `fadeInUp 0.8s ease-out`,
                  "&:hover": {
                    transform: "translateY(-12px)",
                    boxShadow: "0 16px 48px rgba(102, 126, 234, 0.3)",
                  },
                }}
              >
                <Chip
                  icon={<PremiumIcon sx={{ fontSize: isMobile ? 14 : 18 }} />}
                  label="الأكثر شعبية"
                  sx={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    fontWeight: "700",
                    fontSize: isMobile ? "11px" : "14px",
                    padding: isMobile ? "14px 6px" : "18px 10px",
                    zIndex: 1,
                  }}
                />

                <CardContent
                  sx={{
                    padding: isMobile ? "36px 24px" : isTablet ? "48px 36px" : "56px 48px",
                    textAlign: "center",
                  }}
                >
                  {/* Plan Name */}
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "700",
                      fontSize: isMobile ? "24px" : isTablet ? "28px" : "32px",
                      color: "#1a1a1a",
                      marginBottom: isMobile ? "16px" : "20px",
                    }}
                  >
                    {plan.plan}
                  </Typography>

                  {/* Price */}
                  <Box
                    sx={{
                      marginBottom: isMobile ? "28px" : "36px",
                      padding: isMobile ? "20px" : isTablet ? "24px" : "28px",
                      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                      borderRadius: "16px",
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: "700",
                        fontSize: isMobile ? "16px" : isTablet ? "18px" : "20px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        lineHeight: 1.6,
                      }}
                    >
                      {plan.price}
                    </Typography>
                  </Box>

                  {/* Features List */}
                  <List sx={{ padding: 0, marginBottom: isMobile ? "28px" : "36px" }}>
                    {plan.features.map((feature, i) => (
                      <ListItem
                        key={i}
                        sx={{
                          padding: isMobile ? "10px 0" : "12px 0",
                          alignItems: "flex-start",
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: isMobile ? "36px" : "40px", marginTop: "2px" }}>
                          <CheckCircleIcon
                            sx={{
                              color: "#10b981",
                              fontSize: isMobile ? 20 : 24,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            sx: {
                              color: "#374151",
                              fontSize: isMobile ? "15px" : isTablet ? "16px" : "17px",
                              fontWeight: "500",
                              lineHeight: 1.6,
                              textAlign: "right",
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Select Button 
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleSelectPlan(plan)}
                    
                    sx={{
                      padding: isMobile ? "14px 28px" : isTablet ? "16px 32px" : "18px 36px",
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      fontWeight: "700",
                      fontSize: isMobile ? "16px" : isTablet ? "17px" : "18px",
                      textTransform: "none",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    اختر الخطة
                  </Button>  */}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Modal Form */}
        <Dialog
          open={selectedPlan !== null}
          onClose={() => setSelectedPlan(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: "24px",
              boxShadow: "0 20px 60px rgba(102, 126, 234, 0.3)",
              direction: "rtl",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              padding: "24px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: "700", marginBottom: "4px" }}>
                التسجيل
              </Typography>
              {selectedPlan && (
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  الخطة: {selectedPlan.plan} ({selectedPlan.price})
                </Typography>
              )}
            </Box>
            <Button
              onClick={() => setSelectedPlan(null)}
              sx={{
                color: "white",
                minWidth: "auto",
                padding: "8px",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <CloseIcon />
            </Button>
          </DialogTitle>

          <form onSubmit={handleSubmit}>
            <DialogContent
              sx={{
                padding: "32px",
                background: "#f8f9fa",
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Name */}
                <TextField
                  fullWidth
                  label="اسمك"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ color: "#667eea", marginLeft: "12px" }} />,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "white",
                    },
                  }}
                />

                {/* Phone */}
                <TextField
                  fullWidth
                  label="رقم هاتفك"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ color: "#667eea", marginLeft: "12px" }} />,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "white",
                    },
                  }}
                />

                {/* Email */}
                <TextField
                  fullWidth
                  type="email"
                  label="بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ color: "#667eea", marginLeft: "12px" }} />,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                      backgroundColor: "white",
                    },
                  }}
                />

                {/* Gender */}
                <FormControl fullWidth required>
                  <InputLabel>اختر الجنس</InputLabel>
                  <Select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    label="اختر الجنس"
                    startAdornment={<GenderIcon sx={{ color: "#667eea", marginLeft: "12px" }} />}
                    sx={{
                      borderRadius: "12px",
                      backgroundColor: "white",
                    }}
                  >
                    <MenuItem value="ذكر">ذكر</MenuItem>
                    <MenuItem value="أنثى">أنثى</MenuItem>
                  </Select>
                </FormControl>

                {/* Level */}
                <FormControl fullWidth required>
                  <InputLabel>اختر المستوى</InputLabel>
                  <Select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    label="اختر المستوى"
                    startAdornment={<SchoolIcon sx={{ color: "#667eea", marginLeft: "12px" }} />}
                    sx={{
                      borderRadius: "12px",
                      backgroundColor: "white",
                    }}
                  >
                    <MenuItem value="السنة الثالثة">السنة الثالثة</MenuItem>
                    <MenuItem value="الباكالوريا">الباكالوريا</MenuItem>
                  </Select>
                </FormControl>

                {/* Branch */}
                <FormControl fullWidth required>
                  <InputLabel>اختر الشعبة</InputLabel>
                  <Select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    label="اختر الشعبة"
                    startAdornment={<BookIcon sx={{ color: "#667eea", marginLeft: "12px" }} />}
                    sx={{
                      borderRadius: "12px",
                      backgroundColor: "white",
                    }}
                  >
                    <MenuItem value="رياضيات">رياضيات</MenuItem>
                    <MenuItem value="علوم">علوم</MenuItem>
                    <MenuItem value="تقنية">تقنية</MenuItem>
                    <MenuItem value="إعلامية">إعلامية</MenuItem>
                    <MenuItem value="اقتصاد">اقتصاد</MenuItem>
                    <MenuItem value="آداب">آداب</MenuItem>
                    <MenuItem value="رياضة">رياضة</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>

            <DialogActions
              sx={{
                padding: "20px 32px",
                background: "#f8f9fa",
                gap: "12px",
              }}
            >
              <Button
                onClick={() => setSelectedPlan(null)}
                sx={{
                  padding: "10px 24px",
                  borderRadius: "12px",
                  fontWeight: "700",
                  textTransform: "none",
                  color: "#6b7280",
                  "&:hover": {
                    backgroundColor: "#e5e7eb",
                  },
                }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<WhatsAppIcon />}
                sx={{
                  padding: "10px 24px",
                  borderRadius: "12px",
                  background: "#25D366",
                  color: "white",
                  fontWeight: "700",
                  textTransform: "none",
                  "&:hover": {
                    background: "#20BA5A",
                  },
                }}
              >
                إرسال عبر واتساب
              </Button>
            </DialogActions>
          </form>
        </Dialog>
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