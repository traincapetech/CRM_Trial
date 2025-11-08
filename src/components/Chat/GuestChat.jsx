import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { FaPaperPlane, FaTimes, FaComments } from 'react-icons/fa';
import './GuestChat.css';

const GuestChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    phone: '',
    isInfoProvided: false
  });
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [supportTeam, setSupportTeam] = useState([]);
  const [selectedSupport, setSelectedSupport] = useState(null);
  const messagesEndRef = useRef(null);
  const guestId = useRef(`guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO connection for guest
  useEffect(() => {
    if (isOpen && !socket) {
      const serverUrl = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:8080';
      
      const newSocket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        query: {
          isGuest: true,
          guestId: guestId.current
        }
      });

      newSocket.on('connect', () => {
        console.log('✅ Guest connected to chat server');
        setIsConnected(true);
        
        // Join guest room
        newSocket.emit('join-guest-room', guestId.current);
        
        // Request available support team
        newSocket.emit('get-support-team');
      });

      newSocket.on('support-team-list', (team) => {
        setSupportTeam(team.filter(member => member.chatStatus === 'ONLINE'));
      });

      newSocket.on('guest-message-received', (message) => {
        setMessages(prev => [...prev, {
          ...message,
          timestamp: new Date(message.timestamp)
        }]);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Guest connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isOpen]);

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    if (guestInfo.name && guestInfo.email) {
      setGuestInfo(prev => ({ ...prev, isInfoProvided: true }));
      
      // Send welcome message
      const welcomeMessage = {
        id: Date.now(),
        content: `Hi ${guestInfo.name}! Thanks for reaching out. How can we help you today?`,
        sender: 'system',
        timestamp: new Date(),
        isSystem: true
      };
      setMessages([welcomeMessage]);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket && selectedSupport) {
      const messageData = {
        guestId: guestId.current,
        guestInfo,
        recipientId: selectedSupport._id,
        content: newMessage.trim(),
        timestamp: new Date()
      };

      // Add message to local state immediately
      const localMessage = {
        id: Date.now(),
        content: newMessage.trim(),
        sender: 'guest',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, localMessage]);

      // Send via socket
      socket.emit('guest-message', messageData);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectSupport = (supportMember) => {
    setSelectedSupport(supportMember);
    const selectionMessage = {
      id: Date.now(),
      content: `You're now connected with ${supportMember.fullName} (${supportMember.role}). They'll respond shortly.`,
      sender: 'system',
      timestamp: new Date(),
      isSystem: true
    };
    setMessages(prev => [...prev, selectionMessage]);
  };

  if (!isOpen) {
    return (
      <div className="guest-chat-button" onClick={() => setIsOpen(true)}>
        <FaComments className="chat-icon" />
        <span className="chat-text">Need Help? Chat Now!</span>
        <div className="chat-pulse"></div>
      </div>
    );
  }

  return (
    <div className="guest-chat-window">
      <div className="guest-chat-header">
        <div className="header-content">
          <FaComments className="header-icon" />
          <div>
            <h3>Live Support Chat</h3>
            <span className={`status ${isConnected ? 'online' : 'offline'}`}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
        <button className="close-button" onClick={() => setIsOpen(false)}>
          <FaTimes />
        </button>
      </div>

      <div className="guest-chat-body">
        {!guestInfo.isInfoProvided ? (
          <div className="guest-info-form">
            <h4>Welcome! Let's get started</h4>
            <p>Please provide your details to begin chatting with our support team:</p>
            <form onSubmit={handleInfoSubmit}>
              <input
                type="text"
                placeholder="Your Name *"
                value={guestInfo.name}
                onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <input
                type="email"
                placeholder="Your Email *"
                value={guestInfo.email}
                onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <input
                type="tel"
                placeholder="Your Phone (Optional)"
                value={guestInfo.phone}
                onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
              />
              <button type="submit" className="start-chat-btn">
                Start Chat
              </button>
            </form>
          </div>
        ) : !selectedSupport ? (
          <div className="support-team-selection">
            <h4>Choose a support team member:</h4>
            {supportTeam.length > 0 ? (
              <div className="support-list">
                {supportTeam.map(member => (
                  <div 
                    key={member._id} 
                    className="support-member"
                    onClick={() => selectSupport(member)}
                  >
                    <div className="member-info">
                      <div className="member-name">{member.fullName}</div>
                      <div className="member-role">{member.role}</div>
                    </div>
                    <div className="online-indicator"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-support">
                <p>No support team members are currently online.</p>
                <p>Please leave your message and we'll get back to you soon!</p>
                <button 
                  className="continue-anyway-btn"
                  onClick={() => setSelectedSupport({ _id: 'offline', fullName: 'Support Team', role: 'Support' })}
                >
                  Continue Anyway
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'guest' ? 'guest-message' : 'support-message'} ${message.isSystem ? 'system-message' : ''}`}
              >
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {guestInfo.isInfoProvided && selectedSupport && (
        <div className="guest-chat-footer">
          <div className="message-input-container">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="message-input"
            />
            <button 
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
              className="send-button"
            >
              <FaPaperPlane />
            </button>
          </div>
          <div className="chat-footer-info">
            <small>Chatting with {selectedSupport.fullName} • {isConnected ? 'Online' : 'Offline'}</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestChat; 