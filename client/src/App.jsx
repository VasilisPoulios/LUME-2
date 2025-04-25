import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';
import theme from './theme';
import AppRoutes from './routes';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <TicketProvider>
          <Router>
            <AppRoutes />
          </Router>
          <ToastContainer 
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
          />
        </TicketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
