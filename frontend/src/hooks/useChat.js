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
          title: chatData.title
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
        const newChat = await saveChat(chatData);
        setCurrentChatId(newChat._id);
        setChatTitle(newChat.title);
      }
    } catch (error) {
      const errorMessage = 'Failed to save message';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [currentChatId, saveChat]);

  // Send message (handles both user and bot messages)
  const sendMessage = useCallback(async (messageText) => {
    if (!user) {
      const errorMessage = 'Please log in to send messages';
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    // Add user message immediately
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
      await addMessageToChat({
        text: messageText,
        isUser: true
      });

      // Send message to Gemini API
      const response = await sendMessageToBrother(messageText);
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);

      // Save bot message to backend
      await addMessageToChat({
        text: response,
        isUser: false
      });

      // Update chat title if it's still "New Chat"
      if (chatTitle === 'New Chat' && currentChatId) {
        const newTitle = messageText.length > 50 
          ? messageText.substring(0, 50) + '...'
          : messageText;
        
        try {
          await chatService.updateChat(currentChatId, { title: newTitle });
          setChatTitle(newTitle);
        } catch (error) {
          // Silent error for title update
        }
      }

    } catch (error) {
      const errorMessage = `Failed to send message: ${error.message}`;
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Add error message
      const botErrorMessage = {
        id: Date.now() + 1,
        text: "Arre yaar, kuch technical problem aa gayi! 😅 Thoda wait kar ke try kar. Main abhi busy tha! 🛠️",
        isUser: false,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [user, addMessageToChat, chatTitle, currentChatId]);

  // Clear current chat (start new chat)
  const clearChat = useCallback(() => {
    setMessages([
      {
        id: Date.now(),
        text: "Hey bhai! 👋 Fresh start kar rahe hain! DSA mein kya seekhna hai? 🚀",
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