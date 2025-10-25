import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Container,
  Box,
  Chip,
} from '@mui/material';
import {
  School as SchoolIcon,
  Description as DescriptionIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import courses from '../../subjects';
import { useNavigate } from 'react-router-dom';

export function Resume() {
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
          Résumés
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '500',
          }}
        >
          Accédez aux résumés de cours par matière
        </Typography>
      </Box>

      {/* Courses Cards Grid */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        {filteredCourses.map((course, index) => (
          <Card
            key={index}
            onClick={() => {
              navigate(`/dashboard/resumes/${course.links}`, {
                state: { subFolderName: `resumes/${course.links}` },
              });
            }}
            sx={{
              width: 420,
              borderRadius: '20px',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.25)',
              },
              '&:hover .arrow-icon': {
                transform: 'translateX(8px)',
              },
            }}
          >
            {/* Image with Overlay */}
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="220"
                image={course.image}
                alt={course.name}
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
                    'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
                }}
              />
              <Chip
                icon={<SchoolIcon sx={{ fontSize: 18, color: 'white !important' }} />}
                label={course.name}
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

            {/* Course Content */}
            <CardContent
              sx={{
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '28px',
                minHeight: '100px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  <DescriptionIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: '700',
                      color: '#1a1a1a',
                      fontSize: '20px',
                      marginBottom: '4px',
                    }}
                  >
                    {course.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#6b7280',
                      fontSize: '13px',
                      fontWeight: '500',
                    }}
                  >
                    Voir les résumés
                  </Typography>
                </Box>
              </Box>

              <ArrowForwardIcon
                className="arrow-icon"
                sx={{
                  color: '#667eea',
                  fontSize: 28,
                  transition: 'transform 0.3s ease',
                }}
              />
            </CardContent>

            {/* Hover Indicator */}
            <Box
              sx={{
                height: '4px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              }}
            />
          </Card>
        ))}
      </Box>
    </Container>
  );
}