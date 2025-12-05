import axios from 'axios'

// Get the current hostname (works for both localhost and network IP)
const getApiBaseURL = () => {
  // In development, use the same host as the frontend
  if (process.env.NODE_ENV === 'development') {
    const hostname = window.location.hostname
    // If accessing via localhost, use localhost for backend
    // If accessing via IP, use the same IP for backend
    return hostname === 'localhost' || hostname === '127.0.0.1'
      ? 'http://localhost:5000/'
      : `http://${hostname}:5000/`
  }
  // In production (Vercel), use REACT_APP_API_URL pointing to Railway backend
  // This must be set in Vercel environment variables
  // Example: REACT_APP_API_URL=https://your-backend.railway.app
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.endsWith('/') 
      ? process.env.REACT_APP_API_URL 
      : process.env.REACT_APP_API_URL + '/'
  }
  // Fallback: empty string for same-origin (not applicable for cross-origin)
  console.warn('REACT_APP_API_URL not set in production. Please set it in Vercel environment variables.')
  return ''
}

const axiosInstance = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true, // Required for cross-origin cookie sharing
  headers: {
    'Content-Type': 'application/json'
  }
})

export default axiosInstance
