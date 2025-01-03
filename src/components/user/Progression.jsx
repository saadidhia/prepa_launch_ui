import React ,  { useState }from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
  PieChart, Pie,
} from "recharts";
import {FilterStatistic} from "../small/filterStatistic";



const data = [
  { name: "January", value: 30 },
  { name: "February", value: 45 },
  { name: "March", value: 60 },
  { name: "April", value: 75 },
  { name: "May", value: 90 },
];

const colors = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c"];

export function Progression() {
  const [statisticsData, setStatisticsData] = useState([]);

  const handleDataReceived = (data) => {
    // Transform elapsedTime into total seconds
    const transformedData = data.map(item => {
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
      <BarChart
        width={500}
        height={300}
        data={statisticsData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="subject" />
        <YAxis label={{ value: "Time (seconds)", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="totalSeconds" fill="#8884d8">
          {statisticsData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
      <PieChart width={400} height={400}>
        <Pie
          data={statisticsData}
          dataKey="percentage"
          nameKey="subject"
          cx="50%"
          cy="50%"
          outerRadius={120}
          fill="#8884d8"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(2)}%`}
        >
          {statisticsData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </>
  );
}
