import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

const ChatDebug = () => {
  const { user, token } = useAuth();
  const { socket, isConnected } = useChat();
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          // background: '#f59e0b',
          // color: 'white',
          // border: 'none',
          // padding: '8px 12px',
          // borderRadius: '4px',
          // fontSize: '12px',
          // cursor: 'pointer',
          // zIndex: 9999
        }}
      >
        {/* 🐛 Debug Chat */}
      </button>
    );
  }

  const testConnection = async () => {
    try {
      const isDevelopment = import.meta.env.DEV && import.meta.env.MODE !== 'production';
      const serverUrl = isDevelopment ? 'http://localhost:8080' : 'https://crm-backend-o36v.onrender.com';
      const response = await fetch(`${serverUrl}/api/chat/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`✅ API Connection OK! Found ${data.data.length} users`);
      } else {
        alert(`❌ API Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      alert(`❌ Connection Error: ${error.message}`);
    }
  };

  const testSocketConnection = () => {
    if (socket) {
      socket.emit('test-connection', { message: 'Hello from debug' });
      alert('✅ Socket test message sent');
    } else {
      alert('❌ No socket connection available');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('Chat Notifications Enabled!', {
          body: 'You will now receive chat notifications.',
          icon: '/favicon.ico'
        });
        alert('✅ Notifications enabled!');
      } else {
        alert('❌ Notifications denied');
      }
    } else {
      alert('❌ Notifications not supported');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid #ccc',
      borderRadius: '8px',
      padding: '15px',
      zIndex: 9999,
      minWidth: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>🐛 Chat Debug</h3>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>User:</strong> {user?.fullName || 'Not logged in'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Token:</strong> {token ? '✅ Present' : '❌ Missing'}
        {token && (
          <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
            {token.substring(0, 20)}...
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Socket:</strong> {socket ? '✅ Created' : '❌ Not created'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Connected:</strong> {isConnected ? '✅ Yes' : '❌ No'}
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <strong>Server URL:</strong> {import.meta.env.DEV && import.meta.env.MODE !== 'production' ? 'http://localhost:8080' : 'https://crm-backend-o36v.onrender.com'}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={testConnection}
          style={{
            padding: '8px 12px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test API Connection
        </button>
        
        <button 
          onClick={testSocketConnection}
          style={{
            padding: '8px 12px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Socket Connection
        </button>
        
        <button 
          onClick={requestNotificationPermission}
          style={{
            padding: '8px 12px',
            background: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Request Permission
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 12px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
      
      <div style={{ marginTop: '12px', fontSize: '11px', color: '#6b7280' }}>
        💡 Check browser console for detailed logs
      </div>
    </div>
  );
};

export default ChatDebug; 