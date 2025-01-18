import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from 'react-bootstrap';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/tr';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LostPets from './pages/LostPets';
import FoundPets from './pages/FoundPets';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import { AuthProvider } from './context/AuthContext';
import PetDetail from './pages/PetDetail';
import MyPosts from './pages/MyPosts';

// Tema renkleri
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#2196f3' : '#90caf9',
      light: mode === 'light' ? '#64b5f6' : '#e3f2fd',
      dark: mode === 'light' ? '#1976d2' : '#42a5f5',
    },
    secondary: {
      main: mode === 'light' ? '#f50057' : '#f48fb1',
      light: mode === 'light' ? '#ff4081' : '#fce4ec',
      dark: mode === 'light' ? '#c51162' : '#f06292',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#000000' : '#ffffff',
      secondary: mode === 'light' ? '#666666' : '#b3b3b3',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '6px 16px',
          boxShadow: mode === 'light' ? '0 2px 4px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.2)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: mode === 'light' ? '0 4px 8px rgba(0,0,0,0.15)' : '0 4px 8px rgba(0,0,0,0.3)',
          },
        },
        containedPrimary: {
          background: mode === 'light' 
            ? 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)'
            : 'linear-gradient(45deg, #90caf9 30%, #64b5f6 90%)',
          color: '#ffffff',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #f50057 30%, #ff4081 90%)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(45deg, #ff1976 30%, #ff4f8e 90%)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'light' 
            ? '0 4px 12px rgba(0,0,0,0.1)'
            : '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: mode === 'light'
              ? '0 6px 16px rgba(0,0,0,0.15)'
              : '0 6px 16px rgba(0,0,0,0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: mode === 'light'
            ? 'linear-gradient(90deg, #2196f3 0%, #64b5f6 100%)'
            : 'linear-gradient(90deg, #121212 0%, #1e1e1e 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
    },
  },
});

function App() {
  const [mode, setMode] = useState('light');
  const theme = createTheme(getDesignTokens(mode));

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <AuthProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="tr">
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <div className="App">
              <Navbar toggleColorMode={toggleColorMode} mode={mode} />
              <Container fluid className="px-0">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/lost-pets" element={<LostPets />} />
                  <Route path="/found-pets" element={<FoundPets />} />
                  <Route path="/report-lost" element={<ReportLost />} />
                  <Route path="/report-found" element={<ReportFound />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/pet/:type/:id" element={<PetDetail />} />
                  <Route path="/my-posts" element={<MyPosts />} />
                </Routes>
              </Container>
            </div>
          </Router>
        </ThemeProvider>
      </LocalizationProvider>
    </AuthProvider>
  );
}

export default App;
