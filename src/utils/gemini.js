// src/utils/gemini.js
import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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
    // Add user message to history
    conversationHistory.push({
      role: "user",
      parts: [{ text: userMessage }]
    });

    const response = await axios.post(GEMINI_API_URL, {
      contents: conversationHistory,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1024
      }
    });

    const botResponse = response.data.candidates[0].content.parts[0].text;
    
    // Add bot response to history
    conversationHistory.push({
      role: "model",
      parts: [{ text: botResponse }]
    });

    return botResponse;
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      return "Arre bhai, kuch galat input diya hai! 😅 Thoda check kar ke try kar.";
    }
    
    if (error.response?.status === 403) {
      return "API key ka issue hai bhai! 🔑 .env file check kar.";
    }
    
    return "Sorry bhai, kuch technical issue aa gaya hai! 🛠️ Thoda wait kar ke try kar.";
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