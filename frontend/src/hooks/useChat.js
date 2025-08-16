import { useState, useCallback, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { sendMessageToBrother, getInitialMessage } from '../utils/gemini';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useChat = (chatId = null) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(chatId);
  const [chatTitle, setChatTitle] = useState('New Chat');
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Initialize chat when component mounts or chatId changes
  useEffect(() => {
    if (currentChatId) {
      loadChat(currentChatId);
    } else {
      // Start with initial message for new chat
      setMessages([
        {
          id: Date.now(),
          text: getInitialMessage(),
          isUser: false,
          timestamp: Date.now()
        }
      ]);
      setChatTitle('New Chat');
    }
  }, [currentChatId]);

  // Load existing chat from backend
  const loadChat = useCallback(async (chatId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await chatService.getChat(chatId);
      const chat = response.data.chat;
      
      // Set messages from the loaded chat
      setMessages(chat.messages || []);
      setChatTitle(chat.title || 'New Chat');
      setCurrentChatId(chat._id);
    } catch (error) {
      const errorMessage = 'Failed to load chat';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Fallback to new chat
      setMessages([
        {
          id: Date.now(),
          text: getInitialMessage(),
          isUser: false,
          timestamp: Date.now()
        }
      ]);
      setChatTitle('New Chat');
      setCurrentChatId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save chat to backend
  const saveChat = useCallback(async (chatData) => {
    try {
      if (currentChatId) {
        // Update existing chat
        const response = await chatService.updateChat(currentChatId, {
          title: chatData.title,
          messages: chatData.messages
        });
        return response.data.chat;
      } else {
        // Create new chat
        const response = await chatService.createChat(chatData);
        const newChat = response.data.chat;
        setCurrentChatId(newChat._id);
        return newChat;
      }
    } catch (error) {
      const errorMessage = 'Failed to save chat';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    }
  }, [currentChatId]);

  // Add message to chat (both locally and backend)
  const addMessageToChat = useCallback(async (messageData) => {
    try {
      if (currentChatId) {
        // Add to existing chat
        await chatService.addMessage(currentChatId, messageData);
      } else {
        // Create new chat with this message
        const chatData = {
          title: 'New Chat',
          messages: [messageData]
        };
        await saveChat(chatData);
      }
    } catch (error) {
      console.error('Failed to add message to chat:', error);
      // Continue with local state even if backend save fails
    }
  }, [currentChatId, saveChat]);

  // Send message using user's API key
  const sendMessage = useCallback(async (messageText) => {
    // Check if user has API key
    if (!user?.geminiApiKey) {
      const errorMessage = {
        id: Date.now(),
        text: "Bhai, tumhara Gemini API key missing hai! 🔑 Profile mein jakar add kar le, tab main tujhe help kar sakta hun.",
        isUser: false,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Add user message immediately to local state
    const userMessage = {
      id: Date.now(),
      text: messageText,
      isUser: true,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Save user message to backend
      await addMessageToChat(userMessage);

      // Send message to Gemini using user's API key
      const response = await sendMessageToBrother(messageText, user.geminiApiKey);
      
      // Add bot response to local state
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Save bot message to backend
      await addMessageToChat(botMessage);

      // Update chat title if it's still "New Chat"
      if (chatTitle === 'New Chat' && currentChatId) {
        const suggestedTitle = messageText.length > 30 
          ? messageText.substring(0, 30) + '...' 
          : messageText;
        setChatTitle(suggestedTitle);
        await saveChat({ title: suggestedTitle });
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message to local state
      const errorMessage = {
        id: Date.now() + 1,
        text: "Arre yaar, kuch technical problem aa gayi! 😅 Thoda wait kar ke try kar. Main abhi busy tha! 🛠️",
        isUser: false,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.geminiApiKey, addMessageToChat, chatTitle, currentChatId, saveChat]);

  // Clear current chat (start new chat)
  const clearChat = useCallback(() => {
    setMessages([
      {
        id: Date.now(),
        text: getInitialMessage(),
        isUser: false,
        timestamp: Date.now()
      }
    ]);
    setCurrentChatId(null);
    setChatTitle('New Chat');
    setError(null);
  }, []);

  // Delete current chat
  const deleteChat = useCallback(async () => {
    if (!currentChatId) return;

    try {
      await chatService.deleteChat(currentChatId);
      clearChat();
      toast.success('Chat deleted successfully');
    } catch (error) {
      const errorMessage = 'Failed to delete chat';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [currentChatId, clearChat]);

  // Archive current chat
  const archiveChat = useCallback(async () => {
    if (!currentChatId) return;

    try {
      await chatService.archiveChat(currentChatId);
      clearChat();
      toast.success('Chat archived successfully');
    } catch (error) {
      const errorMessage = 'Failed to archive chat';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [currentChatId, clearChat]);

  return {
    messages,
    isLoading,
    currentChatId,
    chatTitle,
    error,
    sendMessage,
    clearChat,
    deleteChat,
    archiveChat,
    loadChat,
    setError
  };
};