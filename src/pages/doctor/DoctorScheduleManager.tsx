import React, { useState, useMemo, useEffect, useCallback } from "react";
import axios from "axios";
import type { TimeSlot } from "@/types/types";

// ================= IMPORT ICONS =================
import { ArrowLeftIcon } from "../../components/icons/ArrowLeftIcon";
import { PlusIcon } from "../../components/icons/PlusIcon";
import { ClockIcon } from "../../components/icons/ClockIcon";
import { UsersIcon } from "../../components/icons/UsersIcon";
import { TrashIcon } from "../../components/icons/TrashIcon";
import { XCircleIcon } from "../../components/icons/XCircleIcon";
import { ChevronLeftIcon } from "../../components/icons/ChevronLeftIcon";
import { ChevronRightIcon } from "../../components/icons/ChevronRightIcon";
import { VideoCameraIcon } from "../../components/icons/VideoCameraIcon";
import { BuildingOfficeIcon } from "../../components/icons/BuildingOfficeIcon";

// ================= CẤU HÌNH API =================
// Lưu ý: Đảm bảo port Backend đúng (4421 hoặc 3000 tùy máy bạn)
const BASE_URL = "http://localhost:4421/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// INTERCEPTOR: Tự động gắn Token
// DoctorScheduleManager.tsx

// Sửa lại phần interceptor
api.interceptors.request.use((config) => {
  const isPublic =
    config.url?.startsWith("/schedules/") && config.method === "get"; // ← CHỈ GET mới public

  if (!isPublic) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Sending token:", token.substring(0, 20) + "...");
    } else {
      console.error("❌ No token found!");
    }
  }

  console.log("📤 Request:", {
    method: config.method,
    url: config.url,
    hasAuth: !!config.headers.Authorization,
  });

  return config;
});

// Helper format giờ
const formatTime12h = (time24: string) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const date = new Date(1970, 0, 1, parseInt(hours, 10), parseInt(minutes, 10));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// ================= INTERFACES =================
interface DoctorScheduleManagerProps {
  // Ở App.tsx bạn truyền UserID vào đây.
  // Component này sẽ tự xử lý để tìm ra DoctorID thật.
  currentDoctorId: number;
  onGoBack: () => void;
}

interface AddSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSlot: (slot: {
    date: string;
    startTime: string;
    endTime: string;
    maxPatients: number;
    appointmentType: "online" | "offline";
  }) => void;
  selectedDate: Date;
  isSubmitting: boolean;
}

