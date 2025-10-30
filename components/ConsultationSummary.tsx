
import React from 'react';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface ConsultationSummaryProps {
  summary: string;
}

export const ConsultationSummary: React.FC<ConsultationSummaryProps> = ({ summary }) => {
  const formattedSummary = summary.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>')
                                 .replace(/\*/g, '<br class="hidden"/>&bull;')
                                 .split('\n')
                                 .join('<br />');

  return (
    <div className="mt-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <DocumentTextIcon className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Tóm tắt buổi tư vấn</h2>
          <div 
            className="prose prose-slate max-w-none" 
            dangerouslySetInnerHTML={{ __html: formattedSummary }} 
          />
        </div>
      </div>
    </div>
  );
};
