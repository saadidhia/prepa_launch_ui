import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Container,
  Box,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  ArrowForward as ArrowForwardIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import courses from '../../subjects';
import points from '../../points';
import { useNavigate } from 'react-router-dom';

export function Series() {
  const Auth = useAuth();
  const user = Auth.getUser();
  const navigate = useNavigate();
  const filteredCourses = courses.filter((course) =>
    course.section.includes(user.data.field)
  );

  return (
    <Container maxWidth="xl" sx={{ paddingY: '32px' }}>
      {/* Header */}
      <Box sx={{ marginBottom: '32px', textAlign: 'center' }}>
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
          Séries
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '500',
          }}
        >
          Accédez aux séries d'exercices par catégorie et matière
        </Typography>
      </Box>

      {/* Points Cards Grid */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        {points.map((point, index) => (
          <Card
            key={index}
            sx={{
              width: 420,
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.25)',
              },
            }}
          >
            {/* Image with Overlay */}
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="220"
                image={point.image}
                alt={point.name}
                sx={{
                  objectFit: 'cover',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)',
                }}
              />
              <Chip
                icon={<CategoryIcon sx={{ fontSize: 18, color: 'white !important' }} />}
                label={point.name}
                sx={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  backgroundColor: 'rgba(102, 126, 234, 0.9)',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '14px',
                  padding: '16px 8px',
                  backdropFilter: 'blur(10px)',
                  '& .MuiChip-icon': {
                    color: 'white',
                  },
                }}
              />
            </Box>

            {/* Course Buttons */}
            <CardContent sx={{ padding: '24px', backgroundColor: '#f8f9fa' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <SchoolIcon sx={{ color: '#667eea', fontSize: 22 }} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: '700',
                    color: '#1a1a1a',
                    fontSize: '16px',
                  }}
                >
                  Matières disponibles
                </Typography>
                <Chip
                  label={filteredCourses.length}
                  size="small"
                  sx={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '11px',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredCourses.map((course, courseIndex) => (
                  <Button
                    key={courseIndex}
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => {
                      navigate(
                        `/dashboard/series/${point.link}/${course.links}`,
                        {
                          state: {
                            subFolderName: `series/${point.link}/${course.links}`,
                          },
                        }
                      );
                    }}
                    sx={{
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '15px',
                      textTransform: 'none',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                      },
                    }}
                  >
                    {course.name}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}