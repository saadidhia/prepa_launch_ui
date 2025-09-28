import React, { useState } from "react";
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
} from "recharts";
import { FilterStatistic } from "../small/filterStatistic";

const colors = [
  "#8884d8", // purple
  "#83a6ed", // blue
  "#8dd1e1", // cyan
  "#82ca9d", // green
  "#a4de6c", // lime
  "#d0ed57", // yellow
  "#ffc658", // orange
  "#ff8042", // coral
  "#ff6666", // red
  "#d888d8"  // pink/purple
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

      // Calculate percentage for pie chart
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

  return (
    <>
      <FilterStatistic onDataReceived={handleDataReceived} />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        {/* Bar Chart */}
        <div
          style={{
            flex: "1 1 45%",
            margin: "10px",
            padding: "20px",
            border: "2px solid #ccc",
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
            Time Spent by Subject (Bar Chart)
          </h3>
          <BarChart
            width={500}
            height={300}
            data={statisticsData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis
              label={{ value: "Time", angle: -90, position: "insideLeft" }}
              tickFormatter={formatTime}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalSeconds" fill="#8884d8">
              {statisticsData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </div>

        {/* Pie Chart */}
        <div
          style={{
            flex: "1 1 45%",
            margin: "10px",
            padding: "20px",
            border: "2px solid #ccc",
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
            Time Distribution by Subject (Pie Chart)
          </h3>
          <PieChart width={400} height={300}>
            <Pie
              data={statisticsData}
              dataKey="percentage"
              nameKey="subject"
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(2)}%`
              }
            >
              {statisticsData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Line Chart */}
        <div
          style={{
            flex: "1 1 90%",
            margin: "10px",
            padding: "20px",
            border: "2px solid #ccc",
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
            Time Progression by Subject (Line Chart)
          </h3>
          <LineChart
            width={900}
            height={300}
            data={statisticsData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis tickFormatter={formatTime} />
            <Tooltip />
            <Legend />
            {statisticsData.map((entry, index) => (
              <Line
                key={`line-${index}`}
                type="monotone"
                dataKey="totalSeconds"
                name={entry.subject}
                dot={{ r: 5 }}
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </div>
      </div>
    </>
  );
}
