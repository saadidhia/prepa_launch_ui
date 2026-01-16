import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box, Container, Grid, Chip } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import subjects from '../../subjects';

export function BooksGrintta() {
  const Auth = useAuth();
  const user = Auth.getUser();
  const navigate = useNavigate();
  const filteredCourses = subjects.filter(course => course.section.includes(user.data.field));

  useEffect(() => {  }, []);

  return (
    <Container maxWidth="xl" sx={{ paddingY: '32px' }}>
    MES LIVRES Grintta
    </Container>
  );
}