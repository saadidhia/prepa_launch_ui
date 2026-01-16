import React, { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import Avatar from '@mui/material/Avatar';
import MuiAlert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VerifiedIcon from '@mui/icons-material/Verified';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DialogContentText from '@mui/material/DialogContentText';
import TimerIcon from '@mui/icons-material/Timer';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import navigations from '../Navigations';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Logout from './small/logout';
import NotificationPanelTimer from './user/timer/NotificationPanelTimer';

const drawerWidth = 260;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
  backdropFilter: 'blur(10px)',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const SingleLevel = ({ item, handleNavigation }) => (
  <ListItemButton
    onClick={() => handleNavigation(item.link)}
    sx={{
      '&:hover': { 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        transform: 'translateX(4px)',
        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)',
      },
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '12px 16px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      boxShadow: '0px 4px 12px rgba(102, 126, 234, 0.2)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      marginBottom: '6px',
      border: 'none',
    }}
  >
    <ListItemText
      primary={item.text}
      primaryTypographyProps={{
        sx: { 
          color: 'white', 
          fontSize: '14px', 
          fontWeight: '600',
          letterSpacing: '0.2px',
        },
      }}
    />
  </ListItemButton>
);

const MenuItem = ({ item, handleNavigation }) => (
  <SingleLevel item={item} handleNavigation={handleNavigation} />
);

