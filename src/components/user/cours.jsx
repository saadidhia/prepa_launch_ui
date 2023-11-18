import React, { useEffect, useState } from 'react';
import { premiereApi } from '../../apis/premiereApi';
import { PdfViewer} from '../small/PdfViewer' 
import { useAuth } from '../context/AuthContext'
import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import courses from '../../courses';


export function Cours() {
  const Auth = useAuth()
    const user = Auth.getUser()
  //  const filteredCourses = courses.filter(course => course.section.includes(user.));
    return (
  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      {courses.map((course, index) => (
        <Card key={index} sx={{ maxWidth: 300, margin: '10px' }}>
          <CardMedia component="img" height="140" image={`https://via.placeholder.com/300?text=${course.name}`} alt={course.name} />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {course.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {course.name}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </div>
    )

  /**  const [pdfFiles, setPdfFiles] = useState([]);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const response = await premiereApi.getPdfs(user);
        console.log(response.data);
        setPdfFiles(response.data);
      } catch (error) {
        console.error("Error fetching PDFs:", error);
      }
    };
    fetchPdfs();
  }, []);


  

  return (
    <div>
      <h1>PDF Viewer</h1>
      <div className="pdf-container" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {pdfFiles.length > 0 ? (
          pdfFiles.map((pdf) => (
            <div style={{ width: '30%', margin: '10px 0' }}>

              <PdfViewer key={pdf.id} pdf={pdf} />
            </div>
          ))
        ) : (
          <p>No PDF files available</p>
        )}
      </div>
    </div>
  );
  **/
}

