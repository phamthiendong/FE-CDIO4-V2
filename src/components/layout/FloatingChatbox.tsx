import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; 
import { ChatBubbleOvalLeftEllipsisIcon } from "../icons/ChatBubbleOvalLeftEllipsisIcon";
import { XMarkIcon } from "../icons/XMarkIcon";
import { ChatBubble } from "../ui/ChatBubble";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { PaperAirplaneIcon } from "../icons/PaperAirplaneIcon";

interface Message {
  role: "user" | "model";
  text: string;
}

export const FloatingChatbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
   const [messages, setMessages] = useState<Message[]>([
     {
       role: "model",
       text: "Xin chào! Tôi là trợ lý AI của dự án Chăm sóc sức khỏe. Tôi có thể giúp gì cho bạn?",
     },
   ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const userQuery = input;
    setInput("");
    setIsLoading(true);

    try {
      // Gọi API đến backend NestJS
      const result = await axios.post(
        "http://localhost:4421/api/v1/gemini/chat",
        {
          prompt: userQuery,
        }
      );
      const aiResponse: Message = { role: "model", text: result.data.response };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "model",
        text: "Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-700 transition-colors z-50"
        aria-label="Mở chatbox"
      >
        <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 w-96 h-[600px] bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col z-50">
      <div className="flex justify-between items-center p-4 border-b border-slate-200">
        <h2 className="font-bold text-slate-800">Trợ lý AI</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-500 hover:text-slate-800"
          aria-label="Đóng chatbox"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
      <div
        ref={chatContainerRef}
        className="flex-grow p-6 overflow-y-auto space-y-6"
      >
        {messages.map((msg, index) => (
          <ChatBubble key={index} role={msg.role} text={msg.text} />
        ))}
        {isLoading && <ChatBubble role="model" text="" isLoading={true} />}
      </div>
      <div className="p-4 border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi..."
            className="flex-grow p-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-cyan-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:bg-slate-400"
          >
            {isLoading ? (
              <LoadingSpinner className="w-5 h-5" />
            ) : (
              <PaperAirplaneIcon className="w-6 h-6" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};