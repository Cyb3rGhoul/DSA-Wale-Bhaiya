import React from 'react';
import { Copy, Check, Send, Loader2 } from 'lucide-react';

// CodeBlock Component
const CodeBlock = ({ code, language = 'javascript' }) => {
  const [copied, setCopied] = React.useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden my-4 border border-gray-700/50 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900/60 border-b border-gray-700/30">
        <span className="text-sm text-gray-300 font-medium tracking-wide">{language}</span>
        <button
          onClick={copyCode}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-all duration-200 px-2 py-1 rounded-lg hover:bg-gray-700/50"
        >
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          <span className="text-xs font-medium">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-5 text-sm text-gray-100 overflow-x-auto font-mono leading-relaxed">
        <code className="text-gray-100">{code}</code>
      </pre>
    </div>
  );
};

// TypingIndicator Component
const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-4 p-6 animate-fadeIn">
      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500/80 to-purple-600/80 backdrop-blur-sm flex items-center justify-center text-white text-sm font-semibold shadow-lg border border-white/10">
        B
      </div>
      <div className="flex-1">
        <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl rounded-tl-md px-5 py-4 max-w-xs border border-gray-700/30 shadow-lg">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0s', animationDuration: '1.4s'}}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s', animationDuration: '1.4s'}}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s', animationDuration: '1.4s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ChatMessage Component
const ChatMessage = ({ message, isUser, timestamp }) => {
  // Function to parse and format message content
  const formatMessage = (text) => {
    const parts = [];
    let currentIndex = 0;
    
    // Regex patterns for different formatting
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*(.*?)\*/g;
    
    let match;
    const matches = [];
    
    // Find all code blocks first
    while ((match = codeBlockRegex.exec(text)) !== null) {
      matches.push({
        type: 'codeblock',
        start: match.index,
        end: match.index + match[0].length,
        language: match[1] || 'javascript',
        code: match[2].trim()
      });
    }
    
    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);
    
    // Process text with matches
    let lastEnd = 0;
    matches.forEach((match) => {
      // Add text before match
      if (match.start > lastEnd) {
        const textPart = text.slice(lastEnd, match.start);
        parts.push({ type: 'text', content: textPart });
      }
      
      // Add the match
      parts.push(match);
      lastEnd = match.end;
    });
    
    // Add remaining text
    if (lastEnd < text.length) {
      parts.push({ type: 'text', content: text.slice(lastEnd) });
    }
    
    return parts;
  };

  const formatTextContent = (text) => {
    // Handle bold, italic, and inline code in regular text
    return text
      .split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/)
      .map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className={`font-semibold ${isUser ? 'text-gray-100' : 'text-gray-200'}`}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
          return <em key={index} className="italic">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={index} className={`px-2 py-1 rounded-lg text-sm font-mono ${isUser ? 'bg-white/20 text-gray-100' : 'bg-gray-700/60 text-gray-200'}`}>{part.slice(1, -1)}</code>;
        }
        return part;
      });
  };

  const messageParts = formatMessage(message);

  return (
    <div className={`flex items-start gap-4 p-6 animate-fadeIn ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white text-sm font-semibold shadow-lg border border-white/10 ${
        isUser 
          ? 'bg-gradient-to-br from-emerald-500/80 to-teal-600/80 backdrop-blur-sm' 
          : 'bg-gradient-to-br from-blue-500/80 to-purple-600/80 backdrop-blur-sm'
      }`}>
        {isUser ? 'Y' : 'B'}
      </div>
      <div className="flex-1">
        <div className={`inline-block rounded-2xl px-5 py-4 max-w-4xl shadow-lg backdrop-blur-sm border ${
          isUser 
            ? 'bg-gradient-to-br from-emerald-500/90 to-teal-600/90 text-gray-100 rounded-tr-md border-white/10' 
            : 'bg-gray-800/60 text-gray-200 rounded-tl-md border-gray-700/30'
        }`}>
          {messageParts.map((part, index) => {
            if (part.type === 'codeblock') {
              return <CodeBlock key={index} code={part.code} language={part.language} />;
            } else {
              return (
                <div key={index} className="whitespace-pre-wrap leading-relaxed text-[15px]">
                  {formatTextContent(part.content)}
                </div>
              );
            }
          })}
        </div>
        {timestamp && (
          <div className="text-xs text-gray-500 mt-2 text-left">
            {new Date(timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

// ChatInput Component
const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = React.useState('');

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-700/30 bg-gray-900/40 backdrop-blur-lg p-6">
      <div className="flex gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="DSA ka koi bhi question pooch, bhai! 🤔"
          className="flex-1 resize-none rounded-2xl border border-gray-600/40 bg-gray-800/50 backdrop-blur-sm px-5 py-4 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 min-h-[52px] max-h-32 shadow-lg"
          rows={1}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          className="bg-gradient-to-br from-blue-500/90 to-purple-600/90 backdrop-blur-sm text-white rounded-2xl px-5 py-4 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[52px] shadow-lg border border-white/10 hover:shadow-xl"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>
    </div>
  );
};

export { ChatMessage, ChatInput, TypingIndicator, CodeBlock };