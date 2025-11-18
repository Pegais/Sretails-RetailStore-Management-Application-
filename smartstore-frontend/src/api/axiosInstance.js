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
  // In production, use empty string for relative paths (Nginx will handle routing)
  // Or use REACT_APP_API_URL if explicitly set (CRA uses REACT_APP_ prefix)
  return process.env.REACT_APP_API_URL || ''
}

const axiosInstance = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true // For JWT cookie support
})

export default axiosInstance
