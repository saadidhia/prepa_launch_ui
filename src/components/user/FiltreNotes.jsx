import React from "react";
import {
  Button,
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Subject as SubjectIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";

export default function FiltreNotes({
  userSubjects,
  selectedSubjects,
  selectedContexts,
  toggleSubject,
  toggleContext,
  handleOpenCreate,
}) {
  return (
    <Card
      sx={{
        borderRadius: '20px',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <FilterListIcon sx={{ color: 'white', fontSize: 28 }} />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{ color: 'white', fontWeight: '700', fontSize: '18px' }}
          >
            Filtres & Actions
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '13px' }}
          >
            Créez et filtrez vos notes par matière et contexte
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            padding: '10px 24px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontWeight: '700',
            fontSize: '14px',
            textTransform: 'none',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Créer une note
        </Button>
      </Box>

      <CardContent sx={{ padding: '28px', backgroundColor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Subject Filter Section */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <SubjectIcon sx={{ color: '#667eea', fontSize: 22 }} />
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: '700', color: '#1a1a1a', fontSize: '15px' }}
              >
                Filtrer par matière
              </Typography>
              {selectedSubjects.size > 0 && (
                <Chip
                  label={`${selectedSubjects.size} sélectionné${selectedSubjects.size > 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    backgroundColor: '#ff5722',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '11px',
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {userSubjects.map((subject, index) => {
                const isSelected = selectedSubjects.has(
                  subject.name.trim().toLowerCase()
                );
                return (
                  <Avatar
                    key={index}
                    onClick={() => toggleSubject(subject.name)}
                    sx={{
                      width: 56,
                      height: 56,
                      backgroundColor: isSelected ? '#ff5722' : '#667eea',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'all 0.3s ease',
                      border: isSelected
                        ? '3px solid #ff5722'
                        : '3px solid transparent',
                      boxShadow: isSelected
                        ? '0 4px 12px rgba(255, 87, 34, 0.4)'
                        : '0 2px 8px rgba(102, 126, 234, 0.3)',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: isSelected
                          ? '0 6px 16px rgba(255, 87, 34, 0.5)'
                          : '0 4px 12px rgba(102, 126, 234, 0.4)',
                      },
                    }}
                  >
                    {subject.name.slice(0, 4).toUpperCase()}
                  </Avatar>
                );
              })}
            </Box>
          </Box>

          {/* Context Filter Section */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <CategoryIcon sx={{ color: '#667eea', fontSize: 22 }} />
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: '700', color: '#1a1a1a', fontSize: '15px' }}
              >
                Filtrer par contexte
              </Typography>
              {selectedContexts.size > 0 && (
                <Chip
                  label={`${selectedContexts.size} sélectionné${selectedContexts.size > 1 ? 's' : ''}`}
                  size="small"
                  sx={{
                    backgroundColor: '#ff5722',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '11px',
                  }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {["rules", "summary"].map((ctx) => {
                const isSelected = selectedContexts.has(ctx);
                return (
                  <Chip
                    key={ctx}
                    label={ctx.charAt(0).toUpperCase() + ctx.slice(1)}
                    onClick={() => toggleContext(ctx)}
                    icon={<CategoryIcon sx={{ fontSize: 16, color: 'white !important' }} />}
                    sx={{
                      backgroundColor: isSelected ? '#ff5722' : '#667eea',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '13px',
                      padding: '20px 12px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: isSelected
                        ? '2px solid #ff5722'
                        : '2px solid transparent',
                      boxShadow: isSelected
                        ? '0 4px 12px rgba(255, 87, 34, 0.3)'
                        : '0 2px 8px rgba(102, 126, 234, 0.2)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: isSelected
                          ? '0 6px 16px rgba(255, 87, 34, 0.4)'
                          : '0 4px 12px rgba(102, 126, 234, 0.3)',
                      },
                      '& .MuiChip-icon': {
                        color: 'white',
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* Info Message */}
          {selectedSubjects.size === 0 && selectedContexts.size === 0 && (
            <Box
              sx={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(102, 126, 234, 0.05)',
                border: '2px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FilterListIcon sx={{ color: '#667eea', fontSize: 20 }} />
              <Typography
                variant="body2"
                sx={{ color: '#6b7280', fontSize: '13px', fontWeight: '500' }}
              >
                Aucun filtre actif - Toutes les notes sont affichées
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}