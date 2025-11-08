

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { authAPI } from "../services/api";
import employeeAPI from "../services/employeeAPI";
import { useAuth } from "../context/AuthContext";
import EditEmployeeDialog from "../components/Employee/EditEmployeeDialog";
import { formatDate as formatDateUtil } from "../utils/helpers";

const AdminUsersPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmployeeEditModal, setShowEmployeeEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editEmployeeId, setEditEmployeeId] = useState(null);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [accountPassword, setAccountPassword] = useState('');
  const [generateRandomPassword, setGenerateRandomPassword] = useState(true);
  const [editDocuments, setEditDocuments] = useState({
    photograph: null,
    tenthMarksheet: null,
    twelfthMarksheet: null,
    bachelorDegree: null,
    postgraduateDegree: null,
    aadharCard: null,
    panCard: null,
    pcc: null,
    resume: null,
    offerLetter: null
  });
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Sales Person",
    // Employee-specific fields
    phoneNumber: "",
    whatsappNumber: "",
    linkedInUrl: "",
    currentAddress: "",
    permanentAddress: "",
    dateOfBirth: "",
    joiningDate: "",
    salary: "",
    department: "",
    employeeRole: "",
    status: "ACTIVE",
    collegeName: "",
    internshipDuration: ""
  });

  const [documents, setDocuments] = useState({
    photograph: null,
    tenthMarksheet: null,
    twelfthMarksheet: null,
    bachelorDegree: null,
    postgraduateDegree: null,
    aadharCard: null,
    panCard: null,
    pcc: null,
    resume: null,
    offerLetter: null
  });

  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchEmployees();
    fetchDepartmentsAndRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUsers();
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        setError("Failed to load users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  const fetchDepartmentsAndRoles = async () => {
    try {
      const [departmentsRes, rolesRes] = await Promise.all([
        employeeAPI.getDepartments(),
        employeeAPI.getRoles()
      ]);
      
      if (departmentsRes.data.success) {
        setDepartments(departmentsRes.data.data);
      }
      if (rolesRes.data.success) {
        setRoles(rolesRes.data.data);
      }
    } catch (err) {
      console.error("Error fetching departments and roles:", err);
    }
  };

  const handleInputChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add main user data directly (not nested in employee object)
      formData.append('fullName', newUser.fullName);
      formData.append('email', newUser.email);
      formData.append('password', newUser.password);
      formData.append('role', newUser.role);
      
      // Add employee-specific fields
      formData.append('phoneNumber', newUser.phoneNumber || '');
      formData.append('whatsappNumber', newUser.whatsappNumber || '');
      formData.append('linkedInUrl', newUser.linkedInUrl || '');
      formData.append('currentAddress', newUser.currentAddress || '');
      formData.append('permanentAddress', newUser.permanentAddress || '');
      formData.append('dateOfBirth', newUser.dateOfBirth || '');
      formData.append('joiningDate', newUser.joiningDate || '');
      formData.append('salary', newUser.salary || '');
      formData.append('department', newUser.department || '');
      formData.append('employeeRole', newUser.employeeRole || '');
      formData.append('status', newUser.status || 'ACTIVE');
      formData.append('collegeName', newUser.collegeName || '');
      formData.append('internshipDuration', newUser.internshipDuration || '');
      
      // Add documents
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          formData.append(key, documents[key]);
        }
      });
      
      // Debug: Log form data before sending
      console.log('AdminUsersPage - Form data being sent:', {
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          type: typeof value,
          isFile: value instanceof File,
          size: value instanceof File ? value.size : null,
          value: value instanceof File ? value.name : value
        }))
      });

      // Create user with documents
      const response = await authAPI.createUserWithDocuments(formData);
      
      if (response.data.success) {
        fetchUsers();
        fetchEmployees();
        setShowModal(false);
        resetForm();
        alert(`User created successfully!\nEmployee ID: ${response.data.employeeId || 'Generated'}\nPlease save this information.`);
      } else {
        setError(response.data.message || "Failed to create user");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.response?.data?.message || "Failed to create user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewUser({
      fullName: "",
      email: "",
      password: "",
      role: "Sales Person",
      // Employee-specific fields
      phoneNumber: "",
      whatsappNumber: "",
      linkedInUrl: "",
      currentAddress: "",
      permanentAddress: "",
      dateOfBirth: "",
      joiningDate: "",
      salary: "",
      department: "",
      employeeRole: "",
      status: "ACTIVE",
      collegeName: "",
      internshipDuration: ""
    });
    setDocuments({
      photograph: null,
      tenthMarksheet: null,
      twelfthMarksheet: null,
      bachelorDegree: null,
      postgraduateDegree: null,
      aadharCard: null,
      panCard: null,
      pcc: null,
      resume: null,
      offerLetter: null
    });
    setEditDocuments({
      photograph: null,
      tenthMarksheet: null,
      twelfthMarksheet: null,
      bachelorDegree: null,
      postgraduateDegree: null,
      aadharCard: null,
      panCard: null,
      pcc: null,
      resume: null,
      offerLetter: null
    });
    setUploadProgress({});
  };

  const generateReferenceId = () => {
    return 'REF' + Date.now().toString(36).toUpperCase();
  };

  const handleDocumentChange = (documentType, file) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const handleEditDocumentChange = (documentType, file) => {
    setEditDocuments(prev => ({
      ...prev,
      [documentType]: file
    }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      // Validate password if provided
      if (editUser.password && editUser.password.length > 0 && editUser.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      setLoading(true);
      
      // Create FormData for handling file uploads and all employee fields
      const formData = new FormData();
      
      // Basic user fields
      formData.append('fullName', editUser.fullName);
      formData.append('email', editUser.email);
      formData.append('role', editUser.role);
      if (editUser.password) {
        formData.append('password', editUser.password);
      }
      
      // Employee-specific fields
      formData.append('phoneNumber', editUser.phoneNumber || '');
      formData.append('whatsappNumber', editUser.whatsappNumber || '');
      formData.append('linkedInUrl', editUser.linkedInUrl || '');
      formData.append('currentAddress', editUser.currentAddress || '');
      formData.append('permanentAddress', editUser.permanentAddress || '');
      formData.append('dateOfBirth', editUser.dateOfBirth || '');
      formData.append('joiningDate', editUser.joiningDate || '');
      formData.append('salary', editUser.salary || '');
      formData.append('department', editUser.department || '');
      formData.append('employeeRole', editUser.employeeRole || '');
      formData.append('status', editUser.status || 'ACTIVE');
      formData.append('collegeName', editUser.collegeName || '');
      formData.append('internshipDuration', editUser.internshipDuration || '');
      
      // Append documents to FormData
      Object.keys(editDocuments).forEach(key => {
        if (editDocuments[key]) {
          formData.append(key, editDocuments[key]);
          console.log(`Adding document ${key}:`, editDocuments[key].name);
        }
      });

      // Debug: Log what we're sending
      console.log('Updating user with ID:', editUser._id);
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      // Use the updateUserWithDocuments endpoint
      const response = await authAPI.updateUserWithDocuments(editUser._id, formData);
      
      console.log('Response received:', response);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data.data);
      
      if (response.data && response.data.success) {
        setShowEditModal(false);
        fetchUsers();
        fetchEmployees(); // Also refresh employee data
        
        // Force a small delay to ensure data is updated
        setTimeout(() => {
          fetchEmployees(); // Refresh again after a short delay
        }, 1000);
        
        setError(null);
        // Reset edit documents
        setEditDocuments({
          photograph: null,
          tenthMarksheet: null,
          twelfthMarksheet: null,
          bachelorDegree: null,
          postgraduateDegree: null,
          aadharCard: null,
          panCard: null,
          pcc: null,
          resume: null,
          offerLetter: null
        });
        alert('User updated successfully!');
      } else {
        setError((response.data && response.data.message) || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response?.data);
      console.error("Error response status:", err.response?.status);
      console.error("Error response statusText:", err.response?.statusText);
      setError(
        err.response?.data?.message || 
        "Failed to update user. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      const response = await authAPI.deleteUser(userId);
      
      if (response.data && response.data.success) {
        // Refresh user list
        fetchUsers();
        setConfirmDelete(null);
        setError(null);
      } else {
        setError((response.data && response.data.message) || "Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(
        err.response?.data?.message || 
        "Failed to delete user. Please check your connection and try again."
      );
      setConfirmDelete(null);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = async (userItem) => {
    try {
      // Fetch employee data for this user
      let employeeData = {};
      if (['Sales Person', 'Lead Person', 'Manager', 'Employee'].includes(userItem.role)) {
        const response = await employeeAPI.getAll();
        if (response.data && response.data.success) {
          const employee = response.data.data.find(emp => emp.userId === userItem._id);
          if (employee) {
            employeeData = {
              phoneNumber: employee.phoneNumber || '',
              whatsappNumber: employee.whatsappNumber || '',
              linkedInUrl: employee.linkedInUrl || '',
              currentAddress: employee.currentAddress || '',
              permanentAddress: employee.permanentAddress || '',
              dateOfBirth: employee.dateOfBirth ? (() => {
                const date = new Date(employee.dateOfBirth);
                return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
              })() : '',
              joiningDate: employee.joiningDate ? (() => {
                const date = new Date(employee.joiningDate);
                return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
              })() : '',
              salary: employee.salary || '',
              department: employee.department?._id || '',
              employeeRole: employee.role?._id || '',
              status: employee.status || 'ACTIVE',
              collegeName: employee.collegeName || '',
              internshipDuration: employee.internshipDuration || ''
            };
          }
        }
      }
      
      // Create a comprehensive edit user object
      setEditUser({
        _id: userItem._id,
        fullName: userItem.fullName,
        email: userItem.email,
        role: userItem.role,
        password: "", // Empty password field for optional update
        // Employee-specific fields
        phoneNumber: employeeData.phoneNumber || '',
        whatsappNumber: employeeData.whatsappNumber || '',
        linkedInUrl: employeeData.linkedInUrl || '',
        currentAddress: employeeData.currentAddress || '',
        permanentAddress: employeeData.permanentAddress || '',
        dateOfBirth: employeeData.dateOfBirth || '',
        joiningDate: employeeData.joiningDate || '',
        salary: employeeData.salary || '',
        department: employeeData.department || '',
        employeeRole: employeeData.employeeRole || '',
        status: employeeData.status || 'ACTIVE',
        collegeName: employeeData.collegeName || '',
        internshipDuration: employeeData.internshipDuration || ''
      });
      setShowEditModal(true);
    } catch (error) {
      console.error('Error loading employee data:', error);
      // Still show modal with basic user data if employee data fails
      setEditUser({
        _id: userItem._id,
        fullName: userItem.fullName,
        email: userItem.email,
        role: userItem.role,
        password: "", // Empty password field for optional update
        // Employee-specific fields with defaults
        phoneNumber: '',
        whatsappNumber: '',
        linkedInUrl: '',
        currentAddress: '',
        permanentAddress: '',
        dateOfBirth: '',
        joiningDate: '',
        salary: '',
        department: '',
        employeeRole: '',
        status: 'ACTIVE',
        collegeName: '',
        internshipDuration: ''
      });
      setShowEditModal(true);
    }
  };

  const handleEditEmployee = (employeeId) => {
    console.log('handleEditEmployee called with employeeId:', employeeId);
    setEditEmployeeId(employeeId);
    setShowEmployeeEditModal(true);
  };

  const handleEmployeeUpdated = () => {
    fetchEmployees();
    setShowEmployeeEditModal(false);
    setEditEmployeeId(null);
  };

  const openCreateAccountModal = (employee) => {
      // Check if user already exists
      const existingUser = users.find(u => u.email === employee.email);
      if (existingUser) {
        setError(`User account already exists for ${employee.email}`);
        return;
    }
    
    // Check if employee already has userId set
    if (employee.userId) {
      setError(`This employee already has a user account linked (ID: ${employee.userId})`);
      return;
    }
    
    setSelectedEmployee(employee);
    setAccountPassword('');
    setGenerateRandomPassword(true);
    setShowCreateAccountModal(true);
  };

  const createUserAccountForEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      // Check if user already exists (double-check)
      const existingUser = users.find(u => u.email === selectedEmployee.email);
      if (existingUser) {
        setError(`User account already exists for ${selectedEmployee.email}`);
        setShowCreateAccountModal(false);
        return;
      }

      // Determine password
      let password;
      if (generateRandomPassword) {
        password = generateTempPassword();
      } else {
        if (!accountPassword || accountPassword.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
        password = accountPassword;
      }

      const userData = {
        fullName: selectedEmployee.fullName,
        email: selectedEmployee.email,
        password: password,
        role: selectedEmployee.role?.name || "Employee"
      };

      const response = await authAPI.createUser(userData);
      if (response.data.success) {
        // Update employee with user ID
        await employeeAPI.update(selectedEmployee._id, {
          employee: JSON.stringify({ userId: response.data.data._id })
        });
        
        fetchUsers();
        fetchEmployees();
        setShowCreateAccountModal(false);
        setSelectedEmployee(null);
        setAccountPassword('');
        
        const passwordMessage = generateRandomPassword 
          ? `Generated Password: ${password}\nPlease share this with the employee securely.`
          : 'Account created with the provided password.';
        
        alert(`User account created successfully for ${selectedEmployee.fullName}\n${passwordMessage}`);
      }
    } catch (err) {
      console.error("Error creating user account:", err);
      setError(err.response?.data?.message || "Failed to create user account. Please try again.");
    }
  };

  const generateTempPassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
  };

  // Use the imported formatDate utility from helpers
  const formatDate = formatDateUtil;

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <div className="flex gap-3">
            <Link
              to="/employees"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM8 14v.01M12 14v.01M16 14v.01" />
              </svg>
              Employee Management
            </Link>
            {activeTab === "users" && (
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Add New User
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("users")}
                className={`${
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
                </svg>
                User Accounts
              </button>
              <button
                onClick={() => setActiveTab("employees")}
                className={`${
                  activeTab === "employees"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Employees ({employees.length})
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* User Accounts Tab */}
        {activeTab === "users" && (
          <>
            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sales Team</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {users.filter(u => u.role === "Sales Person").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Managers</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {users.filter(u => u.role === "Manager").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM8 14v.01M12 14v.01M16 14v.01" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">HR & Employees</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {users.filter(u => u.role === "HR" || u.role === "Employee").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
       <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 mb-6">
  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
    
    {/* Search Field */}
    <div className="w-full lg:w-1/3">
      <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Search Users
      </label>
      <input
        type="text"
        id="search"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
    </div>

    {/* Role Filter */}
    <div className="w-full lg:w-1/3">
      <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Filter by Role
      </label>
      <select
        id="roleFilter"
        value={filterRole}
        onChange={(e) => setFilterRole(e.target.value)}
        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="">All Roles</option>
        <option value="Sales Person">Sales Person</option>
        <option value="Lead Person">Lead Person</option>
        <option value="Manager">Manager</option>
        <option value="Admin">Admin</option>
        <option value="HR">HR</option>
        <option value="Employee">Employee</option>
  <option value="IT Manager">IT Manager</option>
  <option value="IT Intern">IT Intern</option>
  <option value="IT Permanent">IT Permanent</option>
      </select>
    </div>

    {/* Clear Button */}
    <div className="w-full lg:w-auto flex items-end pt-1">
      <button
        onClick={() => {
          setSearchTerm("");
          setFilterRole("");
        }}
        className="w-full lg:w-auto px-4 py-2 rounded-md bg-green-400 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-sm text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-slate-600 transition-all"
      >
        Clear Filters
      </button>
    </div>
  </div>
</div>


{/* Users Table */}
{loading ? (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
) : (
  <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-black/25 overflow-hidden">
    {filteredUsers.length === 0 ? (
      <div className="p-6 text-center text-gray-500 dark:text-gray-500">
        No users found. Try adjusting your filters.
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              {["Avatar", "Name", "Email", "Role", "Created", "Actions"].map((title) => (
                <th
                  key={title}
                  className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
            {filteredUsers.map((userItem) => (
              <tr
                key={userItem._id}
                className="hover:bg-gray-50 dark:hover:bg-slate-800 transition duration-150 text-center"
              >
                {/* Avatar */}
                <td className="px-6 py-4">
                  <div className="h-10 w-10 mx-auto bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold">
                    {userItem.fullName.charAt(0).toUpperCase()}
                  </div>
                </td>

                {/* Name */}
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {userItem.fullName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 break-all">
                    ID: {userItem._id}
                  </div>
                </td>

                {/* Email */}
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {userItem.email}
                </td>

                {/* Role */}
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      userItem.role === "Admin"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        : userItem.role === "Manager"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : userItem.role === "Lead Person"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : userItem.role === "HR"
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                        : userItem.role === "Employee"
                        ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {userItem.role}
                  </span>
                </td>

                {/* Created */}
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(userItem.createdAt)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-sm font-medium">
                  {userItem._id !== user.id ? (
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => openEditModal(userItem)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(userItem)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-500">Current User</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

          </>
        )}

        {/* Employees Tab */}
      {/* Employees Tab */}
{activeTab === "employees" && (
  <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-black/25 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Registered Employees
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Manage employee details and create user accounts for CRM access
      </p>
    </div>

    {loading ? (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    ) : employees.length === 0 ? (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-lg font-medium mb-2">No employees found</h3>
        <p className="text-sm">No employees are registered in the system yet.</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              {["Avatar", "Employee", "Contact", "Department", "Role", "Status", "User Account", "Actions"].map((title) => (
                <th
                  key={title}
                  className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
            {employees.map((employee) => {
              // Check if user account exists by email match OR if employee has userId set
              const hasUserAccount = users.some(u => u.email === employee.email) || !!employee.userId;
              return (
                <tr key={employee._id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition duration-150 text-center">
                  
                  {/* Avatar */}
                  <td className="px-6 py-4">
                    <div className="h-10 w-10 mx-auto bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold">
                      {employee.fullName?.charAt(0)?.toUpperCase() || 'E'}
                    </div>
                  </td>

                  {/* Employee Info */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {employee.fullName || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 break-all">
                      ID: {employee.employeeId || employee._id}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <div>{employee.email || 'N/A'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{employee.phoneNumber || 'N/A'}</div>
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {employee.department?.name || 'N/A'}
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {employee.role?.name || 'N/A'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.status === 'Active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : employee.status === 'Inactive'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {employee.status || 'N/A'}
                    </span>
                  </td>

                  {/* User Account */}
                  <td className="px-6 py-4">
                    {hasUserAccount ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        None
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => handleEditEmployee(employee._id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      {!hasUserAccount && employee.email && !employee.userId && (
                        <button
                          onClick={() => openCreateAccountModal(employee)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Create Account
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow-lg dark:shadow-black/25 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center bg-blue-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-medium">Create User Account & Employee Profile</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="px-6 py-4">
              {/* Basic User Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={newUser.fullName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Password must be at least 6 characters</p>
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      System Role *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={newUser.role}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      required
                    >
                      <option value="Sales Person">Sales Person</option>
                      <option value="Lead Person">Lead Person</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                      <option value="HR">HR</option>
                      <option value="Employee">Employee</option>
  <option value="IT Manager">IT Manager</option>
  <option value="IT Intern">IT Intern</option>
  <option value="IT Permanent">IT Permanent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={newUser.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="whatsappNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      id="whatsappNumber"
                      name="whatsappNumber"
                      value={newUser.whatsappNumber}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="linkedInUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      id="linkedInUrl"
                      name="linkedInUrl"
                      value={newUser.linkedInUrl}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Address Information</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="currentAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Current Address
                    </label>
                    <textarea
                      id="currentAddress"
                      name="currentAddress"
                      value={newUser.currentAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Permanent Address
                    </label>
                    <textarea
                      id="permanentAddress"
                      name="permanentAddress"
                      value={newUser.permanentAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Professional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={newUser.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="joiningDate" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      id="joiningDate"
                      name="joiningDate"
                      value={newUser.joiningDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Salary (₹)
                    </label>
                    <input
                      type="number"
                      id="salary"
                      name="salary"
                      value={newUser.salary}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      placeholder="Enter salary amount"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Department
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={newUser.department}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
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
                    <label htmlFor="employeeRole" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Employee Role
                    </label>
                    <select
                      id="employeeRole"
                      name="employeeRole"
                      value={newUser.employeeRole}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={newUser.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="TERMINATED">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Educational Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Educational Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      College Name
                    </label>
                    <input
                      type="text"
                      id="collegeName"
                      name="collegeName"
                      value={newUser.collegeName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="internshipDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Internship Duration (months)
                    </label>
                    <input
                      type="number"
                      id="internshipDuration"
                      name="internshipDuration"
                      value={newUser.internshipDuration}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      placeholder="Enter duration in months"
                    />
                  </div>
                </div>
              </div>
              
              {/* Document Upload Section */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Document Uploads (Optional)</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">You can upload documents now or add them later. All documents are optional.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Photograph */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Photograph
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleDocumentChange('photograph', e.target.files[0])}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-l file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {/* 10th Marksheet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      10th Marksheet
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentChange('tenthMarksheet', e.target.files[0])}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-l file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {/* 12th Marksheet */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      12th Marksheet
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentChange('twelfthMarksheet', e.target.files[0])}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-l file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {/* Bachelor Degree */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Bachelor Degree
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentChange('bachelorDegree', e.target.files[0])}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-l file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {/* Postgraduate Degree */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Postgraduate Degree
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentChange('postgraduateDegree', e.target.files[0])}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-l file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {/* Aadhar Card */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Aadhar Card
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentChange('aadharCard', e.target.files[0])}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-l file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {/* PAN Card */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      PAN Card
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentChange('panCard', e.target.files[0])}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-l file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {/* PCC */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Police Clearance Certificate
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentChange('pcc', e.target.files[0])}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-l file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {/* Resume */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Resume
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleDocumentChange('resume', e.target.files[0])}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-l file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  
                  {/* Offer Letter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Offer Letter
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleDocumentChange('offerLetter', e.target.files[0])}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-l file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  All documents are optional. Accepted formats: PDF, JPG, JPEG, PNG (for images), DOC, DOCX (for documents)
                </p>
              </div>
              
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-50 dark:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create User & Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow-lg dark:shadow-black/25 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center bg-blue-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-medium">Edit User Account & Employee Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="px-6 py-4">
              {/* Basic User Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editFullName" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="editFullName"
                      name="fullName"
                      value={editUser.fullName}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="editEmail"
                      name="email"
                      value={editUser.email}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="editPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="editPassword"
                      name="password"
                      value={editUser.password}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      placeholder="Leave blank to keep current password"
                      minLength={editUser.password ? 6 : 0}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Leave blank to keep current password. New password must be at least 6 characters.</p>
                  </div>
                  <div>
                    <label htmlFor="editRole" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      System Role *
                    </label>
                    <select
                      id="editRole"
                      name="role"
                      value={editUser.role}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      required
                    >
                      <option value="Sales Person">Sales Person</option>
                      <option value="Lead Person">Lead Person</option>
                      <option value="Manager">Manager</option>
                      <option value="Admin">Admin</option>
                      <option value="HR">HR</option>
                      <option value="Employee">Employee</option>
  <option value="IT Manager">IT Manager</option>
  <option value="IT Intern">IT Intern</option>
  <option value="IT Permanent">IT Permanent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="editPhoneNumber"
                      name="phoneNumber"
                      value={editUser.phoneNumber}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="editWhatsappNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      id="editWhatsappNumber"
                      name="whatsappNumber"
                      value={editUser.whatsappNumber}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="editLinkedInUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      id="editLinkedInUrl"
                      name="linkedInUrl"
                      value={editUser.linkedInUrl}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Address Information</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="editCurrentAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Current Address
                    </label>
                    <textarea
                      id="editCurrentAddress"
                      name="currentAddress"
                      value={editUser.currentAddress}
                      onChange={handleEditInputChange}
                      rows="3"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="editPermanentAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Permanent Address
                    </label>
                    <textarea
                      id="editPermanentAddress"
                      name="permanentAddress"
                      value={editUser.permanentAddress}
                      onChange={handleEditInputChange}
                      rows="3"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Professional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editDateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="editDateOfBirth"
                      name="dateOfBirth"
                      value={editUser.dateOfBirth}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="editJoiningDate" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      id="editJoiningDate"
                      name="joiningDate"
                      value={editUser.joiningDate}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="editSalary" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Salary (₹)
                    </label>
                    <input
                      type="number"
                      id="editSalary"
                      name="salary"
                      value={editUser.salary}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      placeholder="Enter salary amount"
                    />
                  </div>
                  <div>
                    <label htmlFor="editDepartment" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Department
                    </label>
                    <select
                      id="editDepartment"
                      name="department"
                      value={editUser.department}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
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
                    <label htmlFor="editEmployeeRole" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Employee Role
                    </label>
                    <select
                      id="editEmployeeRole"
                      name="employeeRole"
                      value={editUser.employeeRole}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Status
                    </label>
                    <select
                      id="editStatus"
                      name="status"
                      value={editUser.status}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="TERMINATED">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Educational Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Educational Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editCollegeName" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      College Name
                    </label>
                    <input
                      type="text"
                      id="editCollegeName"
                      name="collegeName"
                      value={editUser.collegeName}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      placeholder="Enter college name"
                    />
                  </div>
                  <div>
                    <label htmlFor="editInternshipDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                      Internship Duration (months)
                    </label>
                    <input
                      type="number"
                      id="editInternshipDuration"
                      name="internshipDuration"
                      value={editUser.internshipDuration}
                      onChange={handleEditInputChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 dark:focus:border-blue-400 focus:border-blue-500"
                      placeholder="Enter duration in months"
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Update Documents (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(editDocuments).map((docType) => (
                    <div key={docType} className="flex items-center space-x-2">
                      <input
                        type="file"
                        id={`edit-${docType}`}
                        onChange={(e) => handleEditDocumentChange(docType, e.target.files[0])}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                      <label
                        htmlFor={`edit-${docType}`}
                        className="flex-1 px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                      >
                        <span className="text-gray-600 dark:text-gray-400">
                          {docType.charAt(0).toUpperCase() + docType.slice(1).replace(/([A-Z])/g, ' $1')}:
                        </span>
                        <span className="ml-2 text-gray-800 dark:text-gray-200">
                          {editDocuments[docType] ? editDocuments[docType].name : 'Choose file'}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-50 dark:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update User & Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow-lg dark:shadow-black/25 max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete user <span className="font-semibold">{confirmDelete.fullName}</span>? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-50 dark:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(confirmDelete._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Edit Modal */}
      {showEmployeeEditModal && editEmployeeId && (
        <EditEmployeeDialog
          employeeId={editEmployeeId}
          isOpen={showEmployeeEditModal}
          onOpenChange={setShowEmployeeEditModal}
          onEmployeeUpdated={handleEmployeeUpdated}
          departments={departments}
          roles={roles}
        />
      )}

      {/* Create Account Modal */}
      {showCreateAccountModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow-lg dark:shadow-black/25 max-w-md w-full p-6">
            <h3 className="text-lg font-medium mb-4">Create User Account</h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Creating account for: <span className="font-semibold">{selectedEmployee.fullName}</span> ({selectedEmployee.email})
            </p>
            
            <div className="mb-4">
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={generateRandomPassword}
                  onChange={(e) => {
                    setGenerateRandomPassword(e.target.checked);
                    if (e.target.checked) {
                      setAccountPassword('');
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">Generate random password</span>
              </label>
              
              {!generateRandomPassword && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <input
                    type="password"
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    placeholder="Enter password (min 6 characters)"
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters required</p>
                </div>
              )}
              
              {generateRandomPassword && (
                <p className="text-xs text-gray-500 mt-1">A random password will be generated and shown after account creation.</p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateAccountModal(false);
                  setSelectedEmployee(null);
                  setAccountPassword('');
                  setError(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-400 rounded-md hover:bg-gray-50 dark:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={createUserAccountForEmployee}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminUsersPage; 