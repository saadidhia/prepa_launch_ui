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

export function Progression  ()  {
   
  return (
    <>
     <FilterStatistic/>
    <BarChart
      width={500}
      height={300}
      data={data}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="value" fill="#8884d8">
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Bar>
    </BarChart>
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={120}
        fill="#8884d8"
        label
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
    </>
  );
};

export default Progression;