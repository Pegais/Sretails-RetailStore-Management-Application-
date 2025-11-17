import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Stack,
    Grid,
    useTheme,
    Container,
    InputAdornment,
    IconButton,
    FormControl,
    InputLabel,
    OutlinedInput,
    FormHelperText,
    Link
} from '@mui/material'
import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
import loginAnimation from '../assets/login-animation.json' // Add this file
import { GoogleLogin } from '@react-oauth/google'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useState } from 'react'
import axiosInstance from '../api/axiosInstance'
import { useNavigate } from "react-router-dom"
import useSmartStore from '../store/useSmartStore'

// Modal 
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert
} from '@mui/material'



export default function LoginPage() {

    const navigate = useNavigate();
    const setUser = useSmartStore((state) => state.setUser)
    const fetchSession = useSmartStore((state) => state.fetchSession)
    const [showPassword, setShowPassword] = useState(false)


    const [forgotOpen, setForgotOpen] = useState(false)
    const [step, setStep] = useState('email') // 'email' | 'otp' | 'reset'

    const [forgotEmail, setForgotEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')


    // Handler function
    const handleCancel = () => {
        setForgotOpen(false)
        setStep('email')
        setForgotEmail('')
        setOtp('')
        setNewPassword('')
        setConfirmPassword('')
    }

    const handleSendOtp = async () => {
        try {
            console.log('📨 Sending OTP to:', forgotEmail)
            const res = await axiosInstance.post('/auth/forgot-password', { email: forgotEmail })
            alert(res.data.message || 'OTP sent!')
            setStep('otp')
        } catch (error) {
            alert(error.response?.data?.message || 'OTP send failed')
        }

    }

    const handleVerifyOtp = async () => {
        try {

            if (otp.length === 6) {
                // console.log('✅ OTP Verified:', otp)
                const res = await axiosInstance.post('/auth/verify-otp', {
                    email: forgotEmail,
                    otp
                })
                alert(res.data.message || 'OTP verified!')
                setStep('reset')
            } else {
                alert('OTP must have 6 character')
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Invalid OTP')
        }
    }


    const handleResetPassword = async () => {
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters')
        }
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match')
        }
        try {
            const res = await axiosInstance.post('/auth/reset-password', {
                email: forgotEmail,
                newPassword
            })
            alert(res.data.message || 'Password reset successful!')
            handleCancel() // Close and reset all

        } catch (err) {
            alert(err.response?.data?.message || 'Reset failed')
        }
    }







    const handleTogglePassword = () => {
        setShowPassword((prev) => !prev)
    }



    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email('Invalid email address')
                .required('Email is required'),
            password: Yup.string()
                .min(4, 'Password too short')
                .required('Password is required')
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                console.log(values,"values");
                
                const res = await axiosInstance.post('/auth/login', values)
                const loggedInUser = res.data?.user
                if (loggedInUser) {
                    setUser(loggedInUser)
                } else {
                    // fallback: re-fetch session
                    await fetchSession(true)
                }
                console.log('✅ Logged in:', res.data)
                alert(`Welcome ${loggedInUser?.name || 'User'}!`)
                navigate('/dashboard', { replace: true })

                // TODO: Optional: store user in context or global state
                // TODO: Redirect to dashboard if route exists

            } catch (err) {
                console.error('❌ Login failed:', err)
                alert(err.response?.data?.message || 'Login failed')
            } finally {
                setSubmitting(false)
            }
        }
    })


    return (
        <Container maxWidth="xl">
            <Dialog
                open={forgotOpen}
                onClose={handleCancel}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 2,
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem' }}>
                    Forgot Password?
                </DialogTitle>

                <DialogContent sx={{ pt: 2 }}>
                    {step === 'email' && (
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Enter your registered email"
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                        />
                    )}

                    {step === 'otp' && (
                        <Stack spacing={2}>
                            <Alert severity="success">OTP has been sent to your email</Alert>
                            <TextField
                                fullWidth
                                label="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </Stack>
                    )}

                    {step === 'reset' && (
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                label="New Password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                    <Button onClick={handleCancel} variant="text">
                        Cancel
                    </Button>

                    {step === 'email' && (
                        <Button onClick={handleSendOtp} variant="contained" disabled={!forgotEmail}>
                            Send OTP
                        </Button>
                    )}

                    {step === 'otp' && (
                        <Button onClick={handleVerifyOtp} variant="contained" disabled={otp.length !== 6}>
                            Verify OTP
                        </Button>
                    )}

                    {step === 'reset' && (
                        <Button
                            onClick={handleResetPassword}
                            variant="contained"
                            disabled={!newPassword || !confirmPassword}
                        >
                            Reset Password
                        </Button>
                    )}
                </DialogActions>
            </Dialog>



            <Grid container minHeight="100vh" alignItems="center" justifyContent="center">
                {/* Left Side - Animation */}
                {/* Left: Animated Illustration */}
                <Grid item xs={0} md={6}
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                    <Lottie animationData={loginAnimation} style={{ height: 350 }} />
                </Grid>

                {/* Right Side - Login Card */}
                <Grid item xs={12} md={6}>
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Card elevation={6} sx={{ borderRadius: 3, p: 3 }}>
                            <CardContent>
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                        textAlign="center"
                                        mb={2}
                                        color="secondary"
                                        sx={{ fontFamily: 'Poppins, sans-serif' }}
                                    >
                                        Welcome to SmartStore
                                    </Typography>
                                </motion.div>



                                <form onSubmit={formik.handleSubmit}>

                                    <Stack spacing={2}>
                                        <FormControl
                                            fullWidth
                                            variant="outlined"
                                            error={formik.touched.email && Boolean(formik.errors.email)}
                                        >
                                            <InputLabel htmlFor="email">Email</InputLabel>
                                            <OutlinedInput
                                                id="email"
                                                name="email"
                                                type="email"
                                                label="Email"
                                                value={formik.values.email}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                            />
                                            <FormHelperText>
                                                {formik.touched.email && formik.errors.email}
                                            </FormHelperText>
                                        </FormControl>
                                        <FormControl fullWidth variant="outlined" error={formik.touched.password && Boolean(formik.errors.password)}>
                                            <InputLabel htmlFor="password">Password</InputLabel>
                                            <OutlinedInput
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                label="Password"
                                                value={formik.values.password}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={handleTogglePassword} edge="end">
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                            />
                                            <FormHelperText>{formik.touched.password && formik.errors.password}</FormHelperText>
                                        </FormControl>



                                        <Button variant="contained" size="large" fullWidth sx={{ textTransform: 'none' }} type='submit'>
                                            Login
                                        </Button>
                                        {/* 🔁 Google Login Here */}
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => {
                                                // Use the same hostname as current page for backend
                                                const hostname = window.location.hostname
                                                const backendURL = hostname === 'localhost' || hostname === '127.0.0.1'
                                                  ? 'http://localhost:5000'
                                                  : `http://${hostname}:5000`
                                                window.location.href = `${backendURL}/auth/google`
                                            }}
                                        >
                                            Login with Google
                                        </Button>

                                        {/* // At bottom of login form */}
                                        <Typography variant="body2" textAlign="center">
                                            <Link
                                                component="button"
                                                variant="body2"
                                                onClick={() => setForgotOpen(true)}
                                                underline="hover"
                                            >
                                                {('Forgot Password?')}
                                            </Link>
                                        </Typography>
                                    </Stack>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Grid>
            </Grid>
        </Container>
    )
}
