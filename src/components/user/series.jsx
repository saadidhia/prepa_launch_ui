import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import courses from '../../subjects';
import points from '../../points';
import { useNavigate } from 'react-router-dom';

export function Series() {
  const Auth = useAuth();
  const user = Auth.getUser();
  const navigate = useNavigate(); 
  const filteredCourses = courses.filter(course => course.section.includes(user.data.field));
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      {console.log("Points", points)}
      {points.map((point, index) => (
        <Card key={index} sx={{ width: 400, margin: '10px' }}>
          <CardMedia component="img" height="200" image={point.image} alt={point.name} />
          {filteredCourses.map((course, index) => (
            <CardContent key={index}>
              <Typography gutterBottom variant="h5" component="div">
                <button 
                  onClick={() => {
                    // Navigate to the specific course URL on button click
                    navigate(`/dashboard/series/${point.link}/${course.links}`, { state: { subFolderName: `series/${point.link}/${course.links}` } });
                  }}
                  style={{
                    width: '100%', // Make button full width
                    backgroundColor: '#2196F3', // Set your desired button color here
                    color: 'white', // Text color
                    border: 'none', // Remove default border
                    padding: '10px', // Padding inside the button
                    borderRadius: '4px', // Rounded corners
                    cursor: 'pointer', // Change cursor to pointer on hover
                    fontSize: '16px', // Button text size
                    textAlign: 'center', // Center the text
                    transition: 'background-color 0.3s' // Smooth background color transition
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2196F0'} // Darker green on hover
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'} // Reset to original color
                >
                  {course.name}
                </button>
              </Typography>
            </CardContent>
          ))}
        </Card>
      ))}
    </div>
  );
}
