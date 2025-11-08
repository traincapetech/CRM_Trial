import React, { useEffect, useState } from "react";
import banner from "../../assets/ForgotPassword.jpg";
import logo from "../../assets/ForgotPassword.jpg";
import { motion } from "framer-motion";
import { FaRegEyeSlash, FaEye } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authAPI } from "../../services/api"; // Import the authAPI service

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [error, setError] = useState(false);
  const [showEmail, setShowEmail] = useState(true);
  const [successMessage, setSuccessMessage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);

  const inputRefs = React.useRef([]);

  const handleOtpChange = (e, index) => {
    const newOtpArray = [...inputRefs.current.map((input) => input?.value || "")];
    newOtpArray[index] = e.target.value;
    
    // Auto-advance to next field
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    const pasteArray = paste.split("");
    
    inputRefs.current.forEach((input, index) => {
      if (index < pasteArray.length && input) {
        input.value = pasteArray[index];
      }
    });
    
    if (inputRefs.current[pasteArray.length - 1]) {
      inputRefs.current[pasteArray.length - 1].focus();
    }
  };
  
  const [showOtp, setShowOtp] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (e) => {
    setPayload({
      ...payload,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!payload.email.trim()) {
        setError("Email is required");
        toast.error("Email is required");
        setLoading(false);
        return;
      }

      const response = await authAPI.forgotPassword(payload.email);
      const result = response.data;
      
      if (result.success) {
        setError(false);
        setShowOtp(true);
        setShowEmail(false);
        setLoading(false);
        setSuccessMessage("OTP sent successfully");
        toast.success("OTP sent successfully to your email!");
      } else {
        console.log("result", result);
        toast.error(result.message || "Failed to send OTP");
        setError(result.message || "Failed to send OTP");
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.error(e);
      if (e.message === "Network Error") {
        toast.error("Network error. Please check your internet connection or contact support.");
        setError("Network error. Please check your internet connection or contact support.");
      } else {
        toast.error(e.response?.data?.message || "Failed to send OTP. Please try again later.");
        setError(e.response?.data?.message || "Failed to send OTP. Please try again later.");
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((input) => input?.value || "");
    const otp = otpArray.join("");
    
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      setError("Please enter the complete 6-digit OTP");
      return;
    }
    
    try {
      setLoading(true);
      console.log("payload.email", payload.email);
      console.log("otp", otp);
      const response = await authAPI.verifyOTP({ otp, email: payload.email });
      const result = response.data;
      
      if (result.success) {
        setError(false);
        setShowNewPassword(true);
        setShowOtp(false);
        setLoading(false);
        // Store the resetOtp for the password reset step
        localStorage.setItem('resetOtp', result.resetOtp);
        setSuccessMessage("OTP verified successfully. Enter your new password");
        toast.success("OTP verified successfully!");
      } else {
        setSuccessMessage(false);
        toast.error(result.message || "Invalid OTP");
        setError(result.message || "Invalid OTP");
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.error(e);
      if (e.message === "Network Error") {
        toast.error("Network error. Please check your internet connection or contact support.");
        setError("Network error. Please check your internet connection or contact support.");
      } else {
        toast.error(e.response?.data?.message || "Failed to verify OTP. Please try again later.");
        setError(e.response?.data?.message || "Failed to verify OTP. Please try again later.");
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!payload.newPassword.trim()) {
      toast.error("New password is required");
      setError("New password is required");
      return;
    }
    
    if (payload.newPassword !== payload.confirmPassword) {
      toast.error("Passwords do not match");
      setError("Passwords do not match");
      return;
    }
    
    if (payload.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      setError("Password must be at least 6 characters");
      return;
    }
    
    try {
      setLoading(true);
      // Get the resetOtp from the verification response
      const response = await authAPI.resetPassword({ 
        email: payload.email, 
        resetOtp: localStorage.getItem('resetOtp'), // Get the stored resetOtp
        newPassword: payload.newPassword 
      });
      const result = response.data;
      
      if (result.success) {
        setError(false);
        setLoading(false);
        setSuccessMessage("Password reset successfully!");
        toast.success("Password reset successfully! You can now login with your new password.");
        
        // Clean up stored resetOtp
        localStorage.removeItem('resetOtp');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setSuccessMessage(false);
        toast.error(result.message || "Failed to reset password");
        setError(result.message || "Failed to reset password");
        setLoading(false);
      }
    } catch (e) {
      setLoading(false);
      console.error(e);
      if (e.message === "Network Error") {
        toast.error("Network error. Please check your internet connection or contact support.");
        setError("Network error. Please check your internet connection or contact support.");
      } else {
        toast.error(e.response?.data?.message || "Failed to reset password. Please try again later.");
        setError(e.response?.data?.message || "Failed to reset password. Please try again later.");
      }
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };
  
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { duration: 0.3 } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div
      className="w-full min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${banner})` }}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      <motion.div 
        className="absolute inset-0 flex justify-center items-center p-4"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        <div className="grid grid-cols-1 md:flex max-w-5xl w-full">
          <motion.div 
            className="bg-[#152B54] w-full md:w-[40%] p-6 hidden md:flex flex-col justify-center items-center"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative">
              <img
                src={logo}
                alt="Traincape Technology"
                className="w-[130px] h-[130px] mb-8"
              />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-white text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Password Recovery</h2>
              <p className="mb-6">Recover your account access quickly and securely</p>
              <div className="w-16 h-1 bg-white dark:bg-slate-900 transition-all duration-200 ease-out mx-auto"></div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out bg-opacity-95 p-8 md:p-12 shadow-xl w-full md:w-[60%] rounded-lg"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.h1 
              className="text-3xl font-semibold text-center text-[#152B54] mb-6"
              variants={itemVariants}
            >
              Forgot Password
            </motion.h1>
            
            {error && (
              <motion.div 
                className="mb-4 p-3 bg-red-100 text-red-800 rounded-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}
            
            {successMessage && (
              <motion.div 
                className="mb-4 p-3 bg-green-100 text-green-800 rounded-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {successMessage}
              </motion.div>
            )}
            
            <form>
              {/* Email Form */}
              {showEmail && (
                <motion.div variants={formVariants}>
                  <motion.div className="mb-6" variants={itemVariants}>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={payload.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 mt-1 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#152B54] transition-all duration-200"
                    />
                  </motion.div>
                  <motion.button
                    type="button"
                    onClick={handleEmailSubmit}
                    disabled={loading}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-[#152B54] text-white rounded-lg hover:bg-sky-950 transition duration-200 flex justify-center items-center"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      "Send Reset OTP"
                    )}
                  </motion.button>
                  <motion.div 
                    className="mt-4 text-center"
                    variants={itemVariants}
                  >
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-[#152B54] hover:underline"
                    >
                      Back to Login
                    </button>
                  </motion.div>
                </motion.div>
              )}
              
              {/* OTP Form */}
              {showOtp && (
                <motion.div 
                  className="mt-4"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.h2 
                    className="text-xl font-semibold text-center text-[#152B54] mb-4"
                    variants={itemVariants}
                  >
                    Enter Verification Code
                  </motion.h2>
                  <motion.p 
                    className="text-center text-gray-600 dark:text-gray-400 mb-6"
                    variants={itemVariants}
                  >
                    We've sent a 6-digit code to your email
                  </motion.p>
                  <motion.div
                    onPaste={handlePaste}
                    className="flex justify-between mb-6"
                    variants={itemVariants}
                  >
                    {Array(6)
                      .fill(0)
                      .map((_, index) => (
                        <motion.input
                          type="text"
                          maxLength="1"
                          key={index}
                          required
                          onChange={(e) => handleOtpChange(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          ref={(el) => (inputRefs.current[index] = el)}
                          whileFocus={{ scale: 1.1 }}
                          className="w-12 h-12 text-3xl text-center border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#152B54] focus:border-[#152B54] transition-all duration-200"
                        />
                      ))}
                  </motion.div>
                  <motion.button
                    type="button"
                    onClick={handleOtpSubmit}
                    disabled={loading}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 mt-2 bg-[#152B54] text-white rounded-lg hover:bg-sky-950 transition duration-200 flex justify-center items-center"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify OTP"
                    )}
                  </motion.button>
                  <motion.div 
                    className="mt-4 text-center"
                    variants={itemVariants}
                  >
                    <button
                      type="button"
                      onClick={handleEmailSubmit}
                      className="text-[#152B54] hover:underline"
                    >
                      Didn't receive code? Resend
                    </button>
                  </motion.div>
                </motion.div>
              )}
              
              {/* New Password Form */}
              {showNewPassword && (
                <motion.div 
                  className="mt-4"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.h2 
                    className="text-xl font-semibold text-center text-[#152B54] mb-4"
                    variants={itemVariants}
                  >
                    Create New Password
                  </motion.h2>
                  <motion.p 
                    className="text-center text-gray-600 dark:text-gray-400 mb-6"
                    variants={itemVariants}
                  >
                    Your new password must be at least 6 characters
                  </motion.p>
                  <motion.div className="mb-5 relative" variants={itemVariants}>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={passwordVisible ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={payload.newPassword}
                        onChange={handleChange}
                        required
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#152B54] transition-all duration-200"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-300 hover:text-gray-700"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? <FaRegEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  </motion.div>
                  <motion.div className="mb-6" variants={itemVariants}>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={payload.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#152B54] transition-all duration-200"
                    />
                  </motion.div>
                  <motion.button
                    type="button"
                    onClick={handlePasswordSubmit}
                    disabled={loading}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-[#152B54] text-white rounded-lg hover:bg-sky-950 transition duration-200 flex justify-center items-center"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                        <span>Resetting Password...</span>
                      </div>
                    ) : (
                      "Reset Password"
                    )}
                  </motion.button>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;