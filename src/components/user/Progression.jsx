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
} from "recharts";
import { FilterStatistic } from "../small/filterStatistic";

const colors = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c"];

export function Progression() {
  const [statisticsData, setStatisticsData] = useState([]);

  const handleDataReceived = (data) => {
    // Transform elapsedTime into total seconds
    const transformedData = data.map((item) => {
      const [hours, minutes, seconds] = item.elapsedTime
        .match(/\d+/g)
        .map(Number);
      return {
        ...item,
        totalSeconds: hours * 3600 + minutes * 60 + seconds, // Calculate total seconds
      };
    });
    setStatisticsData(transformedData);
  };

  return (
    <>
      <FilterStatistic onDataReceived={handleDataReceived} />
      <div
        style={{
          display: "flex",
          flexDirection: "row", // Arrange items in a row
          justifyContent: "center", // Center the charts horizontally
          alignItems: "flex-start", // Align charts at the top
          gap: "20px", // Adds spacing between the charts
          flexWrap: "wrap", // Ensure responsiveness for smaller screens
        }}
      >
        {/* Bar Chart Box */}
        <div
          style={{
            flex: "1 1 45%", // Allow the chart to take up 45% of the row
            margin: "10px",
            padding: "20px", // Adds padding inside the box
            border: "2px solid #ccc", // Adds a border around the box
            borderRadius: "10px", // Rounds the corners of the box
            backgroundColor: "#f9f9f9", // Light background color for the box
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds a subtle shadow
          }}
        >
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
            Time Spent by Subject (Bar Chart)
          </h3>
          <BarChart
            width={500}
            height={300} // Adjusted height for better row alignment
            data={statisticsData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis
              label={{
                value: "Time (seconds)",
                angle: -90,
                position: "insideLeft",
              }}
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

        {/* Pie Chart Box */}
        <div
          style={{
            flex: "1 1 45%", // Allow the chart to take up 45% of the row
            margin: "10px",
            padding: "20px", // Adds padding inside the box
            border: "2px solid #ccc", // Adds a border around the box
            borderRadius: "10px", // Rounds the corners of the box
            backgroundColor: "#f9f9f9", // Light background color for the box
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds a subtle shadow
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
      </div>
    </>
  );
}
