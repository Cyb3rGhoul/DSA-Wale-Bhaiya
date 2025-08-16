import React from 'react';
import { Copy, Check, Send, Loader2, Bot, User } from 'lucide-react';

// CodeBlock Component
const CodeBlock = ({ code, language = 'cpp' }) => {
  const [copied, setCopied] = React.useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-lg sm:rounded-xl overflow-hidden my-3 sm:my-4 border border-gray-700/60 shadow-lg max-w-full">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/80 border-b border-gray-700/40">
        <span className="text-xs sm:text-sm text-gray-300 font-medium tracking-wide capitalize">{language}</span>
        <button
          onClick={copyCode}
          className="flex items-center gap-1 sm:gap-2 text-gray-400 hover:text-gray-200 transition-all duration-200 px-2 py-1 rounded-md hover:bg-gray-700/50 text-xs sm:text-sm"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          <span className="font-medium hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-3 sm:p-4 lg:p-5 text-xs sm:text-sm text-gray-100 font-mono leading-relaxed whitespace-pre min-w-0">
          <code className="text-gray-100 break-all sm:break-normal">{code}</code>
        </pre>
      </div>
    </div>
  );
};

// TypingIndicator Component
const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 animate-fadeIn">
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/90 to-purple-600/90 backdrop-blur-sm flex items-center justify-center text-white text-sm font-semibold shadow-lg border border-white/10 flex-shrink-0">
        <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="flex-1">
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl rounded-tl-md px-3 sm:px-4 py-3 sm:py-4 max-w-xs border border-gray-700/40 shadow-lg">
          <div className="flex gap-1 sm:gap-1.5">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0s', animationDuration: '1.4s'}}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s', animationDuration: '1.4s'}}></div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s', animationDuration: '1.4s'}}></div>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1 ml-1">
          DSA Bhai is thinking...
        </div>
      </div>
    </div>
  );
};

// ChatMessage Component
const ChatMessage = ({ message, isUser, timestamp, userName }) => {
  // Function to parse and format message content
  const formatMessage = (text) => {
    const parts = [];
    let currentIndex = 0;
    
    // Regex patterns for different formatting
    const codeBlockRegex = /```([\w+]+)?\n([\s\S]*?)```/g;
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
        language: match[1] || 'cpp',
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
          return <code key={index} className={`px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono ${isUser ? 'bg-white/20 text-gray-100' : 'bg-gray-700/60 text-gray-200'}`}>{part.slice(1, -1)}</code>;
        }
        return part;
      });
  };

  const messageParts = formatMessage(message);

  return (
    <div className={`flex items-start gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 animate-fadeIn ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center text-white text-xs sm:text-sm font-semibold shadow-lg border border-white/10 flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-br from-emerald-500/90 to-teal-600/90 backdrop-blur-sm' 
          : 'bg-gradient-to-br from-blue-500/90 to-purple-600/90 backdrop-blur-sm'
      }`} title={isUser ? userName || 'You' : 'DSA Brother Bot'}>
        {isUser ? (
          userName ? userName.charAt(0).toUpperCase() : <User className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </div>
      
      <div className={`flex-1 min-w-0 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
        <div className={`max-w-full sm:max-w-[85%] lg:max-w-[75%] rounded-2xl px-3 sm:px-4 py-3 sm:py-4 shadow-lg backdrop-blur-sm border overflow-hidden ${
          isUser 
            ? 'bg-gradient-to-br from-emerald-500/90 to-teal-600/90 text-gray-100 rounded-tr-md border-white/10' 
            : 'bg-gray-800/70 text-gray-200 rounded-tl-md border-gray-700/40'
        }`}>
          {messageParts.map((part, index) => {
            if (part.type === 'codeblock') {
              return <CodeBlock key={index} code={part.code} language={part.language} />;
            } else {
              return (
                <div key={index} className="whitespace-pre-wrap leading-relaxed text-sm sm:text-[15px] break-words">
                  {formatTextContent(part.content)}
                </div>
              );
            }
          })}
        </div>
      </div>
      
      {timestamp && (
        <div className={`text-xs text-gray-500 mt-1 flex-shrink-0 ${isUser ? 'order-first mr-2' : 'ml-2'}`}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
};

// ChatInput Component
const ChatInput = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = React.useState('');
  const textareaRef = React.useRef(null);

  // Auto-resize textarea based on content
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to get correct scrollHeight
      textarea.style.height = 'auto';
      // Set new height (but limit to 6 rows max on mobile, 8 on desktop)
      const maxRows = window.innerWidth < 640 ? 4 : 6;
      const lineHeight = window.innerWidth < 640 ? 20 : 24;
      const maxHeight = maxRows * lineHeight;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      // Reset height after submit
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-700/40 shadow-2xl p-3 sm:p-4 lg:p-6">
      <div className="flex gap-2 sm:gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="DSA ka koi bhi question pooch, bhai! 🤔"
            className="w-full resize-none rounded-xl sm:rounded-2xl border border-gray-600/50 bg-gray-800/60 backdrop-blur-sm px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition-all duration-200 min-h-[44px] sm:min-h-[48px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
            rows={1}
            disabled={isLoading}
            style={{ 
              lineHeight: window.innerWidth < 640 ? '1.25rem' : '1.5rem',
              maxHeight: window.innerWidth < 640 ? '80px' : '120px'
            }}
          />
          
          {/* Character count for long messages */}
          {message.length > 500 && (
            <div className="absolute bottom-1 right-2 text-xs text-gray-500 bg-gray-800/80 px-2 py-1 rounded">
              {message.length}/2000
            </div>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          className="bg-gradient-to-br from-blue-500/90 to-purple-600/90 backdrop-blur-sm text-white rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[44px] sm:min-w-[48px] h-[44px] sm:h-[48px] shadow-lg border border-white/10 hover:shadow-xl flex-shrink-0"
          title={isLoading ? 'Sending...' : 'Send message'}
        >
          {isLoading ? (
            <Loader2 size={16} className="sm:w-5 sm:h-5 animate-spin" />
          ) : (
            <Send size={16} className="sm:w-5 sm:h-5" />
          )}
        </button>
      </div>
      
      {/* Quick suggestions */}
      {!message && (
        <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
          {[
            "Array sorting problem",
            "Binary tree traversal", 
            "Dynamic programming",
            "Graph algorithms"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setMessage(suggestion)}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-800/50 hover:bg-gray-700/60 text-gray-400 hover:text-gray-300 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export { ChatMessage, ChatInput, TypingIndicator, CodeBlock };