import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardMedia, Typography, CardActions, Button } from '@mui/material';
import courses from '../../subjects';
import { useNavigate } from 'react-router-dom';

export function Exams() {
  const Auth = useAuth();
  const navigate = useNavigate();
  const user = Auth.getUser();
  const filteredCourses = courses.filter(course => course.section.includes(user.data.field));

  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      {filteredCourses.map((course, index) => (
        <Card key={index} sx={{ width: 400, margin: '10px' }}>
          <CardMedia component="img" height="200" image={course.image} alt={course.name} />
          <CardContent>
            <Typography variant="h5" component="div">
              {course.name}
            </Typography>
          </CardContent>
          <CardActions style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              size="small"
              onClick={() => navigate(`/dashboard/exams/ds/${course.links}`, { state: { subFolderName: 'DS' } })}
              style={{ flex: 1, backgroundColor: '#4CAF50', color: 'white', marginRight: '5px' }} // Green color
            >
              DS
            </Button>
            <Button
              size="small"
              onClick={() => navigate(`/dashboard/exams/exam/${course.links}`, { state: { subFolderName: 'Exams' } })}
              style={{ flex: 1, backgroundColor: '#2196F3', color: 'white', marginLeft: '5px' }} // Blue color
            >
              EXAMS
            </Button>
          </CardActions>
        </Card>
      ))}
    </div>
  );
}
