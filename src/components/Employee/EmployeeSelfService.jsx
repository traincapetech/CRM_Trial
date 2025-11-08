import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import employeeAPI from '../../services/employeeAPI';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLinkedin, FaFileUpload, FaEdit, FaSave, FaTimes, FaSpinner, FaDollarSign } from 'react-icons/fa';

const EmployeeSelfService = ({ employeeData, onDataUpdated }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    whatsappNumber: '',
    linkedInUrl: '',
    currentAddress: '',
    permanentAddress: ''
  });
  const [files, setFiles] = useState({});
  const [uploadingFiles, setUploadingFiles] = useState({});

  useEffect(() => {
    if (employeeData) {
      setFormData({
        phoneNumber: employeeData.phoneNumber || '',
        whatsappNumber: employeeData.whatsappNumber || '',
        linkedInUrl: employeeData.linkedInUrl || '',
        currentAddress: employeeData.currentAddress || '',
        permanentAddress: employeeData.permanentAddress || ''
      });
    }
  }, [employeeData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: fileList[0]
      }));
    }
  };

  const handleSavePersonalInfo = async () => {
    if (!employeeData) return;

    try {
      setLoading(true);
      const response = await employeeAPI.update(employeeData._id, {
        employee: JSON.stringify(formData)
      });

      if (response.data.success) {
        setEditing(false);
        onDataUpdated?.();
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      alert('Failed to update personal information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (fieldName) => {
    if (!files[fieldName] || !employeeData) return;

    try {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));
      
      const formDataToSend = new FormData();
      formDataToSend.append(fieldName, files[fieldName]);

      const response = await employeeAPI.update(employeeData._id, formDataToSend);

      if (response.data.success) {
        setFiles(prev => ({ ...prev, [fieldName]: null }));
        onDataUpdated?.();
        // Reset file input
        const fileInput = document.querySelector(`input[name="${fieldName}"]`);
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const documentFields = [
    { key: 'photograph', label: 'Photograph', accept: 'image/*', icon: '📷' },
    { key: 'resume', label: 'Resume', accept: '.pdf,.doc,.docx', icon: '📄' },
    { key: 'tenthMarksheet', label: '10th Marksheet', accept: '.pdf,.jpg,.jpeg,.png', icon: '📜' },
    { key: 'twelfthMarksheet', label: '12th Marksheet', accept: '.pdf,.jpg,.jpeg,.png', icon: '📜' },
    { key: 'bachelorDegree', label: 'Bachelor Degree', accept: '.pdf,.jpg,.jpeg,.png', icon: '🎓' },
    { key: 'postgraduateDegree', label: 'Postgraduate Degree', accept: '.pdf,.jpg,.jpeg,.png', icon: '🎓' },
    { key: 'aadharCard', label: 'Aadhar Card', accept: '.pdf,.jpg,.jpeg,.png', icon: '🆔' },
    { key: 'panCard', label: 'PAN Card', accept: '.pdf,.jpg,.jpeg,.png', icon: '🆔' },
    { key: 'pcc', label: 'PCC', accept: '.pdf,.jpg,.jpeg,.png', icon: '🛡️' },
    { key: 'offerLetter', label: 'Offer Letter', accept: '.pdf,.doc,.docx', icon: '📨' }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Personal Information Section */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FaUser className="mr-2 text-blue-600" />
            Personal Information
          </h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <FaEdit className="mr-1" />
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSavePersonalInfo}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? <FaSpinner className="animate-spin mr-1" /> : <FaSave className="mr-1" />}
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                <FaTimes className="mr-1" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FaPhone className="inline mr-2" />
              Phone Number
            </label>
            {editing ? (
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            ) : (
              <p className="text-gray-900 dark:text-white py-2">{formData.phoneNumber || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FaPhone className="inline mr-2" />
              WhatsApp Number
            </label>
            {editing ? (
              <input
                type="tel"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter WhatsApp number"
              />
            ) : (
              <p className="text-gray-900 dark:text-white py-2">{formData.whatsappNumber || 'Not provided'}</p>
            )}
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FaLinkedin className="inline mr-2" />
              LinkedIn URL
            </label>
            {editing ? (
              <input
                type="url"
                name="linkedInUrl"
                value={formData.linkedInUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter LinkedIn profile URL"
              />
            ) : (
              <p className="text-gray-900 dark:text-white py-2">
                {formData.linkedInUrl ? (
                  <a href={formData.linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                    {formData.linkedInUrl}
                  </a>
                ) : (
                  'Not provided'
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FaMapMarkerAlt className="inline mr-2" />
              Current Address
            </label>
            {editing ? (
              <textarea
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter current address"
              />
            ) : (
              <p className="text-gray-900 dark:text-white py-2">{formData.currentAddress || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <FaMapMarkerAlt className="inline mr-2" />
              Permanent Address
            </label>
            {editing ? (
              <textarea
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter permanent address"
              />
            ) : (
              <p className="text-gray-900 dark:text-white py-2">{formData.permanentAddress || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-6">
          <FaFileUpload className="mr-2 text-blue-600" />
          Document Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentFields.map((field) => (
            <div key={field.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {field.icon} {field.label}
                </label>
                {employeeData && employeeData[field.key] && (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                    ✓ Uploaded
                  </span>
                )}
              </div>

              {employeeData && employeeData[field.key] && (
                <p className="text-xs text-gray-500 mb-2 truncate">
                  Current: {employeeData[field.key].split('/').pop()}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="file"
                  name={field.key}
                  accept={field.accept}
                  onChange={handleFileChange}
                  className="flex-1 text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
                />
                {files[field.key] && (
                  <button
                    onClick={() => handleFileUpload(field.key)}
                    disabled={uploadingFiles[field.key]}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
                  >
                    {uploadingFiles[field.key] ? (
                      <FaSpinner className="animate-spin mr-1" />
                    ) : (
                      <FaFileUpload className="mr-1" />
                    )}
                    Upload
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Read-only Information */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-6">
          <FaUser className="mr-2 text-blue-600" />
          Professional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600 dark:text-gray-400">Email</p>
            <p className="font-medium text-gray-900 dark:text-white flex items-center">
              <FaEnvelope className="mr-2 text-gray-500" />
              <span className="truncate">{employeeData?.email || 'N/A'}</span>
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Employee ID</p>
            <p className="font-medium text-gray-900 dark:text-white">{employeeData?.employeeId || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Department</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {employeeData?.department?.name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Role</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {employeeData?.role?.name || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Salary</p>
            <p className="font-medium text-gray-900 dark:text-white flex items-center">
              <FaDollarSign className="mr-1 text-gray-500" />
              {employeeData?.salary ? `₹${employeeData.salary.toLocaleString()}` : 'Not disclosed'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Status</p>
            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
              employeeData?.status === 'ACTIVE' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {employeeData?.status || 'N/A'}
            </span>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-400">Joining Date</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {employeeData?.joiningDate ? new Date(employeeData.joiningDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelfService; 