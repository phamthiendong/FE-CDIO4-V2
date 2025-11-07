import React, { useState, useMemo, useRef } from 'react';
import type { User, Appointment, Doctor, KnowledgeBaseItem, LearningRequest, Review, Service, Specialty, AiInteractionLog, RecentActivity } from '@/types/types';
import { UsersIcon } from '@/components/icons/UsersIcon';
import { BriefcaseIcon } from '@/components/icons/BriefcaseIcon';
import { CurrencyDollarIcon } from '@/components/icons/CurrencyDollarIcon';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { PlusCircleIcon } from '@/components/icons/PlusCircleIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { PencilSquareIcon } from '@/components/icons/PencilSquareIcon';
import { BrainIcon } from '@/components/icons/BrainIcon';
import { EyeIcon } from '@/components/icons/EyeIcon';
import { DoctorDetailModal } from '@/features/doctor/components/DoctorDetailModal';
import { ClipboardDocumentListIcon } from '@/components/icons/ClipboardDocumentListIcon';
import { ShieldCheckIcon } from '@/components/icons/ShieldCheckIcon';
import { XCircleIcon } from '@/components/icons/XCircleIcon';
import { Cog6ToothIcon } from '@/components/icons/Cog6ToothIcon';
import { BanknotesIcon } from '@/components/icons/BanknotesIcon';
import { ChartBarIcon } from '@/components/icons/ChartBarIcon';
import { CheckBadgeIcon } from '@/components/icons/CheckBadgeIcon';
import { ChatBubbleLeftRightIcon } from '@/components/icons/ChatBubbleLeftRightIcon';
import { UserPlusIcon } from '@/components/icons/UserPlusIcon';
import { MegaphoneIcon } from '@/components/icons/MegaphoneIcon';
import { StarIcon } from '@/components/icons/StarIcon';
import { UserCircleIcon } from '@/components/icons/UserCircleIcon';

interface AdminDashboardProps {
    users: User[];
    appointments: Appointment[];
    doctors: Doctor[];
    onInitiateAddDoctor: () => void;
    knowledgeBase: KnowledgeBaseItem[];
    learningRequests: LearningRequest[];
    onOpenKnowledgeModal: (item: KnowledgeBaseItem | null) => void;
    onDeleteKnowledgeItem: (itemId: string) => void;
    onResolveLearningRequest: (requestId: string, question: string) => void;
    onAdminViewPatientHistory: (patientId: string) => void;
    onInitiateUserEdit: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    services: Service[];
    onUpdateServicePrice: (specialty: Specialty, newPrice: number) => void;
    onDeleteReview: (doctorId: string, reviewId: string) => void;
    aiInteractionLogs: AiInteractionLog[];
    onSendHumanResponse: (logId: string, response: string) => void;
    activities: RecentActivity[];
    onSendAdminNotification: (doctorId: string, message: string) => void;
}

type AdminTab = 'overview' | 'userManagement' | 'appointmentManagement' | 'serviceManagement' | 'reporting' | 'aiModeration';

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex items-center gap-4">
        <div className="bg-cyan-100 p-3 rounded-full">
            <Icon className="w-6 h-6 text-cyan-600" />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    </div>
);

export const parseDate = (dateString: string): Date => {
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(NaN);
};

interface BarChartProps {
  data: { label: string; value: number }[];
  title: string;
  icon: React.ElementType;
  color: 'cyan' | 'indigo';
}

