import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import notificationService from '../services/notificationService';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    enableSounds: true,
    messageSound: 'message',
    volume: 0.3,
    enableBrowserNotifications: true,
    enableToastNotifications: true
  });
  
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef({});

  // Initialize Socket.IO connection
  useEffect(() => {
    if (user && token) {
      // Always use production URL
      const apiUrl = 'https://crm-backend-o36v.onrender.com/api';
      const serverUrl = apiUrl.replace('/api', ''); // Remove /api for socket connection
      console.log('🔌 Connecting to chat server:', serverUrl);
      console.log('👤 User:', user.fullName, 'Role:', user.role);
      console.log('🔑 Token present:', !!token);
      
      const newSocket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5,
        auth: {
          token: token
        },
        query: {
          userId: user._id,
          userRole: user.role
        }
      });

      newSocket.on('connect', () => {
        console.log('✅ Connected to chat server');
        setIsConnected(true);
        
        // Join user room for targeted messages
        newSocket.emit('join-user-room', user._id);
        console.log('📡 Joined user room:', user._id);
        
        // Update user status to online
        updateUserStatus('ONLINE');
        
        // Fetch initial data
        fetchAllUsers();
        fetchChatRooms();
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setIsConnected(false);
        
        // Show user-friendly error message
        toast.error('Failed to connect to chat server. Please refresh the page.');
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from chat server:', reason);
        setIsConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          newSocket.connect();
        }
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected to chat server, attempt:', attemptNumber);
        setIsConnected(true);
        // Rejoin user room after reconnection
        newSocket.emit('join-user-room', user._id);
        updateUserStatus('ONLINE');
        
        toast.success('Reconnected to chat server');
      });

      // Handle new messages
      newSocket.on('newMessage', (message) => {
        console.log('📨 New message received:', message);
        
        setMessages(prev => ({
          ...prev,
          [message.chatId]: [...(prev[message.chatId] || []), message]
        }));

        // Update unread count if not in active chat
        if (!activeChat || activeChat.chatId !== message.chatId) {
          setUnreadCounts(prev => ({
            ...prev,
            [message.senderId._id]: (prev[message.senderId._id] || 0) + 1
          }));
        }

        // Update chat rooms with latest message
        setChatRooms(prev => prev.map(room => 
          room.chatId === message.chatId 
            ? { ...room, lastMessage: message.content, lastMessageTime: message.timestamp }
            : room
        ));
      });

      // Handle message notifications - integrated with notification service
      newSocket.on('messageNotification', (notification) => {
        console.log('🔔 Message notification received:', notification);
        
        // The notification service will handle this automatically
        // But we can also add local logic here if needed
        
        // Only show local toast if chat window is not open or not focused on sender
        if (!isChatOpen || (activeChat && activeChat.otherUser._id !== notification.senderId)) {
          
          // Check user preferences before showing notifications
          if (notificationPreferences.enableToastNotifications) {
            const message = notification.isGuest 
              ? `👤 ${notification.senderName}: ${notification.content.substring(0, 50)}${notification.content.length > 50 ? '...' : ''}`
              : `💬 ${notification.senderName}: ${notification.content.substring(0, 50)}${notification.content.length > 50 ? '...' : ''}`;

            toast(message, {
              icon: notification.isGuest ? '👤' : '💬',
              duration: 5000,
              position: 'top-right',
              style: {
                background: notification.isGuest ? '#fef3c7' : '#f3f4f6',
                color: notification.isGuest ? '#92400e' : '#1f2937',
                border: notification.isGuest ? '1px solid #d97706' : '1px solid #d1d5db'
              },
              onClick: () => {
                // Find and start chat with sender
                if (notification.senderId) {
                  const sender = onlineUsers.find(u => u._id === notification.senderId);
                  if (sender) {
                    startChat(sender);
                  }
                }
              }
            });
          }
        }
      });

      // Handle user status updates
      newSocket.on('userStatusUpdate', (statusUpdate) => {
        console.log('👤 User status update received:', statusUpdate);
        
        setOnlineUsers(prev => prev.map(user => 
          user._id === statusUpdate.userId 
            ? { ...user, status: statusUpdate.status, lastSeen: statusUpdate.lastSeen }
            : user
        ));
      });

      // Handle typing indicators
      newSocket.on('typing', (typingData) => {
        console.log('✍️ Typing indicator received:', typingData);
        
        setTypingUsers(prev => ({
          ...prev,
          [typingData.senderId]: typingData.isTyping
        }));

        // Clear typing indicator after timeout
        if (typingData.isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => ({
              ...prev,
              [typingData.senderId]: false
            }));
          }, 3000);
        }
      });

      // Handle message delivery confirmations
      newSocket.on('messageDelivered', (deliveryData) => {
        console.log('✅ Message delivered:', deliveryData);
        
        // Update message status in local state
        setMessages(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(chatId => {
            updated[chatId] = updated[chatId].map(msg => 
              msg._id === deliveryData._id 
                ? { ...msg, delivered: true, isOptimistic: false }
                : msg
            );
          });
          return updated;
        });
      });

      // Handle message errors
      newSocket.on('messageError', (errorData) => {
        console.error('❌ Message error:', errorData);
        
        toast.error(`Failed to send message: ${errorData.error}`);
        
        // Remove optimistic message from state
        setMessages(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(chatId => {
            updated[chatId] = updated[chatId].filter(msg => !msg.isOptimistic);
          });
          return updated;
        });
      });

      setSocket(newSocket);
      socketRef.current = newSocket;

      return () => {
        console.log('🔌 Cleaning up socket connection');
        newSocket.close();
        setSocket(null);
        socketRef.current = null;
      };
    }
  }, [user, token]);

  // Clean up typing timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(typingTimeoutRef.current).forEach(clearTimeout);
    };
  }, []);

  // Listen for focus chat window events from notification service
  useEffect(() => {
    const handleFocusChatWindow = () => {
      setIsChatOpen(true);
    };

    window.addEventListener('focusChatWindow', handleFocusChatWindow);
    
    return () => {
      window.removeEventListener('focusChatWindow', handleFocusChatWindow);
    };
  }, []);

  // Load notification preferences from localStorage
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const saved = localStorage.getItem('chatNotificationPreferences');
        if (saved) {
          const preferences = JSON.parse(saved);
          setNotificationPreferences(prev => ({ ...prev, ...preferences }));
        }
      } catch (error) {
        console.warn('Error loading chat notification preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Save notification preferences to localStorage
  const saveNotificationPreferences = (preferences) => {
    try {
      localStorage.setItem('chatNotificationPreferences', JSON.stringify(preferences));
      setNotificationPreferences(prev => ({ ...prev, ...preferences }));
      
      // Update notification service preferences
      notificationService.updatePreferences(preferences);
      
      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Error saving chat notification preferences:', error);
      toast.error('Failed to save notification preferences');
    }
  };

  // Send message with enhanced feedback
  const sendMessage = (recipientId, content, messageType = 'text') => {
    if (socket && user) {
      const messageData = {
        senderId: user._id,
        recipientId,
        content,
        messageType
      };

      console.log('📤 Sending message:', messageData);
      socket.emit('sendMessage', messageData);

      // Optimistically add message to local state
      const chatId = [user._id, recipientId].sort().join('_');
      const optimisticMessage = {
        _id: Date.now().toString(), // Temporary ID
        chatId,
        senderId: user,
        recipientId: { _id: recipientId },
        content,
        messageType,
        timestamp: new Date(),
        isRead: false,
        isOptimistic: true,
        delivered: false
      };

      setMessages(prev => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), optimisticMessage]
      }));

      // Play success sound for sent messages
      if (notificationPreferences.enableSounds) {
        notificationService.playNotificationSound('success');
      }
    }
  };

  // Send typing indicator
  const sendTypingIndicator = (recipientId, isTyping) => {
    if (socket && user) {
      socket.emit('typing', {
        senderId: user._id,
        recipientId,
        isTyping
      });
    }
  };

  // Update user status
  const updateUserStatus = (status) => {
    if (socket && user) {
      socket.emit('updateStatus', {
        userId: user._id,
        status
      });
    }
  };

  // Fetch chat rooms
  const fetchChatRooms = async () => {
    try {
      const isDevelopment = import.meta.env.DEV && import.meta.env.MODE !== 'production';
      const apiUrl = isDevelopment ? 'http://localhost:8080/api' : 'https://crm-backend-o36v.onrender.com/api';
      const response = await fetch(`${apiUrl}/chat/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChatRooms(data.data);
        
        // Set unread counts
        const counts = {};
        data.data.forEach(room => {
          if (room.unreadCount > 0) {
            counts[room.otherUser._id] = room.unreadCount;
          }
        });
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  // Fetch messages for a specific chat
  const fetchMessages = async (roomId) => {
    try {
      const isDevelopment = import.meta.env.DEV && import.meta.env.MODE !== 'production';
      const apiUrl = isDevelopment ? 'http://localhost:8080/api' : 'https://crm-backend-o36v.onrender.com/api';
      const response = await fetch(`${apiUrl}/chat/messages/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const chatId = [user._id, roomId].sort().join('_');
        setMessages(prev => ({
          ...prev,
          [chatId]: data.data
        }));

        // Clear unread count for this user
        setUnreadCounts(prev => ({
          ...prev,
          [roomId]: 0
        }));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch all users for chat
  const fetchAllUsers = async () => {
    try {
      const isDevelopment = import.meta.env.DEV && import.meta.env.MODE !== 'production';
      const apiUrl = isDevelopment ? 'http://localhost:8080/api' : 'https://crm-backend-o36v.onrender.com/api';
      const response = await fetch(`${apiUrl}/chat/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOnlineUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Start chat with user
  const startChat = async (otherUser) => {
    console.log('🚀 Starting chat with:', otherUser.fullName);
    
    setActiveChat({
      chatId: [user._id, otherUser._id].sort().join('_'),
      otherUser
    });
    
    await fetchMessages(otherUser._id);
    setIsChatOpen(true);

    // Clear unread count for this user
    setUnreadCounts(prev => ({
      ...prev,
      [otherUser._id]: 0
    }));
  };

  // Close chat
  const closeChat = () => {
    setActiveChat(null);
    setIsChatOpen(false);
  };

  // Test notification sound
  const testNotificationSound = (type = 'message') => {
    notificationService.testNotificationSound(type);
  };

  // Get total unread count
  const getTotalUnreadCount = () => {
    return Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  };

  const value = {
    socket,
    isConnected,
    onlineUsers,
    chatRooms,
    activeChat,
    messages,
    unreadCounts,
    typingUsers,
    isChatOpen,
    notificationPreferences,
    sendMessage,
    sendTypingIndicator,
    updateUserStatus,
    fetchChatRooms,
    fetchMessages,
    fetchAllUsers,
    startChat,
    closeChat,
    setIsChatOpen,
    saveNotificationPreferences,
    testNotificationSound,
    getTotalUnreadCount
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 