import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { ChatBubble } from '@/components/ui/ChatBubble';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PaperAirplaneIcon } from '@/components/icons/PaperAirplaneIcon';
import { ArrowPathIcon } from '@/components/icons/ArrowPathIcon';
import { SparklesIcon } from '@/components/icons/SparklesIcon';

interface ChatPageProps {
  chatSession: Chat;
  onNewChat: () => void;
  onLogInteraction: (userQuery: string, aiResponse: string) => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const ChatPage: React.FC<ChatPageProps> = ({ chatSession, onNewChat, onLogInteraction }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleNewChat = () => {
    setMessages([]);
    onNewChat();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const userQuery = input;
    setInput('');
    setIsLoading(true);
    
    let finalAiResponse = '';

    try {
      const stream = await chatSession.sendMessageStream({ message: userQuery });
      let text = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        text += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = text;
          return newMessages;
        });
      }
      finalAiResponse = text;
    } catch (error) {
      console.error('Error sending message:', error);
      finalAiResponse = 'Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại.';
      setMessages(prev => [...prev, { role: 'model', text: finalAiResponse }]);
    } finally {
      setIsLoading(false);
      onLogInteraction(userQuery, finalAiResponse);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
       <div className="text-center mb-12">
        <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-cyan-600" />
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">AI Chat</h1>
        <p className="mt-4 text-lg text-slate-600">
          Hỏi đáp trực tiếp với trợ lý AI về các thắc mắc sức khỏe tổng quát của bạn.
        </p>
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col" style={{height: '70vh'}}>
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-800">Trợ lý y tế ClinicAI</h2>
            <button
                onClick={handleNewChat}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-cyan-600 transition-colors"
                title="Bắt đầu cuộc trò chuyện mới"
            >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Trò chuyện mới</span>
            </button>
        </div>
        <div ref={chatContainerRef} className="flex-grow p-6 overflow-y-auto space-y-6">
          {messages.map((msg, index) => (
            <ChatBubble key={index} role={msg.role} text={msg.text} />
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <ChatBubble role="model" text="" isLoading={true} />
          )}
        </div>
        <div className="p-4 border-t border-slate-200">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn ở đây..."
              className="flex-grow p-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Gửi tin nhắn"
            >
              {isLoading ? <LoadingSpinner className="w-5 h-5" /> : <PaperAirplaneIcon className="w-6 h-6" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};