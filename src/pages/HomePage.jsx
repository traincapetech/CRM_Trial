// import React from "react";
// import { Link } from "react-router-dom";
// import Layout from "../components/Layout/Layout";
// import { useAuth } from "../context/AuthContext";
// import GuestChat from "../components/Chat/GuestChat";
// import { FaRocket, FaPlay, FaUsers, FaChartLine, FaTasks, FaFileInvoiceDollar, FaCreditCard, FaChartBar, FaShieldAlt, FaClock, FaLinkedin, FaTwitter, FaFacebook } from 'react-icons/fa';
// import traincapeLogo from '../assets/traincape-logo.jpg';
// import '../styles/homepage.css';

// const HomePage = () => {
//   const { user } = useAuth();

//   const stats = [
//     { value: "2.5K+", label: "Active Leads", trend: "+12% this month", icon: <FaUsers className="text-blue-600" /> },
//     { value: "100%", label: "Task Completion", trend: "On target", icon: <FaTasks className="text-green-600" /> },
//     { value: "$0.5M", label: "Monthly Revenue", trend: "+28% increase", icon: <FaChartLine className="text-purple-600" /> },
//     { value: "19", label: "Team Members", trend: "Growing team", icon: <FaUsers className="text-orange-600" /> }
//   ];

//   const features = [
//     {
//       title: "Contact Management",
//       description: "Organize and manage all your client data with advanced filtering and segmentation tools.",
//       icon: <FaUsers />,
//       color: "blue",
//       link: "/management-contacts"
//     },
//     {
//       title: "Sales Pipeline",
//       description: "Track deals from initial contact to closing with customizable pipeline stages.",
//       icon: <FaChartLine />,
//       color: "green",
//       link: "/sales"
//     },
//     {
//       title: "Task Management",
//       description: "Schedule tasks, set reminders, and never miss important follow-ups.",
//       icon: <FaTasks />,
//       color: "purple",
//       link: "/tasks"
//     },
//     {
//       title: "Invoice Management",
//       description: "Create professional invoices, track payments, and manage billing effortlessly.",
//       icon: <FaFileInvoiceDollar />,
//       color: "orange",
//       link: "/invoices"
//     },
//     {
//       title: "Stripe Integration",
//       description: "Secure payment processing with automatic invoice generation and notifications.",
//       icon: <FaCreditCard />,
//       color: "indigo",
//       link: "/stripe-invoices"
//     },
//     {
//       title: "Analytics Dashboard",
//       description: "Comprehensive reporting and analytics to drive data-driven decisions.",
//       icon: <FaChartBar />,
//       color: "pink",
//       link: "/analytics"
//     }
//   ];

//   return (
//     <Layout>
//              {/* Hero Section */}
//        <div className="gradient-bg text-white py-12 sm:py-16 md:py-20 relative overflow-hidden">
//          {/* Background Decorations */}
//          <div className="absolute inset-0 overflow-hidden">
//            <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full bg-white opacity-10 floating-animation"></div>
//            <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-48 h-48 sm:w-96 sm:h-96 rounded-full bg-white opacity-5 floating-animation"></div>
//            <div className="absolute top-1/2 left-1/4 w-16 h-16 sm:w-32 sm:h-32 rounded-full bg-white opacity-10 floating-animation"></div>
//          </div>
         
