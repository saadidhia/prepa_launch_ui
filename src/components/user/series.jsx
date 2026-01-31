import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Box,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import courses from '../../subjects';
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
          Accédez aux séries d'exercices par matière
        </Typography>
      </Box>

      {/* Courses Card */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Card
          sx={{
            maxWidth: 600,
            width: '100%',
            borderRadius: '20px',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ padding: '32px', backgroundColor: '#f8f9fa' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px',
              }}
            >
              <SchoolIcon sx={{ color: '#667eea', fontSize: 28 }} />
              <Typography
                variant="h5"
                sx={{
                  fontWeight: '700',
                  color: '#1a1a1a',
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
                  fontSize: '12px',
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredCourses.map((course, courseIndex) => (
                <Button
                  key={courseIndex}
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => {
                    navigate(
                      `/dashboard/series/${course.links}`,
                      {
                        state: {
                          subFolderName: `series/${course.links}`,
                        },
                      }
                    );
                  }}
                  sx={{
                    width: '100%',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '16px',
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
      </Box>
    </Container>
  );
}