import React from 'react';
import type { Doctor } from '@/types/types';
import { StarIcon } from '@/components/icons/StarIcon';
import { CurrencyDollarIcon } from '@/components/icons/CurrencyDollarIcon';

interface DoctorCardProps {
  doctor: Doctor;
  onSelectDoctor: (doctor: Doctor) => void;
}

export const DoctorCard = ({ doctor, onSelectDoctor }: DoctorCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 transform hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="p-6 flex-grow">
        <div className="flex items-center gap-4">
          <img
            src={doctor.imageUrl}
            alt={doctor.name}
            className="w-24 h-24 rounded-full border-4 border-cyan-100 object-cover"
          />
          <div>
            <h3 className="text-xl font-bold text-slate-900">{doctor.name}</h3>
            <p className="text-cyan-700 font-medium">{doctor.specialty}</p>
            <div className="flex items-center gap-1 mt-2 text-amber-500">
                <StarIcon className="w-5 h-5" />
                <span className="font-bold text-slate-700">{doctor.rating.toFixed(1)}</span>
                <span className="text-sm text-slate-500">({doctor.experience} năm KN)</span>
            </div>
          </div>
        </div>
         <div className="mt-4 flex items-center justify-start gap-2 text-green-600">
            <CurrencyDollarIcon className="w-5 h-5" />
            <span className="font-semibold text-slate-800">
              {doctor.consultationFee.toLocaleString('vi-VN')}đ / lần
            </span>
        </div>
        <p className="text-slate-600 mt-2 text-sm line-clamp-3">
          {doctor.bio}
        </p>
      </div>
      <div className="p-6 bg-slate-50">
        <button 
          onClick={() => onSelectDoctor(doctor)}
          className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-300"
        >
          Xem hồ sơ & Đặt lịch
        </button>
      </div>
    </div>
  );
};