import React, { useState, useMemo } from 'react';
import type { TimeSlot } from '@/types/types';
import { ArrowLeftIcon } from '../../components/icons/ArrowLeftIcon';
import { CalendarIcon } from '../../components/icons/CalendarIcon';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { ClockIcon } from '../../components/icons/ClockIcon';
import { UsersIcon } from '../../components/icons/UsersIcon';
import { TrashIcon } from '../../components/icons/TrashIcon';
import { XCircleIcon } from '../../components/icons/XCircleIcon';
import { ChevronLeftIcon } from '../../components/icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../components/icons/ChevronRightIcon';
import { VideoCameraIcon } from '../../components/icons/VideoCameraIcon';
import { BuildingOfficeIcon } from '../../components/icons/BuildingOfficeIcon';

// Helper to format time from "HH:mm" to "h:mm AM/PM"
const formatTime12h = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const date = new Date(1970, 0, 1, parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
};

interface DoctorScheduleManagerProps {
  initialSlots: TimeSlot[];
  onGoBack: () => void;
}

const AddSlotModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddSlot: (slot: Omit<TimeSlot, 'id' | 'doctorId' | 'bookedCount' | 'status'>) => void;
  selectedDate: Date;
}> = ({ isOpen, onClose, onAddSlot, selectedDate }) => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:30');
  const [maxPatients, setMaxPatients] = useState(1);
  const [appointmentType, setAppointmentType] = useState<'online' | 'offline'>('offline');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSlot({
      date: selectedDate.toISOString().split('T')[0],
      startTime,
      endTime,
      maxPatients,
      type: appointmentType,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <XCircleIcon className="w-7 h-7" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Thêm khung giờ mới</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Ngày</label>
            <input type="text" readOnly value={selectedDate.toLocaleDateString('vi-VN')} className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed"/>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Hình thức khám</label>
            <div className="flex gap-4 p-2 bg-slate-100 rounded-lg">
                <label className={`flex-1 text-center py-2 px-3 rounded-md cursor-pointer transition-colors ${appointmentType === 'offline' ? 'bg-white shadow-sm text-cyan-700 font-semibold' : 'text-slate-600'}`}>
                    <input type="radio" name="appointmentType" value="offline" checked={appointmentType === 'offline'} onChange={() => setAppointmentType('offline')} className="sr-only"/>
                    Tại phòng khám
                </label>
                <label className={`flex-1 text-center py-2 px-3 rounded-md cursor-pointer transition-colors ${appointmentType === 'online' ? 'bg-white shadow-sm text-cyan-700 font-semibold' : 'text-slate-600'}`}>
                    <input type="radio" name="appointmentType" value="online" checked={appointmentType === 'online'} onChange={() => setAppointmentType('online')} className="sr-only"/>
                    Trực tuyến
                </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="start-time" className="block text-sm font-medium text-slate-600 mb-1">Giờ bắt đầu</label>
                <input id="start-time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg" required />
            </div>
            <div>
                <label htmlFor="end-time" className="block text-sm font-medium text-slate-600 mb-1">Giờ kết thúc</label>
                <input id="end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg" required />
            </div>
          </div>
          <div>
            <label htmlFor="max-patients" className="block text-sm font-medium text-slate-600 mb-1">Số bệnh nhân tối đa</label>
            <input id="max-patients" type="number" min="1" value={maxPatients} onChange={e => setMaxPatients(parseInt(e.target.value, 10))} className="w-full p-2.5 border border-slate-300 rounded-lg" required />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="py-2.5 px-5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200">Hủy</button>
            <button type="submit" className="py-2.5 px-5 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export const DoctorScheduleManager: React.FC<DoctorScheduleManagerProps> = ({ initialSlots, onGoBack }) => {
  const [slots, setSlots] = useState<TimeSlot[]>(initialSlots);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState(new Date()); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSlot = (newSlotData: Omit<TimeSlot, 'id' | 'doctorId' | 'bookedCount' | 'status'>) => {
    const newSlot: TimeSlot = {
      ...newSlotData,
      id: `slot-${Date.now()}`,
      doctorId: 'doc-1',
      bookedCount: 0,
      status: 'available',
    };
    setSlots(prev => [...prev, newSlot].sort((a,b) => a.startTime.localeCompare(b.startTime)));
  };

  const handleDeleteSlot = (slotId: string) => {
    setSlots(prev => prev.filter(slot => slot.id !== slotId));
  };
  
  const handleDateSelect = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day < today) return;
    setSelectedDate(day);
  };

  const changeWeek = (direction: 'next' | 'prev') => {
    setDisplayDate(current => {
        const newDate = new Date(current);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        return newDate;
    });
  };
  
  const { weekDays, monthYearLabel } = useMemo(() => {
    const startOfWeek = new Date(displayDate);
    // Set to the first day of the week (Sunday), but we'll display Monday first
    const dayOfWeek = startOfWeek.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when week starts on Sunday
    startOfWeek.setDate(diff);

    
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        return d;
    });

    const label = displayDate.toLocaleDateString('vi-VN', {
      month: 'long',
      year: 'numeric',
    });
    
    return { weekDays: days, monthYearLabel: label };
  }, [displayDate]);

  const isPrevWeekDisabled = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(startOfCurrentWeek.getDate() - startOfCurrentWeek.getDay() + (startOfCurrentWeek.getDay() === 0 ? -6 : 1));

    return weekDays[0] <= startOfCurrentWeek;
  }, [weekDays]);


  const filteredSlots = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return slots.filter(slot => slot.date === dateStr);
  }, [slots, selectedDate]);
  
  const morningSlots = filteredSlots.filter(s => s.startTime < '12:00');
  const afternoonSlots = filteredSlots.filter(s => s.startTime >= '12:00' && s.startTime < '18:00');
  const eveningSlots = filteredSlots.filter(s => s.startTime >= '18:00');

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
      <AddSlotModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddSlot={handleAddSlot} selectedDate={selectedDate} />

      <div className="flex items-center gap-4">
        <button onClick={onGoBack} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
          <ArrowLeftIcon className="w-6 h-6 text-slate-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý lịch khám</h1>
          <p className="text-slate-600">Thêm, xóa và quản lý các khung giờ khám bệnh của bạn.</p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-800 text-lg">Chọn ngày</h2>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => changeWeek('prev')} 
                    disabled={isPrevWeekDisabled}
                    className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Tuần trước"
                >
                    <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
                </button>
                <span className="font-semibold text-slate-700 w-32 text-center">{monthYearLabel}</span>
                <button 
                    onClick={() => changeWeek('next')} 
                    className="p-2 rounded-full hover:bg-slate-200 transition-colors"
                    aria-label="Tuần tới"
                >
                    <ChevronRightIcon className="w-5 h-5 text-slate-600" />
                </button>
            </div>
        </div>
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {weekDays.map(day => {
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const today = new Date();
            today.setHours(0,0,0,0);
            const isPast = day < today;
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateSelect(day)}
                disabled={isPast}
                className={`flex-shrink-0 text-center p-2 md:p-3 rounded-xl border-2 transition-all duration-200 ${
                  isSelected ? 'bg-cyan-600 text-white border-cyan-700 shadow-md' : 'bg-slate-50 hover:bg-slate-200 border-transparent'
                } ${isPast ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' : 'cursor-pointer'}`}
              >
                <p className="font-semibold text-sm">{day.toLocaleDateString('vi-VN', { weekday: 'short' })}</p>
                <p className="font-bold text-xl md:text-2xl my-0.5">{day.getDate()}</p>
                <p className="text-xs">{day.toLocaleDateString('vi-VN', { month: 'short' })}</p>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="space-y-6">
        <SlotSection title="Buổi sáng" slots={morningSlots} onDeleteSlot={handleDeleteSlot} onAddSlot={() => setIsModalOpen(true)} />
        <SlotSection title="Buổi chiều" slots={afternoonSlots} onDeleteSlot={handleDeleteSlot} onAddSlot={() => setIsModalOpen(true)} />
        <SlotSection title="Buổi tối" slots={eveningSlots} onDeleteSlot={handleDeleteSlot} onAddSlot={() => setIsModalOpen(true)} />
      </div>
    </div>
  );
};

