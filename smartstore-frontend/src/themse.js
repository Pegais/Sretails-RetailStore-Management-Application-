import { createTheme } from '@mui/material/styles'

const oliveTheme = createTheme({
  palette: {
    primary: {
      main: '#556B2F', // Olive green
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8F9779', // Softer olive tone
    },
    background: {
      default: '#f8f9f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
    allVariants: {
      color: '#556B2F', // Force olive color for all text
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
  },
})

export default oliveTheme
