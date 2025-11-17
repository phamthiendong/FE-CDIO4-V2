import React, { useState, useMemo } from 'react';
import type { Appointment, Doctor, User, Notification } from  '@/types/types';
import { CalendarIcon } from '../../components/icons/CalendarIcon';
import { ClockIcon } from '../../components/icons/ClockIcon';
import { ShieldCheckIcon } from '../../components/icons/ShieldCheckIcon';
import { XCircleIcon } from '../../components/icons/XCircleIcon';
import { BriefcaseIcon } from '../../components/icons/BriefcaseIcon';
import { StarIcon } from '../../components/icons/StarIcon';
import { MegaphoneIcon } from '../../components/icons/MegaphoneIcon';
import { PlusIcon } from '../../components/icons/PlusIcon';
import { CurrencyDollarIcon } from '../../components/icons/CurrencyDollarIcon';
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

interface DoctorDashboardProps {
  doctor: Doctor;
  appointments: Appointment[];
  users: User[];
  userNotifications: Notification[];
  totalRevenue: number;
  onStartConsultation: (appointment: Appointment) => void;
  onConfirmAppointment: (appointmentId: string) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onViewSchedule: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = (props) => {
    const { doctor, appointments, users, userNotifications, totalRevenue, onStartConsultation, onConfirmAppointment, onCancelAppointment, onViewSchedule } = props;
    
    const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');

    const pendingAppointments = appointments.filter(a => a.status === 'Chờ xác nhận').slice(0, 3);
    const today = new Date().toISOString().split('T')[0];
    const todaysAppointments = appointments.filter(a => a.date === today && (a.status === 'Đã xác nhận' || a.status === 'Sắp diễn ra'));
    const pendingCount = appointments.filter(a => a.status === 'Chờ xác nhận').length;
    const recentReviews = [...doctor.reviews].reverse().slice(0, 2);

    const filteredTodaysAppointments = useMemo(() => {
        if (filter === 'all') {
            return todaysAppointments;
        }
        return todaysAppointments.filter(apt => apt.type === filter);
    }, [todaysAppointments, filter]);

    return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Chào mừng trở lại, {doctor.name}!</h1>
        <p className="mt-2 text-md md:text-lg text-slate-600">Đây là tổng quan nhanh về ngày làm việc của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Lịch hẹn chờ" value={pendingCount.toString()} icon={BriefcaseIcon} />
        <StatCard title="Lịch hẹn hôm nay" value={todaysAppointments.length.toString()} icon={CalendarIcon} />
        <StatCard 
            title="Doanh thu (Online)" 
            value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)} 
            icon={CurrencyDollarIcon} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <DashboardCard title="Lịch hẹn hôm nay">
                <div className="flex flex-wrap gap-2 mb-4">
                    <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>Tất cả</FilterButton>
                    <FilterButton active={filter === 'online'} onClick={() => setFilter('online')}>Trực tuyến</FilterButton>
                    <FilterButton active={filter === 'offline'} onClick={() => setFilter('offline')}>Tại phòng khám</FilterButton>
                </div>

                 {filteredTodaysAppointments.length > 0 ? (
                    <div className="space-y-4">
                        {filteredTodaysAppointments.map(apt => (
                        <AppointmentCard 
                            key={apt.id}
                            appointment={apt}
                            users={users}
                            onStartConsultation={onStartConsultation}
                            onConfirmAppointment={onConfirmAppointment}
                            onCancelAppointment={onCancelAppointment}
                        />
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 p-4 text-center">Không có lịch hẹn nào hôm nay khớp với bộ lọc.</p>
                )}
            </DashboardCard>
            <DashboardCard title="Lịch hẹn chờ xác nhận">
                 {pendingAppointments.length > 0 ? (
                    <div className="space-y-4">
                        {pendingAppointments.map(apt => (
                        <AppointmentCard 
                            key={apt.id}
                            appointment={apt}
                            users={users}
                            onStartConsultation={onStartConsultation}
                            onConfirmAppointment={onConfirmAppointment}
                            onCancelAppointment={onCancelAppointment}
                            isPending={true}
                        />
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 p-4 text-center">Không có lịch hẹn nào đang chờ.</p>
                )}
                {pendingCount > 3 && <button onClick={onViewSchedule} className="text-sm font-medium text-cyan-600 hover:underline mt-4">Xem tất cả</button>}
            </DashboardCard>
        </div>
        <div className="lg:col-span-1 space-y-6">
             <DashboardCard title="Lịch làm việc">
                <p className="text-slate-600 text-sm mb-4">Mở hoặc đóng các khung giờ khám bệnh cho bệnh nhân đặt lịch.</p>
                <button 
                    onClick={onViewSchedule} 
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 transition-colors text-sm"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Quản lý lịch</span>
                </button>
            </DashboardCard>
             <DashboardCard title="Thông báo từ Admin" icon={MegaphoneIcon}>
                {userNotifications.length > 0 ? (
                    <div className="space-y-2">
                        {userNotifications.map(n => (
                            <div key={n.id} className="bg-purple-50 p-3 rounded-lg text-sm text-purple-800 border border-purple-200">
                                {n.message}
                            </div>
                        ))}
                    </div>
                ) : <p className="text-slate-500 text-sm">Không có thông báo mới.</p>}
             </DashboardCard>
              <DashboardCard title="Đánh giá gần đây" icon={StarIcon}>
                {recentReviews.length > 0 ? (
                    <div className="space-y-4">
                        {recentReviews.map(review => (
                            <div key={review.id} className="border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm text-slate-800">{review.author}</p>
                                    <div className="flex items-center gap-1 text-amber-500 bg-amber-100 px-2 py-0.5 rounded-full">
                                        <StarIcon className="w-4 h-4" />
                                        <span className="text-sm font-bold">{review.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 italic mt-1">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                ): <p className="text-slate-500 text-sm">Chưa có đánh giá nào.</p>}
              </DashboardCard>
        </div>
      </div>
    </div>
  );
};

const FilterButton: React.FC<{active: boolean, onClick: () => void, children: React.ReactNode}> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors ${
            active 
                ? 'bg-cyan-600 text-white shadow' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        }`}
    >
        {children}
    </button>
)

const DashboardCard: React.FC<{ title: string; icon?: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            {Icon && <Icon className="w-6 h-6 text-slate-500" />}
            {title}
        </h2>
        {children}
    </div>
);

interface AppointmentCardProps {
  appointment: Appointment;
  users: User[];
  onStartConsultation: (appointment: Appointment) => void;
  onConfirmAppointment: (appointmentId: string) => void;
  onCancelAppointment: (appointmentId: string) => void;
  isPending?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = 
({ appointment, users, onStartConsultation, onConfirmAppointment, onCancelAppointment, isPending }) => {
  const patient = users.find(u => u.id === appointment.patientId);
  // Safer date parsing to prevent timezone issues.
  const formattedDate = new Date(`${appointment.date}T00:00:00`).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const cardBgColor = appointment.type === 'online' 
    ? 'bg-cyan-50/80 border-cyan-200' 
    : 'bg-amber-50/80 border-amber-200';

  return (
    <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${cardBgColor}`}>
      <div className="flex items-center gap-3 flex-grow">
        <img src={patient?.avatar} alt={patient?.name} className="w-12 h-12 rounded-full object-cover"/>
        <div>
          <p className="font-bold text-slate-800 flex items-center gap-2">
            {appointment.type === 'online' 
                ? <VideoCameraIcon className="w-5 h-5 text-cyan-700" /> 
                : <BuildingOfficeIcon className="w-5 h-5 text-amber-700" />
            }
            {patient?.name || 'Bệnh nhân'}
          </p>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
              <div className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /><span>{formattedDate}</span></div>
              <div className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /><span>{formatTime12h(appointment.time)}</span></div>
          </div>
        </div>
      </div>
       <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-center shrink-0">
        {(appointment.status === 'Đã xác nhận' || appointment.status === 'Sắp diễn ra') && (
            <button onClick={() => onStartConsultation(appointment)} className="flex-1 sm:flex-none bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 text-sm transition-colors">Bắt đầu</button>
        )}
        {isPending && (
          <>
            <button onClick={() => onConfirmAppointment(appointment.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-green-100 text-green-700 font-bold py-2 px-3 rounded-lg hover:bg-green-200 text-sm transition-colors"><ShieldCheckIcon className="w-4 h-4"/> <span>Xác nhận</span></button>
            <button onClick={() => onCancelAppointment(appointment.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-100 text-red-700 font-bold py-2 px-3 rounded-lg hover:bg-red-200 text-sm transition-colors"><XCircleIcon className="w-4 h-4"/> <span>Hủy</span></button>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-4">
        <div className="bg-cyan-100 p-3 rounded-full">
            <Icon className="w-7 h-7 text-cyan-600" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
    </div>
);