const SlotSection: React.FC<{
  title: string;
  slots: TimeSlot[];
  onDeleteSlot: (id: string) => void;
  onAddSlot: () => void;
}> = ({ title, slots, onDeleteSlot, onAddSlot }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <button onClick={onAddSlot} className="flex items-center gap-1.5 bg-cyan-50 text-cyan-700 font-bold py-2 px-3 rounded-lg hover:bg-cyan-100 text-sm transition-colors">
        <PlusIcon className="w-4 h-4" />
        <span>Thêm</span>
      </button>
    </div>
    {slots.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {slots.map(slot => (
          <SlotCard key={slot.id} slot={slot} onDelete={onDeleteSlot} />
        ))}
      </div>
    ) : (
      <p className="text-slate-500 text-center py-4">Chưa có khung giờ nào.</p>
    )}
  </div>
);

const SlotCard: React.FC<{ slot: TimeSlot; onDelete: (id: string) => void }> = ({ slot, onDelete }) => {
    const isFull = slot.bookedCount >= slot.maxPatients;
    const progress = slot.maxPatients > 0 ? (slot.bookedCount / slot.maxPatients) * 100 : 0;
    
    return (
        <div className={`p-4 rounded-xl border ${isFull ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'} flex flex-col justify-between`}>
           <div>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                    <ClockIcon className="w-5 h-5" />
                    <span>{formatTime12h(slot.startTime)} - {formatTime12h(slot.endTime)}</span>
                </div>
                <button onClick={() => onDelete(slot.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" aria-label={`Xóa khung giờ ${slot.startTime}`}>
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
             <div className="space-y-1.5 mt-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    {slot.type === 'online' ? <VideoCameraIcon className="w-5 h-5" /> : <BuildingOfficeIcon className="w-5 h-5" />}
                    <span>{slot.type === 'online' ? 'Trực tuyến' : 'Tại phòng khám'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <UsersIcon className="w-5 h-5" />
                    <span>{slot.bookedCount}/{slot.maxPatients} đã đặt</span>
                </div>
            </div>
           </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
              <div className={`h-1.5 rounded-full ${isFull ? 'bg-amber-400' : 'bg-green-500'}`} style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};
