import axios from "axios"
import { useState, useContext, useEffect } from "react"
import { ShopContext } from "../context/ShopContext"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { 
  FaEye, 
  FaEyeSlash, 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaArrowLeft,
  FaKey,
  FaCheckCircle,
  FaSpinner
} from "react-icons/fa"

const Login = () => {
  const [mode, setMode] = useState('login')
  const { token, setToken, setUser, backendUrl } = useContext(ShopContext)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    newPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [canResendOtp, setCanResendOtp] = useState(true)
  const [resendTimer, setResendTimer] = useState(0)
  const navigate = useNavigate()

  const isSignUp = mode === 'signup'
  const isForgotPassword = mode === 'forgot-password'
  const isResetPassword = mode === 'reset-password'
  const isLogin = mode === 'login'

  // Email validation regex
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Normalize email to lowercase
  const normalizeEmail = (email) => {
    return email.toLowerCase().trim()
  }

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Get normalized email for API calls
  const getNormalizedEmail = () => {
    return normalizeEmail(formData.email)
  }

  // Resend OTP function
  const handleResendOtp = async () => {
    if (!canResendOtp) return

    try {
      setIsLoading(true)
      const response = await axios.post(`${backendUrl}/api/user/resend-otp`, {
        email: getNormalizedEmail()
      })
      
      if (response.data.success) {
        toast.success("New OTP sent to your email")
        setCanResendOtp(false)
        setResendTimer(60)
        
        const timer = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              setCanResendOtp(true)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address")
      return
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    if ((isSignUp || isResetPassword) && formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    if (isResetPassword && formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    if (isResetPassword && formData.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }

    setIsLoading(true)

    try {
      const normalizedEmail = getNormalizedEmail()

      if (isSignUp) {
        const response = await axios.post(`${backendUrl}/api/user/register`, {
          name: formData.name,
          email: normalizedEmail,
          password: formData.password
        })
        
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          
          setUser({
            _id: response.data.user?._id,
            name: response.data.user?.name || formData.name,
            email: normalizedEmail,
            isLoggedIn: true
          })
          
          toast.success("Account created successfully")
          navigate("/")
        } else {
          toast.error(response.data.message)
        }
      } else if (isLogin) {
        const response = await axios.post(`${backendUrl}/api/user/login`, {
          email: normalizedEmail,
          password: formData.password
        })
        
        if (response.data.success) {
          setToken(response.data.token)
          localStorage.setItem('token', response.data.token)
          
          setUser({
            _id: response.data.user?._id,
            name: response.data.user?.name || 'User',
            email: normalizedEmail,
            isLoggedIn: true
          })
          
          toast.success("Logged in successfully")
          navigate("/")
        } else {
          toast.error(response.data.message)
        }
      } else if (isForgotPassword) {
        const response = await axios.post(`${backendUrl}/api/user/forgot-password`, {
          email: normalizedEmail
        })
        
        if (response.data.success) {
          toast.success("OTP sent to your email")
          setMode('reset-password')
          setCanResendOtp(false)
          setResendTimer(60)
          
          const timer = setInterval(() => {
            setResendTimer(prev => {
              if (prev <= 1) {
                clearInterval(timer)
                setCanResendOtp(true)
                return 0
              }
              return prev - 1
            })
          }, 1000)
        } else {
          toast.error(response.data.message)
        }
      } else if (isResetPassword) {
        const response = await axios.post(`${backendUrl}/api/user/reset-password`, {
          email: normalizedEmail,
          otp: formData.otp,
          newPassword: formData.newPassword
        })
        
        if (response.data.success) {
          toast.success("Password reset successfully")
          setMode('login')
          setFormData(prev => ({ ...prev, email: '', otp: '', newPassword: '' }))
          setCanResendOtp(true)
          setResendTimer(0)
        } else {
          toast.error(response.data.message)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(current => current === 'login' ? 'signup' : 'login')
    setFormData({ name: '', email: '', password: '', confirmPassword: '', otp: '', newPassword: '' })
    setCanResendOtp(true)
    setResendTimer(0)
  }

  const handleForgotPassword = () => {
    setMode('forgot-password')
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
  }

  const handleBackToLogin = () => {
    setMode('login')
    setFormData(prev => ({ ...prev, otp: '', newPassword: '' }))
    setCanResendOtp(true)
    setResendTimer(0)
  }

  const getDisplayText = () => {
    switch (mode) {
      case 'signup': return 'Create Account'
      case 'forgot-password': return 'Reset Password'
      case 'reset-password': return 'Enter OTP'
      default: return 'Welcome Back'
    }
  }

  const getSubText = () => {
    switch (mode) {
      case 'signup': return 'Create a new account to get started'
      case 'forgot-password': return 'Enter your email to reset password'
      case 'reset-password': return 'Enter the OTP sent to your email'
      default: return 'Sign in to your account to continue'
    }
  }

  const getSubmitButtonText = () => {
    if (isLoading) return 'Processing...'
    switch (mode) {
      case 'signup': return 'Create Account'
      case 'forgot-password': return 'Send OTP'
      case 'reset-password': return 'Reset Password'
      default: return 'Sign In'
    }
  }

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button for non-login modes */}
        {(isForgotPassword || isResetPassword || isSignUp) && (
          <button
            onClick={isResetPassword ? handleBackToLogin : handleForgotPassword}
            className="flex items-center gap-2 text-black hover:text-gray-800 mb-6 transition-colors duration-200"
            disabled={isLoading}
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to {isResetPassword ? 'Forgot Password' : 'Login'}
          </button>
        )}

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header section with gradient */}
          <div className="bg-black p-8 text-center">
            <div className="flex justify-center mb-4">
            
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{getDisplayText()}</h1>
            <p className="text-gray-300">{getSubText()}</p>
          </div>

          {/* Form section */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name field for signup */}
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black flex items-center gap-2">
                    <FaUser className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-800 focus:ring-2 focus:ring-gray-800/20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your full name"
                    required
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Email field for all modes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black flex items-center gap-2">
                  <FaEnvelope className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-800 focus:ring-2 focus:ring-gray-800/20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  required
                  disabled={isLoading || isResetPassword}
                />
              </div>

              {/* Password fields for login and signup */}
              {(isLogin || isSignUp) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black flex items-center gap-2">
                    <FaLock className="w-4 h-4" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      type={showPassword ? "text" : "password"}
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-gray-800 focus:ring-2 focus:ring-gray-800/20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter your password"
                      required
                      disabled={isLoading}
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black disabled:opacity-50 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {isLogin && (
                    <div className="text-right">
                      <button 
                        type="button" 
                        onClick={handleForgotPassword}
                        className="text-sm text-black hover:text-gray-800 transition-colors duration-200 disabled:opacity-50"
                        disabled={isLoading}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm password for signup */}
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Confirm Password</label>
                  <div className="relative">
                    <input
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-gray-800 focus:ring-2 focus:ring-gray-800/20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black disabled:opacity-50 transition-colors duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP field for reset password */}
              {isResetPassword && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">Enter OTP</label>
                  <input
                    value={formData.otp}
                    onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    type="text"
                    className="w-full px-4 py-3 text-center text-lg tracking-widest rounded-lg border border-gray-300 focus:border-gray-800 focus:ring-2 focus:ring-gray-800/20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="• • • • • •"
                    required
                    disabled={isLoading}
                    maxLength={6}
                    pattern="\d{6}"
                  />
                  <div className="text-center">
                    <button 
                      type="button" 
                      onClick={handleResendOtp}
                      className={`text-sm ${canResendOtp ? 'text-black hover:text-gray-800' : 'text-gray-400'} transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                      disabled={!canResendOtp || isLoading}
                    >
                      {canResendOtp ? "Didn't receive OTP? Resend" : `Resend OTP in ${resendTimer}s`}
                    </button>
                  </div>
                </div>
              )}

              {/* New password field for reset password */}
              {isResetPassword && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">New Password</label>
                  <div className="relative">
                    <input
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      type={showNewPassword ? "text" : "password"}
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:border-gray-800 focus:ring-2 focus:ring-gray-800/20 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter new password"
                      required
                      disabled={isLoading}
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black disabled:opacity-50 transition-colors duration-200"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={isLoading}
                    >
                      {showNewPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button 
                type="submit" 
                className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:from-gray-800 hover:to-black active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin" />
                    {getSubmitButtonText()}
                  </>
                ) : (
                  getSubmitButtonText()
                )}
              </button>

              {/* Mode toggle for login/signup */}
              {(isLogin || isSignUp) && (
                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-black">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button 
                      type="button" 
                      onClick={toggleMode}
                      className="ml-2 font-medium text-gray-900 hover:text-black transition-colors duration-200 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isSignUp ? 'Sign In' : 'Create Account'}
                    </button>
                  </p>
                </div>
              )}
            </form>
          </div>

        
        </div>

        {/* Additional info */}
        {isForgotPassword && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-blue-800">
                  We'll send a 6-digit OTP to your email address. Please check your inbox and spam folder.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login