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
  Assignment as AssignmentIcon,
  MenuBook as ExamIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import courses from '../../subjects';
import { useNavigate } from 'react-router-dom';

export function Exams() {
  const Auth = useAuth();
  const navigate = useNavigate();
  const user = Auth.getUser();
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
          Examens
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '500',
          }}
        >
          Accédez aux Controles et syntheses par matière
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

            {/* Course Title */}
            <CardContent sx={{ padding: '24px', backgroundColor: '#f8f9fa' }}>
              <Typography
                variant="h4"
                align="center"
                sx={{
                  fontWeight: '700',
                  color: '#1a1a1a',
                  fontSize: '24px',
                  marginBottom: '20px',
                }}
              >
                {course.name}
              </Typography>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: '12px' }}>
                {/* CONTROLE Button */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<AssignmentIcon />}
                  endIcon={<ArrowForwardIcon />}
                  onClick={() =>
                    navigate(`/dashboard/exams/controle/${course.links}`, {
                      state: { subFolderName: `exams/controle/${course.links}` },
                    })
                  }
                  sx={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '15px',
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                    },
                  }}
                >
                  CONTROLE
                </Button>

                {/* EXAMS Button */}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<ExamIcon />}
                  endIcon={<ArrowForwardIcon />}
                  onClick={() =>
                    navigate(`/dashboard/exams/synthese/${course.links}`, {
                      state: { subFolderName: `exams/synthese/${course.links}` },
                    })
                  }
                  sx={{
                    flex: 1,
                    padding: '14px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '15px',
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
                    },
                  }}
                >
                  SYNTHESE
                </Button>
              </Box>

              {/* Info Helper */}
              <Box
                sx={{
                  marginTop: '16px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(102, 126, 234, 0.05)',
                  border: '2px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <ExamIcon sx={{ color: '#667eea', fontSize: 18 }} />
                <Typography
                  variant="body2"
                  sx={{ color: '#6b7280', fontSize: '12px', fontWeight: '500' }}
                >
                  Choisissez entre Controle ou Synthese
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}