import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Doctor, TimeSlot } from "@/types/types";
import { CalendarIcon } from "@/components/icons/CalendarIcon";
import { ClockIcon } from "@/components/icons/ClockIcon";

interface BookingCalendarProps {
  doctor: Doctor;
  onBook: (
    doctor: Doctor,
    slot: { date: string; time: string; scheduleId: number },
    type: "online" | "offline"
  ) => void;
}

// ================= API CONFIG =================
const API_BASE = "http://localhost:4421/api/v1";

// ================= COMPONENT =================
export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  doctor,
  onBook,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<"online" | "offline">(
    "online"
  );

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // ================= FORMAT DATE =================
  const formattedDate = selectedDate.toISOString().split("T")[0];

  // ================= fetch schedules =================
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        const res = await axios.get(`${API_BASE}/schedules/${doctor.id}`, {
          params: { date: formattedDate },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data.data || [];

        const mapped: TimeSlot[] = data.map((item: any) => ({
          id: item.id.toString(),
          doctorId: item.doctorId,
          date: item.date,
          startTime: item.startTime.slice(0, 5),
          endTime: item.endTime.slice(0, 5),
          maxPatients: item.maxPatients,
          bookedCount: item.bookedPatients || 0,
          status:
            item.bookedPatients >= item.maxPatients ? "full" : "available",
          type: item.appointmentType,
        }));

        setSlots(mapped);
      } catch (error) {
        console.error("❌ Lỗi lấy khung giờ:", error);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [doctor.id, formattedDate]);

  // ================= handle booking =================
  const handleBooking = () => {
    if (!selectedTime) return;

    const selectedSlot = slots.find((s) => s.startTime === selectedTime);

    if (!selectedSlot) return;

    onBook(
      doctor,
      {
        date: formattedDate,
        time: selectedTime,
        scheduleId: Number(selectedSlot.id), //  CỰC KỲ QUAN TRỌNG
      },
      appointmentType
    );
  };

  // ================= date change =================
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.valueAsDate;
    if (date) {
      const adjustedDate = new Date(
        date.getTime() + date.getTimezoneOffset() * 60000
      );
      setSelectedDate(adjustedDate);
      setSelectedTime(null); // reset giờ khi đổi ngày
    }
  };

  // ================= chia buổi =================
  const morningSlots = slots.filter((s) => s.startTime < "12:00");
  const afternoonSlots = slots.filter((s) => s.startTime >= "12:00");

  // ================= UI =================
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 sticky top-28">
      <h3 className="text-xl font-bold text-slate-900 text-center mb-4">
        Đặt lịch hẹn
      </h3>

      {/* ====== CHỌN NGÀY ====== */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          <CalendarIcon className="w-4 h-4 inline-block mr-2" />
          Chọn ngày
        </label>
        <input
          type="date"
          className="w-full p-2 border border-slate-300 rounded-md"
          defaultValue={formattedDate}
          min={new Date().toISOString().split("T")[0]}
          onChange={handleDateChange}
        />
      </div>

      {/* ====== HÌNH THỨC ====== */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Hình thức khám
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setAppointmentType("online")}
            className={`p-2 rounded-md text-sm font-medium border-2 ${
              appointmentType === "online"
                ? "bg-cyan-600 text-white border-cyan-600"
                : "bg-white hover:bg-cyan-50"
            }`}
          >
            Tư vấn Online
          </button>
          <button
            onClick={() => setAppointmentType("offline")}
            className={`p-2 rounded-md text-sm font-medium border-2 ${
              appointmentType === "offline"
                ? "bg-cyan-600 text-white border-cyan-600"
                : "bg-white hover:bg-cyan-50"
            }`}
          >
            Khám tại quầy
          </button>
        </div>
      </div>

      {/* ====== GIỜ SÁNG ====== */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <ClockIcon className="w-4 h-4 inline-block mr-2" />
          Chọn giờ (sáng)
        </label>

        {loading ? (
          <p className="text-slate-500 text-sm">Đang tải...</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {morningSlots.map((slot) => (
              <button
                key={slot.id}
                disabled={slot.status === "full"}
                onClick={() => setSelectedTime(slot.startTime)}
                className={`p-2 rounded-md text-sm font-medium border-2 ${
                  selectedTime === slot.startTime
                    ? "bg-cyan-600 text-white border-cyan-600"
                    : "bg-white text-cyan-800 border-cyan-200 hover:bg-cyan-50"
                } ${
                  slot.status === "full" ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {slot.startTime}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ====== GIỜ CHIỀU ====== */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <ClockIcon className="w-4 h-4 inline-block mr-2" />
          Chọn giờ (chiều)
        </label>

        <div className="grid grid-cols-3 gap-2">
          {afternoonSlots.map((slot) => (
            <button
              key={slot.id}
              disabled={slot.status === "full"}
              onClick={() => setSelectedTime(slot.startTime)}
              className={`p-2 rounded-md text-sm font-medium border-2 ${
                selectedTime === slot.startTime
                  ? "bg-cyan-600 text-white border-cyan-600"
                  : "bg-white text-cyan-800 border-cyan-200 hover:bg-cyan-50"
              } ${
                slot.status === "full" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {slot.startTime}
            </button>
          ))}
        </div>
      </div>

      {/* ====== NÚT XÁC NHẬN ====== */}
      <div className="mt-6">
        <button
          onClick={handleBooking}
          disabled={!selectedTime}
          className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
          {selectedTime
            ? appointmentType === "online"
              ? `Xác nhận & Thanh toán ${doctor.consultationFee.toLocaleString(
                  "vi-VN"
                )}đ`
              : "Xác nhận Lịch hẹn"
            : "Vui lòng chọn giờ"}
        </button>
      </div>
    </div>
  );
};
