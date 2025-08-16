import { useState, useCallback, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useChatHistory = () => {
  const [chats, setChats] = useState([]);
  const [archivedChats, setArchivedChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Load user's chat history
  const loadChats = useCallback(async (includeArchived = false) => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load active chats
      const activeResponse = await chatService.getChats({ archived: false });
      setChats(activeResponse.data.chats || []);

      // Load archived chats if requested
      if (includeArchived) {
        const archivedResponse = await chatService.getChats({ archived: true });
        setArchivedChats(archivedResponse.data.chats || []);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      const errorMessage = 'Failed to load chat history';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load chats when user changes
  useEffect(() => {
    if (user) {
      loadChats(true); // Load both active and archived chats
    } else {
      setChats([]);
      setArchivedChats([]);
    }
  }, [user, loadChats]);

  // Create new chat
  const createChat = useCallback(async (chatData) => {
    try {
      const response = await chatService.createChat(chatData);
      const newChat = response.data.chat;
      
      // Add to local state
      setChats(prev => [newChat, ...prev]);
      
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      const errorMessage = 'Failed to create chat';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Update chat
  const updateChat = useCallback(async (chatId, updates) => {
    try {
      const response = await chatService.updateChat(chatId, updates);
      const updatedChat = response.data.chat;
      
      // Update in local state
      setChats(prev => prev.map(chat => 
        chat._id === chatId ? updatedChat : chat
      ));
      
      return updatedChat;
    } catch (error) {
      console.error('Error updating chat:', error);
      const errorMessage = 'Failed to update chat';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Delete chat
  const deleteChat = useCallback(async (chatId) => {
    console.log('useChatHistory: deleteChat called with ID:', chatId);
    
    try {
      console.log('useChatHistory: calling chatService.deleteChat...');
      const response = await chatService.deleteChat(chatId);
      console.log('useChatHistory: deleteChat response:', response);
      
      // Remove from local state
      console.log('useChatHistory: removing chat from local state');
      setChats(prev => {
        const filtered = prev.filter(chat => chat._id !== chatId);
        console.log('useChatHistory: active chats before filter:', prev.length, 'after filter:', filtered.length);
        return filtered;
      });
      
      setArchivedChats(prev => {
        const filtered = prev.filter(chat => chat._id !== chatId);
        console.log('useChatHistory: archived chats before filter:', prev.length, 'after filter:', filtered.length);
        return filtered;
      });
      
      console.log('useChatHistory: chat deleted successfully');
    } catch (error) {
      console.error('useChatHistory: Error deleting chat:', error);
      console.error('useChatHistory: Error response:', error.response?.data);
      console.error('useChatHistory: Error status:', error.response?.status);
      
      const errorMessage = `Failed to delete chat: ${error.response?.data?.message || error.message}`;
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Archive chat
  const archiveChat = useCallback(async (chatId) => {
    try {
      const response = await chatService.archiveChat(chatId);
      const archivedChat = response.data.chat;
      
      // Move from active to archived
      setChats(prev => prev.filter(chat => chat._id !== chatId));
      setArchivedChats(prev => [archivedChat, ...prev]);
    } catch (error) {
      console.error('Error archiving chat:', error);
      const errorMessage = 'Failed to archive chat';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Unarchive chat
  const unarchiveChat = useCallback(async (chatId) => {
    try {
      const response = await chatService.unarchiveChat(chatId);
      const unarchivedChat = response.data.chat;
      
      // Move from archived to active
      setArchivedChats(prev => prev.filter(chat => chat._id !== chatId));
      setChats(prev => [unarchivedChat, ...prev]);
    } catch (error) {
      console.error('Error unarchiving chat:', error);
      const errorMessage = 'Failed to unarchive chat';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  // Get chat by ID
  const getChatById = useCallback((chatId) => {
    return chats.find(chat => chat._id === chatId) || 
           archivedChats.find(chat => chat._id === chatId);
  }, [chats, archivedChats]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    chats,
    archivedChats,
    isLoading,
    error,
    loadChats,
    createChat,
    updateChat,
    deleteChat,
    archiveChat,
    unarchiveChat,
    getChatById,
    clearError
  };
};