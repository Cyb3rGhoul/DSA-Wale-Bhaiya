// src/hooks/useGemini.js
import { useState, useCallback } from 'react';
import { sendMessageToBrother, clearConversation, getInitialMessage } from '../utils/gemini';

export const useGemini = (userApiKey) => {
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      text: getInitialMessage(),
      isUser: false,
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (messageText) => {
    // Check if user has API key
    if (!userApiKey) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Bhai, tumhara Gemini API key missing hai! 🔑 Profile mein jakar add kar le, tab main tujhe help kar sakta hun.",
        isUser: false,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
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

    try {
      // Send message to Gemini using user's API key
      const response = await sendMessageToBrother(messageText, userApiKey);
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "Arre yaar, kuch technical problem aa gayi! 😅 Thoda wait kar ke try kar. Main abhi busy tha! 🛠️",
        isUser: false,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [userApiKey]);

  const clearChat = useCallback(() => {
    // Clear conversation history in gemini.js
    clearConversation();
    
    // Reset messages state
    setMessages([
      {
        id: Date.now(),
        text: "Hey bhai! 👋 Fresh start kar rahe hain! DSA mein kya seekhna hai? 🚀",
        isUser: false,
        timestamp: Date.now()
      }
    ]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat
  };
};