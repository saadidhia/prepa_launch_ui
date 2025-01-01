import React, {useState} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../context/AuthContext';
import courses from '../../subjects';


 
export function FilterStatistic ()  {

    const Auth = useAuth();
      const user = Auth.getUser();
      const filteredCourses = courses.filter(course => course.section.includes(user.data.field));
    const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
    return (
        <>

        <h3>Available Courses:</h3>
              {filteredCourses.map((course, index) => (
                <div key={index}>
                  <label>
                    <input type="checkbox" value={course} />
                    {course.name}
                  </label>
                </div>
              ))}
            <div style={{ padding: "20px" }}>
              <h3>Select Date Range</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <div>
                  <label>Start Date:</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select start date"
                  />
                </div>
                <div>
                  <label>End Date:</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select end date"
                  />
                </div>
              </div>
              <div style={{ marginTop: "20px" }}>
                <strong>Selected Range:</strong>{" "}
                {startDate && endDate
                  ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                  : "None"}
              </div>
            </div>
        </>
    );
};

export default FilterStatistic;