import React, { useMemo } from 'react';
import type { User, Appointment, Notification } from '@/types/types';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { BellIcon } from '@/components/icons/BellIcon';
import { MagnifyingGlassIcon } from '@/components/icons/MagnifyingGlassIcon';
import { ClockIcon } from '@/components/icons/ClockIcon';


interface PatientDashboardProps {
  currentUser: User;
  appointments: Appointment[];
  notifications: Notification[];
  onFindDoctor: () => void;
  onViewAppointments: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ currentUser, appointments, notifications, onFindDoctor, onViewAppointments }) => {
    
    const upcomingAppointment = useMemo(() => {
        return appointments
            .filter(a => a.status === 'Đã xác nhận' && new Date(a.date.split('/').reverse().join('-')) >= new Date())
            .sort((a,b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime())
            [0];
    }, [appointments]);

    const recentUnreadNotifications = useMemo(() => {
        return notifications.filter(n => !n.read).slice(0, 3);
    }, [notifications]);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-slate-900">Chào mừng trở lại, {currentUser.name}!</h1>
                <p className="mt-2 text-lg text-slate-600">Đây là bảng điều khiển sức khỏe của bạn.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionCard 
                    title="Tìm Bác sĩ" 
                    description="Tìm kiếm và đặt lịch với chuyên gia." 
                    icon={MagnifyingGlassIcon} 
                    onClick={onFindDoctor} 
                    color="cyan"
                />
                <ActionCard 
                    title="Xem Lịch hẹn" 
                    description="Quản lý các cuộc hẹn sắp tới và đã qua." 
                    icon={CalendarIcon} 
                    onClick={onViewAppointments}
                    color="indigo"
                />
            </div>

            {upcomingAppointment && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Lịch hẹn sắp tới</h2>
                    <div className="bg-blue-50 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <img src={upcomingAppointment.doctor.imageUrl} alt={upcomingAppointment.doctor.name} className="w-12 h-12 rounded-full" />
                            <div>
                                <p className="font-bold text-slate-800">BS. {upcomingAppointment.doctor.name}</p>
                                <p className="text-sm text-slate-600">{upcomingAppointment.doctor.specialty}</p>
                            </div>
                        </div>
                         <div className="text-sm text-slate-700 space-y-1">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{upcomingAppointment.date}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                <span>{upcomingAppointment.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Thông báo gần đây</h2>
                {recentUnreadNotifications.length > 0 ? (
                    <div className="space-y-3">
                        {recentUnreadNotifications.map(n => (
                             <div key={n.id} className="bg-slate-50 p-3 rounded-lg flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                    <BellIcon className="w-5 h-5 text-amber-600" />
                                </div>
                                <p className="text-sm text-slate-700">{n.message}</p>
                             </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-4">Bạn không có thông báo mới nào.</p>
                )}
            </div>
        </div>
    );
};


interface ActionCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    onClick: () => void;
    color: 'cyan' | 'indigo';
}
const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon: Icon, onClick, color }) => {
    const colorClasses = {
        cyan: {
            bg: 'bg-cyan-50',
            text: 'text-cyan-800',
            hoverBg: 'hover:bg-cyan-100',
            iconBg: 'bg-cyan-100',
            iconText: 'text-cyan-600'
        },
        indigo: {
             bg: 'bg-indigo-50',
            text: 'text-indigo-800',
            hoverBg: 'hover:bg-indigo-100',
            iconBg: 'bg-indigo-100',
            iconText: 'text-indigo-600'
        }
    }
    const classes = colorClasses[color];

    return (
        <button onClick={onClick} className={`p-6 rounded-2xl shadow-lg border border-slate-200 flex items-start gap-4 text-left transition-colors ${classes.bg} ${classes.hoverBg}`}>
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${classes.iconBg}`}>
                <Icon className={`w-6 h-6 ${classes.iconText}`} />
            </div>
            <div>
                <h3 className={`text-xl font-bold ${classes.text}`}>{title}</h3>
                <p className="mt-1 text-slate-600">{description}</p>
            </div>
        </button>
    )
};