//          <div className="container mx-auto px-4 sm:px-6 relative z-10">
//            <div className="max-w-4xl mx-auto text-center">
//              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
//                Transform Your <span className="text-yellow-300">Sales Process</span>
//              </h1>
//              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-100 leading-relaxed px-2">
//                Streamline lead management, track sales performance, and boost your team's productivity with our comprehensive CRM platform
//              </p>
//                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
//                {!user ? (
//                  <>
//                    <Link to="/login" className="glassmorphism px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold hover:bg-white hover:bg-opacity-20 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base">
//                      <FaRocket className="mr-2 sm:mr-3" />Get Started Free
//                    </Link>
//                    <button className="bg-white text-gray-800 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-gray-100 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base">
//                      <FaPlay className="mr-2 sm:mr-3" />Watch Demo
//                    </button>
//                  </>
//                ) : (
//                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
//                    <Link to={user.role === "Customer" ? "/customer" : user.role === "Sales Person" ? "/sales" : "/leads"}
//                      className="glassmorphism px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold hover:bg-white hover:bg-opacity-20 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base">
//                      <FaRocket className="mr-2 sm:mr-3" />Go to Dashboard
//                    </Link>
//                    {(user.role === "Admin" || user.role === "Manager") && (
//                      <Link to={user.role === "Admin" ? "/admin" : "/manager"}
//                        className="bg-purple-600 hover:bg-purple-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base">
//                        <FaShieldAlt className="mr-2 sm:mr-3" />{user.role === "Admin" ? "Access Admin Dashboard" : "Access Manager Dashboard"}
//                      </Link>
//                    )}
//                  </div>
//                )}
//              </div>
//           </div>
//         </div>
//       </div>

//              {/* Stats Section */}
//        <div className="py-12 sm:py-16 bg-white relative">
//          <div className="container mx-auto px-4 sm:px-6">
//            {/* TrainCape Logo */}
//            {/* <div className="text-center mb-6 sm:mb-8">
//              <img 
//                src={traincapeLogo} 
//                alt="TrainCape CRM" 
//                className="h-12 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-lg shadow-lg"
//              />
//              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">TrainCape CRM</h3>
//              <p className="text-sm sm:text-base text-gray-600">Your Complete Business Solution</p>
//            </div> */}
           
//            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 -mt-12 sm:-mt-16 relative z-10">
//              {stats.map((stat, index) => (
//                <div key={index} className="stats-card rounded-2xl p-4 sm:p-6 text-center">
//                  <div className="text-2xl sm:text-3xl font-bold mb-2 flex items-center justify-center">
//                    {stat.icon}
//                    <span className="ml-2">{stat.value}</span>
//                  </div>
//                  <div className="text-gray-600 font-medium text-sm sm:text-base">{stat.label}</div>
//                  <div className="text-xs sm:text-sm text-green-500 mt-1">
//                    {stat.trend}
//                  </div>
//                </div>
//              ))}
//            </div>
//          </div>
//        </div>

//              {/* Features Section */}
//        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100">
//          <div className="container mx-auto px-4 sm:px-6">
//            <div className="text-center mb-12 sm:mb-16">
//              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Powerful Features</h2>
//              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">Everything you need to manage your sales pipeline effectively</p>
//            </div>
           
//            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
//              {features.map((feature, index) => (
//                <div key={index} className="bg-white rounded-2xl p-6 sm:p-8 hover-scale neon-border">
//                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6`}>
//                    <div className="text-white text-xl sm:text-2xl">{feature.icon}</div>
//                  </div>
//                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">{feature.title}</h3>
//                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{feature.description}</p>
//                  <Link to={feature.link} className={`text-${feature.color}-600 font-semibold hover:text-${feature.color}-700 transition flex items-center text-sm sm:text-base`}>
//                    Learn More <FaRocket className="ml-2" />
//                  </Link>
//                </div>
//              ))}
//            </div>
//          </div>
//        </section>

//              {/* Role-based Access Section */}
//        <section className="py-12 sm:py-16 md:py-20 bg-white">
//          <div className="container mx-auto px-4 sm:px-6">
//            <div className="text-center mb-12 sm:mb-16">
//              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Role-Based Access Control</h2>
//              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
//                Secure, permission-based access ensures each team member has the right tools for their role
//              </p>
//            </div>
           
