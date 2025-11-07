
import React from 'react';
import type { SpecialtySuggestion } from '@/types/types';
import { CheckCircleIcon } from '@/components/icons/CheckCircleIcon';
import { ShieldExclamationIcon } from '@/components/icons/ShieldExclamationIcon';

interface SpecialtySuggestionsProps {
  suggestions: SpecialtySuggestion[];
  isLoading: boolean;
}

const SuggestionSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow border border-slate-200 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
  </div>
);

const riskStyles = {
  'Thấp': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300'
  },
  'Trung bình': {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300'
  },
  'Cao': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300'
  }
};

export const SpecialtySuggestions: React.FC<SpecialtySuggestionsProps> = ({ suggestions, isLoading }) => {
  if (isLoading) {
    return (
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">AI đang phân tích...</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SuggestionSkeleton />
          <SuggestionSkeleton />
          <SuggestionSkeleton />
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }
  
  const overallRisk = suggestions[0]?.riskLevel || 'Thấp';
  const riskStyle = riskStyles[overallRisk];

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">Kết quả Phân tích từ AI</h2>

      <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${riskStyle.bg} border ${riskStyle.border}`}>
        <ShieldExclamationIcon className={`w-8 h-8 flex-shrink-0 ${riskStyle.text}`} />
        <div>
          <h3 className={`font-bold text-lg ${riskStyle.text}`}>Mức độ nguy hiểm: {overallRisk}</h3>
          <p className={`text-sm ${riskStyle.text}`}>Đây là đánh giá sơ bộ. Vui lòng tham khảo ý kiến bác sĩ để có chẩn đoán chính xác.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">{suggestion.specialty}</h3>
                <p className="mt-2 text-slate-600">{suggestion.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};