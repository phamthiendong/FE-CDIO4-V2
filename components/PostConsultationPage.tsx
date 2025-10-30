
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { BellIcon } from './icons/BellIcon';

interface PostConsultationPageProps {
  summary: string;
  isSummarizing: boolean;
  onDone: () => void;
}

export const PostConsultationPage: React.FC<PostConsultationPageProps> = ({ summary, isSummarizing, onDone }) => {
  const formattedSummary = summary.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>')
                                   .replace(/\n/g, '<br />');

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Buổi tư vấn đã kết thúc</h1>
        <p className="mt-2 text-lg text-slate-600">
          Dưới đây là tóm tắt sơ bộ từ AI về buổi tư vấn của bạn.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <DocumentTextIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Tóm tắt buổi tư vấn bằng AI</h2>
            {isSummarizing ? (
              <div className="flex items-center gap-2 text-slate-600">
                <LoadingSpinner className="w-5 h-5 text-slate-500" />
                <span>Đang tạo tóm tắt...</span>
              </div>
            ) : (
              <div 
                className="prose prose-slate max-w-none text-sm" 
                dangerouslySetInnerHTML={{ __html: formattedSummary }} 
              />
            )}
          </div>
        </div>
      </div>

      <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-r-lg flex items-center gap-3">
        <BellIcon className="w-6 h-6 flex-shrink-0" />
        <p>Bác sĩ đang hoàn tất hồ sơ bệnh án và đơn thuốc của bạn. Hồ sơ sẽ sớm có mặt trong trang "Lịch hẹn của tôi".</p>
      </div>
      
      <div className="text-center">
         <button
          onClick={onDone}
          className="w-full md:w-auto inline-flex items-center justify-center px-10 py-4 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-700 transition-all duration-300"
        >
          Về trang Lịch hẹn
        </button>
      </div>
    </div>
  );
};