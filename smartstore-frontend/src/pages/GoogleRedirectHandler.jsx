import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'

const GoogleRedirectHandler = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get('/auth/me') // protected route to check login
        console.log('✅ Google login success:', res.data)
        alert(`Welcome ${res.data.name}`)
        navigate('/dashboard')
      } catch (err) {
        alert('Google login failed')
        navigate('/login')
      }
    }

    fetchUser()
  }, [navigate])

  return <p>Authenticating via Google... please wait.</p>
}

export default GoogleRedirectHandler
