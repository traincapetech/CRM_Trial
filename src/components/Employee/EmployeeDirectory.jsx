import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaPhone, FaEnvelope, FaLinkedin, FaFilter, FaUsers } from 'react-icons/fa';
import employeeAPI from '../../services/employeeAPI';
import EmployeeDetailsModal from './EmployeeDetailsModal';
import LoadingSpinner from '../ui/LoadingSpinner';

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, selectedDepartment, selectedRole]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesRes, departmentsRes, rolesRes] = await Promise.all([
        employeeAPI.getAll(),
        employeeAPI.getDepartments(),
        employeeAPI.getRoles()
      ]);

      if (employeesRes.data.success) {
        setEmployees(employeesRes.data.data);
      }
      if (departmentsRes.data.success) {
        setDepartments(departmentsRes.data.data);
      }
      if (rolesRes.data.success) {
        setRoles(rolesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching directory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees.filter(emp => emp.status === 'ACTIVE');

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phoneNumber?.includes(searchTerm)
      );
    }

    // Department filter
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(emp => {
        const deptId = emp.department?._id || emp.department;
        return deptId === selectedDepartment;
      });
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(emp => {
        const roleId = emp.role?._id || emp.role;
        return roleId === selectedRole;
      });
    }

    setFilteredEmployees(filtered);
  };

  const getEmployeeInitials = (name) => {
    if (!name) return 'E';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const getDepartmentStats = () => {
    const stats = {};
    departments.forEach(dept => {
      const count = employees.filter(emp => {
        const deptId = emp.department?._id || emp.department;
        return deptId === dept._id && emp.status === 'ACTIVE';
      }).length;
      stats[dept.name] = count;
    });
    return stats;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner 
          size={50}
          text="Loading directory..."
          particleCount={2}
          speed={1.1}
          hueRange={[160, 220]}
        />
      </div>
    );
  }

  const departmentStats = getDepartmentStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaUsers className="mr-2 text-blue-600" />
              Employee Directory
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredEmployees.length} of {employees.filter(e => e.status === 'ACTIVE').length} employees
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>
                  {dept.name} ({departmentStats[dept.name] || 0})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDepartment('all');
                setSelectedRole('all');
              }}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Employee List/Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <FaUser className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              No employees found
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.map((employee) => (
              <div key={employee._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    {employee.photograph ? (
                      <img
                        src={`/api/uploads/${employee.photograph}`}
                        alt={employee.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {getEmployeeInitials(employee.fullName)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-sm font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => handleViewEmployee(employee)}
                    >
                      {employee.fullName || 'Unknown'}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {employee.role?.name || 'No Role'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <FaEnvelope className="mr-2 w-3 h-3" />
                    <span className="truncate">{employee.email || 'No email'}</span>
                  </div>
                  
                  {employee.phoneNumber && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FaPhone className="mr-2 w-3 h-3" />
                      <span>{employee.phoneNumber}</span>
                    </div>
                  )}

                  {employee.linkedInUrl && (
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FaLinkedin className="mr-2 w-3 h-3" />
                      <a
                        href={employee.linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        LinkedIn
                      </a>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {employee.department?.name || 'No Department'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEmployees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                          {employee.photograph ? (
                            <img
                              src={`/api/uploads/${employee.photograph}`}
                              alt={employee.fullName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                              {getEmployeeInitials(employee.fullName)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div 
                            className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => handleViewEmployee(employee)}
                          >
                            {employee.fullName || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {employee.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {employee.department?.name || 'No Department'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {employee.role?.name || 'No Role'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        {employee.phoneNumber && (
                          <div className="flex items-center">
                            <FaPhone className="mr-2 w-3 h-3" />
                            <span>{employee.phoneNumber}</span>
                          </div>
                        )}
                        {employee.linkedInUrl && (
                          <div className="flex items-center">
                            <FaLinkedin className="mr-2 w-3 h-3" />
                            <a
                              href={employee.linkedInUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              LinkedIn
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmployeeDetailsModal
        employee={selectedEmployee}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
};

export default EmployeeDirectory; 