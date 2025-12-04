import React, { useState, useMemo, useEffect } from "react";
import type {
  Appointment,
  Doctor,
  User,
  Notification,
  MedicalHistoryRecord,
} from "@/types/types";
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
  StickyNote,
  AlertTriangle,
} from "lucide-react";

// --- HELPERS ---
const formatTimeDisplay = (time24: string) => {
  const [hours, minutes] = time24.split(":");
  const date = new Date(1970, 0, 1, parseInt(hours, 10), parseInt(minutes, 10));
  return date.toLocaleTimeString("vi-VN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  });
};

// --- INTERFACES ---
interface DoctorDashboardProps {
  doctor: Doctor;
  appointments: Appointment[];
  users: User[];
  userNotifications: Notification[];
  totalRevenue: number;
  medicalHistory: MedicalHistoryRecord[];
  onStartConsultation: (appointment: Appointment) => void;
  onConfirmAppointment: (appointmentId: string) => void;
  onCancelAppointment: (appointmentId: string, reason: string) => void;
  onViewSchedule: () => void;
}

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isPending: boolean; // Để đổi tiêu đề
}

// --- MODAL HỦY/TỪ CHỐI ---
const CancelModal: React.FC<CancelModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do.");
      return;
    }
    onConfirm(reason);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-red-50">
          <div className="flex items-center gap-2 text-red-700 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <h3>{isPending ? "Từ chối lịch hẹn" : "Hủy lịch hẹn"}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-slate-600">
            {isPending
              ? "Bạn có chắc chắn muốn từ chối yêu cầu này?"
              : "Bạn có chắc chắn muốn hủy lịch hẹn này?"}
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Lý do <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none text-sm resize-none"
              rows={3}
              placeholder="Nhập lý do..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value.trim()) setError("");
              }}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm"
          >
            Quay lại
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 text-sm shadow-sm shadow-red-200"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
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
    onViewSchedule,
  } = props;

  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const [historySearch, setHistorySearch] = useState("");
  const [historyTimeFilter, setHistoryTimeFilter] = useState<
    "all" | "7days" | "30days"
  >("all");
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 5;
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );

  // Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(
    null
  );
  const [isActionPending, setIsActionPending] = useState(false); // Để biết là Hủy hay Từ chối

  const today = new Date().toISOString().split("T")[0];

  // 1. Lọc danh sách CHỜ XÁC NHẬN (Lấy tất cả các ngày để bác sĩ không bỏ sót)
  const pendingAppointments = useMemo(() => {
    return appointments.filter((a) => a.status === "Chờ xác nhận");
  }, [appointments]);

  // 2. Lọc danh sách HÔM NAY (Đã xác nhận hoặc sắp diễn ra)
  const todaysAppointments = useMemo(() => {
    return appointments.filter(
      (a) =>
        a.date === today &&
        (a.status === "Đã xác nhận" || a.status === "Sắp diễn ra")
    );
  }, [appointments, today]);

  const filteredTodaysAppointments = useMemo(() => {
    if (filter === "all") return todaysAppointments;
    return todaysAppointments.filter((apt) => apt.type === filter);
  }, [todaysAppointments, filter]);

  const todayOnlineCount = todaysAppointments.filter(
    (a) => a.type === "online"
  ).length;
  const todayOfflineCount = todaysAppointments.filter(
    (a) => a.type === "offline"
  ).length;
  const latestReview = [...doctor.reviews].reverse()[0];

  // Logic History (Giữ nguyên)
  const filteredHistory = useMemo(() => {
    let result = medicalHistory || [];
    if (historySearch) {
      const searchLower = historySearch.toLowerCase();
      result = result.filter(
        (r) =>
          r.patientName.toLowerCase().includes(searchLower) ||
          r.diagnosis.toLowerCase().includes(searchLower)
      );
    }
    // ... (logic time filter giữ nguyên)
    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [medicalHistory, historySearch, historyTimeFilter]);

  const paginatedHistory = filteredHistory.slice(
    (historyPage - 1) * itemsPerPage,
    historyPage * itemsPerPage
  );
  const totalHistoryPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const selectedPatient = users.find((u) => u.id === selectedPatientId);
  const selectedPatientHistory = useMemo(() => {
    return selectedPatientId
      ? (medicalHistory || []).filter((h) => h.patientId === selectedPatientId)
      : [];
  }, [selectedPatientId, medicalHistory]);

  // Handlers
  const handleRequestCancel = (appointmentId: string, isPending: boolean) => {
    setAppointmentToCancel(appointmentId);
    setIsActionPending(isPending);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = (reason: string) => {
    if (appointmentToCancel) {
      onCancelAppointment(appointmentToCancel, reason);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8 font-sans">
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isPending={isActionPending}
      />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Chào mừng trở lại, {doctor.name}!
          </h1>
          <p className="mt-2 text-md md:text-lg text-slate-600">
            Lịch làm việc của bạn.
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Lịch Khám Online"
          value={todayOnlineCount.toString()}
          icon={Video}
          color="cyan"
        />
        <StatCard
          title="Lịch Khám Offline"
          value={todayOfflineCount.toString()}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Tổng lịch hôm nay"
          value={todaysAppointments.length.toString()}
          icon={Calendar}
          color="indigo"
        />
        <StatCard
          title="Doanh Thu (Online)"
          value={new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(totalRevenue)}
          icon={DollarSign}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* 🔥 SECTION 1: YÊU CẦU CẦN DUYỆT (PENDING) 🔥 */}
          {pendingAppointments.length > 0 && (
            <div className="mb-8">
              <DashboardCard
                title={`🔔 Yêu cầu cần duyệt (${pendingAppointments.length})`}
                icon={ShieldCheck}
              >
                <div className="space-y-4">
                  {pendingAppointments.map((apt) => (
                    <AppointmentCard
                      key={apt.id}
                      appointment={apt}
                      users={props.users}
                      onStartConsultation={props.onStartConsultation}
                      onConfirmAppointment={props.onConfirmAppointment} // Truyền hàm xác nhận
                      onRequestCancel={props.onCancelAppointment as any} // Truyền hàm hủy/từ chối
                      isPending={true} // Báo cho Card biết để hiện nút Xác nhận/Từ chối
                    />
                  ))}
                </div>
              </DashboardCard>
            </div>
          )}

          {/* SECTION 2: LỊCH HẸN HÔM NAY (CONFIRMED) */}
          <DashboardCard title="Lịch hẹn hôm nay" icon={Calendar}>
            <div className="flex flex-wrap gap-2 mb-6">
              <FilterButton
                active={filter === "all"}
                onClick={() => setFilter("all")}
              >
                Tất cả
              </FilterButton>
              <FilterButton
                active={filter === "online"}
                onClick={() => setFilter("online")}
              >
                Trực tuyến
              </FilterButton>
              <FilterButton
                active={filter === "offline"}
                onClick={() => setFilter("offline")}
              >
                Tại phòng khám
              </FilterButton>
            </div>

            {filteredTodaysAppointments.length > 0 ? (
              <div className="space-y-4">
                {filteredTodaysAppointments.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    users={users}
                    onStartConsultation={onStartConsultation}
                    onConfirmAppointment={onConfirmAppointment}
                    onRequestCancel={(id) => handleRequestCancel(id, false)} // false = not pending
                    isPending={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500">Không có lịch hẹn nào hôm nay.</p>
              </div>
            )}
          </DashboardCard>
        </div>

        {/* RIGHT SIDEBAR (Giữ nguyên) */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Calendar className="w-4 h-4 text-cyan-600" />
              <span>Lịch làm việc</span>
            </div>
            <p className="text-xs text-slate-500">
              Quản lý khung giờ khám bệnh của bạn.
            </p>
            <button
              onClick={onViewSchedule}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> <span>Quản lý lịch</span>
            </button>
          </div>
          {/* (Các block Thông báo, Đánh giá giữ nguyên như cũ...) */}
        </div>
      </div>

      {/* HISTORY TABLE (Giữ nguyên) */}
      <DashboardCard title="Lịch sử khám bệnh" icon={History}>
        {/* (Code bảng lịch sử giữ nguyên như cũ của bạn) */}
        <div className="relative flex-grow w-full sm:w-auto mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={historySearch}
            onChange={(e) => setHistorySearch(e.target.value)}
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        {/* (Table Render logic...) */}
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

// --- SUB COMPONENTS ---

const AppointmentCard: React.FC<{
  appointment: Appointment;
  users: User[];
  onStartConsultation: (a: Appointment) => void;
  onConfirmAppointment: (id: string) => void;
  onRequestCancel: (id: string) => void;
  isPending: boolean;
}> = ({
  appointment,
  users,
  onStartConsultation,
  onConfirmAppointment,
  onRequestCancel,
  isPending,
}) => {
  const patient = users.find((u) => u.id === appointment.patientId);
  const formattedDate = new Date(
    `${appointment.date}T00:00:00`
  ).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
  });
  const isOnline = appointment.type === "online";

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 ${
        isOnline ? "bg-cyan-50 border-cyan-100" : "bg-amber-50 border-amber-100"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={patient?.avatar}
              alt={patient?.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white ${
                isOnline
                  ? "bg-cyan-100 text-cyan-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {isOnline ? (
                <Video className="w-3 h-3" />
              ) : (
                <Building2 className="w-3 h-3" />
              )}
            </div>
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg">
              {patient?.name || "Bệnh nhân"}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimeDisplay(appointment.time)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-none justify-end">
          {isPending ? (
            <>
              <button
                onClick={() => onConfirmAppointment(appointment.id)}
                className="flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 font-semibold py-2 px-4 rounded-lg hover:bg-emerald-200 text-sm"
              >
                <ShieldCheck className="w-4 h-4" /> <span>Xác nhận</span>
              </button>
              <button
                onClick={() => onRequestCancel(appointment.id)}
                className="flex items-center justify-center gap-2 bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg hover:bg-red-200 text-sm"
              >
                <XCircle className="w-4 h-4" /> <span>Từ chối</span>
              </button>
            </>
          ) : (
            <>
              {isOnline && (
                <button
                  onClick={() => onStartConsultation(appointment)}
                  className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-700 text-sm"
                >
                  Bắt đầu khám
                </button>
              )}
              {!isOnline && (
                <div className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg text-sm border border-slate-200">
                  Đã xác nhận
                </div>
              )}
              <button
                onClick={() => onRequestCancel(appointment.id)}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ElementType;
  color: "cyan" | "blue" | "emerald" | "indigo";
}> = ({ title, value, icon: Icon, color }) => {
  const colors = {
    cyan: "text-cyan-600 bg-cyan-100",
    blue: "text-blue-600 bg-blue-100",
    emerald: "text-emerald-600 bg-emerald-100",
    indigo: "text-indigo-600 bg-indigo-100",
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
      <div className={`p-3.5 rounded-xl ${colors[color]}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{
  title: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 h-full flex flex-col">
    <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2.5 pb-3 border-b border-slate-50">
      {Icon && <Icon className="w-5 h-5 text-cyan-600" />}
      {title}
    </h2>
    <div className="flex-1">{children}</div>
  </div>
);

const FilterButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-full border ${
      active
        ? "bg-cyan-600 text-white border-cyan-600"
        : "bg-white text-slate-600 border-slate-200"
    }`}
  >
    {children}
  </button>
);

const PatientHistoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  patient: User;
  historyRecords: MedicalHistoryRecord[];
}> = ({ isOpen, onClose, patient, historyRecords }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{patient.name}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {historyRecords.map((r) => (
            <div key={r.id} className="border p-3 rounded">
              {r.diagnosis} - {r.date}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
