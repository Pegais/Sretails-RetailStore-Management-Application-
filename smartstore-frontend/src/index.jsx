import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import oliveTheme from './themse.js'
import { ThemeProvider, CssBaseline } from '@mui/material'
import './i18n/config'

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="911580229670-q4me9tuua602tmpi935rs145s9opmdqh.apps.googleusercontent.com">
    <ThemeProvider theme={oliveTheme}>
      <CssBaseline>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CssBaseline>
    </ThemeProvider>
  </GoogleOAuthProvider>
)

