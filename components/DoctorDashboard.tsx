
import React from 'react';
import type { Appointment, Doctor, User, Notification } from '../types';
import { CalendarIcon } from './icons/CalendarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ClipboardDocumentListIcon } from './icons/ClipboardDocumentListIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { StarIcon } from './icons/StarIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';

interface DoctorDashboardProps {
  doctor: Doctor;
  appointments: Appointment[];
  users: User[];
  userNotifications: Notification[];
  onStartConsultation: (appointment: Appointment) => void;
  onConfirmAppointment: (appointmentId: string) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onViewSchedule: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = (props) => {
    const { doctor, appointments, users, userNotifications, onStartConsultation, onConfirmAppointment, onCancelAppointment, onViewSchedule } = props;
    
    const pendingAppointments = appointments.filter(a => a.status === 'Chờ xác nhận').slice(0, 3);
    const today = new Date().toLocaleDateString('vi-VN');
    const todaysAppointments = appointments.filter(a => a.date === today && (a.status === 'Đã xác nhận' || a.status === 'Sắp diễn ra'));
    const pendingCount = appointments.filter(a => a.status === 'Chờ xác nhận').length;
    const recentReviews = [...doctor.reviews].reverse().slice(0, 3);

    return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Chào mừng trở lại, {doctor.name}!</h1>
        <p className="mt-2 text-lg text-slate-600">Đây là tổng quan nhanh về ngày làm việc của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Yêu cầu mới" value={pendingCount.toString()} icon={BriefcaseIcon} />
        <StatCard title="Lịch hẹn hôm nay" value={todaysAppointments.length.toString()} icon={CalendarIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <DashboardCard title="Lịch hẹn hôm nay">
                 {todaysAppointments.length > 0 ? (
                    <div className="space-y-4">
                        {todaysAppointments.map(apt => (
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
                    <p className="text-slate-500 p-4 text-center">Không có lịch hẹn nào hôm nay.</p>
                )}
            </DashboardCard>
            <DashboardCard title="Yêu cầu đang chờ">
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
                    <p className="text-slate-500 p-4 text-center">Không có yêu cầu mới nào.</p>
                )}
                {pendingCount > 3 && <button onClick={onViewSchedule} className="text-sm font-medium text-cyan-600 hover:underline mt-4">Xem tất cả</button>}
            </DashboardCard>
        </div>
        <div className="lg:col-span-1 space-y-6">
             <DashboardCard title="Thông báo từ Admin" icon={MegaphoneIcon}>
                {userNotifications.length > 0 ? (
                    <div className="space-y-2">
                        {userNotifications.map(n => (
                            <div key={n.id} className="bg-purple-50 p-3 rounded-lg text-sm text-purple-800">
                                {n.message}
                            </div>
                        ))}
                    </div>
                ) : <p className="text-slate-500 text-sm">Không có thông báo mới.</p>}
             </DashboardCard>
              <DashboardCard title="Đánh giá gần đây" icon={StarIcon}>
                {recentReviews.length > 0 ? (
                    <div className="space-y-3">
                        {recentReviews.map(review => (
                            <div key={review.id} className="border-b border-slate-200 pb-2">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm text-slate-700">{review.author}</p>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <StarIcon className="w-4 h-4" />
                                        <span className="text-sm font-bold text-slate-600">{review.rating.toFixed(1)}</span>
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

// --- Sub-components ---

const DashboardCard: React.FC<{ title: string; icon?: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            {Icon && <Icon className="w-6 h-6 text-slate-500" />}
            {title}
        </h2>
        {children}
    </div>
);

// FIX: Defined an explicit props interface for AppointmentCard to resolve multiple typing errors.
// The component receives a single 'appointment' object, not the full list from DoctorDashboardProps.
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
  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <p className="font-bold text-slate-800">{patient?.name || 'Bệnh nhân'}</p>
        <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
            <div className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /><span>{appointment.date}</span></div>
            <div className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /><span>{appointment.time}</span></div>
        </div>
      </div>
       <div className="flex items-center gap-2 w-full sm:w-auto">
        {(appointment.status === 'Đã xác nhận' || appointment.status === 'Sắp diễn ra') && (
            <button onClick={() => onStartConsultation(appointment)} className="flex-1 sm:flex-none bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 text-sm">Bắt đầu</button>
        )}
        {isPending && (
          <>
            <button onClick={() => onConfirmAppointment(appointment.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-green-100 text-green-700 font-bold py-2 px-3 rounded-lg hover:bg-green-200 text-sm"><ShieldCheckIcon className="w-4 h-4"/> <span>Xác nhận</span></button>
            <button onClick={() => onCancelAppointment(appointment.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-100 text-red-700 font-bold py-2 px-3 rounded-lg hover:bg-red-200 text-sm"><XCircleIcon className="w-4 h-4"/> <span>Hủy</span></button>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex items-center gap-4">
        <div className="bg-green-100 p-3 rounded-full">
            <Icon className="w-6 h-6 text-green-600" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    </div>
);