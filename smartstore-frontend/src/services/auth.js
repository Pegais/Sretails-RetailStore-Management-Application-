import axios from 'axios'

// Get the current hostname (works for both localhost and network IP)
const getApiBaseURL = () => {
  if (import.meta.env.DEV) {
    const hostname = window.location.hostname
    return hostname === 'localhost' || hostname === '127.0.0.1'
      ? 'http://localhost:5000'
      : `http://${hostname}:5000`
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000'
}

const API = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true
})

export const login = (email, password) =>
  API.post('/auth/login', { email, password })

export const sendOtp = (email) =>
  API.post('/auth/forgot-password', { email })

export const verifyOtp = (email, otp) =>
  API.post('/auth/verify-otp', { email, otp })

export const resetPassword = (email, password) =>
  API.post('/auth/reset-password', { email, password })
