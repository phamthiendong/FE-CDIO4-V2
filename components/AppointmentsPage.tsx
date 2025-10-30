

import React from 'react';
import type { Appointment, Doctor, User } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { BellIcon } from './icons/BellIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface AppointmentsPageProps {
  appointments: Appointment[];
  onStartConsultation: (appointment: Appointment) => void;
  onInitiateReview: (appointment: Appointment) => void;
  onViewMedicalRecord: (recordId: string) => void;
  doctors: Doctor[];
  currentUser: User | null;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ appointments, onStartConsultation, onInitiateReview, onViewMedicalRecord, doctors, currentUser }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Lịch hẹn của tôi</h1>
        <p className="mt-4 text-lg text-slate-600">
          Xem lại các cuộc hẹn sắp tới và bắt đầu buổi tư vấn của bạn.
        </p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-r-lg mb-8 flex items-center gap-3">
        <BellIcon className="w-6 h-6 flex-shrink-0" />
        <p>Bạn sẽ nhận được lời nhắc cho các cuộc hẹn sắp tới qua Zalo và Email.</p>
      </div>

      <div className="space-y-6">
        {appointments.length > 0 ? (
          appointments.map(apt => {
            const currentDoctorState = doctors.find(d => d.id === apt.doctor.id);
            const hasReviewed = currentDoctorState?.reviews.some(r => r.author === currentUser?.name);

             const statusStyles = {
              'Sắp diễn ra': 'bg-blue-100 text-blue-800',
              'Đã xác nhận': 'bg-blue-100 text-blue-800',
              'Đã hoàn thành': 'bg-green-100 text-green-800',
              'Đã hủy': 'bg-red-100 text-red-800',
              'Chờ xác nhận': 'bg-amber-100 text-amber-800',
            };
            
            return (
              <div key={apt.id} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-grow">
                  <img 
                    src={apt.doctor.imageUrl} 
                    alt={apt.doctor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{apt.doctor.name}</h3>
                    <p className="text-slate-600">{apt.doctor.specialty}</p>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CalendarIcon className="w-5 h-5" />
                    <span className="font-medium">{apt.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 mt-1">
                    <ClockIcon className="w-5 h-5" />
                    <span className="font-medium">{apt.time}</span>
                  </div>
                </div>
                <div>
                  <span className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${statusStyles[apt.status]}`}>
                    {apt.status}
                  </span>
                </div>
                <div className="w-full md:w-auto flex-shrink-0">
                  {(apt.status === 'Sắp diễn ra' || apt.status === 'Đã xác nhận') && (
                    <button 
                      onClick={() => onStartConsultation(apt)}
                      className="w-full md:w-auto bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition-colors duration-300"
                    >
                      Bắt đầu tư vấn
                    </button>
                  )}
                  {apt.status === 'Đã hoàn thành' && apt.medicalRecordId && (
                     <button 
                      onClick={() => onViewMedicalRecord(apt.medicalRecordId!)}
                      className="w-full md:w-auto flex items-center gap-2 bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors duration-300"
                    >
                      <DocumentTextIcon className="w-5 h-5" />
                      <span>Xem hồ sơ bệnh án</span>
                    </button>
                  )}
                   {apt.status === 'Đã hoàn thành' && !apt.medicalRecordId && (
                     <button 
                      onClick={() => onInitiateReview(apt)}
                      disabled={hasReviewed}
                      className="w-full md:w-auto bg-amber-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-300"
                    >
                      {hasReviewed ? 'Đã đánh giá' : 'Đánh giá'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center bg-white p-12 rounded-2xl shadow-md border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">Không có lịch hẹn nào</h2>
            <p className="mt-2 text-slate-500">Bạn chưa đặt lịch hẹn nào. Hãy bắt đầu bằng cách tìm một bác sĩ.</p>
          </div>
        )}
      </div>
    </div>
  );
};