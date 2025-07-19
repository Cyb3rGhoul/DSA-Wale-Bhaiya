// import React from 'react';
// import { Copy, Check } from 'lucide-react';

// const CodeBlock = ({ code, language = 'javascript' }) => {
//   const [copied, setCopied] = React.useState(false);

//   const copyCode = () => {
//     navigator.clipboard.writeText(code);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <div className="relative bg-slate-900 rounded-lg overflow-hidden my-3">
//       <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
//         <span className="text-sm text-slate-400 font-medium">{language}</span>
//         <button
//           onClick={copyCode}
//           className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
//         >
//           {copied ? <Check size={16} /> : <Copy size={16} />}
//           <span className="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
//         </button>
//       </div>
//       <pre className="p-4 text-sm text-slate-100 overflow-x-auto font-fira leading-relaxed">
//         <code>{code}</code>
//       </pre>
//     </div>
//   );
// };

// export default CodeBlock;
