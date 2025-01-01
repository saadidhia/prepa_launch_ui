import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../context/AuthContext';
import courses from '../../subjects';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  Paper
} from '@mui/material';

export function FilterStatistic() {
  const Auth = useAuth();
  const user = Auth.getUser();
  const filteredCourses = courses.filter(course => course.section.includes(user.data.field));
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleSubmit = () => {
    alert("Filter submitted!"); // Replace with your submit logic
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        maxWidth: 1200, // Increased width
        margin: "auto", 
        padding: 3, 
        borderRadius: 2, 
        backgroundColor: "#f9f9f9" 
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: 5, // Increased gap for spacing
          justifyContent: 'space-between' // Even spacing between items
        }}
      >
        {/* Course Checkboxes */}
        <Box sx={{ flex: 2 }}>
          {filteredCourses.map((course, index) => (
            <FormControlLabel
              key={index}
              control={<Checkbox value={course} />}
              label={course.name}
            />
          ))}
        </Box>

        {/* Start and End Date */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <Box>
            <Typography variant="body1">Start Date:</Typography>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
              customInput={
                <Button variant="outlined" fullWidth>
                  {startDate ? startDate.toLocaleDateString() : "Start Date"}
                </Button>
              }
            />
          </Box>
          <Box>
            <Typography variant="body1">End Date:</Typography>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select end date"
              customInput={
                <Button variant="outlined" fullWidth>
                  {endDate ? endDate.toLocaleDateString() : "End Date"}
                </Button>
              }
            />
          </Box>
        </Box>

        {/* Submit Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 0.5 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
          >
            Submit Filter
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default FilterStatistic;
