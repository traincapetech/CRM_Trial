// import React, { useState, useRef, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import CurrencySelector from "./CurrencySelector";
// import ThemeToggle from "./ThemeToggle";
// import ActivityTimer from "./ActivityTimer/ActivityTimer";
// import logo from '../assets/traincape-logo.jpg';
// import '../styles/navbar.css';
// import {
//   FaHome,
//   FaChartLine,
//   FaUsers,
//   FaCog,
//   FaUser,
//   FaSignOutAlt,
//   FaRocket,
//   FaBell,
//   FaSearch,
//   FaLinkedin,
//   FaTwitter,
//   FaFacebook
// } from 'react-icons/fa';

// const Navbar = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
//   const [isSalesDropdownOpen, setIsSalesDropdownOpen] = useState(false);
//   const [isLeadsDropdownOpen, setIsLeadsDropdownOpen] = useState(false);
//   const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);

//   const adminDropdownRef = useRef(null);
//   const salesDropdownRef = useRef(null);
//   const leadsDropdownRef = useRef(null);
//   const profileDropdownRef = useRef(null);

//   // Handle scroll effect
//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 20);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
//         setIsAdminDropdownOpen(false);
//       }
//       if (salesDropdownRef.current && !salesDropdownRef.current.contains(event.target)) {
//         setIsSalesDropdownOpen(false);
//       }
//       if (leadsDropdownRef.current && !leadsDropdownRef.current.contains(event.target)) {
//         setIsLeadsDropdownOpen(false);
//       }
//       if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
//         setIsProfileDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//     setIsProfileDropdownOpen(false);
//   };

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   // Enhanced Dropdown menu component with glassmorphism
//   const DropdownMenu = ({ isOpen, items, title, reference, icon: Icon }) => (
//     <div ref={reference} className="relative">
//       <button
//         onClick={() => {
//           if (reference === adminDropdownRef) setIsAdminDropdownOpen(!isOpen);
//           else if (reference === salesDropdownRef) setIsSalesDropdownOpen(!isOpen);
//           else if (reference === leadsDropdownRef) setIsLeadsDropdownOpen(!isOpen);
//           else setIsProfileDropdownOpen(!isOpen);
//         }}
//         className={`group flex items-center px-4 py-2 rounded-xl transition-all duration-300 ease-out border border-transparent ${
//           isScrolled
//             ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-200 dark:hover:border-slate-600'
//             : 'text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20'
//         }`}
//       >
//         {Icon && <Icon className="mr-2 text-sm" />}
//         <span className="font-medium">{title}</span>
//         {title && (
//           <svg
//             className={`ml-2 h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//           </svg>
//         )}
//       </button>

//       {isOpen && (
//         <>
//           <div className="fixed inset-0 z-40" onClick={() => {
//             setIsAdminDropdownOpen(false);
//             setIsSalesDropdownOpen(false);
//             setIsLeadsDropdownOpen(false);
//             setIsProfileDropdownOpen(false);
//           }}></div>

//           <div className={`absolute right-0 mt-3 py-3 w-64 rounded-2xl shadow-2xl z-50 transform dropdown-enter ${
//             isScrolled
//               ? 'navbar-glass-dark dark:bg-slate-800/95'
//               : 'navbar-glass bg-white/95'
//           }`}>
//             {title && (
//               <div className="px-3 pb-2 mb-2 border-b border-gray-200/50 dark:border-slate-600/50">
//                 <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
//               </div>
//             )}

//             {items.map((item, index) => (
//               item.onClick ? (
//                 <button
//                   key={index}
//                   onClick={() => {
//                     item.onClick();
//                     setIsAdminDropdownOpen(false);
//                     setIsSalesDropdownOpen(false);
//                     setIsLeadsDropdownOpen(false);
//                     setIsProfileDropdownOpen(false);
//                   }}
//                   className="group w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200 ease-out flex items-center rounded-xl mx-2"
//                 >
//                   {item.icon && <item.icon className="mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />}
//                   <span className="group-hover:translate-x-1 transition-transform duration-200">{item.label}</span>
//                 </button>
//               ) : (
//                 <Link
//                   key={index}
//                   to={item.path}
//                   className="group block px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-200 ease-out flex items-center rounded-xl mx-2"
//                   onClick={() => {
//                     setIsAdminDropdownOpen(false);
//                     setIsSalesDropdownOpen(false);
//                     setIsLeadsDropdownOpen(false);
//                     setIsProfileDropdownOpen(false);
//                   }}
//                 >
//                   {item.icon && <item.icon className="mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />}
//                   <span className="group-hover:translate-x-1 transition-transform duration-200">{item.label}</span>
//                 </Link>
//               )
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );

