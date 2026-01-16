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

  const pricingData = [
    {
      plan: "شهر واحد",
      price: "35 دت",
      features: [
        "دروس",
        "امتحانات",
        "سلاسل (المنستير، تونس، منار)",
        "مسابقات (تونس، فرنسا، المغرب)",
        "تتبع وقت التحضير الخاص بك",
        "إدارة ملاحظاتك في شكل ملخصات أو قواعد",
        "راقب تقدمك من خلال الإحصائيات",
      ],
    },
    {
      plan: "ثلاثة أشهر",
      price: "100 دت",
      features: [
        "دروس",
        "امتحانات",
        "سلاسل (المنستير، تونس، منار)",
        "مسابقات (تونس، فرنسا، المغرب)",
        "تتبع وقت التحضير الخاص بك",
        "إدارة ملاحظاتك في شكل ملخصات أو قواعد",
        "راقب تقدمك من خلال الإحصائيات",
      ],
      popular: true,
    },
    {
      plan: "ستة أشهر",
      price: "200 دت",
      features: [
        "دروس",
        "امتحانات",
        "سلاسل (المنستير، تونس، منار)",
        "مسابقات (تونس، فرنسا، المغرب)",
        "تتبع وقت التحضير الخاص بك",
        "إدارة ملاحظاتك في شكل ملخصات أو قواعد",
        "راقب تقدمك من خلال الإحصائيات",
      ],
    },
    {
      plan: "عشرة أشهر",
      price: "300 دت",
      features: [
        "دروس",
        "امتحانات",
        "سلاسل (المنستير، تونس، منار)",
        "مسابقات (تونس، فرنسا، المغرب)",
        "تتبع وقت التحضير الخاص بك",
        "إدارة ملاحظاتك في شكل ملخصات أو قواعد",
        "راقب تقدمك من خلال الإحصائيات",
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
        direction: "rtl", // Added for RTL support
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
            الاشتراكات
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
            اختر الخطة التي تناسب احتياجاتك. كل خطة توفر مدة مرنة ومزايا فريدة لمساعدتك على النجاح.
          </Typography>
        </Box>

        {/* Pricing Cards */}
        <Grid container spacing={isMobile ? 3 : 4}>
          {pricingData.map((plan, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: "24px",
                  boxShadow: plan.popular
                    ? "0 12px 40px rgba(102, 126, 234, 0.25)"
                    : "0 4px 20px rgba(0, 0, 0, 0.08)",
                  border: plan.popular
                    ? "3px solid #667eea"
                    : "2px solid #e5e7eb",
                  position: "relative",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`,
                  "&:hover": {
                    transform: "translateY(-12px)",
                    boxShadow: "0 16px 48px rgba(102, 126, 234, 0.3)",
                  },
                }}
              >
                {plan.popular && (
                  <Chip
                    icon={<PremiumIcon sx={{ fontSize: 16 }} />}
                    label="الأكثر شعبية"
                    sx={{
                      position: "absolute",
                      top: "-12px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "12px",
                      padding: "16px 8px",
                      zIndex: 1,
                    }}
                  />
                )}

                <CardContent
                  sx={{
                    padding: isMobile ? "28px 20px" : "32px 24px",
                    textAlign: "center",
                  }}
                >
                  {/* Plan Name */}
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "700",
                      fontSize: isMobile ? "20px" : "22px",
                      color: "#1a1a1a",
                      marginBottom: "12px",
                    }}
                  >
                    {plan.plan}
                  </Typography>

                  {/* Price */}
                  <Box
                    sx={{
                      marginBottom: "24px",
                      padding: "16px",
                      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                      borderRadius: "16px",
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: "700",
                        fontSize: isMobile ? "32px" : "36px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {plan.price}
                    </Typography>
                  </Box>

                  {/* Features List */}
                  <List sx={{ padding: 0, marginBottom: "24px" }}>
                    {plan.features.map((feature, i) => (
                      <ListItem
                        key={i}
                        sx={{
                          padding: "8px 0",
                          alignItems: "flex-start",
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: "32px", marginTop: "2px" }}>
                          <CheckCircleIcon
                            sx={{
                              color: "#10b981",
                              fontSize: 18,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            sx: {
                              color: "#374151",
                              fontSize: "13px",
                              fontWeight: "500",
                              lineHeight: 1.5,
                              textAlign: "right",
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {/* Select Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleSelectPlan(plan)}
                    sx={{
                      padding: "12px 24px",
                      borderRadius: "12px",
                      background: plan.popular
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "#1a1a1a",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "14px",
                      textTransform: "none",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      "&:hover": {
                        background: plan.popular
                          ? "linear-gradient(135deg, #764ba2 0%, #667eea 100%)"
                          : "#374151",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.2)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    اختر الخطة
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

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