export const BarChart: React.FC<BarChartProps> = ({ data, title, icon: Icon, color }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const colorClasses = {
        cyan: 'bg-cyan-500 hover:bg-cyan-600',
        indigo: 'bg-indigo-500 hover:bg-indigo-600'
    };

    const formatValue = (value: number) => {
        return value.toLocaleString('vi-VN');
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Icon className="w-6 h-6 text-slate-500"/>
                {title}
            </h3>
            <div className="flex justify-around items-end h-48 gap-3 text-center relative">
                <div className="absolute w-full h-full border-l border-slate-200 grid grid-rows-4">
                    <div className="border-b border-slate-200"></div>
                    <div className="border-b border-slate-200"></div>
                    <div className="border-b border-slate-200"></div>
                    <div></div>
                </div>
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-grow h-full justify-end z-10">
                        <div 
                            className={`w-full rounded-t-md transition-colors group relative ${colorClasses[color]}`}
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                        >
                           <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                             {formatValue(item.value)}
                           </div>
                        </div>
                        <span className="text-xs font-medium text-slate-500 mt-2">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [selectedDoctorForDetail, setSelectedDoctorForDetail] = useState<Doctor | null>(null);
    const [notificationDoctor, setNotificationDoctor] = useState<Doctor | null>(null);
    
    const analyticsData = useMemo(() => {
        const completedAppointments = props.appointments.filter(a => a.status === 'Đã hoàn thành');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysRevenue = completedAppointments.filter(a => parseDate(a.date).getTime() === today.getTime()).reduce((sum, a) => sum + a.doctor.consultationFee, 0);
        const thisMonthRevenue = completedAppointments.filter(a => {
            const aptDate = parseDate(a.date);
            return aptDate.getMonth() === today.getMonth() && aptDate.getFullYear() === today.getFullYear();
        }).reduce((sum, a) => sum + a.doctor.consultationFee, 0);
        
        const dailyRevenueData = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const revenue = completedAppointments.filter(a => parseDate(a.date).getTime() === date.getTime()).reduce((sum, a) => sum + a.doctor.consultationFee, 0);
            let label = date.toLocaleDateString('vi-VN', { weekday: 'short' });
            if (i === 0) label = 'H.nay';
            if (i === 1) label = 'H.qua';
            return { label, value: revenue };
        }).reverse();

        const appointmentVolumeData = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const count = props.appointments.filter(a => {
                const aptDate = parseDate(a.date);
                return !isNaN(aptDate.getTime()) && aptDate.getTime() === date.getTime();
            }).length;
            let label = date.toLocaleDateString('vi-VN', { weekday: 'short' });
            if (i === 0) label = 'H.nay';
            if (i === 1) label = 'H.qua';
            return { label, value: count };
        }).reverse();


        return { todaysRevenue, thisMonthRevenue, dailyRevenueData, appointmentVolumeData };
    }, [props.appointments]);

    const tabs = [
        { id: 'overview', label: 'Tổng quan', icon: BriefcaseIcon },
        { id: 'userManagement', label: 'Quản lý Người dùng', icon: UsersIcon },
        { id: 'appointmentManagement', label: 'Quản lý Lịch khám', icon: CalendarIcon },
        { id: 'serviceManagement', label: 'Quản lý Dịch vụ', icon: Cog6ToothIcon },
        { id: 'reporting', label: 'Báo cáo & Thống kê', icon: ChartBarIcon },
        { id: 'aiModeration', label: 'Kiểm duyệt', icon: ChatBubbleLeftRightIcon },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewContent {...props} analyticsData={analyticsData} onTabChange={setActiveTab} />;
            case 'userManagement':
                return <UserManagementTab {...props} onSelectDoctorForDetail={setSelectedDoctorForDetail} onOpenNotificationModal={setNotificationDoctor} />;
            case 'appointmentManagement':
                return <AppointmentManagementTab {...props} />;
            case 'serviceManagement':
                return <ServiceManagementTab {...props} />;
            case 'reporting':
                return <ReportingTab {...props} />;
            case 'aiModeration':
                return <AiModerationTab {...props} />;
            default:
                return <div className="p-6 bg-white rounded-lg shadow-md border border-slate-200">Coming soon...</div>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-900 mb-8 px-2">Bảng điều khiển</h1>
                <nav className="space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as AdminTab)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rounded-lg transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-cyan-100 text-cyan-700 font-bold'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="flex-grow">
                {renderContent()}
            </main>
            {selectedDoctorForDetail && (
                <DoctorDetailModal doctor={selectedDoctorForDetail} appointments={props.appointments} users={props.users} onClose={() => setSelectedDoctorForDetail(null)} />
            )}
            {notificationDoctor && (
                <NotificationModal 
                    doctor={notificationDoctor} 
                    onClose={() => setNotificationDoctor(null)}
                    onSend={props.onSendAdminNotification}
                />
            )}
        </div>
    );
};

