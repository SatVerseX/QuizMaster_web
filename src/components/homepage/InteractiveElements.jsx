import React, { useState, useEffect } from 'react';
import { FiMessageCircle, FiBell, FiPlus, FiX, FiSearch, FiBookOpen, FiUser, FiSettings } from 'react-icons/fi';
import { FaRocket, FaGraduationCap } from 'react-icons/fa';

const InteractiveElements = ({ 
  isDark, 
  currentUser, 
  onCreateSeries, 
  onBrowseSeries,
  onSearch,
  searchTerm,
  setSearchTerm 
}) => {
  const [showFAB, setShowFAB] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Mock notifications
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        title: 'New Test Available',
        message: 'UPSC Prelims Mock Test 5 is now available',
        time: '2 hours ago',
        type: 'test',
        read: false
      },
      {
        id: 2,
        title: 'Achievement Unlocked',
        message: 'You completed 10 tests this week!',
        time: '1 day ago',
        type: 'achievement',
        read: false
      },
      {
        id: 3,
        title: 'Study Reminder',
        message: 'Don\'t forget to take your daily test',
        time: '2 days ago',
        type: 'reminder',
        read: true
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  // Mock chat messages
  useEffect(() => {
    const mockMessages = [
      {
        id: 1,
        sender: 'support',
        message: 'Hi! How can I help you today?',
        time: '10:30 AM'
      },
      {
        id: 2,
        sender: 'user',
        message: 'I need help with my test series',
        time: '10:32 AM'
      }
    ];
    setChatMessages(mockMessages);
  }, []);

  // Show FAB when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setShowFAB(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: 'user',
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Floating Action Button */}
      {showFAB && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            {/* Main FAB */}
            <button
              onClick={() => setShowFAB(!showFAB)}
              className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
                isDark
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              }`}
            >
              <FiPlus className={`w-6 h-6 mx-auto transition-transform duration-300 ${
                showFAB ? 'rotate-45' : ''
              }`} />
            </button>

            {/* FAB Menu Items */}
            <div className={`absolute bottom-16 right-0 space-y-3 transition-all duration-300 ${
              showFAB ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}>
              <button
                onClick={onCreateSeries}
                className={`w-12 h-12 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 ${
                  isDark
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                }`}
                title="Create Test Series"
              >
                <FaGraduationCap className="w-5 h-5 mx-auto" />
              </button>

              <button
                onClick={onBrowseSeries}
                className={`w-12 h-12 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 ${
                  isDark
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                }`}
                title="Browse Series"
              >
                <FiBookOpen className="w-5 h-5 mx-auto" />
              </button>

              <button
                onClick={() => onSearch && onSearch(searchTerm)}
                className={`w-12 h-12 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 ${
                  isDark
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                }`}
                title="Search"
              >
                <FiSearch className="w-5 h-5 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Widget */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="relative">
          {/* Chat Toggle Button */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
              isDark
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
            }`}
          >
            <FiMessageCircle className="w-6 h-6 mx-auto" />
          </button>

          {/* Chat Window */}
          <div className={`absolute bottom-16 left-0 w-80 h-96 rounded-2xl shadow-2xl transition-all duration-300 ${
            showChat ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          } ${isDark ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200'}`}>
            {/* Chat Header */}
            <div className={`p-4 rounded-t-2xl border-b ${
              isDark ? 'bg-gray-700 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">S</span>
                  </div>
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Support Team
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Online now
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className={`p-1 rounded-full hover:bg-white/10 transition-colors ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 h-64 overflow-y-auto">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs p-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'text-blue-100' : isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className={`p-4 border-t ${
              isDark ? 'bg-gray-700 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className={`flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none ${
                    isDark
                      ? 'bg-gray-600 text-white placeholder-gray-400'
                      : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200'
                  }`}
                />
                <button
                  onClick={handleSendMessage}
                  className={`px-3 py-2 rounded-xl transition-colors ${
                    isDark
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <FiMessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Bell */}
      <div className="fixed top-6 right-6 z-50">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-12 h-12 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 ${
              isDark
                ? 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20'
                : 'bg-white/80 backdrop-blur-xl border border-white/40 text-gray-700 hover:bg-white'
            }`}
          >
            <FiBell className="w-5 h-5 mx-auto" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className={`absolute top-14 right-0 w-80 rounded-2xl shadow-2xl transition-all duration-300 ${
            showNotifications ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          } ${isDark ? 'bg-gray-800 border border-white/10' : 'bg-white border border-gray-200'}`}>
            {/* Header */}
            <div className={`p-4 border-b ${
              isDark ? 'bg-gray-700 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Notifications
                </h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className={`p-1 rounded-full hover:bg-white/10 transition-colors ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markNotificationAsRead(notification.id)}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    isDark 
                      ? 'border-white/10 hover:bg-white/5' 
                      : 'border-gray-200 hover:bg-gray-50'
                  } ${!notification.read ? (isDark ? 'bg-blue-500/10' : 'bg-blue-50') : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      !notification.read ? 'bg-blue-500' : 'bg-transparent'
                    }`}></div>
                    <div className="flex-1">
                      <h5 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {notification.title}
                      </h5>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className={`p-4 border-t ${
              isDark ? 'bg-gray-700 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <button className={`w-full py-2 px-4 rounded-xl text-sm font-semibold transition-colors ${
                isDark
                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}>
                View All Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InteractiveElements;
