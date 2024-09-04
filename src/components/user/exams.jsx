import React, { useEffect, useState } from 'react';
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
            
         
          <CardActions display="flex" justifyContent="space-between">
              <Button size="small" onClick={() => navigate(`/dashboard/exams/${course.links}`, { state: { subFolderName: 'DS' } })}>DS</Button>
              <Button size="small" onClick={() => navigate(`/dashboard/exams/${course.links}`, { state: { subFolderName: 'Exams' } })}>EXAMS</Button>

          </CardActions>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}