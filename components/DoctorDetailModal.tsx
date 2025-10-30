
import React, { useState, useMemo } from 'react';
import type { Doctor, Appointment, User } from '../types';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { InformationCircleIcon } from './icons/InformationCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { BarChart, parseDate } from './AdminDashboard'; // Re-using from AdminDashboard
import { ChartBarIcon } from './icons/ChartBarIcon';

interface DoctorDetailModalProps {
  doctor: Doctor;
  appointments: Appointment[];
  users: User[];
  onClose: () => void;
}

type ModalTab = 'info' | 'schedule' | 'revenue';

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 flex items-center gap-4">
        <div className="bg-green-100 p-3 rounded-full">
            <Icon className="w-6 h-6 text-green-600" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
    </div>
);

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({ doctor, appointments, users, onClose }) => {
    const [activeTab, setActiveTab] = useState<ModalTab>('info');

    const doctorAppointments = useMemo(() => {
        return appointments.filter(apt => apt.doctor.id === doctor.id);
    }, [appointments, doctor]);
    
    const revenueData = useMemo(() => {
        const completedAppointments = doctorAppointments.filter(a => a.status === 'Đã hoàn thành');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysRevenue = completedAppointments
            .filter(a => parseDate(a.date).getTime() === today.getTime())
            .reduce((sum, a) => sum + a.doctor.consultationFee, 0);

        const thisMonthRevenue = completedAppointments
            .filter(a => {
                const aptDate = parseDate(a.date);
                return aptDate.getMonth() === today.getMonth() && aptDate.getFullYear() === today.getFullYear();
            })
            .reduce((sum, a) => sum + a.doctor.consultationFee, 0);
        
        const dailyRevenueData = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const revenue = completedAppointments
                .filter(a => parseDate(a.date).getTime() === date.getTime())
                .reduce((sum, a) => sum + a.doctor.consultationFee, 0);
            
            let label = date.toLocaleDateString('vi-VN', { weekday: 'short' });
            if (i === 0) label = 'H.nay';
            if (i === 1) label = 'H.qua';
            
            return { label, value: revenue };
        }).reverse();

        return { todaysRevenue, thisMonthRevenue, dailyRevenueData };

    }, [doctorAppointments]);


    const renderContent = () => {
        switch (activeTab) {
            case 'info':
                return <InfoTab doctor={doctor} />;
            case 'schedule':
                return <ScheduleTab appointments={doctorAppointments} users={users} />;
            case 'revenue':
                return <RevenueTab revenueData={revenueData} />;
        }
    };
    
    const tabs = [
        { id: 'info', label: 'Thông tin', icon: InformationCircleIcon },
        { id: 'schedule', label: 'Lịch hẹn', icon: CalendarIcon },
        { id: 'revenue', label: 'Doanh thu', icon: CurrencyDollarIcon },
    ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
                <img src={doctor.imageUrl} alt={doctor.name} className="w-16 h-16 rounded-full object-cover" />
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{doctor.name}</h2>
                    <p className="text-md font-medium text-cyan-700">{doctor.specialty}</p>
                </div>
            </div>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        {/* Tabs */}
        <div className="p-2 border-b border-slate-200">
            <nav className="flex gap-2">
                 {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as ModalTab)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeTab === tab.id
                                ? 'bg-cyan-100 text-cyan-700'
                                : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};


const InfoTab: React.FC<{doctor: Doctor}> = ({ doctor }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-3">Tiểu sử</h3>
            <p className="text-slate-600 leading-relaxed">{doctor.bio}</p>
        </div>
        <div>
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-3">Học vấn & Bằng cấp</h3>
            <ul className="space-y-3">
            {doctor.education.map((edu, index) => (
                <li key={index} className="flex items-start gap-3">
                <AcademicCapIcon className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                <span className="text-slate-600">{edu}</span>
                </li>
            ))}
            </ul>
        </div>
    </div>
);

const ScheduleTab: React.FC<{appointments: Appointment[], users: User[]}> = ({ appointments, users }) => {
    const upcomingAppointments = appointments.filter(a => a.status === 'Sắp diễn ra');
    return (
        <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Lịch hẹn sắp tới ({upcomingAppointments.length})</h3>
            {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                    {upcomingAppointments.map(apt => {
                        const patient = users.find(u => u.id === apt.patientId);
                        return (
                             <div key={apt.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                                <p className="font-semibold text-slate-800">{patient?.name || 'Bệnh nhân'}</p>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /><span>{apt.date}</span></div>
                                    <div className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /><span>{apt.time}</span></div>
                                </div>
                             </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-slate-500">Không có lịch hẹn nào sắp tới.</p>
            )}
        </div>
    );
};

const RevenueTab: React.FC<{revenueData: any}> = ({ revenueData }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard title="Doanh thu Hôm nay" value={`${revenueData.todaysRevenue.toLocaleString('vi-VN')}đ`} icon={CurrencyDollarIcon} />
            <StatCard title="Doanh thu Tháng này" value={`${revenueData.thisMonthRevenue.toLocaleString('vi-VN')}đ`} icon={CurrencyDollarIcon} />
        </div>
        <div>
            {/* FIX: Added missing 'icon' and 'color' props to BarChart component call. */}
            <BarChart data={revenueData.dailyRevenueData} title="Doanh thu 7 ngày qua" icon={ChartBarIcon} color="cyan" />
        </div>
    </div>
);