//   // Define dropdown items with icons
//   const adminItems = [
//     { label: 'Dashboard', path: '/admin', icon: FaHome },
//     { label: 'Manage Users', path: '/admin/users', icon: FaUsers },
//     { label: 'Manage Leads', path: '/admin/leads', icon: FaChartLine },
//     { label: 'Import Data', path: '/admin/import', icon: FaUsers },
//     { label: 'Activity Logs', path: '/admin/activity-logs', icon: FaBell }
//   ];

//   const salesItems = [
//     { label: 'Sales Tracking', path: '/sales-tracking', icon: FaChartLine },
//     { label: 'Prospects', path: '/prospects', icon: FaUsers }
//   ];

//   const leadsItems = [
//     { label: 'Leads', path: '/leads', icon: FaUsers },
//     { label: 'Lead Sales Sheet', path: '/lead-sales-sheet', icon: FaChartLine }
//   ];

//   const profileItems = [
//     { label: 'Profile', path: '/profile', icon: FaUser },
//     { label: 'Settings', path: '/settings', icon: FaCog },
//     {
//       label: 'Logout',
//       path: '#',
//       onClick: handleLogout,
//       icon: FaSignOutAlt
//     }
//   ];

//   return (
//     <>
//       <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
//         isScrolled
//           ? 'navbar-glass-dark shadow-lg'
//           : 'bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-indigo-700/95'
//       }`}>
//                  <nav className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
//            <div className="flex justify-between items-center h-16 sm:h-20">

//                          {/* Logo Section */}
//              <Link to="/" className="group flex items-center space-x-1 sm:space-x-2 md:space-x-4 hover:scale-105 transition-transform duration-300">
//                <div className="relative">
//                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
//                  <div className="relative bg-white/10 backdrop-blur-sm p-1 sm:p-1.5 md:p-2 rounded-2xl border border-white/20">
//                    <img src={logo} alt="Traincape Technology" className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-xl" />
//                    <FaRocket className="absolute -top-1 -right-1 text-yellow-400 text-xs animate-pulse" />
//                  </div>
//                </div>
//                <div className="block">
//                  <span className={`text-sm sm:text-lg md:text-xl font-black tracking-tight ${
//                    isScrolled
//                      ? 'text-gradient'
//                      : 'text-white'
//                  }`}>
//                    TrainCape
//                  </span>
//                  <div className={`text-xs font-medium ${
//                    isScrolled
//                      ? 'text-gray-600 dark:text-gray-400'
//                      : 'text-blue-100'
//                  }`}>
//                    CRM Technology
//                  </div>
//                </div>
//              </Link>

//                          {/* Mobile Menu Button */}
//              <button
//                className={`lg:hidden p-1 rounded-xl transition-all duration-300 ${
//                  isScrolled
//                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
//                    : 'text-white hover:bg-white/10'
//                }`}
//                onClick={toggleMenu}
//              >
//                <svg className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
//                </svg>
//              </button>

//             {/* Desktop Navigation - Responsive */}
//             <div className="hidden lg:flex items-center space-x-2">
//               <Link
//                 to="/"
//                 className={`nav-link-hover flex items-center px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 ease-out text-sm sm:text-base ${
//                   isScrolled
//                     ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600'
//                     : 'text-white/90 hover:text-white'
//                 }`}
//               >
//                 <FaHome className="mr-1.5 sm:mr-2 text-sm" />
//                 Home
//               </Link>

