import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaUser, FaUsers, FaChartLine, FaClipboardList, FaChartBar, FaCog, FaFileImport, FaCalendarCheck, FaUserCog, FaClock, FaUserTie, FaFileAlt, FaHistory, FaFileInvoiceDollar, FaLaptopCode } from 'react-icons/fa';
import ThemeToggle from '../ThemeToggle';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="h-screen bg-slate-800 dark:bg-slate-900 text-white w-64 flex-shrink-0 hidden md:block transition-all duration-200 ease-out border-r border-slate-700 dark:border-slate-700">
      <div className="flex flex-col h-full">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold">CRM Dashboard</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Welcome, {user?.name}</p>
        </div>
        
        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className={`${
                  location.pathname === '/'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <FaHome
                  className={`${
                    location.pathname === '/'
                      ? 'text-gray-300 dark:text-gray-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                />
                Home
              </Link>
            </li>
            
            {/* Manager Dashboard - Only visible to Manager and Admin */}
            {(user?.role === 'Manager' || user?.role === 'Admin') && (
              <li>
                <Link
                  to="/manager"
                  className={`${
                    location.pathname === '/manager'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaUserCog
                    className={`${
                      location.pathname === '/manager'
                        ? 'text-gray-300 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  Manager Dashboard
                </Link>
              </li>
            )}
            
            {/* IT Dashboard - Visible to IT roles and Admin */}
            {(['Admin', 'IT Manager', 'IT Intern', 'IT Permanent'].includes(user?.role)) && (
              <li>
                <Link
                  to="/it"
                  className={`${
                    location.pathname === '/it'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaLaptopCode
                    className={`${
                      location.pathname === '/it'
                        ? 'text-gray-300 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  IT Dashboard
                </Link>
              </li>
            )}

            {/* Lead Management - Only visible to Lead Person, Manager, and Admin */}
            {(user?.role === 'Lead Person' || user?.role === 'Manager' || user?.role === 'Admin') && (
              <li>
                <Link
                  to="/leads"
                  className={`${
                    location.pathname === '/leads'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaClipboardList
                    className={`${
                      location.pathname === '/leads'
                        ? 'text-gray-300 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  Leads
                </Link>
              </li>
            )}
            
            {/* Sales Management - Only visible to Sales Person, Manager, and Admin */}
            {(user?.role === 'Sales Person' || user?.role === 'Manager' || user?.role === 'Admin') && (
              <li>
                <Link
                  to="/sales"
                  className={`${
                    location.pathname === '/sales'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaChartBar
                    className={`${
                      location.pathname === '/sales'
                        ? 'text-gray-300 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  Sales
                </Link>
              </li>
            )}
            
            {/* Create Sale for Lead Person - Only visible to Sales Person, Manager, and Admin */}
            {(user?.role === 'Sales Person' || user?.role === 'Manager' || user?.role === 'Admin') && (
              <li>
                <Link
                  to="/create-sale"
                  className={`${
                    location.pathname === '/create-sale'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaChartLine
                    className={`${
                      location.pathname === '/create-sale'
                        ? 'text-gray-300 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  Create Sale for Lead
                </Link>
              </li>
            )}
            
            {/* Invoice Management - Only visible to Sales Person, Manager, and Admin */}
            {(user?.role === 'Sales Person' || user?.role === 'Manager' || user?.role === 'Admin') && (
              <>
                <li>
                  <Link
                    to="/invoice-management"
                    className={`${
                      location.pathname === '/invoice-management'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <FaFileInvoiceDollar
                      className={`${
                        location.pathname === '/invoice-management'
                          ? 'text-gray-300 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Invoice Management
                  </Link>
                </li>
                <li>
                  <Link
                    to="/stripe-invoices"
                    className={`${
                      location.pathname === '/stripe-invoices'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <FaFileInvoiceDollar
                      className={`${
                        location.pathname === '/stripe-invoices'
                          ? 'text-gray-300 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Stripe Invoices
                  </Link>
                </li>
              </>
            )}
            
            {/* Task Management - Visible to all authenticated users */}
            {user && (
              <li>
                <Link
                  to="/tasks"
                  className={`${
                    location.pathname === '/tasks'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaCalendarCheck
                    className={`${
                      location.pathname === '/tasks'
                        ? 'text-gray-300 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  Task Management
                </Link>
              </li>
            )}
            
            {/* Lead Sales Sheet - Only visible to Lead Person, Manager, and Admin */}
            {(user?.role === 'Lead Person' || user?.role === 'Manager' || user?.role === 'Admin') && (
              <li>
                <Link
                  to="/lead-sales-sheet"
                  className={`${
                    location.pathname === '/lead-sales-sheet'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaChartLine
                    className={`${
                      location.pathname === '/lead-sales-sheet'
                        ? 'text-gray-300 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  My Sales Sheet
                </Link>
              </li>
            )}
            
            {/* Update Sales - Only visible to Manager and Admin, removed for Lead Person */}
            {(user?.role === 'Manager' || user?.role === 'Admin') && (
              <li>
                <Link
                  to="/update-sales"
                  className={`${
                    location.pathname === '/update-sales'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaChartBar
                    className={`${
                      location.pathname === '/update-sales'
                        ? 'text-gray-300 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  Update Sales
                </Link>
              </li>
            )}
            
            {/* Employee Management - Only visible to HR, Manager, and Admin */}
            {(user?.role === 'HR' || user?.role === 'Manager' || user?.role === 'Admin') && (
              <li>
                <Link
                  to="/employees"
                  className={`${
                    location.pathname === '/employees'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaUserTie
                    className={`${
                      location.pathname === '/employees'
                        ? 'text-gray-300 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  Employee Management
                </Link>
              </li>
            )}

            {/* Document Management - Visible to Employees only (Admin/Manager can use Employee Management) */}
            {user && user.role === 'Employee' && (
              <li>
                <Link
                  to="/documents"
                  className={`${
                    location.pathname === '/documents'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                >
                  <FaFileAlt
                    className={`${
                      location.pathname === '/documents'
                        ? 'text-gray-300 dark:text-gray-400'
                        : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  My Documents
                </Link>
              </li>
            )}

            {/* Profile - Visible to all */}
            <li>
              <Link
                to="/profile"
                className={`${
                  location.pathname === '/profile'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
              >
                <FaUser
                  className={`${
                    location.pathname === '/profile'
                      ? 'text-gray-300 dark:text-gray-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                />
                Profile
              </Link>
            </li>
            
            {/* Admin Section - Only visible to Admin */}
            {user?.role === 'Admin' && (
              <>
                <li className="mt-8 mb-2">
                  <h3 className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Admin
                  </h3>
                </li>
                <li>
                  <Link
                    to="/admin/dashboard"
                    className={`${
                      location.pathname === '/admin/dashboard'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <FaChartLine
                      className={`${
                        location.pathname === '/admin/dashboard'
                          ? 'text-gray-300 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/users"
                    className={`${
                      location.pathname === '/admin/users'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <FaUsers
                      className={`${
                        location.pathname === '/admin/users'
                          ? 'text-gray-300 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Users
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/leads"
                    className={`${
                      location.pathname === '/admin/leads'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <FaClipboardList
                      className={`${
                        location.pathname === '/admin/leads'
                          ? 'text-gray-300 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Leads
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/activity-logs"
                    className={`${
                      location.pathname === '/admin/activity-logs'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <FaHistory
                      className={`${
                        location.pathname === '/admin/activity-logs'
                          ? 'text-gray-300 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Activity Logs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/import"
                    className={`${
                      location.pathname === '/admin/import'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <FaFileImport
                      className={`${
                        location.pathname === '/admin/import'
                          ? 'text-gray-300 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Import Data
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/activity"
                    className={`${
                      location.pathname === '/admin/activity'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <FaClock
                      className={`${
                        location.pathname === '/admin/activity'
                          ? 'text-gray-300 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Activity Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin"
                    className={`${
                      location.pathname === '/admin'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <FaCog
                      className={`${
                        location.pathname === '/admin'
                          ? 'text-gray-300 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Settings
                  </Link>
                </li>
              </>
            )}
            
            {/* Activity Dashboard for Managers - Only visible to Manager (not Admin) */}
            {user?.role === 'Manager' && (
              <>
                <li className="mt-8 mb-2">
                  <h3 className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Management
                  </h3>
                </li>
                <li>
                  <Link
                    to="/admin/activity"
                    className={`${
                      location.pathname === '/admin/activity'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  >
                    <FaClock
                      className={`${
                        location.pathname === '/admin/activity'
                          ? 'text-gray-300 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300 dark:text-gray-400'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    Activity Dashboard
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-700 space-y-3">
          {/* Theme Toggle */}
          <div className="flex justify-center">
            <ThemeToggle className="w-full justify-center" />
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-300 dark:text-gray-500 rounded-md hover:bg-gray-700"
          >
            <svg
              className="mr-3 h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 