// --- Tab Content Components ---

const OverviewContent: React.FC<AdminDashboardProps & { analyticsData: any, onTabChange: (tab: AdminTab) => void }> = ({ users, doctors, analyticsData, activities, aiInteractionLogs, onTabChange, onDeleteReview }) => {
    
    const queriesToReview = aiInteractionLogs.filter(log => log.status === 'needs_human_review');
    const newUsers = activities.filter(act => act.type === 'new_user').slice(0, 3);
    const allReviews = useMemo(() => doctors.flatMap(d => d.reviews.map(r => ({ ...r, doctorName: d.name, doctorId: d.id }))).reverse(), [doctors]);


    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " năm trước";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " tháng trước";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " ngày trước";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " giờ trước";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " phút trước";
        return Math.floor(seconds) + " giây trước";
    };

    return (
    <div className="space-y-8">
        <h2 className="text-3xl font-bold text-slate-900">Tổng quan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Tổng Người dùng" value={users.length} icon={UsersIcon} />
            <StatCard title="Tổng Bác sĩ" value={doctors.length} icon={BriefcaseIcon} />
            <StatCard title="Doanh thu Hôm nay" value={`${analyticsData.todaysRevenue.toLocaleString('vi-VN')}đ`} icon={CurrencyDollarIcon} />
            <StatCard title="Doanh thu Tháng này" value={`${analyticsData.thisMonthRevenue.toLocaleString('vi-VN')}đ`} icon={CurrencyDollarIcon} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <BarChart data={analyticsData.dailyRevenueData} title="Doanh thu 7 ngày qua" icon={ChartBarIcon} color="cyan" />
            <BarChart data={analyticsData.appointmentVolumeData} title="Lượt khám 7 ngày qua" icon={CalendarIcon} color="indigo" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Cần chú ý</h3>
                 <div className="space-y-5">
                     <div>
                        <h4 className="font-semibold text-slate-600 text-sm mb-2 flex items-center gap-2">
                            <ChatBubbleLeftRightIcon className="w-5 h-5"/> Phản hồi AI ({queriesToReview.length})
                        </h4>
                        {queriesToReview.length > 0 ? (
                            <div className="space-y-2">
                                {queriesToReview.slice(0, 3).map(log => (
                                    <div key={log.id} className="text-sm p-2 bg-slate-50 rounded-md border border-slate-200">
                                        <p className="truncate italic">"{log.userQuery}"</p>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-slate-500">Không có mục nào.</p>}
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-600 text-sm mb-2 flex items-center gap-2">
                            <UserPlusIcon className="w-5 h-5"/> Người dùng mới
                        </h4>
                        {newUsers.length > 0 ? (
                            <div className="space-y-2">
                                 {newUsers.map(activity => (
                                    <div key={activity.id} className="text-sm p-2 bg-slate-50 rounded-md border border-slate-200">
                                        <p>{activity.message}</p>
                                        <p className="text-xs text-slate-500">{timeSince(activity.timestamp)}</p>
                                    </div>
                                 ))}
                            </div>
                        ) : <p className="text-sm text-slate-500">Không có người dùng mới.</p>}
                    </div>
                </div>
            </div>
             <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Lối tắt Nhanh</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => onTabChange('userManagement')} className="p-3 bg-cyan-50 hover:bg-cyan-100 rounded-lg text-cyan-800 font-semibold text-sm text-center">Quản lý User</button>
                    <button onClick={() => onTabChange('appointmentManagement')} className="p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-800 font-semibold text-sm text-center">Quản lý Lịch</button>
                    <button onClick={() => onTabChange('reporting')} className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-800 font-semibold text-sm text-center">Xem Báo cáo</button>
                    <button onClick={() => onTabChange('aiModeration')} className="p-3 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-800 font-semibold text-sm text-center">Kiểm duyệt</button>
                </div>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Đánh giá gần đây từ Khách hàng ({allReviews.length})</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {allReviews.length > 0 ? allReviews.map(review => (
                    <div key={review.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <UserCircleIcon className="w-10 h-10 text-slate-400 flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-slate-800">{review.author}</p>
                                    <p className="text-sm text-slate-500">đã đánh giá <span className="font-semibold text-slate-600">{review.doctorName}</span></p>
                                </div>
                            </div>
                            <button onClick={() => onDeleteReview(review.doctorId, review.id)} className="text-red-500 hover:text-red-700 flex-shrink-0 ml-4" title="Xóa đánh giá">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="flex items-center gap-1 my-2">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className={`w-5 h-5 ${i < Math.round(review.rating) ? 'text-amber-400' : 'text-slate-300'}`} />
                            ))}
                            <span className="text-sm font-bold text-slate-600 ml-2">{review.rating.toFixed(1)}</span>
                        </div>
                        <p className="italic text-slate-600">"{review.comment}"</p>
                    </div>
                )) : (
                    <p className="text-slate-500 text-center py-4">Không có đánh giá nào.</p>
                )}
            </div>
        </div>
    </div>
    );
};

const UserManagementTab: React.FC<Omit<AdminDashboardProps, 'onApproveAppointment' | 'onRejectAppointment'> & { onSelectDoctorForDetail: (d: Doctor) => void, onOpenNotificationModal: (d: Doctor) => void }> = ({ users, doctors, onInitiateAddDoctor, onInitiateUserEdit, onDeleteUser, onAdminViewPatientHistory, onSelectDoctorForDetail, onOpenNotificationModal }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Quản lý Người dùng ({users.length})</h2>
            <button onClick={onInitiateAddDoctor} className="flex items-center gap-2 bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors text-sm">
                <PlusCircleIcon className="w-5 h-5" /><span>Thêm Bác sĩ/Nhân viên</span>
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                    <tr>
                        <th scope="col" className="px-6 py-3">Tên</th>
                        <th scope="col" className="px-6 py-3">Email</th>
                        <th scope="col" className="px-6 py-3">Vai trò</th>
                        <th scope="col" className="px-6 py-3">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{user.name}</td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' : user.role === 'doctor' ? 'bg-indigo-100 text-indigo-800' : user.role === 'staff' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{user.role}</span></td>
                            <td className="px-6 py-4 flex items-center gap-4">
                                {user.role === 'doctor' && (
                                    <>
                                        <button onClick={() => onSelectDoctorForDetail(doctors.find(d=>d.userId === user.id)!)} className="text-blue-600 hover:text-blue-800" title="Xem chi tiết"><EyeIcon className="w-5 h-5" /></button>
                                        <button onClick={() => onOpenNotificationModal(doctors.find(d=>d.userId === user.id)!)} className="text-purple-600 hover:text-purple-800" title="Gửi thông báo"><MegaphoneIcon className="w-5 h-5" /></button>
                                    </>
                                )}
                                {user.role === 'patient' && <button onClick={() => onAdminViewPatientHistory(user.id)} className="text-cyan-600 hover:text-cyan-800" title="Xem bệnh án"><ClipboardDocumentListIcon className="w-5 h-5" /></button>}
                                <button onClick={() => onInitiateUserEdit(user)} className="text-gray-600 hover:text-gray-800" title="Sửa"><PencilSquareIcon className="w-5 h-5" /></button>
                                {user.role !== 'admin' && <button onClick={() => onDeleteUser(user.id)} className="text-red-600 hover:text-red-800" title="Xóa"><TrashIcon className="w-5 h-5" /></button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const AppointmentManagementTab: React.FC<Omit<AdminDashboardProps, 'onApproveAppointment' | 'onRejectAppointment' | 'onSendAdminNotification'>> = ({ appointments, users }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Quản lý Lịch khám ({appointments.length})</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                    <tr>
                        <th className="px-4 py-3">Bệnh nhân</th>
                        <th className="px-4 py-3">Bác sĩ</th>
                        <th className="px-4 py-3">Ngày/Giờ</th>
                        <th className="px-4 py-3">Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map(apt => {
                        const patient = users.find(u => u.id === apt.patientId);
                        const statusColors = { 
                            'Chờ xác nhận': 'bg-amber-100 text-amber-800', 
                            'Đã xác nhận': 'bg-blue-100 text-blue-800', 
                            'Đã hoàn thành': 'bg-green-100 text-green-800', 
                            'Đã hủy': 'bg-red-100 text-red-800',
                            'Sắp diễn ra': 'bg-blue-100 text-blue-800' // For legacy
                        };
                        return (
                        <tr key={apt.id} className="bg-white border-b hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900">{patient?.name}</td>
                            <td className="px-4 py-3">{apt.doctor.name}</td>
                            <td className="px-4 py-3">{apt.date} - {apt.time}</td>
                            <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[apt.status]}`}>{apt.status}</span></td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
    </div>
);

const ServiceManagementTab: React.FC<Omit<AdminDashboardProps, 'onApproveAppointment' | 'onRejectAppointment' | 'onSendAdminNotification'>> = ({ services, onUpdateServicePrice }) => {
    const [editingService, setEditingService] = useState<Specialty | null>(null);
    const priceRef = useRef<HTMLInputElement>(null);

    const handleSave = (specialty: Specialty) => {
        if (priceRef.current) {
            onUpdateServicePrice(specialty, Number(priceRef.current.value));
            setEditingService(null);
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Quản lý Dịch vụ & Giá</h2>
             <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                    <tr><th className="px-6 py-3">Chuyên khoa</th><th className="px-6 py-3">Giá (VNĐ)</th><th className="px-6 py-3">Hành động</th></tr>
                </thead>
                <tbody>
                    {services.map(service => (
                        <tr key={service.specialty} className="bg-white border-b">
                            <td className="px-6 py-4 font-medium">{service.specialty}</td>
                            <td className="px-6 py-4">
                                {editingService === service.specialty ? (
                                    <input type="number" ref={priceRef} defaultValue={service.price} className="p-1 border rounded-md" />
                                ) : service.price.toLocaleString('vi-VN')}
                            </td>
                            <td className="px-6 py-4">
                                {editingService === service.specialty ? (
                                    <button onClick={() => handleSave(service.specialty)} className="font-medium text-green-600">Lưu</button>
                                ) : (
                                    <button onClick={() => setEditingService(service.specialty)} className="font-medium text-blue-600">Sửa</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ReportingTab: React.FC<Omit<AdminDashboardProps, 'onApproveAppointment' | 'onRejectAppointment' | 'onSendAdminNotification'>> = ({ appointments, doctors, aiInteractionLogs }) => {
    const reportData = useMemo(() => {
        const completed = appointments.filter(a => a.status === 'Đã hoàn thành');
        const totalRevenue = completed.reduce((sum, a) => sum + a.doctor.consultationFee, 0);
        const avgRevenue = completed.length > 0 ? totalRevenue / completed.length : 0;

        // Monthly Revenue
        const monthlyRevenue = Array.from({ length: 12 }).map((_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            return {
                label: date.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' }),
                value: 0
            };
        }).reverse();

        completed.forEach(a => {
            const aptDate = parseDate(a.date);
            const monthLabel = aptDate.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
            const monthData = monthlyRevenue.find(m => m.label === monthLabel);
            if(monthData) {
                monthData.value += a.doctor.consultationFee;
            }
        });

        // Specialty Distribution
        const specialtyCounts: {[key: string]: number} = {};
        appointments.forEach(a => {
            specialtyCounts[a.doctor.specialty] = (specialtyCounts[a.doctor.specialty] || 0) + 1;
        });
        const specialtyDistribution = Object.entries(specialtyCounts).map(([label, value]) => ({ label, value }));

        // Status Distribution
        const statusCounts: {[key: string]: number} = {};
        appointments.forEach(a => {
            statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
        });
        const statusDistribution = Object.entries(statusCounts).map(([label, value]) => ({ label, value }));

        // Doctor Performance
        const doctorPerformance = doctors.map(doc => {
            const docAppointments = completed.filter(a => a.doctor.id === doc.id);
            return {
                ...doc,
                completedCount: docAppointments.length,
                totalRevenue: docAppointments.reduce((sum, a) => sum + a.doctor.consultationFee, 0)
            }
        }).sort((a, b) => b.totalRevenue - a.totalRevenue);

        return {
            totalRevenue,
            totalAppointments: appointments.length,
            avgRevenue,
            totalAiInteractions: aiInteractionLogs.length,
            monthlyRevenue,
            specialtyDistribution,
            statusDistribution,
            doctorPerformance
        }

    }, [appointments, doctors, aiInteractionLogs]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Tổng Doanh thu" value={`${reportData.totalRevenue.toLocaleString('vi-VN')}đ`} icon={CurrencyDollarIcon} />
                <StatCard title="Tổng Lượt khám" value={reportData.totalAppointments.toLocaleString('vi-VN')} icon={CalendarIcon} />
                <StatCard title="Doanh thu/Lượt khám" value={`${Math.round(reportData.avgRevenue).toLocaleString('vi-VN')}đ`} icon={BanknotesIcon} />
                <StatCard title="Tương tác AI" value={reportData.totalAiInteractions.toLocaleString('vi-VN')} icon={BrainIcon} />
            </div>

            <LineChart data={reportData.monthlyRevenue} title="Doanh thu Hàng tháng (12 tháng qua)" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DonutChart data={reportData.specialtyDistribution} title="Phân bổ Lượt khám theo Chuyên khoa" />
                <DonutChart data={reportData.statusDistribution} title="Phân bổ Trạng thái Lịch hẹn" />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Hiệu suất Bác sĩ</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Bác sĩ</th>
                                <th scope="col" className="px-6 py-3 text-right">Lượt khám Hoàn thành</th>
                                <th scope="col" className="px-6 py-3 text-right">Tổng Doanh thu</th>
                                <th scope="col" className="px-6 py-3 text-right">Đánh giá TB</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.doctorPerformance.map(doc => (
                                <tr key={doc.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{doc.name}</td>
                                    <td className="px-6 py-4 text-right">{doc.completedCount.toLocaleString('vi-VN')}</td>
                                    <td className="px-6 py-4 text-right">{doc.totalRevenue.toLocaleString('vi-VN')}đ</td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                                        <StarIcon className="w-4 h-4 text-amber-400" />
                                        {doc.rating.toFixed(1)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AiModerationTab: React.FC<Pick<AdminDashboardProps, 'aiInteractionLogs' | 'onSendHumanResponse' | 'knowledgeBase' | 'onOpenKnowledgeModal' | 'onDeleteKnowledgeItem'>> = (props) => {
    const queriesToReview = props.aiInteractionLogs.filter(log => log.status === 'needs_human_review');

    return (
        <div className="space-y-6">
             <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                    Phản hồi AI cần trả lời ({queriesToReview.length})
                </h2>
                <div className="space-y-4">
                    {queriesToReview.map(log => (
                        <AiResponseItem key={log.id} log={log} onSendHumanResponse={props.onSendHumanResponse} />
                    ))}
                    {queriesToReview.length === 0 && <p className="text-slate-500">Không có câu hỏi nào cần phản hồi.</p>}
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">Cơ sở Tri thức AI</h3>
                    <button onClick={() => props.onOpenKnowledgeModal(null)} className="flex items-center gap-2 bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 text-sm">
                        <PlusCircleIcon className="w-5 h-5" /><span>Thêm kiến thức</span>
                    </button>
                </div>
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                        <tr>
                            <th className="px-6 py-3">Triệu chứng</th><th className="px-6 py-3">Chẩn đoán</th><th className="px-6 py-3">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.knowledgeBase.map(item => (
                            <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-6 py-4">{item.symptom}</td>
                                <td className="px-6 py-4">{item.diagnosis}</td>
                                <td className="px-6 py-4 flex items-center gap-4">
                                    <button onClick={() => props.onOpenKnowledgeModal(item)} className="text-blue-600 hover:text-blue-800"><PencilSquareIcon className="w-5 h-5" /></button>
                                    <button onClick={() => props.onDeleteKnowledgeItem(item.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AiResponseItem: React.FC<{log: AiInteractionLog, onSendHumanResponse: (logId: string, response: string) => void}> = ({ log, onSendHumanResponse }) => {
    const [response, setResponse] = useState('');
    const handleSubmit = () => {
        if(response.trim()) {
            onSendHumanResponse(log.id, response);
            setResponse('');
        }
    }
    return (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <p className="text-sm text-slate-600 mb-1">Câu hỏi từ User ID: <span className="font-mono text-xs">{log.userId}</span></p>
            <p className="font-semibold text-slate-800 italic">"{log.userQuery}"</p>
            <div className="mt-3 flex gap-2">
                <textarea 
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={2}
                    placeholder="Nhập câu trả lời của bạn ở đây..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500"
                />
                <button onClick={handleSubmit} className="bg-cyan-600 text-white font-bold px-4 rounded-lg hover:bg-cyan-700 text-sm disabled:bg-slate-400" disabled={!response.trim()}>
                    Gửi
                </button>
            </div>
        </div>
    )
};

const NotificationModal: React.FC<{doctor: Doctor, onClose: () => void, onSend: (doctorId: string, message: string) => void}> = ({ doctor, onClose, onSend }) => {
    const [message, setMessage] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(message.trim()) {
            onSend(doctor.id, message);
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-slate-900">Gửi thông báo</h2>
                        <p className="text-sm text-slate-500">Gửi tin nhắn tới {doctor.name}.</p>
                    </div>
                    <div className="p-6">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            className="w-full p-3 border border-slate-300 rounded-md"
                            placeholder="Nhập nội dung thông báo..."
                            required
                        />
                    </div>
                    <div className="p-4 bg-slate-50 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 font-bold rounded-full hover:bg-slate-300">Hủy</button>
                        <button type="submit" disabled={!message.trim()} className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-700 disabled:bg-slate-400">Gửi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- New Chart Components ---

const LineChart: React.FC<{data: {label: string; value: number}[], title: string}> = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (d.value / maxValue) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
         <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
            <div className="h-64 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                    <polyline fill="none" stroke="#06b6d4" strokeWidth="2" points={points} />
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * 100;
                        const y = 100 - (d.value / maxValue) * 100;
                        return <circle key={i} cx={x} cy={y} r="1.5" fill="#06b6d4" />;
                    })}
                </svg>
                <div className="absolute top-0 left-0 -translate-x-full pr-2 h-full flex flex-col justify-between text-xs text-slate-500">
                    <span>{Math.round(maxValue).toLocaleString('vi-VN')}đ</span>
                    <span>0đ</span>
                </div>
                 <div className="absolute bottom-0 -mb-6 w-full flex justify-between text-xs text-slate-500">
                    {data.map((d, i) => (data.length < 15 || i % 2 === 0) && <span key={i}>{d.label}</span>)}
                </div>
            </div>
        </div>
    );
};

const DonutChart: React.FC<{data: {label: string; value: number}[], title: string}> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    let cumulative = 0;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
            <div className="grid grid-cols-2 gap-4 items-center">
                <div className="relative w-40 h-40 mx-auto">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const offset = cumulative;
                            cumulative += percentage;
                            return (
                                <circle
                                    key={index}
                                    cx="18" cy="18" r="15.915"
                                    fill="transparent"
                                    stroke={colors[index % colors.length]}
                                    strokeWidth="3.8"
                                    strokeDasharray={`${percentage} ${100 - percentage}`}
                                    strokeDashoffset={-offset}
                                    transform="rotate(-90 18 18)"
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-800">{total}</span>
                        <span className="text-xs text-slate-500">Tổng cộng</span>
                    </div>
                </div>
                <div className="space-y-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></span>
                            <span className="font-semibold text-slate-700">{item.label}:</span>
                            <span className="text-slate-500">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};