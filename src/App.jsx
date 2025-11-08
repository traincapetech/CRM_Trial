// // src/App.jsx
// import React, { useEffect } from "react";
// import { HashRouter as Router } from "react-router-dom";
// import AllRoutes from "./routes/AllRoutes";
// import "./App.css";
// import { AuthProvider, useAuth } from "./context/AuthContext";
// import { ChatProvider } from "./context/ChatContext";
// import { Toaster } from 'react-hot-toast';
// import ChatWindow from "./components/Chat/ChatWindow";
// import ChatDebug from "./components/Chat/ChatDebug";
// import notificationService from "./services/notificationService";
// import DocumentationPage from './pages/DocumentationPage';
// import MagicLoader from "./components/lightswind/magic-loader";

// // Component to handle notification service initialization
// const NotificationHandler = () => {
//   const { user } = useAuth();

//   useEffect(() => {
//     if (user && user._id) {
//       console.log('🔔 Initializing notifications for user:', user.fullName);
      
//       // Connect to notification service
//       notificationService.connect(user._id);
      
//       // Request notification permission
//       notificationService.requestNotificationPermission();
      
//       // Cleanup on unmount
//       return () => {
//         notificationService.disconnect();
//       };
//     }
//   }, [user]);

//   return null; // This component doesn't render anything
// };

// const App = () => {
//   useEffect(() => {
//     document.title = 'Traincape Technology CRM';
//   }, []);
//   return (
//     <Router>
//       <AuthProvider>
//         <ChatProvider>
//           <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-200 ease-out">
//             <NotificationHandler />
//             <AllRoutes />
//             <ChatWindow />
//             <ChatDebug />
//             <Toaster 
//               position="top-right"
//               toastOptions={{
//                 duration: 4000,
//                 style: {
//                   background: '#363636',
//                   color: '#fff',
//                 },
//                 success: {
//                   duration: 3000,
//                   iconTheme: {
//                     primary: '#4ade80',
//                     secondary: '#fff',
//                   },
//                 },
//                 error: {
//                   duration: 5000,
//                   iconTheme: {
//                     primary: '#ef4444',
//                     secondary: '#fff',
//                   },
//                 },
//               }}
//             />
//           </div>
//         </ChatProvider>
//       </AuthProvider>
//     </Router>
//   );
// };

// export default App;

// src/App.jsx
import React, { useEffect } from "react";
import { HashRouter as Router } from "react-router-dom";
import AllRoutes from "./routes/AllRoutes";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { Toaster } from 'react-hot-toast';
import ChatWindow from "./components/Chat/ChatWindow";
import ChatDebug from "./components/Chat/ChatDebug";
import notificationService from "./services/notificationService";
import DocumentationPage from './pages/DocumentationPage';
import MagicLoader from "./components/lightswind/magic-loader";

// Component to handle notification service initialization
const NotificationHandler = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      console.log('🔔 Initializing notifications for user:', user.fullName);
      
      // Connect to notification service
      notificationService.connect(user._id);
      
      // Request notification permission
      notificationService.requestNotificationPermission();
      
      // Cleanup on unmount
      return () => {
        notificationService.disconnect();
      };
    }
  }, [user]);

  return null; // This component doesn't render anything
};

const App = () => {
  useEffect(() => {
    document.title = 'Traincape Technology CRM';
  }, []);
  return (
    <Router>
      <AuthProvider>
        <ChatProvider>
         <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all duration-200 ease-out">

            <NotificationHandler />
            <AllRoutes />
            <ChatWindow />
            <ChatDebug />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </ChatProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;