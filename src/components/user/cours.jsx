import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box, Container, Grid, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import subjects from '../../subjects';

export function Cours() {
  const Auth = useAuth();
  const user = Auth.getUser();
  const option = user.data.option
  const navigate = useNavigate();
  const filteredCourses = subjects.filter(course => course.section.includes(user.data.field));

  useEffect(() => {  }, []);

  return (
    <Container maxWidth="xl" sx={{ paddingY: '32px' }}>
      {/* Header Section */}
      <Box sx={{ marginBottom: '40px', textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: '700', 
            color: '#1a1a1a',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Mes Cours
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '500',
          }}
        >
          Découvrez vos cours disponibles
        </Typography>
        <Chip 
          label={`${filteredCourses.length + 1} cours disponibles`}
          sx={{
            marginTop: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: '700',
            padding: '20px 12px',
            fontSize: '14px',
          }}
        />
      </Box>

      {/* Courses Grid - Combined with Option */}
      <Grid container spacing={3}>
        {filteredCourses.map((course, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              onClick={() => {
                navigate(`/dashboard/cours/${course.links}`, { 
                  state: { subFolderName: `Cours/${course.links}` } 
                });
              }}
              sx={{
                height: '100%',
                borderRadius: '20px',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                overflow: 'hidden',
                border: '2px solid transparent',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 32px rgba(102, 126, 234, 0.25)',
                  border: '2px solid #667eea',
                  '& .course-image': {
                    transform: 'scale(1.1)',
                  },
                  '& .arrow-icon': {
                    transform: 'translateX(8px)',
                    opacity: 1,
                  },
                  '& .overlay': {
                    opacity: 1,
                  },
                },
              }}
            >
              {/* Image with overlay */}
              <Box sx={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={course.image}
                  alt={course.name}
                  className="course-image"
                  sx={{
                    transition: 'transform 0.5s ease',
                    objectFit: 'cover',
                  }}
                />
                {/* Gradient overlay */}
                <Box
                  className="overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(180deg, rgba(102, 126, 234, 0) 0%, rgba(102, 126, 234, 0.6) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  }}
                />
              </Box>

              {/* Content */}
              <CardContent
                sx={{
                  background: 'white',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '120px',
                  position: 'relative',
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  align="center"
                  sx={{
                    fontWeight: '700',
                    color: '#1a1a1a',
                    fontSize: '18px',
                    lineHeight: 1.3,
                    marginBottom: '12px',
                  }}
                >
                  {course.name}
                </Typography>

                {/* Arrow indicator */}
                <Box
                  className="arrow-icon"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    opacity: 0,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <ArrowForwardIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty state */}
      {filteredCourses.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            borderRadius: '20px',
            border: '2px dashed #e5e7eb',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: '700',
              color: '#6b7280',
              marginBottom: '12px',
            }}
          >
            Aucun cours disponible
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#9ca3af',
            }}
          >
            Il n'y a pas de cours disponibles pour votre branche pour le moment.
          </Typography>
        </Box>
      )}
    </Container>
  );
}