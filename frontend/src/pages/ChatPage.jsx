import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, ChatInput, TypingIndicator } from '../components/ChatComponent';
import ChatSidebar from '../components/ChatSidebar';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from '../components/auth/UserProfile';
import { RefreshCcw, Brain, Code2, AlertCircle, Menu } from 'lucide-react';

function ChatPage() {
  const [currentChatId, setCurrentChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { messages, isLoading, sendMessage, clearChat, error, setError } = useChat(currentChatId);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle chat selection
  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
  };

  // Handle new chat
  const handleNewChat = () => {
    setCurrentChatId(null);
    clearChat();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Chat Sidebar */}
      <ChatSidebar
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0 relative z-10">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border-b border-red-500/20 backdrop-blur-xl shadow-lg">
            <div className="max-w-5xl mx-auto flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-xs sm:text-sm font-medium break-words">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 transition-colors text-lg sm:text-xl flex-shrink-0 ml-2"
                aria-label="Close error"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/30 shadow-2xl sticky top-0 z-30">
          <div className="max-w-5xl mx-auto flex items-center justify-between p-3 sm:p-4 lg:p-6">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-xl transition-all duration-200 flex-shrink-0 active:scale-95"
                aria-label="Open sidebar"
              >
                <Menu size={18} className="sm:w-5 sm:h-5" />
              </button>

              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500/90 to-purple-600/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/20 flex-shrink-0">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-100 tracking-tight truncate">
                  DSA Brother Bot
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 font-medium truncate">
                  Your coding mentor & elder brother 👨‍💻
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400 bg-gray-800/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-700/40">
                <Code2 size={12} />
                <span className="font-medium">DSA Helper</span>
              </div>
              
              <button
                onClick={clearChat}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 backdrop-blur-sm rounded-xl transition-all duration-200 border border-gray-700/40 hover:border-gray-600/60 text-xs sm:text-sm"
                title="Clear Chat"
              >
                <RefreshCcw size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden md:inline font-medium">Clear</span>
              </button>

              {/* User Profile */}
              {user && (
                <div className="relative">
                  <UserProfile />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <main className="flex-1 overflow-hidden relative">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-gray-900/20 scrollbar-thumb-gray-700/50 hover:scrollbar-thumb-gray-600/70">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
              {/* Welcome Message */}
              {messages.length === 1 && (
                <div className="py-8 sm:py-12 lg:py-16 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500/90 to-purple-600/90 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl border border-white/20 animate-pulse">
                    <Brain className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-100 mb-3 sm:mb-4 tracking-tight">
                    Welcome back, {user?.name?.split(' ')[0] || 'Friend'}! 👋
                  </h2>
                  <p className="text-gray-400 max-w-md mx-auto text-base sm:text-lg leading-relaxed px-4">
                    Your friendly elder brother is here to guide you through Data Structures & Algorithms step by step! 🚀
                  </p>
                  
                  {/* Quick start suggestions */}
                  <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto">
                    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-3 sm:p-4 hover:bg-gray-800/60 transition-all duration-200 cursor-pointer group">
                      <div className="text-blue-400 mb-2 group-hover:scale-110 transition-transform duration-200">🔍</div>
                      <h3 className="text-sm font-semibold text-gray-200 mb-1">Algorithm Analysis</h3>
                      <p className="text-xs text-gray-400">Time & space complexity</p>
                    </div>
                    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-3 sm:p-4 hover:bg-gray-800/60 transition-all duration-200 cursor-pointer group">
                      <div className="text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-200">🏗️</div>
                      <h3 className="text-sm font-semibold text-gray-200 mb-1">Data Structures</h3>
                      <p className="text-xs text-gray-400">Arrays, trees, graphs</p>
                    </div>
                    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-xl p-3 sm:p-4 hover:bg-gray-800/60 transition-all duration-200 cursor-pointer group sm:col-span-2 lg:col-span-1">
                      <div className="text-green-400 mb-2 group-hover:scale-110 transition-transform duration-200">💡</div>
                      <h3 className="text-sm font-semibold text-gray-200 mb-1">Problem Solving</h3>
                      <p className="text-xs text-gray-400">Step-by-step guidance</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-4 sm:space-y-6 py-4">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.text}
                    isUser={message.isUser}
                    timestamp={message.timestamp}
                    userName={user?.name}
                  />
                ))}
              </div>

              {/* Typing Indicator */}
              {isLoading && (
                <div className="py-4">
                  <TypingIndicator />
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>
        </main>

        {/* Chat Input */}
        <div className="sticky bottom-0 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent backdrop-blur-xl border-t border-gray-700/20">
          <div className="max-w-5xl mx-auto p-3 sm:p-4 lg:p-6">
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;