import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import { authAPI } from '../services/api';
import api from '../services/api';
import { toast } from 'react-toastify';
import { 
  FaDownload, 
  FaEye, 
  FaUpload, 
  FaFileAlt, 
  FaImage, 
  FaUser, 
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
  FaClock
} from 'react-icons/fa';

const DocumentManagementPage = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [documentFilter, setDocumentFilter] = useState('');
  const [uploadingDocument, setUploadingDocument] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDocumentType, setUploadDocumentType] = useState('');

  // Document types with their display names and requirements
  const documentTypes = [
    { key: 'photograph', label: 'Photograph', required: true, icon: FaImage, accept: 'image/*' },
    { key: 'tenthMarksheet', label: '10th Marksheet', required: true, icon: FaFileAlt, accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'twelfthMarksheet', label: '12th Marksheet', required: true, icon: FaFileAlt, accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'bachelorDegree', label: 'Bachelor Degree', required: true, icon: FaFileAlt, accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'postgraduateDegree', label: 'Postgraduate Degree', required: false, icon: FaFileAlt, accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'aadharCard', label: 'Aadhar Card', required: true, icon: FaFileAlt, accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'panCard', label: 'PAN Card', required: true, icon: FaFileAlt, accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'pcc', label: 'Police Clearance Certificate', required: false, icon: FaFileAlt, accept: '.pdf,.jpg,.jpeg,.png' },
    { key: 'resume', label: 'Resume', required: true, icon: FaFileAlt, accept: '.pdf,.doc,.docx' },
    { key: 'offerLetter', label: 'Offer Letter', required: true, icon: FaFileAlt, accept: '.pdf,.doc,.docx' },
  ];

  // Fetch employees data
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [employees, searchTerm, departmentFilter, documentFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      if (user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'IT Manager') {
        // Fetch all employees for admin/manager/IT manager
        const response = await api.get('/employees');
        if (response.data && response.data.success) {
          setEmployees(response.data.data || []);
        }
      } else {
        // For regular employees, fetch their own employee data
        const employeeResponse = await api.get('/employees/user/' + user.id);
        if (employeeResponse.data && employeeResponse.data.success) {
          const employeeData = employeeResponse.data.data;
          setEmployees([employeeData]);
          setSelectedEmployee(employeeData);
        }
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employee data');
      toast.error('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        (emp.fullName && emp.fullName.toLowerCase().includes(term)) ||
        (emp.email && emp.email.toLowerCase().includes(term)) ||
        (emp.employeeId && emp.employeeId.toLowerCase().includes(term)) ||
        (emp.department && emp.department.toLowerCase().includes(term))
      );
    }

    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    // Document completeness filter
    if (documentFilter) {
      filtered = filtered.filter(emp => {
        const completionStatus = getDocumentCompletionStatus(emp);
        return completionStatus.status === documentFilter;
      });
    }

    setFilteredEmployees(filtered);
  };

  const getDocumentCompletionStatus = (employee) => {
    const documents = employee.documents || {};
    const requiredDocs = documentTypes.filter(doc => doc.required);
    const uploadedRequired = requiredDocs.filter(doc => documents[doc.key] && documents[doc.key].filename).length;
    const totalRequired = requiredDocs.length;
    const totalUploaded = documentTypes.filter(doc => documents[doc.key] && documents[doc.key].filename).length;
    
    const percentage = Math.round((uploadedRequired / totalRequired) * 100);
    
    let status = 'incomplete';
    if (uploadedRequired === totalRequired) {
      status = 'complete';
    } else if (uploadedRequired > 0) {
      status = 'partial';
    }

    return {
      status,
      percentage,
      uploadedRequired,
      totalRequired,
      totalUploaded,
      totalDocuments: documentTypes.length
    };
  };

  const getDocumentStatusIcon = (employee, docType) => {
    const documents = employee.documents || {};
    const info = documents[docType.key];
    const hasDocument = !!(info && (info.url || info.filename || info.path));
    
    if (hasDocument) return <FaCheck className="text-green-500" />;
    if (docType.required) return <FaTimes className="text-red-500" />;
    return <FaClock className="text-yellow-500" />;
  };

  const downloadDocument = async (employee, documentType) => {
    try {
      const documents = employee.documents || {};
      const docInfo = documents[documentType.key];
      if (!docInfo) return toast.error('Document not found');

      // Prefer Google Drive direct link if available
      if (docInfo.webContentLink) {
        window.open(docInfo.webContentLink, '_blank');
        return;
      }
      if (docInfo.url) {
        window.open(docInfo.url, '_blank');
        return;
      }

      // Fallback to backend streaming by filename
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const fileUrl = `${baseUrl}/api/employees/documents/${docInfo.filename}`;
      const token = localStorage.getItem('token');
      const response = await fetch(fileUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('Failed to download');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${employee.fullName || employee.email}_${documentType.label}_${docInfo.originalName || docInfo.filename}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
      toast.success(`Downloaded ${documentType.label}`);
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Failed to download document');
    }
  };

  const viewDocument = (employee, documentType) => {
    const documents = employee.documents || {};
    const docInfo = documents[documentType.key];
    if (!docInfo) return toast.error('Document not found');

    if (docInfo.url) {
      window.open(docInfo.url, '_blank');
      return;
    }
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const fileUrl = `${baseUrl}/api/employees/documents/${docInfo.filename}`;
    const token = localStorage.getItem('token');
    const newWindow = window.open();
    if (!newWindow) return;
    newWindow.document.write('<p>Loading document...</p>');
    fetch(fileUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        newWindow.location.href = blobUrl;
      })
      .catch(() => newWindow.close());
  };

  const handleUploadDocument = async () => {
    if (!uploadFile || !uploadDocumentType || !selectedEmployee) {
      toast.error('Please select a file and document type');
      return;
    }

    try {
      setUploadingDocument(uploadDocumentType);
      
      const formData = new FormData();
      formData.append(uploadDocumentType, uploadFile);
      
      // Add other required fields for the update
      formData.append('fullName', selectedEmployee.fullName);
      formData.append('email', selectedEmployee.email);
      formData.append('role', selectedEmployee.role);

      const response = await authAPI.updateUserWithDocuments(selectedEmployee._id, formData);
      
      if (response.data && response.data.success) {
        toast.success('Document uploaded successfully');
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadDocumentType('');
        fetchEmployees(); // Refresh data
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      toast.error('Failed to upload document');
    } finally {
      setUploadingDocument(null);
    }
  };

  const openUploadModal = (employee, docType) => {
    setSelectedEmployee(employee);
    setUploadDocumentType(docType);
    setShowUploadModal(true);
  };

  const getDepartments = () => {
    const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
    return departments;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg">Loading documents...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Document Management
          </h1>
          {(user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'IT Manager') && (
            <button
              onClick={() => openUploadModal(selectedEmployee, '')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaUpload className="mr-2" />
              Upload Document
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Filters - Only show for Admin/Manager */}
        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaFilter className="mr-2" />
              Filters
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search Employees
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name, email, employee ID..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Departments</option>
                  {getDepartments().map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Document Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Document Status
                </label>
                <select
                  value={documentFilter}
                  onChange={(e) => setDocumentFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Statuses</option>
                  <option value="complete">Complete</option>
                  <option value="partial">Partial</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Employee List - Only show for Admin/Manager */}
        {(user?.role === 'Admin' || user?.role === 'Manager') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FaUser className="mr-2" />
                    Employees ({filteredEmployees.length})
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {filteredEmployees.map(employee => {
                    const completionStatus = getDocumentCompletionStatus(employee);
                    return (
                      <div
                        key={employee._id}
                        onClick={() => setSelectedEmployee(employee)}
                        className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 ${
                          selectedEmployee?._id === employee._id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {employee.fullName || employee.email}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {employee.department} • {employee.role}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              ID: {employee.employeeId || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              completionStatus.status === 'complete' ? 'text-green-600' :
                              completionStatus.status === 'partial' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {completionStatus.percentage}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {completionStatus.uploadedRequired}/{completionStatus.totalRequired} required
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedEmployee ? (
                <DocumentDetails 
                  employee={selectedEmployee}
                  documentTypes={documentTypes}
                  getDocumentStatusIcon={getDocumentStatusIcon}
                  downloadDocument={downloadDocument}
                  viewDocument={viewDocument}
                  openUploadModal={openUploadModal}
                  userRole={user?.role}
                />
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-8 text-center">
                  <FaFileAlt className="mx-auto text-gray-400 text-6xl mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    Select an Employee
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choose an employee from the list to view their documents
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Employee's own documents - Show for non-admin/manager/IT manager users (view-only) */}
        {!['Admin', 'Manager', 'IT Manager'].includes(user?.role) && selectedEmployee && (
          <DocumentDetails 
            employee={selectedEmployee}
            documentTypes={documentTypes}
            getDocumentStatusIcon={getDocumentStatusIcon}
            downloadDocument={downloadDocument}
            viewDocument={viewDocument}
            openUploadModal={openUploadModal}
            userRole={user?.role}
            isOwnDocuments={true}
          />
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-md w-full mx-4">
              <div className="flex justify-between items-center bg-blue-600 text-white px-6 py-4 rounded-t-lg">
                <h3 className="text-lg font-medium">Upload Document</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadDocumentType('');
                  }}
                  className="text-white hover:text-gray-200"
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Document Type
                  </label>
                  <select
                    value={uploadDocumentType}
                    onChange={(e) => setUploadDocumentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Select document type</option>
                    {documentTypes.map(docType => (
                      <option key={docType.key} value={docType.key}>
                        {docType.label} {docType.required ? '(Required)' : '(Optional)'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                    accept={uploadDocumentType ? documentTypes.find(dt => dt.key === uploadDocumentType)?.accept : '*'}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  {uploadDocumentType && (
                    <p className="text-xs text-gray-500 mt-1">
                      Accepted formats: {documentTypes.find(dt => dt.key === uploadDocumentType)?.accept}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setUploadDocumentType('');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadDocument}
                    disabled={!uploadFile || !uploadDocumentType || uploadingDocument}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingDocument ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Document Details Component
const DocumentDetails = ({ 
  employee, 
  documentTypes, 
  getDocumentStatusIcon, 
  downloadDocument, 
  viewDocument, 
  openUploadModal, 
  userRole,
  isOwnDocuments = false 
}) => {
  const documents = employee.documents || {};
  
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isOwnDocuments ? 'My Documents' : `${employee.fullName || employee.email}'s Documents`}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {employee.department} • {employee.role} • ID: {employee.employeeId || 'N/A'}
        </p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4">
          {documentTypes.map(docType => {
            const docInfo = documents[docType.key];
            const hasDocument = docInfo && docInfo.filename;
            const IconComponent = docType.icon;
            
            return (
              <div
                key={docType.key}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <div className="flex items-center">
                  <IconComponent className="text-gray-400 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {docType.label}
                      {docType.required && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {hasDocument ? `Uploaded: ${docInfo.originalName || docInfo.filename}` : 'Not uploaded'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getDocumentStatusIcon(employee, docType)}
                  
                  {hasDocument && (
                    <>
                      <button
                        onClick={() => viewDocument(employee, docType)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        title="View Document"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => downloadDocument(employee, docType)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                        title="Download Document"
                      >
                        <FaDownload />
                      </button>
                    </>
                  )}
                  
                  {/* Allow upload for admin/manager/IT manager, employees can only view (not upload even their own) */}
                  {(userRole === 'Admin' || userRole === 'Manager' || userRole === 'IT Manager') && (
                    <button
                      onClick={() => openUploadModal(employee, docType.key)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      title={hasDocument ? 'Replace Document' : 'Upload Document'}
                    >
                      <FaUpload />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DocumentManagementPage; 