//               {user && user.role === "Customer" && (
//                 <Link
//                   to="/customer"
//                   className={`nav-link-hover flex items-center px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 ease-out text-sm sm:text-base ${
//                     isScrolled
//                       ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600'
//                       : 'text-white/90 hover:text-white'
//                   }`}
//                 >
//                   <FaHome className="mr-1.5 sm:mr-2 text-sm" />
//                   Dashboard
//                 </Link>
//               )}

//               {user && (user.role === "Sales Person" || user.role === "Manager" || user.role === "Admin") && (
//                 <DropdownMenu
//                   isOpen={isSalesDropdownOpen}
//                   items={salesItems}
//                   title="Sales"
//                   reference={salesDropdownRef}
//                   icon={FaChartLine}
//                 />
//               )}

//               {user && (user.role === "Lead Person" || user.role === "Manager" || user.role === "Admin") && (
//                 <DropdownMenu
//                   isOpen={isLeadsDropdownOpen}
//                   items={leadsItems}
//                   title="Leads"
//                   reference={leadsDropdownRef}
//                   icon={FaUsers}
//                 />
//               )}

//               {user && user.role === "Admin" && (
//                 <DropdownMenu
//                   isOpen={isAdminDropdownOpen}
//                   items={adminItems}
//                   title="Admin"
//                   reference={adminDropdownRef}
//                   icon={FaCog}
//                 />
//               )}
//             </div>

//                          {/* Right Side Items - Responsive */}
//              <div className="flex items-center space-x-1">
//                {/* Search and Notifications - Always visible */}
//                <button className={`p-1 rounded-xl transition-all duration-300 ${
//                  isScrolled
//                    ? 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700'
//                    : 'text-white/80 hover:text-white hover:bg-white/10'
//                }`}>
//                  <FaSearch className="text-xs sm:text-sm" />
//                </button>

//                <button className={`relative p-1 rounded-xl transition-all duration-300 ${
//                  isScrolled
//                    ? 'text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700'
//                    : 'text-white/80 hover:text-white hover:bg-white/10'
//                }`}>
//                  <FaBell className="text-xs sm:text-sm" />
//                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full notification-pulse"></div>
//                </button>

//                {/* Utility Components - Hidden on very small screens */}
//                <div className="hidden sm:flex utility-container items-center space-x-1">
//                  <CurrencySelector />
//                  <div className="w-px h-3 bg-white/20"></div>
//                  <ThemeToggle />
//                  <div className="w-px h-3 bg-white/20"></div>
//                  <ActivityTimer />
//                </div>

//                {/* User Profile - Responsive */}
//                {user ? (
//                  <div className="flex items-center space-x-1">
//                    <div className={`hidden sm:block text-right ${
//                      isScrolled
//                        ? 'text-gray-700 dark:text-gray-300'
//                        : 'text-white'
//                    }`}>
//                      <div className="text-xs font-semibold">{user.fullName}</div>
//                      <div className={`text-xs ${
//                        isScrolled
//                          ? 'text-gray-500 dark:text-gray-400'
//                          : 'text-blue-100'
//                      }`}>
//                        {user.role}
//                      </div>
//                    </div>

//                    <DropdownMenu
//                      isOpen={isProfileDropdownOpen}
//                      items={profileItems}
//                      title=""
//                      reference={profileDropdownRef}
//                    />

//                    <div className="avatar-glow">
//                      <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold text-xs">
//                        {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
//                      </div>
//                      <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-green-400 border-2 border-white dark:border-slate-800 rounded-full"></div>
//                    </div>
//                  </div>
//                ) : (
//                  <Link
//                    to="/login"
//                    className="group px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-white to-blue-50 text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border border-white/20 text-xs"
//                  >
//                    <span className="flex items-center">
//                      <FaUser className="mr-1 text-xs" />
//                      <span className="hidden sm:inline">Sign In</span>
//                      <span className="sm:hidden">Login</span>
//                    </span>
//                  </Link>
//                )}
//              </div>
//           </div>

