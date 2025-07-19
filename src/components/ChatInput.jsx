// import { Send, Loader2 } from 'lucide-react';

// const ChatInput = ({ onSendMessage, isLoading }) => {
//   const [message, setMessage] = React.useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (message.trim() && !isLoading) {
//       onSendMessage(message.trim());
//       setMessage('');
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit(e);
//     }
//   };

//   return (
//     <div className="border-t bg-white p-4">
//       <form onSubmit={handleSubmit} className="flex gap-2">
//         <textarea
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           onKeyDown={handleKeyPress}
//           placeholder="DSA ka koi bhi question pooch, bhai! 🤔"
//           className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] max-h-32"
//           rows={1}
//           disabled={isLoading}
//         />
//         <button
//           type="submit"
//           disabled={!message.trim() || isLoading}
//           className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl px-4 py-3 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[44px]"
//         >
//           {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ChatInput;
