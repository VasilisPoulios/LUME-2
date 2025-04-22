import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.jsx'
import theme from './theme/theme'

// Add Poppins font from Google Fonts
const poppinsLink = document.createElement('link')
poppinsLink.rel = 'stylesheet'
poppinsLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
document.head.appendChild(poppinsLink)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
