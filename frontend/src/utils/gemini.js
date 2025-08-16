// src/utils/gemini.js
import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const BROTHER_PROMPT = `
You are a caring elder brother who teaches Data Structures and Algorithms (DSA). Your name is "DSA Bhai".

PERSONALITY:
- Mix English and Hinglish naturally (use Hindi words like: bhai, yaar, chalo, dekho, samjha, theek hai, arre, bas, etc.)
- Be encouraging, patient, and supportive like a caring older brother
- Use terms of endearment: "bhai", "yaar", "champ"
- Be casual but knowledgeable
- Use emojis occasionally (👍, 💪, 🤔, 😅, 🚀, ✨, etc.)

TEACHING STYLE:
1. **Never give direct solutions** - Always guide with hints and questions
2. **Break problems into smaller parts**
3. **Ask leading questions** to make them think
4. **Give small code snippets** as examples, not full solutions
5. **Encourage them to write code themselves**
6. **Check their understanding** with questions like "samjha?" "clear hai?"

APPROACH TO DSA QUESTIONS:
1. First understand what they're asking
2. Give hints about which data structure/algorithm to think about
3. Ask: "Pehle tu batao, isme kya approach sochega?"
4. Guide them step by step with questions
5. Provide small example code snippets (not full solutions)
6. Make them write the actual code
7. Help debug if needed

RESPONSE FORMAT:
- Use **bold** for important concepts
- Use \`inline code\` for small code pieces
- Use code blocks for snippets:
\`\`\`cpp
// small example here
\`\`\`
- Ask questions to engage them
- Be conversational, not formal

HINGLISH EXAMPLES:
- "Arre bhai, yeh problem dekh ke kya lagta hai tujhe?"
- "Pehle tu batao, array mein kya karna hai?"
- "Chalo ek hint deta hun - sorting ke baare mein soch"
- "Samjha kya approach? Ya aur explain karu?"
- "Theek hai, ab tu code likhne ki koshish kar"
- "Bas yaar, bilkul sahi ja raha hai tu!"

Remember: You're teaching, not solving for them. Make them think and learn!

Keep responses conversational and under 300 words unless detailed explanation is needed.
`;

// Store conversation history
let conversationHistory = [
  {
    role: "user",
    parts: [{ text: BROTHER_PROMPT }]
  },
  {
    role: "model",
    parts: [{ text: "Hey bhai! 👋 Main DSA wala bhaiya hun and main tujhe DSA sikhaunga step by step. Jo bhi doubt hai, pooch le - hum saath mein solve karenge!\n\n**Kya seekhna hai aaj?** 🤔\n- Arrays aur Strings?\n- Linked Lists?\n- Trees aur Graphs?\n- Dynamic Programming?\n- Ya koi specific question hai?\n\nReady hai tu? 💪" }]
  }
];

export const sendMessageToBrother = async (userMessage) => {
  try {
    // Check if API key exists
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key is missing');
      return "API key missing hai bhai! 🔑 .env file mein VITE_GEMINI_API_KEY add kar.";
    }

    console.log('API Key exists:', GEMINI_API_KEY ? 'Yes' : 'No');
    console.log('API URL:', GEMINI_API_URL);

    // Keep conversation history manageable (last 10 messages)
    if (conversationHistory.length > 12) { // 2 initial + 10 messages
      conversationHistory = [
        conversationHistory[0], // Keep system prompt
        conversationHistory[1], // Keep initial response
        ...conversationHistory.slice(-8) // Keep last 8 messages
      ];
    }

    // Add user message to history
    conversationHistory.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    console.log('Conversation history length:', conversationHistory.length);
    console.log('Sending request to Gemini API...');
    
    const requestData = {
      contents: conversationHistory,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1024
      }
    };

    console.log('Request data:', JSON.stringify(requestData, null, 2));

    const response = await axios.post(GEMINI_API_URL, requestData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('Gemini API response received:', response.status);
    console.log('Response data:', response.data);

    if (!response.data.candidates || !response.data.candidates[0]) {
      console.error('Invalid response structure:', response.data);
      return "Arre bhai, response mein kuch issue hai! 😅 Try again kar.";
    }

    const botResponse = response.data.candidates[0].content.parts[0].text;
    
    // Add bot response to history
    conversationHistory.push({
      role: "model",
      parts: [{ text: botResponse }]
    });

    return botResponse;
  } catch (error) {
    console.error('Gemini API Error:', error);
    console.error('Error response:', error.response);
    console.error('Error details:', error.response?.data || error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return "Request timeout ho gaya bhai! 😅 Internet connection check kar.";
    }
    
    if (error.response?.status === 400) {
      console.error('Bad request - check input format');
      console.error('Request data was:', error.config?.data);
      return "Arre bhai, kuch galat input diya hai! 😅 Thoda check kar ke try kar.";
    }
    
    if (error.response?.status === 403) {
      console.error('API key issue - check permissions');
      return "API key ka issue hai bhai! 🔑 .env file check kar ya key regenerate kar.";
    }

    if (error.response?.status === 429) {
      console.error('Rate limit exceeded');
      return "Thoda slow down kar bhai! 😅 Rate limit exceed ho gaya. 2-3 second wait kar.";
    }

    if (error.response?.status === 404) {
      console.error('Model not found - check model name');
      return "Model not found hai bhai! 😅 Model name check kar.";
    }
    
    return `Sorry bhai, kuch technical issue aa gaya hai! 🛠️ Error: ${error.message}`;
  }
};

export const clearConversation = () => {
  conversationHistory = [
    {
      role: "user",
      parts: [{ text: BROTHER_PROMPT }]
    },
    {
      role: "model",
      parts: [{ text: "Hey bhai! 👋 Fresh start kar rahe hain! DSA mein kya seekhna hai? 🚀" }]
    }
  ];
};

export const getInitialMessage = () => {
  return "Hey bhai! 👋 Main DSA wala bhaiya hun and main tujhe DSA sikhaunga step by step. Jo bhi doubt hai, pooch le - hum saath mein solve karenge!\n\n**Kya seekhna hai aaj?** 🤔\n- Arrays aur Strings?\n- Linked Lists?\n- Trees aur Graphs?\n- Dynamic Programming?\n- Ya koi specific question hai?\n\nReady hai tu? 💪";
};