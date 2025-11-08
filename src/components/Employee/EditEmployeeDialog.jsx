import React, { useState, useEffect } from 'react';
import employeeAPI from '../../services/employeeAPI';
import { FaUser, FaBriefcase, FaGraduationCap, FaFileUpload, FaSpinner, FaInfoCircle } from 'react-icons/fa';

const EditEmployeeDialog = ({ employeeId, isOpen, onOpenChange, onEmployeeUpdated, departments, roles }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('documents'); // Default to documents tab
  
  // Debug logging
  console.log('EditEmployeeDialog received employeeId:', employeeId);
  console.log('EditEmployeeDialog isOpen:', isOpen);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    linkedInUrl: '',
    currentAddress: '',
    permanentAddress: '',
    dateOfBirth: '',
    joiningDate: '',
    salary: '',
    status: 'ACTIVE',
    department: '',
    role: '',
    collegeName: '',
    internshipDuration: ''
  });
  const [files, setFiles] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchEmployeeDetails();
    }
  }, [isOpen, employeeId]);

  const fetchEmployeeDetails = async () => {
    try {
      console.log('fetchEmployeeDetails called with employeeId:', employeeId);
      setLoading(true);
      const response = await employeeAPI.getById(employeeId);
      console.log('fetchEmployeeDetails response:', response);
      if (response.data.success) {
        const emp = response.data.data;
        console.log('fetchEmployeeDetails employee data:', emp);
        setEmployee(emp);
        setFormData({
          fullName: emp.fullName || '',
          email: emp.email || '',
          phoneNumber: emp.phoneNumber || '',
          whatsappNumber: emp.whatsappNumber || '',
          linkedInUrl: emp.linkedInUrl || '',
          currentAddress: emp.currentAddress || '',
          permanentAddress: emp.permanentAddress || '',
          dateOfBirth: emp.dateOfBirth ? new Date(emp.dateOfBirth).toISOString().split('T')[0] : '',
          joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
          salary: emp.salary || '',
          status: emp.status || 'ACTIVE',
          department: emp.department?._id || emp.department || '',
          role: emp.role?._id || emp.role || '',
          collegeName: emp.collegeName || '',
          internshipDuration: emp.internshipDuration || ''
        });
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
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

  const validateForm = () => {
    const newErrors = {};
    
    // Only validate required fields if they're being changed
    if (formData.fullName.trim() && !formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.salary && isNaN(formData.salary)) {
      newErrors.salary = 'Salary must be a number';
    }

    if (formData.internshipDuration && isNaN(formData.internshipDuration)) {
      newErrors.internshipDuration = 'Internship duration must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('EditEmployeeDialog handleSubmit - employeeId:', employeeId);
    console.log('EditEmployeeDialog handleSubmit - formData:', formData);
    console.log('EditEmployeeDialog handleSubmit - files:', files);
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      const formDataToSend = new FormData();
      
      // Only send fields that have been changed or have files
      const changedFields = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] && formData[key] !== '') {
          changedFields[key] = formData[key];
        }
      });
      
      // Add changed employee data
      if (Object.keys(changedFields).length > 0) {
        formDataToSend.append('employee', JSON.stringify(changedFields));
      }
      
      // Add files
      Object.keys(files).forEach(key => {
        if (files[key]) {
          formDataToSend.append(key, files[key]);
        }
      });

      // If no changes, show message
      if (Object.keys(changedFields).length === 0 && Object.keys(files).length === 0) {
        alert('No changes detected. Please update some information or upload documents.');
        return;
      }

      const response = await employeeAPI.update(employeeId, formDataToSend);
      
      if (response.data.success) {
        onEmployeeUpdated();
        onOpenChange(false);
        alert('Employee updated successfully!');
      } else {
        alert('Failed to update employee. Please try again.');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'documents', label: 'Documents', icon: FaFileUpload },
    { id: 'personal', label: 'Personal Info', icon: FaUser },
    { id: 'professional', label: 'Professional Info', icon: FaBriefcase },
    { id: 'education', label: 'Education', icon: FaGraduationCap }
  ];

  const documentFields = [
    { key: 'photograph', label: 'Photograph', accept: 'image/*' },
    { key: 'resume', label: 'Resume', accept: '.pdf,.doc,.docx' },
    { key: 'tenthMarksheet', label: '10th Marksheet', accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'twelfthMarksheet', label: '12th Marksheet', accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'bachelorDegree', label: 'Bachelor Degree', accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'postgraduateDegree', label: 'Postgraduate Degree', accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'aadharCard', label: 'Aadhar Card', accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'panCard', label: 'PAN Card', accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'pcc', label: 'PCC', accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'offerLetter', label: 'Offer Letter', accept: '.pdf,.doc,.docx' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Employee</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Update employee information and documents. Only changed fields will be updated.
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <FaSpinner className="animate-spin text-2xl text-blue-600" />
              <span className="ml-2">Loading employee details...</span>
            </div>
          ) : (
            <>
              {/* Info Banner */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <FaInfoCircle className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Update Employee Information
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      You can update any employee information or upload new documents. Only selected fields will be updated.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <tab.icon className="mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Documents Tab - Default and Most Important */}
                {activeTab === 'documents' && (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        Upload Employee Documents
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Select the documents you want to upload or update. Only selected files will be processed.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {documentFields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {field.label}
                          </label>
                          <input
                            type="file"
                            name={field.key}
                            accept={field.accept}
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                          />
                          {files[field.key] && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              ✓ {files[field.key].name} selected
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update personal information. Leave fields empty if you don't want to change them.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Leave empty to keep current"
                          className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.fullName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Leave empty to keep current"
                          className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="Leave empty to keep current"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          name="whatsappNumber"
                          value={formData.whatsappNumber}
                          onChange={handleInputChange}
                          placeholder="Leave empty to keep current"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          LinkedIn URL
                        </label>
                        <input
                          type="url"
                          name="linkedInUrl"
                          value={formData.linkedInUrl}
                          onChange={handleInputChange}
                          placeholder="Leave empty to keep current"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Address
                      </label>
                      <textarea
                        name="currentAddress"
                        value={formData.currentAddress}
                        onChange={handleInputChange}
                        placeholder="Leave empty to keep current"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Permanent Address
                      </label>
                      <textarea
                        name="permanentAddress"
                        value={formData.permanentAddress}
                        onChange={handleInputChange}
                        placeholder="Leave empty to keep current"
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Professional Information Tab */}
                {activeTab === 'professional' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update professional information. Leave fields empty if you don't want to change them.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Department
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Keep Current Department</option>
                          {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Role
                        </label>
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Keep Current Role</option>
                          {roles.map(role => (
                            <option key={role._id} value={role._id}>{role.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Joining Date
                        </label>
                        <input
                          type="date"
                          name="joiningDate"
                          value={formData.joiningDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Salary
                        </label>
                        <input
                          type="number"
                          name="salary"
                          value={formData.salary}
                          onChange={handleInputChange}
                          placeholder="Leave empty to keep current"
                          className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.salary ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.salary && <p className="text-red-500 text-xs mt-1">{errors.salary}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="TERMINATED">Terminated</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update education information. Leave fields empty if you don't want to change them.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          College Name
                        </label>
                        <input
                          type="text"
                          name="collegeName"
                          value={formData.collegeName}
                          onChange={handleInputChange}
                          placeholder="Leave empty to keep current"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Internship Duration (months)
                        </label>
                        <input
                          type="number"
                          name="internshipDuration"
                          value={formData.internshipDuration}
                          onChange={handleInputChange}
                          placeholder="Leave empty to keep current"
                          className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.internshipDuration ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.internshipDuration && <p className="text-red-500 text-xs mt-1">{errors.internshipDuration}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin inline mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Update Employee'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeDialog; 