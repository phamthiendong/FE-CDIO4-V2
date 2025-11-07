import React from 'react';
import type { AiInteractionLog } from '@/types/types';
import { QuestionMarkCircleIcon } from '@/components/icons/QuestionMarkCircleIcon';
import { ChatBubbleLeftRightIcon } from '@/components/icons/ChatBubbleLeftRightIcon';

interface ResponseViewModalProps {
  log: AiInteractionLog;
  onClose: () => void;
}

export const ResponseViewModal: React.FC<ResponseViewModalProps> = ({ log, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
            <h2 className="text-xl font-bold text-slate-900">Phản hồi từ Chuyên gia</h2>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
            <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                    <QuestionMarkCircleIcon className="w-5 h-5" />
                    Câu hỏi của bạn
                </h3>
                <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 italic">
                    "{log.userQuery}"
                </p>
            </div>
             <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    Phản hồi của chuyên gia
                </h3>
                <p className="bg-cyan-50 p-4 rounded-lg border border-cyan-200 text-slate-800 whitespace-pre-wrap">
                    {log.humanResponse}
                </p>
            </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 text-right">
             <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-600 text-white font-bold rounded-full hover:bg-slate-700 transition-colors"
            >
              Đóng
            </button>
        </div>
      </div>
    </div>
  );
};