// ================= MODAL COMPONENT =================
const AddSlotModal: React.FC<AddSlotModalProps> = ({
  isOpen,
  onClose,
  onAddSlot,
  selectedDate,
  isSubmitting,
}) => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [maxPatients, setMaxPatients] = useState(1);
  const [appointmentType, setAppointmentType] = useState<"online" | "offline">(
    "offline"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSlot({
      date: selectedDate.toISOString().split("T")[0],
      startTime,
      endTime,
      maxPatients,
      appointmentType,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <XCircleIcon className="w-7 h-7" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          Thêm khung giờ mới
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Ngày
            </label>
            <input
              type="text"
              readOnly
              value={selectedDate.toLocaleDateString("vi-VN")}
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Hình thức khám
            </label>
            <div className="flex gap-4 p-2 bg-slate-100 rounded-lg">
              <label
                className={`flex-1 text-center py-2 px-3 rounded-md cursor-pointer transition-colors ${
                  appointmentType === "offline"
                    ? "bg-white shadow-sm text-cyan-700 font-semibold"
                    : "text-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="appointmentType"
                  value="offline"
                  checked={appointmentType === "offline"}
                  onChange={() => setAppointmentType("offline")}
                  className="sr-only"
                />{" "}
                Tại phòng khám
              </label>
              <label
                className={`flex-1 text-center py-2 px-3 rounded-md cursor-pointer transition-colors ${
                  appointmentType === "online"
                    ? "bg-white shadow-sm text-cyan-700 font-semibold"
                    : "text-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="appointmentType"
                  value="online"
                  checked={appointmentType === "online"}
                  onChange={() => setAppointmentType("online")}
                  className="sr-only"
                />{" "}
                Trực tuyến
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Giờ bắt đầu
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Giờ kết thúc
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Số bệnh nhân tối đa
            </label>
            <input
              type="number"
              min="1"
              value={maxPatients}
              onChange={(e) => setMaxPatients(parseInt(e.target.value, 10))}
              className="w-full p-2.5 border border-slate-300 rounded-lg"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ================= COMPONENT CHÍNH =================
export const DoctorScheduleManager: React.FC<DoctorScheduleManagerProps> = ({
  currentDoctorId, // Đây là User ID từ App.tsx (ví dụ: 3)
  onGoBack,
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State lưu Doctor ID thật (ví dụ: 2)
  const [realDoctorId, setRealDoctorId] = useState<number | null>(null);

  // --- BƯỚC 1: TỰ ĐỘNG CHUYỂN USER ID -> DOCTOR ID ---
  useEffect(() => {
    const fetchRealDoctorId = async () => {
      if (!currentDoctorId || isNaN(currentDoctorId)) return;

      try {
        setIsLoading(true);
        const response = await api.get("/doctors");

        // ✅ Log để debug
        console.log("📋 Danh sách doctors:", response.data);

        const doctorsList = response.data.data || response.data;
        const myProfile = doctorsList.find(
          (d: any) => d.user?.id === currentDoctorId
        );

        console.log("🎯 Kết quả tìm kiếm:", {
          currentDoctorId,
          found: myProfile,
          allDoctors: doctorsList,
        });

        if (myProfile) {
          setRealDoctorId(myProfile.id);
        } else {
          console.error(
            "❌ Không tìm thấy doctor với userId:",
            currentDoctorId
          );
          alert("Không tìm thấy thông tin bác sĩ!");
        }
      } catch (error) {
        console.error("❌ Lỗi khi fetch doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealDoctorId();
  }, [currentDoctorId]);
  // --- BƯỚC 2: LẤY LỊCH KHÁM (Dựa trên realDoctorId) ---
  const fetchSchedules = useCallback(async () => {
    if (!realDoctorId) {
      console.warn("⚠️ Không có realDoctorId");
      return;
    }

    try {
      setIsLoading(true);
      const dateStr = selectedDate.toISOString().slice(0, 10);

      console.log("📡 Fetching schedules:", {
        realDoctorId,
        date: dateStr,
        url: `/schedules/${realDoctorId}?date=${dateStr}`,
      });

      const response = await api.get(`/schedules/${realDoctorId}`, {
        params: { date: dateStr },
      });

      console.log("✅ Response:", response.data);

      const fetchedData = response.data.data || [];

      // ✅ Map dữ liệu
      const mappedSlots: TimeSlot[] = fetchedData.map((item: any) => ({
        id: item.id.toString(),
        doctorId: item.doctorId,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        maxPatients: item.maxPatients,
        bookedCount: item.bookedPatients || 0,
        type: item.appointmentType,
        status: "available",
      }));

      setSlots(
        mappedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime))
      );
    } catch (error: any) {
      console.error("❌ Error:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
      });

      // ✅ Chỉ set rỗng khi 404, các lỗi khác thông báo
      if (error.response?.status === 404) {
        setSlots([]);
      } else {
        alert(
          "Lỗi khi tải lịch: " +
            (error.response?.data?.message || error.message)
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, realDoctorId]);
  // Gọi fetchSchedules khi realDoctorId hoặc ngày thay đổi
  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // --- BƯỚC 3: TẠO LỊCH (POST) ---
  const handleAddSlot = async (newSlotData: {
    date: string;
    startTime: string;
    endTime: string;
    maxPatients: number;
    appointmentType: "online" | "offline";
  }) => {
    try {
      setIsSubmitting(true);

      // 1. POST tạo lịch
      const response = await api.post("/schedules", newSlotData);
      console.log("✅ POST Response:", response.data);

      // 2. Lấy data từ response
      const newSlot = response.data.data;

      // 3. Map sang TimeSlot format
      const mappedSlot: TimeSlot = {
        id: newSlot.id.toString(), // Convert number to string
        doctorId: newSlot.doctorId,
        date: newSlot.date,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        maxPatients: newSlot.maxPatients,
        bookedCount: newSlot.bookedPatients || 0,
        type: newSlot.appointmentType,
        status: "available",
      };

      // 4. Thêm vào state và sort
      setSlots((prev) => {
        const updated = [...prev, mappedSlot];
        return updated.sort((a, b) => a.startTime.localeCompare(b.startTime));
      });

      // 5. Đóng modal
      setIsModalOpen(false);

      console.log("✅ Đã thêm slot:", mappedSlot);
    } catch (error: any) {
      console.error("❌ Error adding slot:", error);
      const message = error.response?.data?.message || "Có lỗi xảy ra";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- BƯỚC 4: XÓA LỊCH ---
  const handleDeleteSlot = async (slotId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa?")) return;
    try {
      await api.delete(`/schedules/${slotId}`);
      setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
    } catch (error: any) {
      alert(error.response?.data?.message || "Lỗi khi xóa");
    }
  };

  // --- LOGIC CALENDAR UI (GIỮ NGUYÊN) ---
  const handleDateSelect = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day < today) return;
    setSelectedDate(day);
  };

  const changeWeek = (direction: "next" | "prev") => {
    setDisplayDate((current) => {
      const newDate = new Date(current);
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      return newDate;
    });
  };

  const { weekDays, monthYearLabel } = useMemo(() => {
    const startOfWeek = new Date(displayDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return {
      weekDays: Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        return d;
      }),
      monthYearLabel: displayDate.toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      }),
    };
  }, [displayDate]);

  const isPrevWeekDisabled = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(
      startOfCurrentWeek.getDate() -
        startOfCurrentWeek.getDay() +
        (startOfCurrentWeek.getDay() === 0 ? -6 : 1)
    );
    return weekDays[0] <= startOfCurrentWeek;
  }, [weekDays]);

  const filteredSlots = useMemo(() => {
    const dateStr = selectedDate.toISOString().slice(0, 10);

    return slots.filter((slot) => {
      const slotDate = slot.date.slice(0, 10);
      return slotDate === dateStr;
    });
  }, [slots, selectedDate]);

  const morningSlots = filteredSlots.filter((s) => s.startTime < "12:00:00");
  const afternoonSlots = filteredSlots.filter(
    (s) => s.startTime >= "12:00:00" && s.startTime < "18:00:00"
  );
  const eveningSlots = filteredSlots.filter((s) => s.startTime >= "18:00:00");

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
      <AddSlotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSlot={handleAddSlot}
        selectedDate={selectedDate}
        isSubmitting={isSubmitting}
      />

      <div className="flex items-center gap-4">
        <button
          onClick={onGoBack}
          className="p-2 rounded-full hover:bg-slate-200 transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-slate-700" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Quản lý lịch khám
          </h1>
          <p className="text-slate-600">
            Thêm, xóa và quản lý các khung giờ khám bệnh.
          </p>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200/80">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-slate-800 text-base">Chọn ngày</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => changeWeek("prev")}
              disabled={isPrevWeekDisabled}
              className="p-1.5 rounded-full hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
            </button>
            <span className="font-semibold text-slate-700 text-sm w-28 text-center">
              {monthYearLabel}
            </span>
            <button
              onClick={() => changeWeek("next")}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {weekDays.map((day) => {
            const isSelected =
              day.toDateString() === selectedDate.toDateString();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPast = day < today;
            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateSelect(day)}
                disabled={isPast}
                className={`flex-shrink-0 text-center py-2 rounded-lg border transition-all duration-200 ${
                  isSelected
                    ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 border-transparent"
                } ${
                  isPast
                    ? "opacity-40 cursor-not-allowed bg-slate-50 text-slate-400"
                    : "cursor-pointer"
                }`}
              >
                <p
                  className={`text-[10px] uppercase font-medium mb-0.5 ${
                    isSelected ? "text-cyan-100" : "text-slate-500"
                  }`}
                >
                  {day.toLocaleDateString("vi-VN", { weekday: "short" })}
                </p>
                <p className="font-bold text-lg leading-none mb-0.5">
                  {day.getDate()}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-2 text-slate-500">Đang tải lịch...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <SlotSection
            title="Buổi sáng"
            slots={morningSlots}
            onDeleteSlot={handleDeleteSlot}
            onAddSlot={() => setIsModalOpen(true)}
          />
          <SlotSection
            title="Buổi chiều"
            slots={afternoonSlots}
            onDeleteSlot={handleDeleteSlot}
            onAddSlot={() => setIsModalOpen(true)}
          />
          <SlotSection
            title="Buổi tối"
            slots={eveningSlots}
            onDeleteSlot={handleDeleteSlot}
            onAddSlot={() => setIsModalOpen(true)}
          />
        </div>
      )}
    </div>
  );
};

// ================= SUB COMPONENTS (GIỮ NGUYÊN) =================
const SlotSection: React.FC<{
  title: string;
  slots: TimeSlot[];
  onDeleteSlot: (id: string) => void;
  onAddSlot: () => void;
}> = ({ title, slots, onDeleteSlot, onAddSlot }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <button
        onClick={onAddSlot}
        className="flex items-center gap-1.5 bg-cyan-50 text-cyan-700 font-bold py-2 px-3 rounded-lg hover:bg-cyan-100 text-sm transition-colors"
      >
        <PlusIcon className="w-4 h-4" /> <span>Thêm</span>
      </button>
    </div>
    {slots.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {slots.map((slot) => (
          <SlotCard key={slot.id} slot={slot} onDelete={onDeleteSlot} />
        ))}
      </div>
    ) : (
      <p className="text-slate-500 text-center py-4">Chưa có khung giờ nào.</p>
    )}
  </div>
);

const SlotCard: React.FC<{
  slot: TimeSlot;
  onDelete: (id: string) => void;
}> = ({ slot, onDelete }) => {
  const isFull = slot.bookedCount >= slot.maxPatients;
  const progress =
    slot.maxPatients > 0 ? (slot.bookedCount / slot.maxPatients) * 100 : 0;
  const containerClasses =
    slot.type === "offline"
      ? "bg-amber-50 border-amber-200"
      : "bg-green-50 border-green-200";
  const progressBarColor =
    slot.type === "offline" ? "bg-amber-500" : "bg-green-500";
  return (
    <div
      className={`p-4 rounded-xl border ${containerClasses} flex flex-col justify-between`}
    >
      <div>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ClockIcon className="w-5 h-5" />
            <span>
              {formatTime12h(slot.startTime)} - {formatTime12h(slot.endTime)}
            </span>
          </div>
          <button
            onClick={() => onDelete(slot.id)}
            className="text-slate-400 hover:text-red-500 transition-colors p-1"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-1.5 mt-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            {slot.type === "online" ? (
              <VideoCameraIcon className="w-5 h-5" />
            ) : (
              <BuildingOfficeIcon className="w-5 h-5" />
            )}
            <span>
              {slot.type === "online" ? "Trực tuyến" : "Tại phòng khám"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            <span className={isFull ? "text-red-600 font-medium" : ""}>
              {slot.bookedCount}/{slot.maxPatients} đã đặt
            </span>
          </div>
        </div>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
        <div
          className={`h-1.5 rounded-full ${progressBarColor}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};
