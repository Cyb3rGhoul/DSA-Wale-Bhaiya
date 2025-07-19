// src/App.jsx
import React, { useEffect, useRef } from 'react';
import { ChatMessage, ChatInput, TypingIndicator } from './components/ChatComponent';
import { useGemini } from './hooks/useGemini';
import { RefreshCcw, Brain, Code2 } from 'lucide-react';
import './App.css';

function App() {
  const { messages, isLoading, sendMessage, clearChat } = useGemini();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/70 backdrop-blur-xl border-b border-gray-700/30 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/80 to-purple-600/80 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100 tracking-tight">DSA Brother Bot</h1>
              <p className="text-sm text-gray-400 font-medium">Your coding mentor & elder brother 👨‍💻</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700/30">
              <Code2 size={14} />
              <span className="font-medium">DSA Helper</span>
            </div>
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 backdrop-blur-sm rounded-xl transition-all duration-200 border border-gray-700/30 hover:border-gray-600/50"
              title="Clear Chat"
            >
              <RefreshCcw size={16} />
              <span className="hidden sm:inline text-sm font-medium">Clear</span>
            </button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto hide-scrollbar">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Message */}
            {messages.length === 1 && (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/80 to-purple-600/80 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/10">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-100 mb-3 tracking-tight">DSA Brother Bot</h2>
                <p className="text-gray-400 max-w-md mx-auto text-lg leading-relaxed">
                  Your friendly elder brother who will guide you through Data Structures & Algorithms step by step! 🚀
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.text}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
            ))}

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Chat Input */}
      <div className="max-w-4xl mx-auto w-full mb-1">
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>

      {/* Quick Start Suggestions */}
      {/* {messages.length === 1 && (
        <div className="max-w-4xl mx-auto w-full p-6 pt-0">
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              "Two Sum problem kaise solve karu?",
              "Binary Search samjha do bhai",
              "Linked List reverse karna hai",
              "Tree traversal ke types batao"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => sendMessage(suggestion)}
                className="text-sm bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700/60 text-gray-300 hover:text-gray-100 px-4 py-2.5 rounded-full border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 font-medium shadow-lg"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}

export default App;