
import React from 'react';
import type { Doctor } from '../../../types/types';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { StarIcon } from '../../../components/icons/StarIcon';

interface ConsultationProps {
  doctor: Doctor;
  transcript: string;
  onSummarize: (transcript: string) => void;
  isSummarizing: boolean;
}

export const Consultation: React.FC<ConsultationProps> = ({ doctor, transcript, onSummarize, isSummarizing }) => {
  const transcriptLines = transcript.trim().split('\n\n');

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
        <img
          src={doctor.imageUrl}
          alt={doctor.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{doctor.name}</h2>
          <p className="text-cyan-700 font-medium">{doctor.specialty}</p>
           <div className="flex items-center gap-1 mt-1 text-amber-500">
                <StarIcon className="w-5 h-5" />
                <span className="font-bold text-slate-700">{doctor.rating.toFixed(1)}</span>
                <span className="text-sm text-slate-500">({doctor.experience} năm KN)</span>
            </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Nội dung buổi tư vấn</h3>
        <div className="space-y-4 max-h-96 overflow-y-auto bg-slate-50 p-4 rounded-lg border border-slate-200">
          {transcriptLines.map((line, index) => {
            const parts = line.split(': ');
            if (parts.length < 2) return null;
            
            const speaker = parts[0];
            const message = parts.slice(1).join(': ');
            const isPatient = speaker === 'Bệnh nhân';

            return (
              <div key={index} className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-3 rounded-xl ${isPatient ? 'bg-cyan-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                  <p className="font-bold text-sm mb-1">{speaker}</p>
                  <p>{message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={() => onSummarize(transcript)}
          disabled={isSummarizing || !transcript.trim()}
          className="w-full md:w-auto inline-flex items-center justify-center px-8 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg"
        >
          {isSummarizing ? (
            <>
              <LoadingSpinner className="w-5 h-5 mr-2" />
              Đang tạo tóm tắt...
            </>
          ) : (
            'Tạo tóm tắt bằng AI'
          )}
        </button>
      </div>
    </div>
  );
}