//           {/* Mobile Menu */}
//           <div className={`lg:hidden transition-all duration-500 ease-out overflow-hidden ${
//             isMenuOpen ? 'mobile-menu-enter max-h-screen opacity-100 pb-6' : 'max-h-0 opacity-0'
//           }`}>
//             <div className="pt-4 border-t border-white/20 dark:border-slate-700/50">
//               <div className="space-y-2">
//                 <Link
//                   to="/"
//                   className={`nav-link-hover flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
//                     isScrolled
//                       ? 'text-gray-700 dark:text-gray-300'
//                       : 'text-white/90'
//                   }`}
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   <FaHome className="mr-3 text-sm" />
//                   Home
//                 </Link>

//                 {user && user.role === "Customer" && (
//                   <Link
//                     to="/customer"
//                     className={`nav-link-hover flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
//                       isScrolled
//                         ? 'text-gray-700 dark:text-gray-300'
//                         : 'text-white/90'
//                     }`}
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     <FaHome className="mr-3 text-sm" />
//                     Dashboard
//                   </Link>
//                 )}

//                 {/* Mobile Sales Links */}
//                 {user && (user.role === "Sales Person" || user.role === "Manager" || user.role === "Admin") && (
//                   <div className="space-y-1">
//                     <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
//                       isScrolled
//                         ? 'text-gray-500 dark:text-gray-400'
//                         : 'text-blue-200'
//                     }`}>
//                       Sales
//                     </div>
//                     {salesItems.map((item, index) => (
//                       <Link
//                         key={index}
//                         to={item.path}
//                         className={`nav-link-hover flex items-center px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
//                           isScrolled
//                             ? 'text-gray-600 dark:text-gray-400'
//                             : 'text-white/80'
//                         }`}
//                         onClick={() => setIsMenuOpen(false)}
//                       >
//                         <item.icon className="mr-3 text-xs" />
//                         {item.label}
//                       </Link>
//                     ))}
//                   </div>
//                 )}

//                 {/* Mobile Leads Links */}
//                 {user && (user.role === "Lead Person" || user.role === "Manager" || user.role === "Admin") && (
//                   <div className="space-y-1">
//                     <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
//                       isScrolled
//                         ? 'text-gray-500 dark:text-gray-400'
//                         : 'text-blue-200'
//                     }`}>
//                       Leads
//                     </div>
//                     {leadsItems.map((item, index) => (
//                       <Link
//                         key={index}
//                         to={item.path}
//                         className={`nav-link-hover flex items-center px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
//                           isScrolled
//                             ? 'text-gray-600 dark:text-gray-400'
//                             : 'text-white/80'
//                         }`}
//                         onClick={() => setIsMenuOpen(false)}
//                       >
//                         <item.icon className="mr-3 text-xs" />
//                         {item.label}
//                       </Link>
//                     ))}
//                   </div>
//                 )}

//                 {/* Mobile Admin Links */}
//                 {user && user.role === "Admin" && (
//                   <div className="space-y-1">
//                     <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
//                       isScrolled
//                         ? 'text-gray-500 dark:text-gray-400'
//                         : 'text-blue-200'
//                     }`}>
//                       Admin
//                     </div>
//                     {adminItems.map((item, index) => (
//                       <Link
//                         key={index}
//                         to={item.path}
//                         className={`nav-link-hover flex items-center px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
//                           isScrolled
//                             ? 'text-gray-600 dark:text-gray-400'
//                             : 'text-white/80'
//                         }`}
//                         onClick={() => setIsMenuOpen(false)}
//                       >
//                         <item.icon className="mr-3 text-xs" />
//                         {item.label}
//                       </Link>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Mobile User Section */}
//               <div className="mt-6 pt-4 border-t border-white/20 dark:border-slate-700/50">
//                 {user ? (
//                   <div className="space-y-2">
//                     <div className={`px-4 py-3 rounded-xl ${
//                       isScrolled
//                         ? 'bg-gray-50 dark:bg-slate-800'
//                         : 'bg-white/10'
//                     }`}>
//                       <div className={`font-semibold ${
//                         isScrolled
//                           ? 'text-gray-900 dark:text-white'
//                           : 'text-white'
//                       }`}>
//                         {user.fullName}
//                       </div>
//                       <div className={`text-sm ${
//                         isScrolled
//                           ? 'text-gray-600 dark:text-gray-400'
//                           : 'text-blue-100'
//                       }`}>
//                         {user.role}
//                       </div>
//                     </div>

