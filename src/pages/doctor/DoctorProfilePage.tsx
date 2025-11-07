import React from 'react';
import type { Doctor } from '@/types/types';
import { StarIcon } from '@/components/icons/StarIcon';
import { BookingCalendar } from '@/features/booking/components/BookingCalendar';
import { AcademicCapIcon } from '@/components/icons/AcademicCapIcon';
import { LanguageIcon } from '@/components/icons/LanguageIcon';
import { CurrencyDollarIcon } from '@/components/icons/CurrencyDollarIcon';
import { DocumentTextIcon } from '@/components/icons/DocumentTextIcon';

interface DoctorProfilePageProps {
  doctor: Doctor;
  onBook: (doctor: Doctor, slot: { date: string, time: string }, type: 'online' | 'offline') => void;
}

export const DoctorProfilePage: React.FC<DoctorProfilePageProps> = ({ doctor, onBook }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-8 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={doctor.imageUrl}
              alt={doctor.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-md"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-900">{doctor.name}</h1>
              <p className="text-xl font-medium text-cyan-700 mt-1">{doctor.specialty}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                <div className="flex items-center gap-1 text-amber-500">
                  <StarIcon className="w-5 h-5" />
                  <span className="font-bold text-slate-700">{doctor.rating.toFixed(1)}</span>
                </div>
                <span className="text-slate-500">•</span>
                <span className="text-slate-600">{doctor.experience} năm kinh nghiệm</span>
              </div>
              <div className="mt-3 flex items-center justify-center md:justify-start gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full w-fit mx-auto md:mx-0">
                <CurrencyDollarIcon className="w-5 h-5" />
                <span className="font-semibold text-md">
                  {doctor.consultationFee.toLocaleString('vi-VN')}đ / lần tư vấn
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Tiểu sử</h2>
              <p className="text-slate-600 leading-relaxed">{doctor.bio}</p>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Học vấn & Bằng cấp</h2>
              <ul className="space-y-3">
                {doctor.education.map((edu, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <AcademicCapIcon className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                    <span className="text-slate-600">{edu}</span>
                  </li>
                ))}
              </ul>
              {doctor.certificateUrl && (
                <div className="mt-4">
                    <a 
                        href={doctor.certificateUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-900 bg-cyan-50 px-3 py-2 rounded-lg border border-cyan-200 transition-colors"
                    >
                        <DocumentTextIcon className="w-5 h-5" />
                        <span>Xem chứng chỉ/bằng cấp</span>
                    </a>
                </div>
              )}
            </div>
            
             <div>
              <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Ngôn ngữ</h2>
              <ul className="space-y-3">
                {doctor.languages.map((lang, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <LanguageIcon className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                    <span className="text-slate-600">{lang}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Đánh giá từ bệnh nhân ({doctor.reviews.length})</h2>
              <div className="space-y-6">
                {doctor.reviews.length > 0 ? (
                  doctor.reviews.map(review => (
                    <div key={review.id} className="bg-slate-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-slate-700">{review.author}</p>
                        <div className="flex items-center gap-1 text-amber-500">
                          <StarIcon className="w-4 h-4" />
                          <span className="text-sm font-bold text-slate-600">{review.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 mt-2 italic">"{review.comment}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">Chưa có đánh giá nào.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Booking */}
          <div className="lg:col-span-1">
            <BookingCalendar doctor={doctor} onBook={onBook} />
          </div>
        </div>
      </div>
    </div>
  );
};