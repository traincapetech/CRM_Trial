import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { FaComments, FaUser, FaEnvelope, FaPhone, FaCalendar } from 'react-icons/fa';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { setIsChatOpen, onlineUsers, unreadCounts } = useChat();
  const [supportTeam, setSupportTeam] = useState([]);

  useEffect(() => {
    // Filter support team members (non-customers)
    const team = onlineUsers.filter(u => u.role !== 'Customer');
    setSupportTeam(team);
  }, [onlineUsers]);

  const totalUnreadMessages = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  const handleStartChat = () => {
    setIsChatOpen(true);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-800 py-8">
        <div className="container mx-auto px-4">
          {/* Welcome Header */}
          <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-black/25 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  Welcome, {user?.fullName}!
                </h1>
                <p className="text-gray-600 dark:text-gray-500 mt-2">
                  Your customer portal - Chat with our team and get support
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-500">Customer ID</div>
                <div className="font-mono text-sm">{user?._id?.slice(-8)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Section */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-black/25 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <FaComments className="mr-2 text-blue-600" />
                    Chat with Support Team
                  </h2>
                  {totalUnreadMessages > 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                      {totalUnreadMessages} new messages
                    </span>
                  )}
                </div>
                
                <div className="text-center py-8">
                  <div className="mb-4">
                    <FaComments className="mx-auto text-6xl text-blue-200" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Need Help? Start a Conversation
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">
                    Our support team is here to help you. Click below to start chatting.
                  </p>
                  <button
                    onClick={handleStartChat}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Open Chat
                  </button>
                </div>

                {/* Support Team Status */}
                {supportTeam.length > 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-400 mb-3">
                      Support Team Online ({supportTeam.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {supportTeam.slice(0, 5).map(member => (
                        <div key={member._id} className="flex items-center bg-green-50 px-3 py-1 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-green-700">{member.fullName}</span>
                          <span className="text-xs text-green-600 ml-1">({member.role})</span>
                        </div>
                      ))}
                      {supportTeam.length > 5 && (
                        <div className="flex items-center bg-gray-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                          <span className="text-sm text-gray-600 dark:text-gray-500">+{supportTeam.length - 5} more</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Info Sidebar */}
            <div className="space-y-6">
              {/* Account Information */}
              <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-black/25 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                  <FaUser className="mr-2 text-blue-600" />
                  Account Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaUser className="text-gray-400 dark:text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-500">Full Name</div>
                      <div className="font-medium">{user?.fullName}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 dark:text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-500">Email</div>
                      <div className="font-medium">{user?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaCalendar className="text-gray-400 dark:text-gray-400 mr-3" />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-500">Member Since</div>
                      <div className="font-medium">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-black/25 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleStartChat}
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg text-left transition-colors"
                  >
                    <FaComments className="inline mr-2" />
                    Start New Chat
                  </button>
                  <button
                    onClick={() => window.location.href = '/profile'}
                    className="w-full bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 text-gray-700 dark:text-gray-400 px-4 py-3 rounded-lg text-left transition-colors"
                  >
                    <FaUser className="inline mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Support Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Need Help?</h3>
                <p className="text-blue-700 text-sm mb-3">
                  Our support team is available to help you with any questions or issues.
                </p>
                <div className="text-sm text-blue-600">
                  <div>📧 Email: support@traincapetech.in</div>
                  <div>🕒 Hours: 9 AM - 6 PM (Mon-Fri)</div>
                  <div>💬 Live Chat: Available now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomerDashboard; 