//            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
//              {/* Role cards */}
//              {[
//                {
//                  role: "Lead Person",
//                  color: "blue",
//                  icon: <FaUsers />,
//                  features: [
//                    "Create and manage leads",
//                    "Assign leads to team members",
//                    "Track lead progress and status",
//                    "Generate lead reports"
//                  ]
//                },
//                {
//                  role: "Sales Person",
//                  color: "green",
//                  icon: <FaChartLine />,
//                  features: [
//                    "Access assigned leads",
//                    "Update lead status and notes",
//                    "Schedule and track activities",
//                    "Create invoices and quotes"
//                  ]
//                },
//                {
//                  role: "Manager/Admin",
//                  color: "purple",
//                  icon: <FaShieldAlt />,
//                  features: [
//                    "Full system access",
//                    "View all leads and sales",
//                    "Manage team and permissions",
//                    "Advanced analytics and reports"
//                  ]
//                }
//              ].map((role, index) => (
//                <div key={index} className={`bg-gradient-to-br from-${role.color}-50 to-${role.color}-100 rounded-2xl p-6 sm:p-8 border-2 border-${role.color}-200`}>
//                  <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-${role.color}-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto`}>
//                    <div className="text-white text-xl sm:text-2xl">{role.icon}</div>
//                  </div>
//                  <h3 className={`text-xl sm:text-2xl font-bold text-${role.color}-800 mb-3 sm:mb-4 text-center`}>{role.role}</h3>
//                  <ul className="space-y-2 sm:space-y-3">
//                    {role.features.map((feature, featureIndex) => (
//                      <li key={featureIndex} className="flex items-start">
//                        <FaRocket className="text-green-500 mt-1 mr-2 sm:mr-3 flex-shrink-0" />
//                        <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
//                      </li>
//                    ))}
//                  </ul>
                 
//                                    {/* Add button for Manager/Admin role card */}
//                   {role.role === "Manager/Admin" && user && (user.role === "Admin" || user.role === "Manager") && (
//                     <div className="mt-6 pt-4 border-t border-purple-200">
//                       <Link 
//                         to="/manager"
//                         className={`w-full bg-${role.color}-600 hover:bg-${role.color}-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center text-sm sm:text-base`}
//                       >
//                         <FaShieldAlt className="mr-2" />
//                         Access Manager Dashboard
//                       </Link>
//                     </div>
//                   )}
//                </div>
//              ))}
//            </div>
//          </div>
//        </section>

//              {/* CTA Section */}
//        <section className="gradient-bg text-white py-12 sm:py-16 md:py-20 relative overflow-hidden">
//          <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
//            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Ready to Transform Your Sales?</h2>
//            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-gray-100 max-w-2xl mx-auto px-2">
//              Join thousands of teams who have streamlined their sales process with TrainCape CRM
//            </p>
           
//            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
//              {!user ? (
//                <>
//                  <Link to="/login" className="glassmorphism px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold hover:bg-white hover:bg-opacity-20 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base">
//                    <FaRocket className="mr-2 sm:mr-3" />Start Free Trial
//                  </Link>
//                  <button className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-white hover:text-gray-800 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base">
//                    <FaPlay className="mr-2 sm:mr-3" />Schedule Demo
//                  </button>
//                </>
//              ) : (
//                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
//                  <Link to={user.role === "Customer" ? "/customer" : user.role === "Sales Person" ? "/sales" : "/leads"}
//                    className="glassmorphism px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold hover:bg-white hover:bg-opacity-20 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base">
//                    <FaRocket className="mr-2 sm:mr-3" />Access Dashboard
//                  </Link>
//                  {(user.role === "Admin" || user.role === "Manager") && (
//                    <Link to={user.role === "Admin" ? "/admin" : "/manager"}
//                      className="bg-purple-600 hover:bg-purple-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base">
//                      <FaShieldAlt className="mr-2 sm:mr-3" />{user.role === "Admin" ? "Access Admin Dashboard" : "Access Manager Dashboard"}
//                    </Link>
//                  )}
//                </div>
//              )}
//            </div>
           
//            {/* Trust Indicators */}
//            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-gray-200">
//              <div className="flex items-center">
//                <FaShieldAlt className="text-green-400 mr-2" />
//                <span className="text-sm sm:text-base">Enterprise Security</span>
//              </div>
//              <div className="flex items-center">
//                <FaClock className="text-blue-400 mr-2" />
//                <span className="text-sm sm:text-base">24/7 Support</span>
//              </div>
//              <div className="flex items-center">
//                <FaChartLine className="text-purple-400 mr-2" />
//                <span className="text-sm sm:text-base">Real-time Analytics</span>
//              </div>
//            </div>
//          </div>
//        </section>

