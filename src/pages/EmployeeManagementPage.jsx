import React, { useState } from 'react';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaClock, 
  FaCog, 
  FaMoneyBillWave 
} from 'react-icons/fa';

import Layout from '../components/Layout/Layout';
import EmployeeList from '../components/Employee/EmployeeList';
import BulkOperations from '../components/Employee/BulkOperations';
import LeaveManagement from '../components/Employee/LeaveManagement';
import LeaveApproval from '../components/Admin/LeaveApproval';
import AttendanceManagement from '../components/Employee/AttendanceManagement';
import PayrollComponent from '../components/Employee/PayrollComponent';
import { useAuth } from '../context/AuthContext';

const EmployeeManagementPage = () => {
  const [activeTab, setActiveTab] = useState('employees');
  const { user } = useAuth();

  const tabs = [
    { id: 'employees', label: 'Employees', icon: FaUsers },
    ...(user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'HR'
      ? [{ id: 'bulk-ops', label: 'Bulk Operations', icon: FaCog }]
      : []),
    { 
      id: 'leave', 
      label: user?.role === 'Admin' || user?.role === 'Manager' 
        ? 'Leave Approvals' 
        : 'Leave Management', 
      icon: FaCalendarAlt 
    },
    { id: 'attendance', label: 'Attendance', icon: FaClock },
    ...(user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'HR'
      ? [{ id: 'payroll', label: 'Payroll Management', icon: FaMoneyBillWave }]
      : [])
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'employees':
        return <EmployeeList />;
      case 'bulk-ops':
        return <BulkOperations />;
      case 'leave':
        return user?.role === 'Admin' || user?.role === 'Manager'
          ? <LeaveApproval />
          : <LeaveManagement userRole={user?.role} />;
      case 'attendance':
        return <AttendanceManagement userRole={user?.role} />;
      case 'payroll':
        return <PayrollComponent />;
      default:
        return <EmployeeList />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        {/* Page Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Employee Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Manage your organization's employees, leave requests, and attendance
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex flex-wrap gap-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    } py-2 px-3 border-b-2 font-medium text-sm flex items-center rounded-md transition`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Tab Content */}
        {renderContent()}
      </div>
    </Layout>
  );
};

export default EmployeeManagementPage;