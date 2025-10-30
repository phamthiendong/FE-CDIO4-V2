
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface SymptomCheckerProps {
  symptoms: string;
  setSymptoms: (symptoms: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({ symptoms, setSymptoms, onAnalyze, isLoading }) => {
  return (
    <div>
      <label htmlFor="symptoms" className="block text-lg font-semibold text-slate-700 mb-2">
        Mô tả triệu chứng của bạn
      </label>
      <textarea
        id="symptoms"
        rows={6}
        className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-200"
        placeholder="VD: Tôi bị ho kéo dài, sốt nhẹ và cảm thấy mệt mỏi mọi lúc..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        disabled={isLoading}
      />
      <div className="mt-6 text-center">
        <button
          onClick={onAnalyze}
          disabled={isLoading || !symptoms.trim()}
          className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300 shadow-lg"
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="w-5 h-5 mr-2" />
              Đang phân tích...
            </>
          ) : (
            'Phân tích triệu chứng'
          )}
        </button>
      </div>
    </div>
  );
};
