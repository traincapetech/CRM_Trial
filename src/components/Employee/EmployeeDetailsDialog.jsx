import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaLinkedin, FaWhatsapp, FaBuilding, FaUserTie, FaFileAlt, FaDownload, FaEye, FaUpload } from 'react-icons/fa';
import employeeAPI from '../../services/employeeAPI';
import { toast } from 'react-toastify';

const EmployeeDetailsDialog = ({ employeeId, isOpen, onOpenChange }) => {
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchEmployeeDetails();
    }
  }, [isOpen, employeeId]);

  const fetchEmployeeDetails = async () => {
    try {
      setIsLoading(true);
      const response = await employeeAPI.getById(employeeId);
      if (response.data.success) {
        setEmployee(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Document types with their display names
  const documentTypes = {
    photograph: 'Photograph',
    tenthMarksheet: '10th Marksheet',
    twelfthMarksheet: '12th Marksheet',
    bachelorDegree: 'Bachelor Degree',
    postgraduateDegree: 'Postgraduate Degree',
    aadharCard: 'Aadhar Card',
    panCard: 'PAN Card',
    pcc: 'Police Clearance Certificate',
    resume: 'Resume',
    offerLetter: 'Offer Letter'
  };

  const downloadDocument = async (documentType) => {
    try {
      const documents = employee.documents || {};
      const docInfo = documents[documentType];
      
      if (!docInfo || (!docInfo.filename && !docInfo.path)) {
        toast.error('Document not found');
        return;
      }

      // Get the document path from either filename or path
      const documentPath = docInfo.path ? docInfo.path.split('/').pop() : docInfo.filename;

      // Use the API endpoint for downloading documents
      const isDevelopment = import.meta.env.DEV && import.meta.env.MODE !== 'production';
      const baseUrl = isDevelopment 
        ? 'http://localhost:8080/api' 
        : (import.meta.env.VITE_API_URL || 'https://crm-backend-o36v.onrender.com/api');
      const fileUrl = `${baseUrl}/employees/documents/${documentPath}`;
      const token = localStorage.getItem('token');
      
      // Fetch the file with authentication
      const response = await fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to download document:', errorText);
        throw new Error(`Failed to download document: ${response.status}`);
      }
      
      // Get the file blob
      const blob = await response.blob();
      
      // Create download link
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${employee.fullName || employee.email}_${documentTypes[documentType]}_${docInfo.filename}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(link.href);
      
      toast.success(`Downloaded ${documentTypes[documentType]}`);
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Failed to download document');
    }
  };

  const viewDocument = (documentType) => {
    try {
      const documents = employee.documents || {};
      const docInfo = documents[documentType];
      
      if (!docInfo || (!docInfo.filename && !docInfo.path)) {
        toast.error('Document not found');
        return;
      }

      // Get the document path from either filename or path
      const documentPath = docInfo.path ? docInfo.path.split('/').pop() : docInfo.filename;

      // Use the API endpoint for viewing documents
      const isDevelopment = import.meta.env.DEV && import.meta.env.MODE !== 'production';
      const baseUrl = isDevelopment 
        ? 'http://localhost:8080/api' 
        : (import.meta.env.VITE_API_URL || 'https://crm-backend-o36v.onrender.com/api');
      const fileUrl = `${baseUrl}/employees/documents/${documentPath}`;
      const token = localStorage.getItem('token');
      
      // Create a new window/tab with the authenticated URL
      const newWindow = window.open();
      
      // Fetch the file with authentication
      fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (!response.ok) {
          return response.text().then(errorText => {
            console.error('Failed to load document:', errorText);
            throw new Error(`Failed to load document: ${response.status}`);
          });
        }
        return response.blob();
      })
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        newWindow.location.href = blobUrl;
      })
      .catch(err => {
        console.error('Error viewing document:', err);
        toast.error('Failed to view document');
        newWindow.close();
      });
    } catch (err) {
      console.error('Error viewing document:', err);
      toast.error('Failed to view document');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Details</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : employee ? (
            <div className="space-y-6">
              {/* Employee Header */}
              <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6">
                <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  {employee.photograph ? (
                    <img
                      src={`/api/uploads/${employee.photograph}`}
                      alt={employee.fullName}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-4xl">
                      {employee.fullName ? employee.fullName[0] : 'E'}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {employee?.fullName || 'N/A'}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {employee?.role ? (typeof employee.role === 'object' ? employee.role?.name : employee.role) : 'N/A'}
                </p>
                <div className="flex justify-center items-center space-x-4 mt-3">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    employee?.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {employee?.status || 'N/A'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Employee ID: {employee?.employeeId || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Employee Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Personal Information */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaUser className="mr-2 text-blue-600" />
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaEnvelope className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                        <p className="text-gray-900 dark:text-white">{employee?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaPhone className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="text-gray-900 dark:text-white">{employee?.phoneNumber || 'N/A'}</p>
                      </div>
                    </div>
                    {employee?.whatsappNumber && (
                      <div className="flex items-center">
                        <FaWhatsapp className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</p>
                          <p className="text-gray-900 dark:text-white">{employee.whatsappNumber}</p>
                        </div>
                      </div>
                    )}
                    {employee?.linkedInUrl && (
                      <div className="flex items-center">
                        <FaLinkedin className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">LinkedIn</p>
                          <a href={employee.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Profile
                          </a>
                        </div>
                      </div>
                    )}
                    {employee?.dateOfBirth && (
                      <div className="flex items-center">
                        <FaCalendarAlt className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                          <p className="text-gray-900 dark:text-white">{new Date(employee.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaUserTie className="mr-2 text-blue-600" />
                    Professional Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaBuilding className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Department</p>
                        <p className="text-gray-900 dark:text-white">
                          {employee?.department ? (typeof employee.department === 'object' ? employee.department?.name : employee.department) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Joining Date</p>
                        <p className="text-gray-900 dark:text-white">
                          {employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {employee?.salary && (
                      <div className="flex items-center">
                        <FaDollarSign className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Salary</p>
                          <p className="text-gray-900 dark:text-white font-semibold">
                            ₹{employee.salary.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {employee?.collegeName && (
                      <div className="flex items-center">
                        <FaFileAlt className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">College</p>
                          <p className="text-gray-900 dark:text-white">{employee.collegeName}</p>
                        </div>
                      </div>
                    )}
                    {employee?.internshipDuration && (
                      <div className="flex items-center">
                        <FaCalendarAlt className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Internship Duration</p>
                          <p className="text-gray-900 dark:text-white">{employee.internshipDuration} months</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Information */}
              {(employee?.currentAddress || employee?.permanentAddress) && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-blue-600" />
                    Address Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee?.currentAddress && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Address</p>
                        <p className="text-gray-900 dark:text-white">{employee.currentAddress}</p>
                      </div>
                    )}
                    {employee?.permanentAddress && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Permanent Address</p>
                        <p className="text-gray-900 dark:text-white">{employee.permanentAddress}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document Status */}
              {employee?.documents && Object.keys(employee.documents).length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FaFileAlt className="mr-2 text-blue-600" />
                    Document Status
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(employee.documents).map(([key, value]) => {
                      const hasDocument = value && value.filename;
                      const displayName = documentTypes[key] || key.replace(/([A-Z])/g, ' $1').trim();
                      
                      return (
                        <div key={key} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-3 ${hasDocument ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {displayName}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {hasDocument ? `Uploaded: ${value.originalName || value.filename}` : 'Not uploaded'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {hasDocument && (
                              <>
                                <button
                                  onClick={() => viewDocument(key)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                  title="View Document"
                                >
                                  <FaEye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => downloadDocument(key)}
                                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                                  title="Download Document"
                                >
                                  <FaDownload className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Employee not found</p>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onOpenChange(false)}
              className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsDialog; 