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
      {points.map((point, index) => (
        <Card key={index} sx={{ width: 400, margin: '10px' }}>
          <CardMedia component="img" height="200" image={point.image} alt={point.name} />
          {filteredCourses.map((course, index) => (
            <CardContent key={index}>
              <Typography gutterBottom variant="h4" component="div"  style={{ fontWeight: 'bold' }} >
                <button 
                  onClick={() => {
                    // Navigate to the specific course URL on button click
                    navigate(`/dashboard/series/${point.link}/${course.links}`, { state: { subFolderName: `series/${point.link}/${course.links}` } });
                  }}
                  style={{
                    width: '100%', 
                    backgroundColor: '#2196F3', 
                    color: 'white', 
                    border: 'none', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '16px', 
                    textAlign: 'center', 
                    transition: 'background-color 0.3s' 
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2196F0'} 
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'} 
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
