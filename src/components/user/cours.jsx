import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import subjects from '../../subjects';

export function Cours() {
  const Auth = useAuth();
  const user = Auth.getUser();
  const navigate = useNavigate();
  const filteredCourses = subjects.filter(course => course.section.includes(user.data.field));

  useEffect(() => { console.log(""); }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      {/*console.log("filtered ", filteredCourses)*/}
      {filteredCourses.map((course, index) => (
        <Card
          key={index}
          sx={{ width: 400, margin: '10px' }}
          onClick={() => {
            // Navigate to the specific course URL on card click
            navigate(`/dashboard/cours/${course.links}`, { state: { subFolderName: `Cours/${course.links}` } });
          }}
        >
          <CardMedia component="img" height="200" image={course.image} alt={course.name} />
          <CardContent
            style={{
              backgroundColor: '#f5f5f5', // Set your desired background color here
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100px' // Optional: Set a fixed height for better alignment
            }}
          >
            <Typography
              gutterBottom
              variant="h4" // Change variant to make the text larger (e.g., h4 is larger than h5)
              component="div"
              align="center" // Center text horizontally
              style={{ fontWeight: 'bold' }} // Make the text bold (grassy)
            >
              {course.name}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
