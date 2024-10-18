import React, { useEffect} from 'react';
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'; // Import useHistory

import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import subjects from '../../subjects';


export function Cours() {
  const Auth = useAuth()
    const user = Auth.getUser()
    const navigate = useNavigate(); 
    const filteredCourses = subjects.filter(course => course.section.includes(user.data.field));
   
    useEffect(()=>{console.log("tri")},[])
   
    return (
  <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
    {console.log("filtered ",filteredCourses)}
      {filteredCourses.map((course, index) => (
        <Card key={index} sx={{ width: 400, margin: '10px' }}
        onClick={() => {
          // Navigate to the specific course URL on card click
          navigate(`/dashboard/cours/${course.links}`, { state: { subFolderName: `Cours/${course.links}` } });
        }}>
          <CardMedia component="img" height="200" image={course.image} alt={course.name} />
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

