import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import courses from '../../subjects';
import { useNavigate } from 'react-router-dom';


export function Resume() {
  const Auth = useAuth()
  const user = Auth.getUser()
  const navigate = useNavigate();
  const filteredCourses = courses.filter(course => course.section.includes(user.data.field));
  return (
    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      {filteredCourses.map((course, index) => (
        <Card
          key={index}
          sx={{ width: 400, margin: '10px' }}
          onClick={() => {
            // Navigate to the specific course URL on card click
            navigate(`/dashboard/resumes/${course.links}`, { state: { subFolderName: `resumes/${course.links}` } });
          }}
        >
          <CardMedia component="img" height="200" image={course.image} alt={course.name} />
          <CardContent
            style={{
              backgroundColor: '#f5f5f5', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100px' 
            }}
          >
            <Typography
              gutterBottom variant="h4"
              component="div"
              style={{ fontWeight: 'bold' }}
            >
              {course.name}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  )

}