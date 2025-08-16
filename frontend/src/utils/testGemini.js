// Test script for Gemini API
import { sendMessageToBrother } from './gemini.js';

export const testGeminiAPI = async () => {
  try {
    console.log('Testing Gemini API...');
    const response = await sendMessageToBrother('Hello, test message');
    console.log('Gemini API test successful:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Gemini API test failed:', error);
    return { success: false, error: error.message };
  }
};

// Simple test function for browser console
export const simpleGeminiTest = async () => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBEdn8xI6oUqD2YGJ2WasHP9AZDV3tpIbs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: "Hello, just testing!" }]
        }]
      })
    });
    
    const data = await response.json();
    console.log('Simple test response:', data);
    return data;
  } catch (error) {
    console.error('Simple test error:', error);
    return { error: error.message };
  }
};

// Run test if called directly
if (typeof window !== 'undefined') {
  window.testGeminiAPI = testGeminiAPI;
  window.simpleGeminiTest = simpleGeminiTest;
}