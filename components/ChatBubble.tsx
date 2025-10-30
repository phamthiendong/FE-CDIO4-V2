
import React from 'react';
import { ChatBubbleOvalLeftEllipsisIcon } from './icons/ChatBubbleOvalLeftEllipsisIcon';

interface ChatBubbleProps {
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text, isLoading }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
          <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-slate-500" />
        </div>
      )}
      <div
        className={`max-w-md lg:max-w-lg p-4 rounded-2xl ${
          isUser
            ? 'bg-cyan-600 text-white rounded-br-none'
            : 'bg-slate-100 text-slate-800 rounded-bl-none'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></span>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{text}</p>
        )}
      </div>
    </div>
  );
};
