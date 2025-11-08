import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import NotificationSettings from './NotificationSettings';
import ChatSoundTest from './ChatSoundTest';
import './ChatWindow.css';

const ChatWindow = () => {
  const { user } = useAuth();
  const {
    isConnected,
    onlineUsers,
    chatRooms,
    activeChat,
    messages,
    unreadCounts,
    typingUsers,
    isChatOpen,
    sendMessage,
    sendTypingIndicator,
    fetchChatRooms,
    fetchAllUsers,
    startChat,
    closeChat,
    setIsChatOpen,
    getTotalUnreadCount
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showSoundTest, setShowSoundTest] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  // Fetch initial data
  useEffect(() => {
    if (isConnected) {
      fetchChatRooms();
      fetchAllUsers();
    }
  }, [isConnected]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && activeChat) {
      sendMessage(activeChat.otherUser._id, messageInput.trim());
      setMessageInput('');
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    // Send typing indicator
    if (activeChat) {
      sendTypingIndicator(activeChat.otherUser._id, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(activeChat.otherUser._id, false);
      }, 1000);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastSeen = (lastSeen) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return lastSeenDate.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE': return '#10b981';
      case 'AWAY': return '#f59e0b';
      case 'OFFLINE': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const filteredUsers = onlineUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMessages = activeChat ? messages[activeChat.chatId] || [] : [];
  const totalUnreadCount = getTotalUnreadCount();

  if (!isChatOpen) {
    return (
      <div className="chat-toggle-button" onClick={() => setIsChatOpen(true)}>
        <i className="fas fa-comments"></i>
        {totalUnreadCount > 0 && (
          <span className="unread-badge">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-left">
          <h3>
            <i className="fas fa-comments"></i>
            Chat
            {totalUnreadCount > 0 && (
              <span className="header-unread-count">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </h3>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            {isConnected ? 'Connected' : 'Connecting...'}
            {!isConnected && (
              <button 
                className="retry-connection"
                onClick={() => window.location.reload()}
                title="Retry connection"
              >
                🔄
              </button>
            )}
          </div>
        </div>
        <div className="chat-header-actions">
          <button 
            className="btn-icon"
            onClick={() => setShowSoundTest(true)}
            title="Test notification sounds"
          >
            <i className="fas fa-volume-up"></i>
            <span className="btn-text">🔊</span>
          </button>
          <button 
            className="btn-icon"
            onClick={() => setShowNotificationSettings(true)}
            title="Notification settings"
          >
            <i className="fas fa-bell"></i>
            <span className="btn-text">🔔</span>
          </button>
          <button 
            className="btn-icon"
            onClick={() => setShowUserList(!showUserList)}
            title="Start new chat"
          >
            <i className="fas fa-plus"></i>
            <span className="btn-text">➕</span>
          </button>
          <button 
            className="btn-icon"
            onClick={() => setIsChatOpen(false)}
            title="Minimize chat"
          >
            <i className="fas fa-minus"></i>
            <span className="btn-text">➖</span>
          </button>
        </div>
      </div>

      <div className="chat-body">
        {/* User List Sidebar */}
        {showUserList && (
          <div className="user-list-sidebar">
            <div className="user-list-header">
              <h4>Start New Chat</h4>
              <button 
                className="btn-close"
                onClick={() => setShowUserList(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="user-search">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="user-list">
              {filteredUsers.map(u => (
                <div 
                  key={u._id}
                  className="user-item"
                  onClick={() => {
                    startChat(u);
                    setShowUserList(false);
                  }}
                >
                  <div className="user-avatar">
                    {u.profilePicture ? (
                      <img src={u.profilePicture} alt={u.fullName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(u.status || u.chatStatus) }}
                    ></div>
                  </div>
                  <div className="user-info">
                    <div className="user-name">{u.fullName}</div>
                    <div className="user-role">{u.role}</div>
                    <div className="user-status">
                      {u.status === 'ONLINE' || u.chatStatus === 'ONLINE' 
                        ? 'Online' 
                        : u.lastSeen 
                          ? `Last seen ${formatLastSeen(u.lastSeen)}`
                          : 'Offline'
                      }
                    </div>
                  </div>
                  {unreadCounts[u._id] > 0 && (
                    <div className="user-unread-count">
                      {unreadCounts[u._id] > 99 ? '99+' : unreadCounts[u._id]}
                    </div>
                  )}
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="no-users">
                  {searchTerm ? 'No users found' : 'Loading users...'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Content */}
        <div className="chat-content">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="active-chat-header">
                <div className="chat-user-info">
                  <div className="chat-user-avatar">
                    {activeChat.otherUser.profilePicture ? (
                      <img src={activeChat.otherUser.profilePicture} alt={activeChat.otherUser.fullName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {activeChat.otherUser.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div 
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(activeChat.otherUser.status || activeChat.otherUser.chatStatus) }}
                    ></div>
                  </div>
                  <div className="chat-user-details">
                    <div className="chat-user-name">{activeChat.otherUser.fullName}</div>
                    <div className="chat-user-status">
                      {typingUsers[activeChat.otherUser._id] ? (
                        <span className="typing-indicator">
                          <i className="fas fa-ellipsis-h"></i>
                          Typing...
                        </span>
                      ) : (
                        <span>
                          {activeChat.otherUser.status === 'ONLINE' || activeChat.otherUser.chatStatus === 'ONLINE' 
                            ? 'Online' 
                            : activeChat.otherUser.lastSeen 
                              ? `Last seen ${formatLastSeen(activeChat.otherUser.lastSeen)}`
                              : 'Offline'
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  className="btn-close-chat"
                  onClick={closeChat}
                  title="Close chat"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {currentMessages.length === 0 ? (
                  <div className="no-messages">
                    <i className="fas fa-comments"></i>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  currentMessages.map((message) => (
                    <div 
                      key={message._id}
                      className={`message ${message.senderId._id === user._id ? 'sent' : 'received'} ${message.isOptimistic ? 'optimistic' : ''}`}
                    >
                      <div className="message-content">
                        <div className="message-text">{message.content}</div>
                        <div className="message-meta">
                          <span className="message-time">{formatTime(message.timestamp)}</span>
                          {message.senderId._id === user._id && (
                            <span className="message-status">
                              {message.isOptimistic ? (
                                <i className="fas fa-clock" title="Sending..."></i>
                              ) : message.delivered ? (
                                <i className="fas fa-check-double" title="Delivered"></i>
                              ) : (
                                <i className="fas fa-check" title="Sent"></i>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="message-input-form">
                <div className="message-input-container">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="message-input"
                    disabled={!isConnected}
                  />
                  <button 
                    type="submit"
                    className="send-button"
                    disabled={!messageInput.trim() || !isConnected}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="chat-welcome">
              <div className="welcome-content">
                <i className="fas fa-comments"></i>
                {/* <h3>Welcome to Chat</h3> */}
                {/* <p>Select a user to start chatting, or click the + button to browse available users.</p> */}
                <div className="welcome-stats">
                  <div className="stat">
                    <span className="stat-number">{onlineUsers.length}</span>
                    <span className="stat-label">Users Online</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{chatRooms.length}</span>
                    <span className="stat-label">Active Chats</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{totalUnreadCount}</span>
                    <span className="stat-label">Unread Messages</span>
                  </div>
                </div>
                
                {/* Quick Test Button */}
                {/* <div className="mt-6">
                  <button
                    onClick={() => setShowSoundTest(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    🔊 Test WhatsApp-Style Notifications
                  </button>
                </div> */}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Settings Modal */}
      <NotificationSettings 
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />

      {/* Sound Test Modal */}
      <ChatSoundTest 
        isOpen={showSoundTest}
        onClose={() => setShowSoundTest(false)}
      />
    </div>
  );
};

export default ChatWindow; 