import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
  PieChart,
  Pie,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { FilterStatistic } from "../small/filterStatistic";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
} from "@mui/material";
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

const colors = [
  "#667eea", // purple (primary)
  "#764ba2", // purple variant
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

export function Progression() {
  const [statisticsData, setStatisticsData] = useState([]);

  // Format seconds into hh:mm:ss
  const formatTime = (s) => {
    const seconds = Math.floor(s);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;

    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  // Transform elapsedTime into total seconds
  const handleDataReceived = (data) => {
    const transformedData = data.map((item) => {
      const [hours, minutes, seconds] = item.elapsedTime
        .match(/\d+/g)
        .map(Number);

      const totalSeconds = (hours * 3600 + minutes * 60 + seconds) / 1_000_000;

      return {
        ...item,
        totalSeconds,
      };
    });

    // Calculate total for percentages
    const totalTime = transformedData.reduce(
      (acc, item) => acc + item.totalSeconds,
      0
    );
    const withPercentages = transformedData.map((item) => ({
      ...item,
      percentage: totalTime > 0 ? item.totalSeconds / totalTime : 0,
    }));

    setStatisticsData(withPercentages);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            padding: "12px 16px",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            border: "2px solid #667eea",
          }}
        >
          <Typography sx={{ fontWeight: "700", color: "#1a1a1a", marginBottom: "4px" }}>
            {payload[0].payload.subject}
          </Typography>
          <Typography sx={{ color: "#6b7280", fontSize: "14px" }}>
            Temps: {formatTime(payload[0].value)}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  const totalTime = statisticsData.reduce((acc, item) => acc + item.totalSeconds, 0);

  return (
    <Container maxWidth="xl" sx={{ paddingY: "32px" }}>
      {/* Header */}
      <Box sx={{ marginBottom: "32px", textAlign: "center" }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "700",
            color: "#1a1a1a",
            marginBottom: "12px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Ma Progression
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "#6b7280",
            fontSize: "16px",
            fontWeight: "500",
            marginBottom: "16px",
          }}
        >
          Analysez votre temps d'étude par matière
        </Typography>
        
        {statisticsData.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <Chip
              icon={<TrendingUpIcon />}
              label={`${statisticsData.length} matières`}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                fontWeight: "700",
                padding: "20px 12px",
                fontSize: "14px",
              }}
            />
            <Chip
              label={`Temps total: ${formatTime(totalTime)}`}
              sx={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                fontWeight: "700",
                padding: "20px 12px",
                fontSize: "14px",
              }}
            />
          </Box>
        )}
      </Box>

      {/* Filter */}
      <Box sx={{ marginBottom: "32px" }}>
        <FilterStatistic onDataReceived={handleDataReceived} />
      </Box>

      {/* Charts */}
      {statisticsData.length === 0 ? (
        <Paper
          sx={{
            padding: "60px 20px",
            textAlign: "center",
            borderRadius: "20px",
            border: "2px dashed #e5e7eb",
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.05) 100%)",
          }}
        >
          <ShowChartIcon sx={{ fontSize: 64, color: "#9ca3af", marginBottom: "16px" }} />
          <Typography variant="h6" sx={{ color: "#6b7280", fontWeight: "600" }}>
            Aucune donnée disponible
          </Typography>
          <Typography sx={{ color: "#9ca3af", marginTop: "8px" }}>
            Sélectionnez une période pour voir vos statistiques
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Bar Chart */}
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                height: "100%",
                borderRadius: "20px",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <BarChartIcon sx={{ color: "white", fontSize: 28 }} />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: "700", fontSize: "18px" }}
                  >
                    Temps par matière
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "13px" }}
                  >
                    Graphique en barres
                  </Typography>
                </Box>
              </Box>
              <CardContent sx={{ padding: "24px" }}>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={statisticsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <defs>
                      {statisticsData.map((entry, index) => (
                        <linearGradient
                          key={`gradient-${index}`}
                          id={`colorBar${index}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={colors[index % colors.length]}
                            stopOpacity={1}
                          />
                          <stop
                            offset="100%"
                            stopColor={colors[index % colors.length]}
                            stopOpacity={0.7}
                          />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="subject"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      tickFormatter={formatTime}
                      tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="totalSeconds" radius={[8, 8, 0, 0]}>
                      {statisticsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`url(#colorBar${index})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                height: "100%",
                borderRadius: "20px",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <PieChartIcon sx={{ color: "white", fontSize: 28 }} />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: "700", fontSize: "18px" }}
                  >
                    Répartition du temps
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "13px" }}
                  >
                    Pourcentage par matière
                  </Typography>
                </Box>
              </Box>
              <CardContent sx={{ padding: "24px" }}>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={statisticsData}
                      dataKey="percentage"
                      nameKey="subject"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(1)}%`
                      }
                      labelLine={{
                        stroke: "#6b7280",
                        strokeWidth: 1,
                      }}
                    >
                      {statisticsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Line Chart */}
          <Grid item xs={12}>
            <Card
              sx={{
                borderRadius: "20px",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <ShowChartIcon sx={{ color: "white", fontSize: 28 }} />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ color: "white", fontWeight: "700", fontSize: "18px" }}
                  >
                    Progression temporelle
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "13px" }}
                  >
                    Évolution du temps d'étude
                  </Typography>
                </Box>
              </Box>
              <CardContent sx={{ padding: "24px" }}>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={statisticsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <defs>
                      <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#667eea" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#764ba2" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="subject"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      tickFormatter={formatTime}
                      tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="totalSeconds"
                      stroke="#667eea"
                      strokeWidth={3}
                      dot={{
                        fill: "#667eea",
                        strokeWidth: 2,
                        r: 6,
                        stroke: "white",
                      }}
                      activeDot={{
                        r: 8,
                        fill: "#764ba2",
                        strokeWidth: 3,
                        stroke: "white",
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistics Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {statisticsData.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                  <Card
                    sx={{
                      borderRadius: "16px",
                      border: `3px solid ${colors[index % colors.length]}`,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.2)",
                      },
                    }}
                  >
                    <CardContent sx={{ padding: "20px" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: "12px",
                        }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "12px",
                            background: colors[index % colors.length],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "white",
                              fontWeight: "700",
                              fontSize: "16px",
                            }}
                          >
                            {item.subject.charAt(0)}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "700",
                            color: "#1a1a1a",
                            fontSize: "16px",
                            flex: 1,
                          }}
                        >
                          {item.subject}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          padding: "12px",
                          borderRadius: "12px",
                          background: `${colors[index % colors.length]}15`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#6b7280",
                            fontWeight: "600",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          Temps d'étude
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            color: colors[index % colors.length],
                            fontWeight: "700",
                          }}
                        >
                          {formatTime(item.totalSeconds)}
                        </Typography>
                      </Box>

                      <Box sx={{ marginTop: "12px" }}>
                        <Chip
                          label={`${(item.percentage * 100).toFixed(1)}%`}
                          size="small"
                          sx={{
                            backgroundColor: colors[index % colors.length],
                            color: "white",
                            fontWeight: "700",
                            fontSize: "12px",
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}