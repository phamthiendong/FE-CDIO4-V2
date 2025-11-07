import React, { useState } from 'react';
import type { Doctor } from '@/types/types';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { ClockIcon } from '@/components/icons/ClockIcon';

interface BookingCalendarProps {
  doctor: Doctor;
  onBook: (doctor: Doctor, slot: { date: string, time: string }, type: 'online' | 'offline') => void;
}

const availableSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00',
  '14:00', '14:30', '15:00', '15:30', '16:00'
];

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ doctor, onBook }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<'online' | 'offline'>('online');

  const handleBooking = () => {
    if (selectedTime) {
      onBook(doctor, { date: selectedDate.toLocaleDateString('vi-VN'), time: selectedTime }, appointmentType);
    }
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.valueAsDate;
    if (date) {
      const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      setSelectedDate(adjustedDate);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 sticky top-28">
      <h3 className="text-xl font-bold text-slate-900 text-center mb-4">Đặt lịch hẹn</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          <CalendarIcon className="w-4 h-4 inline-block mr-2" />
          Chọn ngày
        </label>
        <input 
          type="date"
          className="w-full p-2 border border-slate-300 rounded-md"
          defaultValue={selectedDate.toISOString().split('T')[0]}
          min={new Date().toISOString().split('T')[0]}
          onChange={handleDateChange}
        />
      </div>

      <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Hình thức khám
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setAppointmentType('online')} className={`p-2 rounded-md text-sm font-medium border-2 transition-colors ${appointmentType === 'online' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white hover:bg-cyan-50'}`}>Tư vấn Online</button>
            <button onClick={() => setAppointmentType('offline')} className={`p-2 rounded-md text-sm font-medium border-2 transition-colors ${appointmentType === 'offline' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white hover:bg-cyan-50'}`}>Khám tại quầy</button>
          </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <ClockIcon className="w-4 h-4 inline-block mr-2" />
          Chọn giờ (sáng)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {availableSlots.slice(0, 5).map(time => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`p-2 rounded-md text-sm font-medium border-2 transition-colors ${
                selectedTime === time 
                ? 'bg-cyan-600 text-white border-cyan-600' 
                : 'bg-white text-cyan-800 border-cyan-200 hover:bg-cyan-50'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
      
       <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <ClockIcon className="w-4 h-4 inline-block mr-2" />
          Chọn giờ (chiều)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {availableSlots.slice(5).map(time => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`p-2 rounded-md text-sm font-medium border-2 transition-colors ${
                selectedTime === time 
                ? 'bg-cyan-600 text-white border-cyan-600' 
                : 'bg-white text-cyan-800 border-cyan-200 hover:bg-cyan-50'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleBooking}
          disabled={!selectedTime}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-green-300"
        >
          {selectedTime ? (appointmentType === 'online' ? `Xác nhận & Thanh toán ${doctor.consultationFee.toLocaleString('vi-VN')}đ` : 'Xác nhận Lịch hẹn') : 'Vui lòng chọn giờ'}
        </button>
      </div>
    </div>
  );
};