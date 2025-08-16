import React, { useState } from 'react';
import { useChatHistory } from '../hooks/useChatHistory';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
  Plus, 
  Archive, 
  Trash2, 
  MoreVertical,
  Clock,
  Search,
  X
} from 'lucide-react';

const ChatSidebar = ({ currentChatId, onChatSelect, onNewChat, isOpen, onClose }) => {
  const { 
    chats, 
    archivedChats, 
    isLoading, 
    error, 
    deleteChat, 
    archiveChat, 
    unarchiveChat,
    clearError 
  } = useChatHistory();
  
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Filter chats based on search term
  const filteredChats = (showArchived ? archivedChats : chats).filter(chat =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatSelect = (chatId) => {
    onChatSelect(chatId);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleNewChat = () => {
    onNewChat();
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat(chatId);
        
        if (currentChatId === chatId) {
          onNewChat();
        }
        
        // Show success message
        toast.success('Chat deleted successfully');
      } catch (error) {
        toast.error('Failed to delete chat');
      }
    }
    setActiveDropdown(null);
  };

  const handleArchiveChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      await archiveChat(chatId);
      if (currentChatId === chatId) {
        onNewChat();
      }
      toast.success('Chat archived successfully');
    } catch (error) {
      toast.error('Failed to archive chat');
    }
    setActiveDropdown(null);
  };

  const handleUnarchiveChat = async (chatId, e) => {
    e.stopPropagation();
    try {
      await unarchiveChat(chatId);
      toast.success('Chat unarchived successfully');
    } catch (error) {
      toast.error('Failed to unarchive chat');
    }
    setActiveDropdown(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full w-72 sm:w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/30 
        transform transition-transform duration-300 ease-in-out z-50 flex-shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-700/30 flex-shrink-0">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-100">Chat History</h2>
              <button
                onClick={onClose}
                className="lg:hidden text-gray-400 hover:text-gray-200 transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-600/30 rounded-xl border border-blue-500/20 hover:border-blue-500/30 transition-all duration-200 text-gray-200 hover:text-white text-sm sm:text-base"
            >
              <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="font-medium">New Chat</span>
            </button>

            {/* Search */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>

            {/* Toggle Archived */}
            <div className="flex items-center gap-1 sm:gap-2 mt-3">
              <button
                onClick={() => setShowArchived(false)}
                className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  !showArchived 
                    ? 'bg-gray-700/50 text-gray-200' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setShowArchived(true)}
                className={`flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                  showArchived 
                    ? 'bg-gray-700/50 text-gray-200' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
                }`}
              >
                <Archive size={12} className="inline mr-1" />
                Archived
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border-b border-red-500/20">
              <div className="flex items-center justify-between">
                <span className="text-red-300 text-sm">{error}</span>
                <button
                  onClick={clearError}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full mx-auto mb-2"></div>
                Loading chats...
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchTerm ? 'No chats found' : showArchived ? 'No archived chats' : 'No chats yet'}
                </p>
                {!searchTerm && !showArchived && (
                  <p className="text-xs mt-1">Start a new conversation!</p>
                )}
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredChats.map((chat) => (
                  <div
                    key={chat._id}
                    className={`relative group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      currentChatId === chat._id
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'hover:bg-gray-800/50 border border-transparent hover:border-gray-700/30'
                    }`}
                    onClick={() => handleChatSelect(chat._id)}
                  >
                    <MessageSquare size={14} className="text-gray-400 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-200 truncate leading-tight">
                        {chat.title}
                      </h3>
                      <div className="flex items-center gap-1 sm:gap-2 mt-0.5 sm:mt-1">
                        <Clock size={10} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-500 truncate">
                          {formatDate(chat.updatedAt)}
                        </span>
                        {chat.messageCount && (
                          <span className="text-xs text-gray-500 hidden sm:inline">
                            • {chat.messageCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === chat._id ? null : chat._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-700/50 transition-all duration-200 flex-shrink-0"
                      >
                        <MoreVertical size={12} className="text-gray-400" />
                      </button>

                      {activeDropdown === chat._id && (
                        <div className="absolute right-0 top-8 w-36 sm:w-40 bg-gray-800 border border-gray-700/50 rounded-lg shadow-xl z-50">
                          {!showArchived ? (
                            <button
                              onClick={(e) => handleArchiveChat(chat._id, e)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-700/50 transition-colors rounded-t-lg"
                            >
                              <Archive size={12} />
                              Archive
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleUnarchiveChat(chat._id, e)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-700/50 transition-colors rounded-t-lg"
                            >
                              <Archive size={12} />
                              Unarchive
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteChat(chat._id, e)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-b-lg border-t border-gray-700/30"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </>
  );
};

export default ChatSidebar;