export default function Dashboard() {
  const navigate = useNavigate();
  const Auth = useAuth();
  const user = Auth.getUser();

  const theme = useTheme();
  const [open, setOpen] = useState(false);

  // Subscription alert state
  const [subAlertOpen, setSubAlertOpen] = useState(false);
  const [subAlertMessage, setSubAlertMessage] = useState('');

  // Agenda alert state
  const [agendaAlertOpen, setAgendaAlertOpen] = useState(false);
  const [agendaAlertMessage, setAgendaAlertMessage] = useState('');

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
  const handleNavigation = (link) => navigate(`/dashboard/${link}`);
  const handleProfileClick = () => navigate('/dashboard/profile');



  // Subscription alert
  useEffect(() => {
    if (Auth.isUserAlertedToRenewSubscription()) {
      setSubAlertMessage(
        'Votre compte va expirer à ' + user.data.lock_date + ". Contactez l'administrateur SVP!"
      );
      setSubAlertOpen(true);

      const timer = setTimeout(() => setSubAlertOpen(false), 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Agenda alert
  useEffect(() => {
    if (Auth.hasAgendaReminder) {
      // console.log("agenda "+ Auth.reminderAgendas)
setAgendaAlertMessage(
  "Vous avez des agendas prévus bientôt !" + 
  Auth.reminderAgendas
    .map(agenda => {
      const date = new Date(agenda.eventTime);
      const formattedDate = date.toISOString().split('T')[0]; // returns YYYY-MM-DD
      return `\n- ${formattedDate}`;
    })
    .join('')
);      
setAgendaAlertOpen(true);

      const timer = setTimeout(() => setAgendaAlertOpen(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [Auth.hasAgendaReminder]);

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', height: '70px' }}>
            <div className="left-content">
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{ 
                  mr: 2, 
                  ...(open && { display: 'none' }),
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <MenuIcon sx={{ fontSize: 28 }} />
              </IconButton>
              <Typography 
                variant="h6" 
                noWrap 
                component="div"
                sx={{ 
                  display: 'inline',
                  fontWeight: '700',
                  fontSize: '20px',
                  letterSpacing: '0.5px',
                }}
              >
                Grintta
              </Typography>
            </div>
            <div className="right-content" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Logout />
              <IconButton
                color="inherit"
                aria-label="profile"
                onClick={handleProfileClick}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <AccountCircleRoundedIcon sx={{ fontSize: 32 }} />
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>

        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { 
              width: drawerWidth, 
              boxSizing: 'border-box',
              background: '#ffffff',
              borderRight: 'none',
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08)',
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          {/* Header with close button */}
          <DrawerHeader 
            sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              minHeight: '70px !important',
              padding: '0 16px',
            }}
          >
            <IconButton 
              onClick={handleDrawerClose}
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'rotate(180deg)',
                },
                transition: 'all 0.4s ease',
              }}
            >
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>

          {/* Compact Profile Section - MOVED HIGHER WITH LESS PADDING */}
          <Box 
            sx={{ 
              position: 'relative',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '8px 16px 12px 16px',
              marginBottom: '12px',
              boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)',
            }}
          >
            {/* Avatar with online status */}
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: 'white', 
                    color: '#667eea', 
                    width: 44, 
                    height: 44, 
                    fontSize: 18,
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                  onClick={handleProfileClick}
                >
                  {user.data.preferred_username[0].toUpperCase()}
                </Avatar>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    bgcolor: '#10b981',
                    borderRadius: '50%',
                    border: '2px solid white',
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.4)',
                  }}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  component="div" 
                  sx={{ 
                    fontWeight: '700', 
                    color: 'white',
                    fontSize: '14px',
                    lineHeight: 1.2,
                    marginBottom: '3px',
                  }}
                >
                  {user.data.preferred_username}
                </Typography>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: '600', 
                      color: 'white',
                      fontSize: '9px',
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {user.data.rol[0]}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Expiration info - More compact */}
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '8px 10px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <CalendarTodayIcon sx={{ color: 'white', fontSize: 14 }} />
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '9px',
                    fontWeight: '600',
                    display: 'block',
                  }}
                >
                  Expire le
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}
                >
                  {user.data.lock_date}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Navigation Section */}
          <Box sx={{ padding: '0 16px', flexGrow: 1 }}>
            <Typography 
              variant="overline" 
              sx={{ 
                color: '#9ca3af', 
                fontWeight: '700', 
                fontSize: '10px',
                letterSpacing: '1px',
                paddingLeft: '4px',
                marginBottom: '12px',
                display: 'block',
              }}
            >
              MENU
            </Typography>
            <List sx={{ padding: 0 }}>
              {user.data.rol[0] === "ADMIN"
                ? navigations.filter(n => n.role === "admin").map((item, index) => (
                    <ListItem key={index} disablePadding sx={{ marginBottom: '6px' }}>
                      <MenuItem item={item} handleNavigation={handleNavigation} />
                    </ListItem>
                  ))
                : navigations.filter(n => n.role === "user").map((item, index) => (
                    <ListItem key={index} disablePadding sx={{ marginBottom: '6px' }}>
                      <MenuItem item={item} handleNavigation={handleNavigation} />
                    </ListItem>
                  ))
              }
            </List>
          </Box>

          {/* Footer */}
          <Box 
            sx={{ 
              padding: '12px',
              borderTop: '1px solid #e5e7eb',
              background: 'rgba(102, 126, 234, 0.03)',
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#9ca3af',
                textAlign: 'center',
                display: 'block',
                fontSize: '10px',
                fontWeight: '600',
              }}
            >
              © 2025 Grintta. All rights reserved.
            </Typography>
          </Box>
        </Drawer>

        <Main open={open}>
          <DrawerHeader />
          <NotificationPanelTimer />
          <Outlet />
        </Main>
      </Box>

      {/* Alerts centered at top */}
      <Stack 
        spacing={2} 
        sx={{ 
          width: 'auto', 
          position: 'fixed', 
          top: 90, 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 2000,
          maxWidth: '550px',
          padding: '0 20px',
        }}
      >
        {subAlertOpen && (
          <MuiAlert
            severity="error"
            icon={<NotificationsIcon />}
            onClose={() => setSubAlertOpen(false)}
            sx={{ 
              borderRadius: '16px', 
              fontSize: '14px', 
              fontWeight: '600', 
              boxShadow: '0 12px 32px rgba(239, 68, 68, 0.25)',
              backgroundColor: '#fef2f2',
              border: '2px solid #fecaca',
              padding: '16px',
              '& .MuiAlert-icon': {
                color: '#dc2626',
                fontSize: '24px',
              },
              '& .MuiAlert-message': {
                padding: '4px 0',
              },
              animation: 'slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {subAlertMessage}
          </MuiAlert>
        )}

        {agendaAlertOpen && (
          <MuiAlert
            severity="info"
            icon={<EventNoteIcon />}
            onClose={() => setAgendaAlertOpen(false)}
            sx={{ 
              borderRadius: '16px', 
              fontSize: '14px', 
              fontWeight: '600', 
              boxShadow: '0 12px 32px rgba(59, 130, 246, 0.25)',
              backgroundColor: '#eff6ff',
              border: '2px solid #bfdbfe',
              padding: '16px',
              '& .MuiAlert-icon': {
                color: '#2563eb',
                fontSize: '24px',
              },
              '& .MuiAlert-message': {
                padding: '4px 0',
              },
              animation: 'slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {agendaAlertMessage}
          </MuiAlert>
        )}
      </Stack>

      {/* Chronometer Warning Dialog */}
      <Dialog
        open={Auth.isChronometerOpen}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            color: 'white',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: '700' }}>
            Chronomètre actif
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: '32px 24px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            >
              <TimerIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <DialogContentText sx={{ fontSize: '16px', color: '#374151', flex: 1 }}>
              Vous avez un chronomètre en cours d'exécution. Veuillez l'arrêter avant de vous déconnecter.
            </DialogContentText>
          </Box>
          <Box
            sx={{
              background: '#fef3c7',
              border: '2px solid #fbbf24',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '16px',
            }}
          >
            <Typography variant="body2" sx={{ color: '#92400e', fontWeight: '600' }}>
              💡 Astuce: Rendez-vous dans la section chronomètre pour arrêter votre session en cours.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -30px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(0.95);
          }
        }
      `}</style>
    </>
  );
}