import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:5000', // or deployed URL
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
