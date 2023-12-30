import React, { useEffect, useState } from 'react';
import { premiereApi } from '../../apis/premiereApi';
import { PdfViewer} from '../small/PdfViewer' 
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import courses from '../../subjects';
import points from '../../points';
import { useNavigate } from 'react-router-dom'; // Import useHistory



export function Series() {
  const Auth = useAuth()
    const user = Auth.getUser()
    const navigate = useNavigate(); 
    const filteredCourses = courses.filter(course => course.section.includes(user.data.field));
    return (
  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      { points.map((point,index)=> (
         <Card key={index} sx={{ width: 400, margin: '10px' }}>
         <CardMedia component="img" height="200" image={point.image} alt={point.name} />
      {filteredCourses.map((course, index) => (

          <CardContent key={index}>
            <Typography gutterBottom variant="h5" component="div">
              <button onClick={
                () => {
                  // Navigate to the specific course URL on card click
                  navigate(`/dashboard/series/${point.link}/${course.links}`);
                }
              }>
                    {course.name}
              </button>
              
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {course.name}
            </Typography>
          </CardContent>
      
      )
      )}
      </Card>
      ))
      }
    </div>
    )
      }