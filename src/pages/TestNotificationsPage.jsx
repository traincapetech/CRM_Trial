import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import { toast } from 'react-hot-toast';
import notificationService from '../services/notificationService';

import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
const TestNotificationsPage = () => {
  const { user } = useAuth();
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Check connection status
  useEffect(() => {
    const checkStatus = () => {
      const status = notificationService.getStatus();
      setConnectionStatus(status);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch upcoming exams
  const fetchUpcomingExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-exam/upcoming-exams');
      const data = await response.json();
      
      if (data.success) {
        setUpcomingExams(data.data);
      } else {
        toast.error('Failed to fetch upcoming exams');
      }
    } catch (error) {
      console.error('Error fetching upcoming exams:', error);
      toast.error('Error fetching upcoming exams');
    } finally {
      setLoading(false);
    }
  };

  // Create test exam
  const createTestExam = async (minutesFromNow = 11) => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-exam/create-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course: `React Development ${Date.now()}`,
          minutesFromNow: minutesFromNow,
          userEmail: user.email
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchUpcomingExams();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error creating test exam:', error);
      toast.error('Error creating test exam');
    } finally {
      setLoading(false);
    }
  };

  // Trigger notifications manually
  const triggerNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-exam/trigger-notifications', {
        method: 'POST'
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Notification check triggered!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error triggering notifications:', error);
      toast.error('Error triggering notifications');
    } finally {
      setLoading(false);
    }
  };

  // Clean up test exams
  const cleanupTestExams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test-exam/cleanup-test-exams', {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchUpcomingExams();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error cleaning up test exams:', error);
      toast.error('Error cleaning up test exams');
    } finally {
      setLoading(false);
    }
  };

  // Test audio notification
  const testAudio = () => {
    notificationService.playNotificationSound();
    toast.success('🔊 Audio test played!');
  };

  // Request notification permission
  const requestPermission = async () => {
    const granted = await notificationService.requestNotificationPermission();
    if (granted) {
      toast.success('✅ Notification permission granted!');
    } else {
      toast.error('❌ Notification permission denied');
    }
  };

  useEffect(() => {
    fetchUpcomingExams();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">🧪 Exam Notification Testing</h1>
          
          {/* Connection Status */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">📡 Connection Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-full ${connectionStatus?.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-medium">WebSocket:</span>
                <span className={connectionStatus?.isConnected ? 'text-green-600' : 'text-red-600'}>
                  {connectionStatus?.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">User ID:</span>
                <span className="text-gray-600 dark:text-gray-500">{connectionStatus?.userId || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">🎮 Test Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => createTestExam(11)}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                📝 Create Test Exam (11 min)
              </button>
              
              <button
                onClick={() => createTestExam(2)}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                ⚡ Quick Test (2 min)
              </button>
              
              <button
                onClick={triggerNotifications}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                🔔 Trigger Notifications
              </button>
              
              <button
                onClick={testAudio}
                disabled={loading}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                🔊 Test Audio
              </button>
              
              <button
                onClick={requestPermission}
                disabled={loading}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                🔔 Request Permission
              </button>
              
              <button
                onClick={cleanupTestExams}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                🗑️ Cleanup Test Exams
              </button>
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">📅 Upcoming Exams</h2>
              <button
                onClick={fetchUpcomingExams}
                disabled={loading}
                className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out0 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                🔄 Refresh
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : upcomingExams.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-gray-400">
                <p>No upcoming exams found</p>
                <p className="text-sm mt-2">Create a test exam to see notifications in action!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Exam Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Minutes Until</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Reminder Sent</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-slate-200 dark:divide-slate-700">
                    {upcomingExams.map((exam) => (
                      <tr key={exam.id} className={exam.minutesUntilExam <= 10 ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                          {exam.course}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                          {new Date(exam.examDateTime).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                          {exam.assignedTo?.name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            exam.minutesUntilExam <= 10 
                              ? 'bg-red-100 text-red-800' 
                              : exam.minutesUntilExam <= 30 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {exam.minutesUntilExam} min
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            exam.reminderSent 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
                          }`}>
                            {exam.reminderSent ? '✅ Sent' : '⏳ Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 How to Test</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Click "Request Permission" to enable browser notifications</li>
              <li>Create a test exam using "Create Test Exam (11 min)" - this will trigger a notification in 1 minute</li>
              <li>For immediate testing, use "Quick Test (2 min)" and then "Trigger Notifications"</li>
              <li>Watch for:</li>
              <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                <li>🔊 Audio beep sounds</li>
                <li>🍞 Toast notifications in the app</li>
                <li>🖥️ Browser notifications (if permission granted)</li>
                <li>📧 Email notifications (check your email)</li>
              </ul>
              <li>Use "Cleanup Test Exams" to remove test data when done</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TestNotificationsPage; 