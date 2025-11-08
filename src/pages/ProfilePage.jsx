import React, { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { authAPI } from "../services/api";
import employeeAPI from "../services/employeeAPI";
import { FaCamera, FaCheck, FaTimes, FaCrop, FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBriefcase, FaCalendarAlt, FaEdit, FaClock, FaFileAlt, FaRupeeSign, FaDollarSign, FaBuilding, FaUserTag, FaCalendarCheck, FaChartBar, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import axios from "axios";
import LeaveManagement from "../components/Employee/LeaveManagement";
import AttendanceManagement from "../components/Employee/AttendanceManagement";
import EmployeeSelfService from "../components/Employee/EmployeeSelfService";
import AttendanceWidget from '../components/AttendanceWidget';
import SalarySlipWidget from '../components/SalarySlipWidget';
import LoadingSpinner from '../components/ui/LoadingSpinner';

import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
import { toast } from "react-toastify";

// Helper to get the correct profile picture URL
const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) return null;
  if (profilePicture.startsWith('http')) return profilePicture;
  // Always prepend backend URL for /uploads
  const base = import.meta.env.DEV ? 'http://localhost:8080' : window.location.origin;
  return `${base}${profilePicture}`;
};

const ProfilePage = () => {
  const { user, loading, setUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  // Format date for better readability
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const centerAspectCrop = (mediaWidth, mediaHeight, aspect) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    );
  };

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    setImage(URL.createObjectURL(file));
    setIsCropping(true);
  };

  const getCroppedImg = (image, crop) => {
    if (!crop || !image) return null;
    
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
          resolve({
            file: file,
            url: URL.createObjectURL(blob)
          });
        } else {
          resolve(null);
        }
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCropComplete = (crop) => {
    setCompletedCrop(crop);
  };

  const applyCrop = async () => {
    if (!completedCrop || !imgRef.current) return;
    
    const croppedData = await getCroppedImg(imgRef.current, completedCrop);
    if (croppedData) {
      setSelectedFile(croppedData.file);
      setPreviewUrl(croppedData.url);
      setIsCropping(false);
    }
  };

  const uploadProfilePicture = async () => {
    if (!previewUrl) return;
    
    try {
      setUploading(true);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);

      const response = await authAPI.updateProfilePicture(formData);
      
      if (response.data && response.data.success) {
        // Update user context with the new profile picture URL
        const updatedUser = {
          ...user,
          profilePicture: response.data.data.profilePicture
        };
        setUser(updatedUser);
        
        // Clear preview and reset state
        setPreviewUrl(null);
        setImage(null);
        setSelectedFile(null);
        
        // Show success message
        toast.success('Profile picture updated successfully');
      } else {
        setUploadError('Failed to update profile picture');
        toast.error('Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload profile picture. Please try again.';
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    // Clean up URL objects to prevent memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (image) {
      URL.revokeObjectURL(image);
    }
    
    setPreviewUrl(null);
    setImage(null);
    setSelectedFile(null);
    setIsCropping(false);
    setUploadError(null);
    setCrop(undefined);
    setCompletedCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (image) {
        URL.revokeObjectURL(image);
      }
    };
  }, [previewUrl, image]);

  // Only fetch employee data if you want to show extra info, but do NOT create employee records
  const fetchEmployeeData = async () => {
    if (user) {
      try {
        setLoadingEmployee(true);
        const response = await employeeAPI.getAll();
        const employees = response.data?.data || response.data || [];
        if (Array.isArray(employees)) {
          // Find employee record linked to this user
          let linkedEmployee = employees.find(emp => 
            emp.userId === user._id || 
            emp._id === user.employeeId ||
            (emp.personalInfo?.email && emp.personalInfo.email === user.email) ||
            (emp.email && emp.email === user.email)
          );
          if (linkedEmployee) {
            setEmployeeData(linkedEmployee);
          } else {
            setEmployeeData(null); // No employee record, but don't create one
          }
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setLoadingEmployee(false);
      }
    }
  };

  useEffect(() => {
    if (user && !loading) {
      fetchEmployeeData();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner 
          size={60}
          text="Loading profile..."
          particleCount={2}
          speed={1.2}
          hueRange={[180, 260]}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'self-service', label: 'Self Service', icon: FaEdit },
    { id: 'attendance', label: 'Attendance', icon: FaClock },
    { id: 'salary', label: 'Salary', icon: FaRupeeSign },
    { id: 'leave', label: 'Leave Management', icon: FaCalendarAlt }
  ];

  return (
    <Layout>
      <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-center py-0 px-0">
        <div className="w-full max-w-6xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-2xl shadow-2xl overflow-hidden shadow-lg mt-0 mb-0 flex flex-col min-h-[90vh]">
          <div className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white p-8 flex items-center justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight">User Profile</h2>
            {/* Optionally add a settings or edit button here */}
          </div>
          <div className="flex-1 flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 xl:w-1/4 bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 p-8 flex flex-col items-center justify-start border-r border-slate-200 dark:border-slate-700">
              {/* Profile Picture and Info */}
              <div className="relative h-24 w-24 rounded-full mx-auto mb-4">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Profile Preview" 
                    className="h-24 w-24 rounded-full object-cover border-2 border-blue-300"
                  />
                ) : employeeData?.documents?.photo ? (
                  <img 
                    src={`/api/employees/file/${employeeData.documents.photo}`} 
                    alt={user.fullName} 
                    className="h-24 w-24 rounded-full object-cover border-2 border-blue-200"
                  />
                ) : user.profilePicture ? (
                  <img 
                    src={getProfilePictureUrl(user.profilePicture)}
                    alt={user.fullName} 
                    className="h-24 w-24 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">
                      {employeeData?.personalInfo?.firstName ? 
                        employeeData.personalInfo.firstName.charAt(0).toUpperCase() :
                        user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                )}
                
                {/* Fallback div for failed image loads */}
                {user.profilePicture && (
                  <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center" style={{display: 'none'}}>
                    <span className="text-3xl font-bold text-blue-600">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                )}
                
                <label 
                  htmlFor="profile-upload" 
                  className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer"
                >
                  <FaCamera size={12} />
                </label>
                <input 
                  type="file" 
                  id="profile-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </div>
              
              {/* Preview Controls */}
              {previewUrl && !isCropping && (
                <div className="flex justify-center space-x-3 mb-4">
                  <button
                    onClick={uploadProfilePicture}
                    disabled={uploading}
                    className={`p-2 rounded-full ${uploading ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  >
                    <FaCheck size={12} />
                  </button>
                  <button
                    onClick={cancelUpload}
                    disabled={uploading}
                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              )}
              
              {uploadError && (
                <div className="text-red-500 text-sm mb-2">{uploadError}</div>
              )}
              
              <h3 className="text-xl font-bold mt-2">
                {employeeData?.personalInfo?.firstName && employeeData?.personalInfo?.lastName ? 
                  `${employeeData.personalInfo.firstName} ${employeeData.personalInfo.lastName}` : 
                  user.fullName}
              </h3>
              <p className="text-gray-600 dark:text-gray-500">
                {employeeData?.personalInfo?.email || user.email}
              </p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {user.role}
                </span>
                {employeeData?.employeeId && (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    ID: {employeeData.employeeId}
                  </span>
                )}
                {employeeData?.department?.name && (
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                    {employeeData.department.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
              {/* Tab Navigation */}
              <div className="mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                        } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                      >
                        <tab.icon className="mr-2 h-4 w-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
              
              {/* Tab Content */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h4 className="text-lg font-bold mb-2">Account Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-500">User ID</p>
                        <p className="font-medium">{user._id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-500">Created</p>
                        <p className="font-medium">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {user.role === "Sales Person" && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h4 className="text-lg font-bold mb-2">Sales Information</h4>
                      <p className="text-gray-600 dark:text-gray-500">You have access to view and manage leads assigned to you.</p>
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          💡 <strong>Tip:</strong> Use the <strong>"My Leave"</strong> and <strong>"My Attendance"</strong> tabs above to manage your leave applications and attendance.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {user.role === "Lead Person" && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h4 className="text-lg font-bold mb-2">Lead Management</h4>
                      <p className="text-gray-600 dark:text-gray-500">You have access to create leads and view leads assigned to you.</p>
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          💡 <strong>Tip:</strong> Use the <strong>"My Leave"</strong> and <strong>"My Attendance"</strong> tabs above to manage your leave applications and attendance.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {(user.role === "Admin" || user.role === "Manager") && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h4 className="text-lg font-bold mb-2">Administrative Access</h4>
                      <p className="text-gray-600 dark:text-gray-500">You have access to all leads and administrative functions.</p>
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          🔧 <strong>Admin/Manager:</strong> Approve leave applications in <strong>Employee Management → Leave Approvals</strong>. 
                          Use <strong>"My Leave"</strong> tab above for your own leave applications.
                        </p>
                      </div>
                    </div>
                  )}

                  {user.role === "HR" && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h4 className="text-lg font-bold mb-2">HR Access</h4>
                      <p className="text-gray-600 dark:text-gray-500">You have access to employee management and HR functions.</p>
                      <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                          👥 <strong>HR:</strong> Manage employee records and documents. Use <strong>"My Leave"</strong> tab above for your own leave applications.
                        </p>
                      </div>
                    </div>
                  )}

                  {user.role === "Employee" && (
                    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                      <h4 className="text-lg font-bold mb-2">Employee Access</h4>
                      <p className="text-gray-600 dark:text-gray-500">You have access to general employee functions and self-service features.</p>
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          💡 <strong>Tip:</strong> Use the <strong>"My Leave"</strong> and <strong>"My Attendance"</strong> tabs above to manage your leave applications and attendance.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Employee Information Section */}
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
                    <h4 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center">
                      <FaBriefcase className="mr-2 text-blue-600" />
                      Employee Information
                    </h4>
                    
                    {loadingEmployee ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                        <span className="text-gray-600 dark:text-gray-400">Setting up your employee profile...</span>
                      </div>
                    ) : employeeData ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Employee ID:</span>
                            <p className="text-gray-600 dark:text-gray-400">{employeeData.employeeId || 'Auto-generated'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Department:</span>
                            <p className="text-gray-600 dark:text-gray-400">{employeeData.department?.name || employeeData.professionalInfo?.department || 'Not assigned'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Position:</span>
                            <p className="text-gray-600 dark:text-gray-400">{employeeData.role?.name || employeeData.professionalInfo?.role || user.role}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Salary:</span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {employeeData.salary ? `₹${employeeData.salary.toLocaleString()}` : 'Not disclosed'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                            <p className="text-gray-600 dark:text-gray-400">{employeeData.status || 'Active'}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Joining Date:</span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {employeeData.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString() : 
                               employeeData.professionalInfo?.joiningDate ? new Date(employeeData.professionalInfo.joiningDate).toLocaleDateString() : 
                               'Recently joined'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Phone:</span>
                            <p className="text-gray-600 dark:text-gray-400">
                              {employeeData.phoneNumber || employeeData.personalInfo?.phoneNumber || 'Not provided'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Document Status */}
                        {employeeData.documents && (
                          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Document Status</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                              {Object.entries(employeeData.documents).map(([key, value]) => (
                                <div key={key} className="flex items-center">
                                  <span className={`w-2 h-2 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                  <span className="text-gray-700 dark:text-gray-300">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            ✅ Your employee profile is active. Additional details and documents can be updated by managers or administrators.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <div className="flex items-center justify-center mb-2">
                            <FaBriefcase className="text-yellow-600 dark:text-yellow-400 text-2xl mr-2" />
                            <h5 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">Setting Up Profile</h5>
                          </div>
                          <p className="text-yellow-700 dark:text-yellow-300 mb-3">
                            Your employee profile is being set up automatically based on your user account.
                          </p>
                          <button 
                            onClick={fetchEmployeeData}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                          >
                            Refresh Profile
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Attendance Tab */}
              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AttendanceWidget />
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Quick Stats
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 dark:text-gray-400">This Month</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {/* This will be filled by AttendanceManagement component */}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Always show AttendanceManagement, use user._id if no employeeData */}
                  <AttendanceManagement employeeId={employeeData?._id || user._id} userRole={user?.role} />
                </div>
              )}

              {/* Salary Tab */}
              {activeTab === 'salary' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SalarySlipWidget />
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Salary Information
                      </h3>
                      {employeeData && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Monthly Salary</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {employeeData.salary ? `₹${employeeData.salary.toLocaleString()}` : 'Not disclosed'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Department</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {employeeData.department?.name || 'Not assigned'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Role</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {employeeData.role?.name || user.role}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Employee Status</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              employeeData.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {employeeData.status || 'Active'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Payroll Information
                    </h3>
                    <div className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
                      <p>• Your salary is calculated based on your attendance and working days</p>
                      <p>• Monthly salary is divided by 30 working days to calculate daily rate</p>
                      <p>• Incentives and bonuses are added to your base salary</p>
                      <p>• Deductions include PF, ESI, and professional tax as per government regulations</p>
                      <p>• Download your salary slip once it's approved by HR/Admin</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Self Service Tab */}
              {activeTab === 'self-service' && employeeData && (
                <EmployeeSelfService employeeData={employeeData} onDataUpdated={fetchEmployeeData} />
              )}
              
              {/* Leave Management Tab */}
              {/* Always show LeaveManagement, use user._id if no employeeData */}
              {activeTab === 'leave' && (
                <LeaveManagement employeeId={employeeData?._id || user._id} userRole={user?.role} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 