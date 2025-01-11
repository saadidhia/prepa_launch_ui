import React, { useState, useEffect } from 'react';
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
import { candidatsApi } from '../../apis/candidatsApi';

export function FilterStatistic({ onDataReceived }) {
  const Auth = useAuth();
  const user = Auth.getUser();
  const filteredCourses = courses.filter(course => course.section.includes(user.data.field));
  const [filterStat, setFilterStat] = useState({
    startDate: null,
    endDate: null,
    selectedSubjects: [],
  });
  const [selectAll, setSelectAll] = useState(false);

  // Load state from localStorage when the component mounts
  useEffect(() => {
    const savedFilterStat = JSON.parse(localStorage.getItem('filter_stat')) || {
      selectedSubjects: [],
      startDate: null,
      endDate: null,
    };
    setFilterStat({
      selectedSubjects: savedFilterStat.selectedSubjects,
      startDate: savedFilterStat.startDate ? new Date(savedFilterStat.startDate) : null,
      endDate: savedFilterStat.endDate ? new Date(savedFilterStat.endDate) : null,
    });
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      'filter_stat',
      JSON.stringify({
        selectedSubjects: filterStat.selectedSubjects,
        startDate: filterStat.startDate ? filterStat.startDate.toISOString().split('T')[0] : null,
        endDate: filterStat.endDate ? filterStat.endDate.toISOString().split('T')[0] : null,
      })
    );
  }, [filterStat]);

  const handleCheckboxChange = (courseName) => {
    setFilterStat((prev) => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(courseName)
        ? prev.selectedSubjects.filter((name) => name !== courseName)
        : [...prev.selectedSubjects, courseName],
    }));
  };

  const handleSelectAllChange = () => {
    setFilterStat((prev) => ({
      ...prev,
      selectedSubjects: selectAll ? [] : filteredCourses.map((course) => course.name),
    }));
    setSelectAll(!selectAll);
  };

  const handleDateChange = (key, date) => {
    setFilterStat((prev) => ({ ...prev, [key]: date }));
  };

  useEffect(() => {
    // Call handleSubmit only after all required states are set
    if (filterStat.selectedSubjects.length && filterStat.startDate && filterStat.endDate) {
      handleSubmit();
    }
  }, [filterStat]);

  const handleSubmit = async () => {
    try {
      const response = await candidatsApi.getMyStatisticsBasedOnRangeDate(
        user,
        filterStat.selectedSubjects,
        filterStat.startDate ? filterStat.startDate.toISOString().split('T')[0] : null,
        filterStat.endDate ? filterStat.endDate.toISOString().split('T')[0] : null
      );
      console.log('API Response:', response.data);
      onDataReceived(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        maxWidth: 1200, 
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
          gap: 5, 
          justifyContent: 'space-between' 
        }}
      >
        {/* Course Checkboxes */}
        <Box sx={{ flex: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
            }
            label="Select All"
          />
          {filteredCourses.map((course, index) => (
            <FormControlLabel
              key={index}
              control={
                <Checkbox
                  checked={filterStat.selectedSubjects.includes(course.name)}
                  onChange={() => handleCheckboxChange(course.name)}
                />
              }
              label={course.name}
            />
          ))}
        </Box>

        {/* Start and End Date */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          <Box>
            <Typography variant="body1">Start Date:</Typography>
            <DatePicker
              selected={filterStat.startDate}
              onChange={(date) => handleDateChange('startDate', date)}
              selectsStart
              startDate={filterStat.startDate}
              endDate={filterStat.endDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
              customInput={
                <Button variant="outlined" fullWidth>
                  {filterStat.startDate ? filterStat.startDate.toLocaleDateString() : "Start Date"}
                </Button>
              }
            />
          </Box>
          <Box>
            <Typography variant="body1">End Date:</Typography>
            <DatePicker
              selected={filterStat.endDate}
              onChange={(date) => handleDateChange('endDate', date)}
              selectsEnd
              startDate={filterStat.startDate}
              endDate={filterStat.endDate}
              minDate={filterStat.startDate}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select end date"
              customInput={
                <Button variant="outlined" fullWidth>
                  {filterStat.endDate ? filterStat.endDate.toLocaleDateString() : "End Date"}
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
