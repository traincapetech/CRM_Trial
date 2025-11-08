import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import employeeAPI from '../../services/employeeAPI';
import { toast } from 'react-toastify';

const AddEmployeeDialog = ({ open, onOpenChange, onEmployeeAdded, departments, roles }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    linkedInUrl: '',
    currentAddress: '',
    permanentAddress: '',
    collegeName: '',
    role: '',
    department: '',
    joiningDate: '',
    internshipDuration: '',
    salary: '',
    username: '',
    password: '',
    employmentType: 'PERMANENT',
    techStack: [],
    internshipStartDate: '',
    internshipEndDate: '',
  });

  const [files, setFiles] = useState({
    photograph: null,
    tenthMarksheet: null,
    twelfthMarksheet: null,
    bachelorDegree: null,
    postgraduateDegree: null,
    aadharCard: null,
    panCard: null,
    pcc: null,
    resume: null,
    offerLetter: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      const fileSizeKB = file.size / 1024;
      const fileSizeMB = fileSizeKB / 1024;
      
      // More reasonable file size limits: 10KB to 5MB
      if (fileSizeKB < 10 || fileSizeMB > 5) {
        toast.error(`${name} file size must be between 10KB and 5MB`);
        e.target.value = ''; // Clear the file input
        return;
      }
      
      setFiles(prev => ({
        ...prev,
        [name]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = new FormData();

      // Create employee JSON payload
      const dept = departments.find(d => d._id === formData.department);
      const isITDepartment = dept?.name === 'IT';

      const employeeJsonPayload = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        whatsappNumber: formData.whatsappNumber,
        linkedInUrl: formData.linkedInUrl,
        currentAddress: formData.currentAddress,
        permanentAddress: formData.permanentAddress,
        collegeName: formData.collegeName,
        role: formData.role,
        department: formData.department,
        joiningDate: new Date(formData.joiningDate).toISOString(),
        internshipDuration: formData.internshipDuration ? parseInt(formData.internshipDuration) : undefined,
        salary: parseFloat(formData.salary),
        status: 'ACTIVE',
        hrId: user?.id || '',
        // Add IT-specific fields if IT department
        ...(isITDepartment && {
          employmentType: formData.employmentType,
          techStack: formData.techStack,
          ...(formData.employmentType === 'INTERN' && {
            internshipStartDate: formData.internshipStartDate ? new Date(formData.internshipStartDate).toISOString() : undefined,
            internshipEndDate: formData.internshipEndDate ? new Date(formData.internshipEndDate).toISOString() : undefined,
          })
        })
      };

      console.log('Sending employee data:', {
        formData,
        employeeJsonPayload,
        isITDepartment,
        department: dept,
        files: Object.keys(files).filter(key => files[key])
      });

      // Convert empty strings to undefined
      Object.keys(employeeJsonPayload).forEach(key => {
        if (employeeJsonPayload[key] === '') {
          employeeJsonPayload[key] = undefined;
        }
      });

      form.append('employee', JSON.stringify(employeeJsonPayload));

      if (formData.username) form.append('username', formData.username);
      if (formData.password) form.append('password', formData.password);

      // Append files
      Object.keys(files).forEach(fieldName => {
        if (files[fieldName]) {
          form.append(fieldName, files[fieldName]);
        }
      });

      // Debug: Log form data before sending
      console.log('Form data being sent:', {
        employee: employeeJsonPayload,
        files: Object.keys(files).filter(key => files[key]),
        formDataEntries: Array.from(form.entries()).map(([key, value]) => ({
          key,
          type: typeof value,
          isFile: value instanceof File,
          size: value instanceof File ? value.size : null
        }))
      });

      const response = await employeeAPI.create(form);

      if (response.data.success) {
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          whatsappNumber: '',
          linkedInUrl: '',
          currentAddress: '',
          permanentAddress: '',
          collegeName: '',
          role: '',
          department: '',
          joiningDate: '',
          internshipDuration: '',
          salary: '',
          username: '',
          password: '',
          employmentType: 'PERMANENT',
          techStack: [],
          internshipStartDate: '',
          internshipEndDate: '',
        });
        setFiles({
          photograph: null,
          tenthMarksheet: null,
          twelfthMarksheet: null,
          bachelorDegree: null,
          postgraduateDegree: null,
          aadharCard: null,
          panCard: null,
          pcc: null,
          resume: null,
          offerLetter: null,
        });
        onEmployeeAdded();
        onOpenChange(false);
      } else {
        alert('Failed to add employee. Please try again.');
      }
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('An error occurred while adding the employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileInput = (name, label) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="file"
          name={name}
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <span className="text-xs text-gray-500">(10KB-5MB)</span>
      </div>
    </div>
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Employee</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department *
                </label>
                                  <select
                    name="department"
                    value={formData.department}
                    onChange={(e) => {
                      const dept = departments.find(d => d._id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        department: e.target.value,
                        // Reset role when department changes
                        role: ''
                      }));
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role *
                </label>
                                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Role</option>
                    {roles
                      .filter(role => {
                        const dept = departments.find(d => d._id === formData.department);
                        if (!dept) return true;
                        if (dept.name === 'IT') {
                          return ['IT Staff', 'IT Manager'].includes(role.name);
                        }
                        return !['IT Staff', 'IT Manager'].includes(role.name);
                      })
                      .map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))
                    }
                  </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Joining Date *
                </label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Salary *
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* IT Department Specific Fields */}
            {departments.find(d => d._id === formData.department)?.name === 'IT' && (
              <div className="border-t pt-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">IT Department Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Employment Type *
                    </label>
                    <select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="PERMANENT">Permanent</option>
                      <option value="INTERN">Intern</option>
                      <option value="CONTRACT">Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tech Stack
                    </label>
                    <input
                      type="text"
                      name="techStack"
                      value={formData.techStack.join(', ')}
                      onChange={(e) => {
                        const techs = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                        setFormData(prev => ({
                          ...prev,
                          techStack: techs
                        }));
                      }}
                      placeholder="e.g., React, Node.js, Python"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {formData.employmentType === 'INTERN' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Internship Start Date *
                        </label>
                        <input
                          type="date"
                          name="internshipStartDate"
                          value={formData.internshipStartDate}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Internship End Date *
                        </label>
                        <input
                          type="date"
                          name="internshipEndDate"
                          value={formData.internshipEndDate}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Address
                </label>
                <textarea
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  College Name
                </label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* User Account Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Account (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Documents (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderFileInput("photograph", "Photograph")}
                {renderFileInput("tenthMarksheet", "10th Marksheet")}
                {renderFileInput("twelfthMarksheet", "12th Marksheet")}
                {renderFileInput("bachelorDegree", "Bachelor's Degree")}
                {renderFileInput("postgraduateDegree", "Postgraduate Degree")}
                {renderFileInput("aadharCard", "Aadhar Card")}
                {renderFileInput("panCard", "PAN Card")}
                {renderFileInput("pcc", "Police Clearance Certificate")}
                {renderFileInput("resume", "Resume")}
                {renderFileInput("offerLetter", "Offer Letter")}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                )}
                <span>{isSubmitting ? 'Adding...' : 'Add Employee'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeDialog; 