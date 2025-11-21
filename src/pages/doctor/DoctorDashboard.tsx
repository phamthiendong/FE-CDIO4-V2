import React, { useState, useMemo, useEffect } from 'react';
import type { Appointment, Doctor, User, Notification, MedicalHistoryRecord } from '@/types/types';
import { 
  Calendar, 
  Clock, 
  ShieldCheck, 
  XCircle, 
  Star, 
  Megaphone, 
  Plus, 
  DollarSign, 
  Video, 
  Building2,
  Search,
  History,
  ChevronLeft,
  ChevronRight,
  Filter,
  Timer,
  Eye,
  X,
  StickyNote
} from 'lucide-react';

const formatTimeDisplay = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const date = new Date(1970, 0, 1, parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString('vi-VN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
};

interface DoctorDashboardProps {
  doctor: Doctor;
  appointments: Appointment[];
  users: User[];
  userNotifications: Notification[];
  totalRevenue: number;
  medicalHistory: MedicalHistoryRecord[];
  onStartConsultation: (appointment: Appointment) => void;
  onConfirmAppointment: (appointmentId: string) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onViewSchedule: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = (props) => {
    const { 
        doctor, 
        appointments, 
        users, 
        userNotifications, 
        totalRevenue, 
        medicalHistory,
        onStartConsultation, 
        onConfirmAppointment, 
        onCancelAppointment, 
        onViewSchedule 
    } = props;
    
    const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');
    
    // --- States cho Lịch sử khám bệnh ---
    const [historySearch, setHistorySearch] = useState('');
    const [historyTimeFilter, setHistoryTimeFilter] = useState<'all' | '7days' | '30days'>('all');
    const [historyPage, setHistoryPage] = useState(1);
    const itemsPerPage = 5;

    // --- States cho Modal ---
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    const today = new Date().toISOString().split('T')[0];
    
    // Logic lọc lịch hẹn hôm nay
    const todaysAppointments = useMemo(() => {
        return appointments.filter(a => 
            a.date === today && 
            (
                a.status === 'Đã xác nhận' || 
                a.status === 'Sắp diễn ra' || 
                (a.status === 'Chờ xác nhận' && a.type === 'offline')
            )
        );
    }, [appointments, today]);
    
    const todayOnlineCount = todaysAppointments.filter(a => a.type === 'online').length;
    const todayOfflineCount = todaysAppointments.filter(a => a.type === 'offline').length;
    const latestReview = [...doctor.reviews].reverse()[0];

    const filteredTodaysAppointments = useMemo(() => {
        if (filter === 'all') return todaysAppointments;
        return todaysAppointments.filter(apt => apt.type === filter);
    }, [todaysAppointments, filter]);

    // Logic lọc Lịch sử khám bệnh
    const filteredHistory = useMemo(() => {
        let result = medicalHistory || [];

        if (historySearch) {
            const searchLower = historySearch.toLowerCase();
            result = result.filter(record => 
                record.patientName.toLowerCase().includes(searchLower) ||
                record.diagnosis.toLowerCase().includes(searchLower)
            );
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (historyTimeFilter === '7days') {
            const sevenDaysAgo = new Date(startOfDay);
            sevenDaysAgo.setDate(startOfDay.getDate() - 7);
            result = result.filter(r => new Date(r.date) >= sevenDaysAgo);
        } else if (historyTimeFilter === '30days') {
            const thirtyDaysAgo = new Date(startOfDay);
            thirtyDaysAgo.setDate(startOfDay.getDate() - 30);
            result = result.filter(r => new Date(r.date) >= thirtyDaysAgo);
        }

        return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [medicalHistory, historySearch, historyTimeFilter]);

    // Phân trang
    const totalHistoryPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const paginatedHistory = filteredHistory.slice(
        (historyPage - 1) * itemsPerPage,
        historyPage * itemsPerPage
    );

    useEffect(() => {
        setHistoryPage(1);
    }, [historySearch, historyTimeFilter]);

    const selectedPatient = users.find(u => u.id === selectedPatientId);
    const selectedPatientHistory = useMemo(() => {
        return selectedPatientId 
            ? (medicalHistory || [])
                .filter(h => h.patientId === selectedPatientId)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            : [];
    }, [selectedPatientId, medicalHistory]);

    return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Chào mừng trở lại, {doctor.name}!</h1>
            <p className="mt-2 text-md md:text-lg text-slate-600">Lịch làm việc của bạn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Lịch Khám Online" value={todayOnlineCount.toString()} icon={Video} color="cyan" />
        <StatCard title="Lịch Khám Offline" value={todayOfflineCount.toString()} icon={Building2} color="blue" />
        <StatCard title="Tổng lịch Khám" value={todaysAppointments.length.toString()} icon={Calendar} color="indigo" />
        <StatCard 
            title="Doanh Thu (Online)" 
            value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue)} 
            icon={DollarSign}
            color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <DashboardCard title="Lịch hẹn hôm nay" icon={Calendar}>
                    <div className="flex flex-wrap gap-2 mb-6">
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
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <p className="text-slate-500">Không có lịch hẹn nào.</p>
                        </div>
                    )}
                </DashboardCard>
            </div>

            <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between gap-3">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <Calendar className="w-4 h-4 text-cyan-600" />
                        <span>Lịch làm việc</span>
                    </div>
                    <p className="text-xs text-slate-500">Quản lý khung giờ khám bệnh của bạn.</p>
                    <button onClick={onViewSchedule} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 text-xs transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Quản lý lịch</span>
                    </button>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                            <Megaphone className="w-4 h-4 text-purple-600" />
                            <span>Thông báo</span>
                        </div>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                            {userNotifications.length}
                        </span>
                    </div>
                    {userNotifications.length > 0 ? (
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                            <p className="text-xs text-purple-900 font-medium line-clamp-3">{userNotifications[0].message}</p>
                            <p className="text-[10px] text-purple-500 mt-1 text-right">Mới nhất</p>
                        </div>
                    ) : <p className="text-xs text-slate-500 italic">Không có thông báo.</p>}
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <Star className="w-4 h-4 text-amber-500" />
                        <span>Đánh giá mới nhất</span>
                    </div>
                    {latestReview ? (
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-bold text-slate-700">{latestReview.author}</span>
                                <div className="flex items-center gap-0.5 text-amber-500">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span className="text-xs font-bold">{latestReview.rating}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <p className="text-xs text-slate-600 italic line-clamp-3">"{latestReview.comment}"</p>
                            </div>
                        </div>
                    ): <p className="text-xs text-slate-500">Chưa có đánh giá.</p>}
                </div>
            </div>
      </div>

      <DashboardCard title="Lịch sử khám bệnh" icon={History}>
            <div className="flex flex-col sm:flex-row gap-4 mb-5 justify-between items-start sm:items-center">
                {/* Search Input */}
                <div className="relative flex-grow w-full sm:w-auto">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm theo Tên hoặc Bệnh án..." 
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-sm"
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
                    {['all', '7days', '30days'].map((tFilter) => (
                        <button 
                            key={tFilter}
                            onClick={() => setHistoryTimeFilter(tFilter as any)}
                            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${historyTimeFilter === tFilter ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {tFilter === 'all' ? 'Tất cả' : tFilter === '7days' ? '7 ngày' : '30 ngày'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 mb-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Bệnh nhân</th>
                                <th className="px-4 py-3">Ngày khám</th>
                                <th className="px-4 py-3">Chẩn đoán</th>
                                <th className="px-4 py-3">Toa thuốc</th>
                                <th className="px-4 py-3 text-center">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {paginatedHistory.length > 0 ? (
                                paginatedHistory.map(record => (
                                    <tr 
                                        key={record.id} 
                                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                                        onClick={() => setSelectedPatientId(record.patientId)}
                                    >
                                        <td className="px-4 py-3 font-medium text-slate-800">{record.patientName}</td>
                                        <td className="px-4 py-3 text-slate-500">{new Date(record.date).toLocaleDateString('vi-VN')}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">{record.diagnosis}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={record.prescription}>{record.prescription}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-colors" title="Xem chi tiết">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                                <Filter className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p>Không tìm thấy lịch sử khám nào phù hợp.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalHistoryPages > 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-4 border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-500 text-center sm:text-left">Trang <span className="font-medium text-slate-800">{historyPage}</span> / {totalHistoryPages}</p>
                    <div className="flex items-center justify-center gap-2">
                        <button 
                            onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex gap-1">
                             {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page} onClick={() => setHistoryPage(page)}
                                    className={`w-7 h-7 text-xs font-medium rounded-md transition-all ${page === historyPage ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))} disabled={historyPage === totalHistoryPages}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="hidden sm:block"></div>
                </div>
            )}
      </DashboardCard>

      {selectedPatientId && selectedPatient && (
          <PatientHistoryModal 
            isOpen={!!selectedPatientId} 
            onClose={() => setSelectedPatientId(null)} 
            patient={selectedPatient}
            historyRecords={selectedPatientHistory}
          />
      )}

    </div>
  );
};
const PatientHistoryModal: React.FC<{ isOpen: boolean; onClose: () => void; patient: User; historyRecords: MedicalHistoryRecord[]; }> = ({ isOpen, onClose, patient, historyRecords }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{patient.name}</h2>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <span className="text-cyan-600">BỆNH NHÂN</span>
                                <span>•</span><span>{patient.gender || 'N/A'}</span>
                                <span>•</span><span>{patient.age ? `${patient.age} tuổi` : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                {/* Body */}
                <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1 custom-scrollbar">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-cyan-600" /> Lịch sử khám bệnh</h3>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200">Tổng: {historyRecords.length}</span>
                    </div>
                    <div className="space-y-0">
                        {historyRecords.length > 0 ? (
                            historyRecords.map((record, index) => (
                                <div key={record.id} className="relative pl-8 pb-8 last:pb-0 group">
                                    {index !== historyRecords.length - 1 && (<div className="absolute left-[3px] top-3 bottom-0 w-0.5 bg-slate-200 group-last:hidden"></div>)}
                                    <div className="absolute left-[-4px] top-1.5 w-4 h-4 rounded-full bg-cyan-500 ring-4 ring-white shadow-sm z-10"></div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-3.5 h-3.5 text-cyan-700" />
                                        <span className="text-sm font-bold text-cyan-700">{new Date(record.date).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="mb-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Chẩn đoán</span>
                                            <p className="text-lg font-bold text-slate-800">{record.diagnosis}</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Triệu chứng</span>
                                                <p className="text-sm text-slate-700 leading-relaxed">{record.symptoms || 'Không ghi nhận'}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">Ghi chú</span>
                                                <p className="text-sm text-slate-700 leading-relaxed italic">"{record.notes}"</p>
                                            </div>
                                        </div>
                                        <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide block mb-1 flex items-center gap-1.5"><StickyNote className="w-3 h-3" /> Toa thuốc đã kê</span>
                                            <p className="text-sm font-medium text-slate-700 font-mono">{record.prescription}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : <div className="text-center py-12"><p className="text-slate-500">Chưa có lịch sử khám bệnh.</p></div>}
                    </div>
                </div>
                 <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-sm">Đóng</button>
                 </div>
            </div>
        </div>
    );
}

const FilterButton: React.FC<{active: boolean, onClick: () => void, children: React.ReactNode}> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-full transition-all border ${active ? 'bg-cyan-600 text-white border-cyan-600 shadow-md shadow-cyan-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
        {children}
    </button>
)

const DashboardCard: React.FC<{ title: string; icon?: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 h-full flex flex-col">
        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2.5 pb-3 border-b border-slate-50">
            {Icon && <Icon className="w-5 h-5 text-cyan-600" />}
            {title}
        </h2>
        <div className="flex-1">{children}</div>
    </div>
);

const AppointmentCard: React.FC<{ appointment: Appointment; users: User[]; onStartConsultation: (a: Appointment) => void; onConfirmAppointment: (id: string) => void; onCancelAppointment: (id: string) => void; }> = ({ appointment, users, onStartConsultation, onConfirmAppointment, onCancelAppointment }) => {
  const patient = users.find(u => u.id === appointment.patientId);
  const formattedDate = new Date(`${appointment.date}T00:00:00`).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' });
  const isOnline = appointment.type === 'online';
  const isPending = appointment.status === 'Chờ xác nhận';
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!isOnline || isPending) return;
    const calculateTimeRemaining = () => {
        const now = new Date();
        const [hours, minutes] = appointment.time.split(':').map(Number);
        const apptDate = new Date(); 
        apptDate.setHours(hours, minutes, 0, 0);
        const diffMs = apptDate.getTime() - now.getTime();
        
        if (diffMs <= 0) { setTimeRemaining('Đang diễn ra'); return; }
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(diffHrs > 0 ? `Còn ${diffHrs} giờ ${diffMins} phút` : `Còn ${diffMins} phút`);
    };
    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 60000);
    return () => clearInterval(timer);
  }, [appointment.time, isOnline, isPending]);
  
  const cardStyles = isOnline ? 'bg-gradient-to-r from-cyan-50 to-white border-cyan-100 hover:border-cyan-200' : 'bg-gradient-to-r from-amber-50 to-white border-amber-100 hover:border-amber-200';
  const iconBg = isOnline ? 'bg-cyan-100 text-cyan-700' : 'bg-amber-100 text-amber-700';

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 ${cardStyles}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={patient?.avatar} alt={patient?.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"/>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ${iconBg}`}>
                {isOnline ? <Video className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg">{patient?.name || 'Bệnh nhân'}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /><span>{formattedDate}</span></div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /><span>{formatTimeDisplay(appointment.time)}</span></div>
                {isOnline && !isPending && timeRemaining && timeRemaining !== 'Đang diễn ra' && (
                    <div className="flex items-center gap-1.5 text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100"><Timer className="w-3 h-3" /><span className="font-medium text-xs">{timeRemaining}</span></div>
                )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-none justify-end">
            {isOnline && (appointment.status === 'Đã xác nhận' || appointment.status === 'Sắp diễn ra') && (
                <button onClick={() => onStartConsultation(appointment)} className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 text-sm transition-colors shadow-md shadow-cyan-100">Bắt đầu khám</button>
            )}
            {!isOnline && (appointment.status === 'Đã xác nhận' || appointment.status === 'Sắp diễn ra') && (
                 <div className="w-full sm:w-auto flex items-center justify-center sm:justify-end gap-2 px-4 py-2.5 bg-slate-50 text-slate-700 font-bold rounded-lg border border-slate-200 text-sm"><Clock className="w-4 h-4" /><span>Khám lúc {formatTimeDisplay(appointment.time)}</span></div>
            )}
            {isPending && (
            <>
                <button onClick={() => onConfirmAppointment(appointment.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 font-semibold py-2.5 px-4 rounded-lg border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 text-sm transition-all"><ShieldCheck className="w-4 h-4"/> <span>Xác nhận</span></button>
                <button onClick={() => onCancelAppointment(appointment.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-700 font-semibold py-2.5 px-4 rounded-lg border border-red-100 hover:bg-red-100 hover:border-red-200 text-sm transition-all"><XCircle className="w-4 h-4"/> <span>Hủy</span></button>
            </>
            )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: 'cyan' | 'blue' | 'emerald' | 'indigo'; }> = ({ title, value, icon: Icon, color }) => {
    const colors = {
        cyan: { bg: 'bg-cyan-50', iconBg: 'bg-cyan-100', iconText: 'text-cyan-600' },
        blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconText: 'text-blue-600' },
        emerald: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600' },
        indigo: { bg: 'bg-indigo-50', iconBg: 'bg-indigo-100', iconText: 'text-indigo-600' },
    };
    const theme = colors[color];
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`${theme.iconBg} p-3.5 rounded-xl`}><Icon className={`w-7 h-7 ${theme.iconText}`} /></div>
            <div><p className="text-sm font-medium text-slate-500 mb-1">{title}</p><p className="text-3xl font-bold text-slate-900">{value}</p></div>
        </div>
    );
};