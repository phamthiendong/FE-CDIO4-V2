
import React, { useState, useMemo } from 'react';
import type { Appointment, Doctor, User } from '../../types/types';
import { CalendarIcon } from '../../components/icons/CalendarIcon';
import { ClockIcon } from '../../components/icons/ClockIcon';
import { CurrencyDollarIcon } from '../../components/icons/CurrencyDollarIcon';
import { ClipboardDocumentListIcon } from '../../components/icons/ClipboardDocumentListIcon';
import { ShieldCheckIcon } from '../../components/icons/ShieldCheckIcon';
import { XCircleIcon } from '../../components/icons/XCircleIcon';
import { BarChart, parseDate } from "@/pages/admin/AdminDashboard";
import { BriefcaseIcon } from '../../components/icons/BriefcaseIcon';
import { DocumentChartBarIcon } from '../../components/icons/DocumentChartBarIcon';
import { ChartBarIcon } from '../../components/icons/ChartBarIcon';

interface DoctorSchedulePageProps {
  doctor: Doctor;
  appointments: Appointment[];
  users: User[];
  onStartConsultation: (appointment: Appointment) => void;
  onViewPatientHistory: (patientId: string) => void;
  onConfirmAppointment: (appointmentId: string) => void;
  onCancelAppointment: (appointmentId: string) => void;
}

type DoctorTab = 'schedule' | 'reporting';

export const DoctorSchedulePage: React.FC<DoctorSchedulePageProps> = (props) => {
  const [activeTab, setActiveTab] = useState<DoctorTab>('schedule');
  
  const tabs = [
    { id: 'schedule', label: 'Lịch hẹn', icon: CalendarIcon },
    { id: 'reporting', label: 'Báo cáo', icon: DocumentChartBarIcon },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'schedule':
        return <ScheduleTab {...props} />;
      case 'reporting':
        return <ReportingTab doctor={props.doctor} appointments={props.appointments} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img 
            src={props.doctor.imageUrl} 
            alt={props.doctor.name} 
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-slate-900">Quản lý Lịch hẹn & Báo cáo</h1>
            <p className="text-xl font-medium text-cyan-700 mt-1">{props.doctor.name}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-slate-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DoctorTab)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-cyan-600 text-cyan-600'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {renderContent()}

    </div>
  );
};

// --- Schedule Tab ---
const ScheduleTab: React.FC<DoctorSchedulePageProps> = ({ appointments, users, onStartConsultation, onViewPatientHistory, onConfirmAppointment, onCancelAppointment }) => {
  const pendingAppointments = appointments.filter(apt => apt.status === 'Chờ xác nhận');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'Đã xác nhận' || apt.status === 'Sắp diễn ra');
  const completedAppointments = appointments.filter(apt => apt.status === 'Đã hoàn thành');

  const renderAppointmentList = (title: string, apts: Appointment[], isPending = false) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-4 border-b pb-2">{title} ({apts.length})</h2>
      {apts.length > 0 ? (
        <div className="space-y-4">
          {apts.map(apt => (
            <AppointmentCard 
              key={apt.id} 
              appointment={apt} 
              users={users} 
              onStartConsultation={onStartConsultation}
              onViewPatientHistory={onViewPatientHistory}
              onConfirmAppointment={onConfirmAppointment}
              onCancelAppointment={onCancelAppointment}
              isPending={isPending}
            />
          ))}
        </div>
      ) : (
        <p className="text-slate-500 p-4 text-center">Không có lịch hẹn nào.</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {renderAppointmentList("Yêu cầu cần xác nhận", pendingAppointments, true)}
      {renderAppointmentList("Lịch hẹn sắp tới", confirmedAppointments)}
      {renderAppointmentList("Đã hoàn thành", completedAppointments)}
    </div>
  );
};

// --- Reporting Tab ---
const ReportingTab: React.FC<{doctor: Doctor, appointments: Appointment[]}> = ({ doctor, appointments }) => {
  const revenueData = useMemo(() => {
    const completedAppointments = appointments.filter(a => a.status === 'Đã hoàn thành');
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
  }, [appointments]);

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard title="Lượt khám tháng này" value={appointments.filter(a => {
            const aptDate = parseDate(a.date);
            return aptDate.getMonth() === new Date().getMonth() && aptDate.getFullYear() === new Date().getFullYear();
          }).length.toString()} icon={CalendarIcon} />
          <StatCard title="Doanh thu tháng này" value={`${revenueData.thisMonthRevenue.toLocaleString('vi-VN')}đ`} icon={CurrencyDollarIcon} />
      </div>
       <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
          {/* FIX: Added missing 'icon' and 'color' props to BarChart component call. */}
          <BarChart data={revenueData.dailyRevenueData} title="Doanh thu 7 ngày qua" icon={ChartBarIcon} color="cyan" />
       </div>
    </div>
  );
};

// --- Sub-components ---

interface AppointmentCardProps {
    appointment: Appointment;
    users: User[];
    onStartConsultation: (appointment: Appointment) => void;
    onViewPatientHistory: (patientId: string) => void;
    onConfirmAppointment: (appointmentId: string) => void;
    onCancelAppointment: (appointmentId: string) => void;
    isPending?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, users, onStartConsultation, onViewPatientHistory, onConfirmAppointment, onCancelAppointment, isPending }) => {
  const patient = users.find(u => u.id === appointment.patientId);
  const patientName = patient ? patient.name : "Bệnh nhân không xác định";

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="font-bold text-lg text-slate-800">{patientName}</p>
        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
           <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{appointment.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span>{appointment.time}</span>
            </div>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {!isPending && (
          <button 
            onClick={() => onViewPatientHistory(appointment.patientId)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-900 bg-cyan-50 py-2 px-4 rounded-lg border border-cyan-200"
          >
            <ClipboardDocumentListIcon className="w-5 h-5" />
            <span>Hồ sơ</span>
          </button>
        )}
        {(appointment.status === 'Đã xác nhận' || appointment.status === 'Sắp diễn ra') && (
            <button 
              onClick={() => onStartConsultation(appointment)}
              className="flex-1 sm:flex-none bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Bắt đầu
            </button>
        )}
        {isPending && (
          <>
            <button onClick={() => onConfirmAppointment(appointment.id)} className="flex-1 sm:flex-none flex items-center gap-2 bg-green-100 text-green-700 font-bold py-2 px-4 rounded-lg hover:bg-green-200 text-sm">
                <ShieldCheckIcon className="w-5 h-5"/> <span>Xác nhận</span>
            </button>
            <button onClick={() => onCancelAppointment(appointment.id)} className="flex-1 sm:flex-none flex items-center gap-2 bg-red-100 text-red-700 font-bold py-2 px-4 rounded-lg hover:bg-red-200 text-sm">
                <XCircleIcon className="w-5 h-5"/> <span>Hủy</span>
            </button>
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