//                     {profileItems.map((item, index) => (
//                       item.onClick ? (
//                         <button
//                           key={index}
//                           onClick={() => {
//                             item.onClick();
//                             setIsMenuOpen(false);
//                           }}
//                           className={`w-full nav-link-hover flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
//                             isScrolled
//                               ? 'text-gray-600 dark:text-gray-400 hover:text-red-600'
//                               : 'text-white/80 hover:text-red-200'
//                           }`}
//                         >
//                           <item.icon className="mr-3 text-sm" />
//                           {item.label}
//                         </button>
//                       ) : (
//                         <Link
//                           key={index}
//                           to={item.path}
//                           className={`nav-link-hover flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
//                             isScrolled
//                               ? 'text-gray-600 dark:text-gray-400'
//                               : 'text-white/80'
//                           }`}
//                           onClick={() => setIsMenuOpen(false)}
//                         >
//                           <item.icon className="mr-3 text-sm" />
//                           {item.label}
//                         </Link>
//                       )
//                     ))}
//                   </div>
//                 ) : (
//                   <Link
//                     to="/login"
//                     className={`flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
//                       isScrolled
//                         ? 'bg-blue-600 text-white hover:bg-blue-700'
//                         : 'bg-white text-blue-600 hover:bg-blue-50'
//                     }`}
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     <FaUser className="mr-2 text-sm" />
//                     Sign In
//                   </Link>
//                 )}
//               </div>

//               {/* Mobile Utility Components */}
//               <div className={`mt-4 pt-4 border-t border-white/20 dark:border-slate-700/50 flex items-center justify-center space-x-4 ${
//                 isScrolled
//                   ? 'text-gray-600 dark:text-gray-400'
//                   : 'text-white/80'
//               }`}>
//                 <CurrencySelector />
//                 <ThemeToggle />
//                 <ActivityTimer />
//               </div>
//             </div>
//           </div>
//         </nav>
//       </header>

//       {/* Spacer to prevent content from hiding behind fixed navbar */}
//       <div className="h-16 sm:h-20"></div>
//     </>
//   );
// };

// export default Navbar;

import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CurrencySelector from "./CurrencySelector";
import ThemeToggle from "./ThemeToggle";
import ActivityTimer from "./ActivityTimer/ActivityTimer";
import logo from "../assets/traincape-logo.jpg";
import "../styles/navbar.css";
import {
  FaHome,
  FaChartLine,
  FaUsers,
  FaCog,
  FaUser,
  FaSignOutAlt,
  FaRocket,
  FaBell,
  FaSearch,
  FaBars,
  FaTimes,
} from "react-icons/fa";

/* ---------- Small helpers ---------- */

const NavLink = ({ to, children, isScrolled, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`nav-link-hover px-4 py-2 rounded-xl font-medium transition-all ${
      isScrolled
        ? "text-gray-700 dark:text-gray-300 hover:text-primary"
        : "text-white/90 hover:text-white"
    }`}
  >
    {children}
  </Link>
);

