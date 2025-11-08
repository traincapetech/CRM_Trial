import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import employeeAPI from '../../services/employeeAPI';
import AddEmployeeDialog from './AddEmployeeDialog';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import EditEmployeeDialog from './EditEmployeeDialog';
import { toast } from 'react-toastify';

const EmployeeList = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await employeeAPI.getDepartments();
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Don't set error state - just log it and continue with empty departments
      setDepartments([{ _id: 'default', name: 'General' }]);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await employeeAPI.getRoles();
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Don't set error state - just log it and continue with default roles
      setRoles([
        { _id: 'emp', name: 'Employee' },
        { _id: 'sales', name: 'Sales Person' },
        { _id: 'lead', name: 'Lead Person' },
        { _id: 'it_staff', name: 'IT Staff' },
        { _id: 'it_manager', name: 'IT Manager' }
      ]);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      setEmployees(response.data.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchRoles();
    fetchEmployees();
  }, []);

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const searchString = searchTerm.toLowerCase();
      return (
        employee.fullName?.toLowerCase().includes(searchString) ||
        employee.email?.toLowerCase().includes(searchString) ||
        employee.department?.name?.toLowerCase().includes(searchString) ||
        employee.role?.name?.toLowerCase().includes(searchString)
      );
    });
  }, [employees, searchTerm]);

  // Handle edit employee
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setShowEditDialog(true);
  };

  // Handle view employee details
  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  // Handle delete employee
  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(employeeId);
      await employeeAPI.delete(employeeId);
      toast.success('Employee deleted successfully');
      fetchEmployees(); // Refresh the list
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchEmployees}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Employee Management</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Manage your organization's employees</p>
      </div>

      {/* Search and Add Employee */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
        
        <button
          onClick={() => setShowAddDialog(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:ring-offset-gray-800"
        >
          Add Employee
        </button>
      </div>

      {/* Employee List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <div
            key={employee._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                  {employee.fullName?.[0] || '?'}
                </div>
                <div className="ml-4">
                  <h3 
                    className="text-lg font-semibold text-gray-800 dark:text-white cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => handleView(employee)}
                  >
                    {employee.fullName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{employee.role?.name || 'No Role'}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {employee.status}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">{employee.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Department: {employee.department?.name || 'N/A'}
              </p>
              {employee.salary && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Salary: ₹{employee.salary.toLocaleString()}
                </p>
              )}
              {employee.joiningDate && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Joining Date: {new Date(employee.joiningDate).toLocaleDateString()}
                </p>
              )}
              {employee.phoneNumber && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Phone: {employee.phoneNumber}
                </p>
              )}
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => handleView(employee)}
                className="px-3 py-1 text-sm text-green-500 hover:text-green-600 focus:outline-none"
              >
                View Details
              </button>
              <button
                onClick={() => handleEdit(employee)}
                className="px-3 py-1 text-sm text-blue-500 hover:text-blue-600 focus:outline-none"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(employee._id)}
                disabled={deletingId === employee._id}
                className="px-3 py-1 text-sm text-red-500 hover:text-red-600 focus:outline-none disabled:opacity-50"
              >
                {deletingId === employee._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No employees found</p>
        </div>
      )}

      <AddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onEmployeeAdded={fetchEmployees}
        departments={departments}
        roles={roles}
      />

      <EmployeeDetailsModal
        employee={selectedEmployee}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />

      <EditEmployeeDialog
        employeeId={selectedEmployee?._id}
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        onEmployeeUpdated={fetchEmployees}
        departments={departments}
        roles={roles}
      />
    </div>
  );
};

export default EmployeeList; 