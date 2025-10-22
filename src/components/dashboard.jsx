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

import navigations from '../Navigations';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Logout from './small/logout';
import NotificationPanelTimer from './user/timer/NotificationPanelTimer';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
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
      '&:hover': { backgroundColor: '#2196F3' },
      backgroundColor: '#d0d0d0',
      padding: '10px 20px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'background-color 0.3s ease',
    }}
  >
    <ListItemText
      primary={item.text}
      primaryTypographyProps={{
        sx: { color: 'white', fontSize: '18px', textAlign: 'center' },
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
      setAgendaAlertMessage("Vous avez un agenda prévu bientôt !");
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
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="left-content">
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{ mr: 2, ...(open && { display: 'none' }) }}
              >
                <MenuIcon />
              </IconButton>
            </div>
            <div className="right-content">
              <Typography variant="h6" noWrap component="div">
                <Logout />
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleProfileClick}
                  edge="start"
                >
                  <AccountCircleRoundedIcon fontSize="large" />
                </IconButton>
              </Typography>
            </div>
          </Toolbar>
        </AppBar>

        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>

          <ListItemIcon sx={{ color: 'white' }}>
            <AccountCircleIcon />
          </ListItemIcon>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar sx={{ bgcolor: 'green', color: 'white', width: 56, height: 56, fontSize: 24 }}>
                {user.data.preferred_username[0]}
              </Avatar>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: 'limegreen',
                  borderRadius: '50%',
                  border: '2px solid white',
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                }}
              />
            </Box>
            <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 'bold', marginTop: '10px' }}>
              {user.data.lock_date}
            </Typography>
          </Box>

          <Divider />
          <List>
            {user.data.rol[0] === "ADMIN"
              ? navigations.filter(n => n.role === "admin").map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton>
                      <MenuItem item={item} handleNavigation={handleNavigation} />
                    </ListItemButton>
                  </ListItem>
                ))
              : navigations.filter(n => n.role === "user").map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton>
                      <MenuItem item={item} handleNavigation={handleNavigation} />
                    </ListItemButton>
                  </ListItem>
                ))
            }
          </List>
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
          top: 20, 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 2000 
        }}
      >
        {subAlertOpen && (
          <MuiAlert
            severity="error"
            icon={<NotificationsIcon />}
            onClose={() => setSubAlertOpen(false)}
            sx={{ borderRadius: 2, fontSize: 16, fontWeight: 'bold', boxShadow: 3 }}
          >
            {subAlertMessage}
          </MuiAlert>
        )}

        {agendaAlertOpen && (
          <MuiAlert
            severity="info"
            icon={<EventNoteIcon />}
            onClose={() => setAgendaAlertOpen(false)}
            sx={{ borderRadius: 2, fontSize: 16, fontWeight: 'bold', boxShadow: 3 }}
          >
            {agendaAlertMessage}
          </MuiAlert>
        )}
      </Stack>
    </>
  );
}
