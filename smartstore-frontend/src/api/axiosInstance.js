import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/', // Update if your backend prefix changes
  withCredentials: true // For JWT cookie support
})

export default axiosInstance