//       {/* Guest Chat Widget */}
//       {!user && <GuestChat />}

      
//     </Layout>
//   );
// };

// export default HomePage;

import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import GuestChat from "../components/Chat/GuestChat";
import {
  FaRocket,
  FaPlay,
  FaUsers,
  FaChartLine,
  FaTasks,
  FaFileInvoiceDollar,
  FaCreditCard,
  FaChartBar,
  FaShieldAlt,
  FaClock,
  FaHistory, // Added FaHistory for consistency with previous changes
} from "react-icons/fa";
import "../styles/homepage.css";

const HomePage = () => {
  const { user } = useAuth();

  const stats = [
    {
      value: "2.5K+",
      label: "Active Leads",
      trend: "+12% this month",
      icon: <FaUsers className="text-blue-600 dark:text-blue-400" />,
      shadowColor: "blue", // Added for dynamic dark mode shadow
    },
    {
      value: "100%",
      label: "Task Completion",
      trend: "On target",
      icon: <FaTasks className="text-green-600 dark:text-green-400" />,
      shadowColor: "green", // Added for dynamic dark mode shadow
    },
    {
      value: "$0.5M",
      label: "Monthly Revenue",
      trend: "+28% increase",
      icon: <FaChartLine className="text-purple-600 dark:text-purple-400" />,
      shadowColor: "purple", // Added for dynamic dark mode shadow
    },
    {
      value: "19",
      label: "Team Members",
      trend: "Growing team",
      icon: <FaUsers className="text-orange-600 dark:text-orange-400" />,
      shadowColor: "orange", // Added for dynamic dark mode shadow
    },
  ];

  const features = [
    {
      title: "Contact Management",
      description:
        "Organize and manage all your client data with advanced filtering and segmentation tools.",
      icon: <FaUsers />,
      color: "blue",
      link: "/management-contacts",
    },
    {
      title: "Sales Pipeline",
      description:
        "Track deals from initial contact to closing with customizable pipeline stages.",
      icon: <FaChartLine />,
      color: "green",
      link: "/sales",
    },
    {
      title: "Task Management",
      description:
        "Schedule tasks, set reminders, and never miss important follow-ups.",
      icon: <FaTasks />,
      color: "purple",
      link: "/tasks",
    },
    {
      title: "Invoice Management",
      description:
        "Create professional invoices, track payments, and manage billing effortlessly.",
      icon: <FaFileInvoiceDollar />,
      color: "orange",
      link: "/invoices",
    },
    {
      title: "Stripe Integration",
      description:
        "Secure payment processing with automatic invoice generation and notifications.",
      icon: <FaCreditCard />,
      color: "indigo",
      link: "/stripe-invoices",
    },
    {
      title: "Analytics Dashboard",
      description:
        "Comprehensive reporting and analytics to drive data-driven decisions.",
      icon: <FaChartBar />,
      color: "pink",
      link: "/admin/reports",
      adminOnly: true, // Add this property
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-hero-light dark:bg-hero-dark text-gray-900 dark:text-white py-12 sm:py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 rounded-full bg-white opacity-10 floating-animation "></div>
          <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-48 h-48 sm:w-96 sm:h-96 rounded-full bg-white opacity-5 floating-animation "></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 sm:w-32 sm:h-32 rounded-full bg-white opacity-10 floating-animation dark:bg-gray-800"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-white dark:text-white">
              Transform Your{" "}
              <span className="text-yellow-300 dark:text-yellow-400">
                Sales Process
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-100 dark:text-gray-300 leading-relaxed px-2">
              Streamline lead management, track sales performance, and boost
              your team's productivity with our comprehensive CRM platform
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="glassmorphism px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold hover:bg-white hover:bg-opacity-20 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base"
                  >
                    <FaRocket className="mr-2 sm:mr-3" />
                    Get Started Free
                  </Link>
                  <button className="bg-white text-gray-900 dark:bg-gray-700 dark:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base">
                    <FaPlay className="mr-2 sm:mr-3" />
                    Watch Demo
                  </button>
                </>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <Link
                    to={
                      user.role === "Customer"
                        ? "/customer"
                        : user.role === "Sales Person"
                        ? "/sales"
                        : (user.role === "IT Manager" || user.role === "IT Intern" || user.role === "IT Permanent")
                        ? "/it"
                        : "/leads"
                    }
                    className="glassmorphism px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold hover:bg-white hover:bg-opacity-20 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base"
                  >
                    <FaRocket className="mr-2 sm:mr-3" />
                    Go to Dashboard
                  </Link>

                  {(user.role === "Admin" || user.role === "Manager") && (
                    <Link
                      to={user.role === "Admin" ? "/admin" : "/manager"}
                      className="bg-black px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base"
                    >
                      <FaShieldAlt className="mr-2 sm:mr-3" />
                      {user.role === "Admin"
                        ? "Access Admin Dashboard"
                        : "Access Manager Dashboard"}
                    </Link>
                  )}

                  {(user.role === "IT Manager" || user.role === "IT Intern" || user.role === "IT Permanent") && (
                    <Link
                      to="/it"
                      className="bg-indigo-600 hover:bg-indigo-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base"
                    >
                      Access IT Dashboard
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 sm:py-16 bg-white dark:bg-gray-900 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-8 lg:px-12 py-6 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-md">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`
                  rounded-2xl p-4 sm:p-6 text-center
                  bg-white dark:bg-gray-700 // Changed bg-gray-50 dark:bg-gray-100 to bg-white dark:bg-gray-700
                  shadow-md hover:shadow-lg
                  dark:shadow-xl dark:shadow-${stat.shadowColor}-500/20
                  transition-all duration-300
                  transform hover:-translate-y-1 hover:scale-105
                `}
              >
                {/* Number */}
                <div className="text-2xl sm:text-3xl font-bold mb-2 flex items-center justify-center text-gray-900 dark:text-white"> {/* Ensure text is white in dark mode */}
                  {stat.icon}
                  <span className="ml-2">
                    {stat.value}
                  </span>
                </div>

                {/* Label */}
                <div className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base"> {/* Adjust label text color */}
                  {stat.label}
                </div>

                {/* Trend */}
                <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1"> {/* Ensure trend color is responsive */}
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Powerful Features
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto px-2">
              Everything you need to manage your sales pipeline effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features
              .filter(feature => {
                // Show admin-only features only to Admin users
                if (feature.adminOnly && user?.role !== 'Admin') {
                  return false;
                }
                return true;
              })
              .map((feature, index) => (
              <div
                key={index}
                className={`
                  bg-white dark:bg-gray-800
                  rounded-2xl p-6 sm:p-8
                  shadow-md hover:shadow-lg
                  dark:shadow-xl dark:shadow-${feature.color}-500/20
                  transition-all duration-300
                  transform hover:-translate-y-1 hover:scale-105
                  flex flex-col justify-between
                `}
              >
                <div className="flex items-center space-x-4 mb-4 sm:mb-6">
                  <div
                    className={`min-w-[3rem] min-h-[3rem] sm:min-w-[4rem] sm:min-h-[4rem] bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 rounded-2xl flex items-center justify-center`}
                  >
                    <div className="text-white text-xl sm:text-2xl">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base mb-6">
                  {feature.description}
                </p>

                <div className="flex justify-center">
                  <Link
                    to={feature.link}
                    className={`text-${feature.color}-600 dark:text-${feature.color}-400 font-semibold hover:text-${feature.color}-700 dark:hover:text-${feature.color}-300 transition flex items-center text-sm sm:text-base`}
                  >
                    Learn More <FaRocket className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-based Access Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Role-Based Access Control
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto px-2">
              Secure, permission-based access ensures each team member has the
              right tools for their role
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                role: "Lead Person",
                color: "blue",
                icon: <FaUsers />,
                features: [
                  "Create and manage leads",
                  "Assign leads to team members",
                  "Track lead progress and status",
                  "Generate lead reports",
                ],
              },
              {
                role: "Sales Person",
                color: "green",
                icon: <FaChartLine />,
                features: [
                  "Access assigned leads",
                  "Update lead status and notes",
                  "Schedule and track activities",
                  "Create invoices and quotes",
                ],
              },
              {
                role: "Manager/Admin",
                color: "purple",
                icon: <FaShieldAlt />,
                features: [
                  "Full system access",
                  "View all leads and sales",
                  "Manage team and permissions",
                  "Advanced analytics and reports",
                ],
              },
            ].map((role, index) => (
              <div
                key={index}
                className={`
                  bg-white dark:bg-gray-800
                  rounded-2xl p-6 sm:p-8
                  border-2 border-${role.color}-200 dark:border-${role.color}-800
                  shadow-md hover:shadow-lg
                  dark:shadow-xl dark:shadow-${role.color}-500/20
                  transition-all duration-300
                  transform hover:-translate-y-1 hover:scale-105
                `}
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 bg-${role.color}-500 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto`}
                >
                  <div className="text-white text-xl sm:text-2xl">
                    {role.icon}
                  </div>
                </div>
                <h3
                  className={`text-xl sm:text-2xl font-bold text-${role.color}-800 dark:text-${role.color}-400 mb-3 sm:mb-4 text-center`}
                >
                  {role.role}
                </h3>

                <ul className="space-y-2 sm:space-y-3">
                  {role.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <FaRocket className="text-green-600 dark:text-green-400 mt-1 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="text-gray-900 dark:text-white text-sm sm:text-base">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {role.role === "Manager/Admin" &&
                  user &&
                  (user.role === "Admin" || user.role === "Manager") && (
                    <div className="mt-6 pt-4 border-t border-purple-200 dark:border-purple-800">
                      <Link
                        to="/manager"
                        className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-800 dark:hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center text-sm sm:text-base"
                      >
                        <FaShieldAlt className="mr-2" />
                        {"Access Manager Dashboard"}
                      </Link>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-hero-light dark:bg-hero-dark text-white py-12 sm:py-16 md:py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white">
            Ready to Transform Your Sales?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white max-w-2xl mx-auto px-2">
            Join thousands of teams who have streamlined their sales process
            with TrainCape CRM
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="bg-black px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold hover:bg-gray-900 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base"
                >
                  <FaRocket className="mr-2 sm:mr-3" />
                  Start Free Trial
                </Link>
                <button className="bg-black px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold hover:bg-gray-900 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base">
                  <FaPlay className="mr-2 sm:mr-3" />
                  Schedule Demo
                </button>
              </>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                {/* <Link
                  to="/dashboard"
                  className="bg-black px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold hover:bg-gray-900 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base"
                >
                  <FaRocket className="mr-2 sm:mr-3" />
                  Access Dashboard
                </Link> */}
                {(user.role === "Admin" || user.role === "Manager") && (
                  <Link
                    to={user.role === "Admin" ? "/admin" : "/manager"}
                    className="bg-black px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold hover:bg-gray-900 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base"
                  >
                    <FaShieldAlt className="mr-2 sm:mr-3" />
                    {user.role === "Admin"
                      ? "Access Admin Dashboard"
                      : "Access Manager Dashboard"}
                  </Link>
                )}

                {(user.role === "IT Manager" || user.role === "IT Intern" || user.role === "IT Permanent") && (
                  <Link
                    to="/it"
                    className="bg-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-white font-semibold hover:bg-indigo-700 transition duration-300 w-full sm:w-auto flex items-center justify-center text-sm sm:text-base"
                  >
                    Access IT Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 text-white text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-green-400" />
              <span>Enterprise-grade Security</span>
            </div>
            <div className="flex items-center gap-2">
              <FaClock className="text-blue-400" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <FaChartLine className="text-purple-400" />
              <span>Performance Analytics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Chat */}
      {!user && <GuestChat />}
    </Layout>
  );
};

export default HomePage;