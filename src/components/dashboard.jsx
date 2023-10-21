import React, { useState } from 'react';
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
import adminNavigations from '../adminNavigations';
import candidateNavigations from '../candidateNavigations';

import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Logout from './small/logout';

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

const SingleLevel = ({ item, handleNavigation, level }) => {
  return (
    <ListItemButton
      onClick={() => handleNavigation(item.link)}
      sx={{
        '&:hover': {
          backgroundColor: '#2e3c41',
        },
        backgroundColor: '#d0d0d0',
        paddingLeft: level * 16,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <ListItemText
        primary={item.text}
        primaryTypographyProps={{
          sx: {
            color: 'white',
            fontSize: '18px',
          },
        }}
      />
    </ListItemButton>
  );
};

const MenuItem = ({ item, handleNavigation, level = 0 }) => {
  return <SingleLevel item={item} handleNavigation={handleNavigation} level={level} />;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const Auth = useAuth();
  const user = Auth.getUser();

  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleNavigation = (link) => {
    navigate(`/dashboard/${link}`);
  };

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
              </Typography>
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
            },
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
          <Typography
            sx={{
              color: '#0399f0',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            {user.data.rol[0]} {/* Corrected user data key */}
          </Typography>
          <Divider />
          <List>
            {user.data.rol[0] === "ADMIN"
              ? adminNavigations.map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton>
                      <MenuItem key={index} item={item} handleNavigation={handleNavigation} />
                    </ListItemButton>
                  </ListItem>
                ))
              : candidateNavigations.map((item, index) => (
                  <ListItem key={index} disablePadding>
                    <ListItemButton>
                      <MenuItem key={index} item={item} handleNavigation={handleNavigation} />
                    </ListItemButton>
                  </ListItem>
                ))}
          </List>
        </Drawer>
        <Main open={open}>
          <DrawerHeader />
          <Outlet />
        </Main>
      </Box>
    </>
  );
}