// Desktop dropdown trigger (no ref prop here)
const MenuButton = ({
  id,
  title,
  icon: Icon,
  isScrolled,
  openMenu,
  setOpenMenu,
}) => (
  <button
    onClick={() => setOpenMenu(openMenu === id ? null : id)}
    className={`group flex items-center px-4 py-2 rounded-xl transition-all duration-300 border border-transparent ${
      isScrolled
        ? "text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5 dark:hover:bg-slate-700 hover:border-primary/20 dark:hover:border-slate-600"
        : "text-white/90 hover:text-white hover:bg-white/10 hover:border-white/20"
    }`}
  >
    {Icon && <Icon className="mr-2 text-sm" />}
    <span className="font-medium">{title}</span>
    <svg
      className={`ml-2 h-4 w-4 transition-transform ${
        openMenu === id ? "rotate-180" : ""
      }`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </button>
);

// Desktop dropdown
const Dropdown = ({ items, setOpenMenu }) => (
  <div
    className={`absolute top-12 right-0 mt-2 w-56 rounded-2xl shadow-xl 
             backdrop-blur-md bg-slate-900/90 border border-white/10 z-50`}
    role="menu"
  >
    <div className="py-2">
      {items.map((item, i) =>
        item.onClick ? (
          <button
            key={i}
            onClick={() => {
              item.onClick();
              setOpenMenu(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 
                         font-medium rounded-lg transition-colors duration-200
                         hover:bg-white/10 hover:text-white"
            role="menuitem"
          >
            <item.icon className="opacity-70" size={16} />
            {item.label}
          </button>
        ) : (
          <Link
            key={i}
            to={item.path}
            onClick={() => setOpenMenu(null)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-200 
                         font-medium rounded-lg transition-colors duration-200
                         hover:bg-white/10 hover:text-white"
            role="menuitem"
          >
            <item.icon className="opacity-70" size={16} />
            {item.label}
          </Link>
        )
      )}
    </div>
  </div>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // 'sales' | 'leads' | 'admin' | 'profile' | null

  // Refs wrapping each dropdown group so inside clicks are allowed
  const dropdownRefs = {
    sales: useRef(null),
    leads: useRef(null),
    admin: useRef(null),
    profile: useRef(null),
  };

  // Mobile accordion state
  const [acc, setAcc] = useState({ sales: true, leads: true, admin: true });

  /* ---------- Effects ---------- */

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ Proper outside-click: only check the currently open menu
  useEffect(() => {
    const onDown = (e) => {
      if (!openMenu) return;
      const wrapper = dropdownRefs[openMenu]?.current;
      if (wrapper && !wrapper.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openMenu]);

  // Prevent body scroll when drawer open (iOS-safe)
  useEffect(() => {
    document.body.classList.toggle("no-scroll", isDrawerOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [isDrawerOpen]);

  // ESC to close drawer
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setIsDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- Data ---------- */

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsDrawerOpen(false);
    setOpenMenu(null);
  };

  const salesItems = [
    { label: "Sales Tracking", path: "/sales-tracking", icon: FaChartLine },
    { label: "Prospects", path: "/prospects", icon: FaUsers },
  ];
  const leadsItems = [
    { label: "Leads", path: "/leads", icon: FaUsers },
    { label: "Lead Sales Sheet", path: "/lead-sales-sheet", icon: FaChartLine },
  ];
  const adminItems = [
    { label: "Dashboard", path: "/admin", icon: FaHome },
    { label: "Manage Users", path: "/admin/users", icon: FaUsers },
    { label: "Manage Leads", path: "/admin/leads", icon: FaChartLine },
    { label: "Import Data", path: "/admin/import", icon: FaUsers },
    { label: "Activity Logs", path: "/admin/activity-logs", icon: FaBell },
  ];
  const profileItems = [
    { label: "Profile", path: "/profile", icon: FaUser },
    { label: "Settings", path: "/settings", icon: FaCog },
    { label: "Logout", onClick: handleLogout, icon: FaSignOutAlt },
  ];

  /* ---------- Render ---------- */

  return (
    <>
      {/* Top bar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "navbar-glass-dark shadow-lg"
            : "bg-gradient-to-r from-primary via-secondary to-indigo-700/95"
        }`}
      >
        <nav className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="group flex items-center space-x-2 md:space-x-3 hover:scale-[1.02] transition-transform"
              onClick={() => setOpenMenu(null)}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-70 group-hover:opacity-100" />
                <div className="relative bg-white/10 backdrop-blur-sm p-1.5 md:p-2 rounded-2xl border border-white/20">
                  <img
                    src={logo}
                    alt="TrainCape"
                    className="h-8 w-8 md:h-10 md:w-10 rounded-xl"
                  />
                  <FaRocket className="absolute -top-1 -right-1 text-yellow-400 text-xs animate-pulse" />
                </div>
              </div>
              <div>
                <span
                  className={`text-lg md:text-xl font-black ${
                    isScrolled ? "text-gradient" : "text-white"
                  }`}
                >
                  TrainCape
                </span>
                <div
                  className={`${
                    isScrolled ? "opacity-70" : "text-blue-100"
                  } text-xs`}
                >
                  CRM Technology
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center space-x-2">
              <NavLink
                to="/"
                isScrolled={isScrolled}
                onClick={() => setOpenMenu(null)}
              >
                <FaHome className="inline mr-2 -mt-0.5" /> Home
              </NavLink>

              {user && user.role === "Customer" && (
                <NavLink
                  to="/customer"
                  isScrolled={isScrolled}
                  onClick={() => setOpenMenu(null)}
                >
                  <FaHome className="inline mr-2 -mt-0.5" /> Dashboard
                </NavLink>
              )}

              {user &&
                ["Sales Person", "Manager", "Admin"].includes(user.role) && (
                  <div className="relative" ref={dropdownRefs.sales}>
                    <MenuButton
                      id="sales"
                      title="Sales"
                      icon={FaChartLine}
                      isScrolled={isScrolled}
                      openMenu={openMenu}
                      setOpenMenu={setOpenMenu}
                    />
                    {openMenu === "sales" && (
                      <Dropdown
                        title="Sales"
                        items={salesItems}
                        isScrolled={isScrolled}
                        setOpenMenu={setOpenMenu}
                        align="left"
                      />
                    )}
                  </div>
                )}

              {user &&
                ["Lead Person", "Manager", "Admin"].includes(user.role) && (
                  <div className="relative" ref={dropdownRefs.leads}>
                    <MenuButton
                      id="leads"
                      title="Leads"
                      icon={FaUsers}
                      isScrolled={isScrolled}
                      openMenu={openMenu}
                      setOpenMenu={setOpenMenu}
                    />
                    {openMenu === "leads" && (
                      <Dropdown
                        title="Leads"
                        items={leadsItems}
                        isScrolled={isScrolled}
                        setOpenMenu={setOpenMenu}
                        align="left"
                      />
                    )}
                  </div>
                )}

              {user && user.role === "Admin" && (
                <div className="relative" ref={dropdownRefs.admin}>
                  <MenuButton
                    id="admin"
                    title="Admin"
                    icon={FaCog}
                    isScrolled={isScrolled}
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                  />
                  {openMenu === "admin" && (
                    <Dropdown
                      title="Admin"
                      items={adminItems}
                      isScrolled={isScrolled}
                      setOpenMenu={setOpenMenu}
                      align="left"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <button
                className={`p-2 rounded-lg ${
                  isScrolled ? "text-gray-700/80" : "text-white/90"
                } hidden md:block`}
              >
                <FaSearch />
              </button>
              <button
                className={`p-2 rounded-lg ${
                  isScrolled ? "text-gray-700/80" : "text-white/90"
                } hidden md:block`}
              >
                <FaBell />
              </button>

              {/* Desktop utilities (currency only on desktop) */}
              {/* <div className="hidden lg:flex items-center gap-2 utility-container">
                <CurrencySelector />
                <div className="w-px h-4 bg-white/20" />
                <ThemeToggle />
                <div className="w-px h-4 bg-white/20" />
                <ActivityTimer />
              </div> */}

              {/* Desktop profile or Sign In */}
              {user ? (
                <div
                  className="hidden lg:flex items-center gap-2 relative"
                  ref={dropdownRefs.profile}
                >
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === "profile" ? null : "profile")
                    }
                    className={`px-2 py-1 rounded-lg border border-transparent ${
                      isScrolled
                        ? "text-gray-700 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-slate-700"
                        : "text-white/90 hover:bg-white/10"
                    }`}
                    aria-haspopup="true"
                    aria-expanded={openMenu === "profile"}
                  >
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">
                        {user.fullName}
                      </div>
                      <div className="avatar-glow relative">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-white font-semibold text-xs">
                          {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-third border-2 border-white rounded-full" />
                      </div>
                    </div>
                  </button>
                  {openMenu === "profile" && (
                    <Dropdown
                      title="Profile"
                      items={profileItems}
                      isScrolled={isScrolled}
                      setOpenMenu={setOpenMenu}
                      align="right"
                    />
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`hidden lg:flex items-center px-4 py-2 rounded-lg font-semibold ${
                    isScrolled
                      ? "text-gray-700 dark:text-gray-300 bg-white hover:bg-primary/5"
                      : "bg-white text-primary hover:bg-primary/5"
                  }`}
                >
                  <FaUser className="mr-2" />
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 rounded-lg text-white focus:outline-none"
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Open menu"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile/Tablet Drawer */}
      {isDrawerOpen && (
        <div
          className="drawer open"
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
        >
          <button
            className="drawer-overlay"
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close menu overlay"
          />
          <aside className="drawer-panel safe-area">
            <div className="drawer-header">
              <div className="flex items-center gap-2">
                <img
                  src={logo}
                  alt="TrainCape"
                  className="h-8 w-8 rounded-xl"
                />
                <div className="leading-tight">
                  <div className="text-white font-bold">TrainCape</div>
                  <div className="text-white/70 text-xs">CRM Technology</div>
                </div>
              </div>
              <button
                className="drawer-close"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>

            <div className="menu-scroll">
              <Link
                to="/"
                className="drawer-link"
                onClick={() => setIsDrawerOpen(false)}
              >
                <FaHome className="mr-3" /> Home
              </Link>

              {user && user.role === "Customer" && (
                <Link
                  to="/customer"
                  className="drawer-link"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <FaHome className="mr-3" /> Dashboard
                </Link>
              )}

              {user &&
                ["Sales Person", "Manager", "Admin"].includes(user.role) && (
                  <div className="drawer-section">
                    <button
                      className="drawer-section-btn"
                      onClick={() => setAcc((s) => ({ ...s, sales: !s.sales }))}
                    >
                      <FaChartLine className="mr-3" /> Sales
                      <span
                        className={`ml-auto chevron ${acc.sales ? "open" : ""}`}
                      />
                    </button>
                    {acc.sales && (
                      <div className="drawer-sub">
                        {salesItems.map((it, i) => (
                          <Link
                            key={i}
                            to={it.path}
                            className="drawer-sublink"
                            onClick={() => setIsDrawerOpen(false)}
                          >
                            <it.icon className="mr-3 opacity-80" />
                            {it.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              {user &&
                ["Lead Person", "Manager", "Admin"].includes(user.role) && (
                  <div className="drawer-section">
                    <button
                      className="drawer-section-btn"
                      onClick={() => setAcc((s) => ({ ...s, leads: !s.leads }))}
                    >
                      <FaUsers className="mr-3" /> Leads
                      <span
                        className={`ml-auto chevron ${acc.leads ? "open" : ""}`}
                      />
                    </button>
                    {acc.leads && (
                      <div className="drawer-sub">
                        {leadsItems.map((it, i) => (
                          <Link
                            key={i}
                            to={it.path}
                            className="drawer-sublink"
                            onClick={() => setIsDrawerOpen(false)}
                          >
                            <it.icon className="mr-3 opacity-80" />
                            {it.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              {user && user.role === "Admin" && (
                <div className="drawer-section">
                  <button
                    className="drawer-section-btn"
                    onClick={() => setAcc((s) => ({ ...s, admin: !s.admin }))}
                  >
                    <FaCog className="mr-3" /> Admin
                    <span
                      className={`ml-auto chevron ${acc.admin ? "open" : ""}`}
                    />
                  </button>
                  {acc.admin && (
                    <div className="drawer-sub">
                      {adminItems.map((it, i) => (
                        <Link
                          key={i}
                          to={it.path}
                          className="drawer-sublink"
                          onClick={() => setIsDrawerOpen(false)}
                        >
                          <it.icon className="mr-3 opacity-80" />
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <div className="flex items-center justify-center gap-3 mb-3">
                {/* CurrencySelector intentionally not included on mobile/tablet */}
                <ThemeToggle />
                <ActivityTimer />
              </div>
              {user ? (
                <button className="logout" onClick={handleLogout}>
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="signin"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <FaUser className="mr-2" />
                  Sign In
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Spacer under fixed header */}
      <div className="h-16 sm:h-20" />
    </>
  );
};

export default Navbar;
