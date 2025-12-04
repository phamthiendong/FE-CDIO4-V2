import React, { useEffect, useState } from "react";

/* ======================= TYPES ======================= */

interface Doctor {
  name: string;
  specialty: string;
  consultationFee: number;
}

interface SePayResponse {
  qrUrl: string;
  amount: number;
  orderCode: string;
  bankInfo: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
    transferContent: string;
  };
}

export interface PendingAppointment {
  date: string;
  time: string;
  type: "online" | "offline";
  doctor: Doctor;
  payment?: SePayResponse; // ✅ PAYMENT TỪ BACKEND
}

interface PaymentModalProps {
  appointment: PendingAppointment;
  bookingId: number;
  onClose: () => void;
  onConfirm: (id: number) => void;
}

type PaymentStatus = "qr_display" | "polling" | "success" | "error";

/* ======================= API ======================= */

const API_BASE = "https://8abafaa91448.ngrok-free.app/api/v1/payments/sepay";

/* ======================= ICONS ======================= */

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/* ======================= PAYMENT MODAL ======================= */

export const PaymentModal: React.FC<PaymentModalProps> = ({
  appointment,
  bookingId,
  onClose,
  onConfirm,
}) => {
  const [status, setStatus] = useState<PaymentStatus>("qr_display");
  const [errorMsg, setErrorMsg] = useState("");
  const payment = appointment.payment;
  const isOnline = appointment.type === "online";

  /* ======================= POLLING KIỂM TRA THANH TOÁN ======================= */
  useEffect(() => {
    if (!payment || !isOnline || status === "success") return;

    let attempts = 0;
    const maxAttempts = 24;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await fetch(`${API_BASE}/check/${payment.orderCode}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        if (!res.ok) return;

        const result = await res.json();
        const isPaid = result.isPaid === true || result.status === "PAID";

        if (isPaid) {
          clearInterval(interval);
          setStatus("success");

          setTimeout(() => {
            onConfirm(bookingId); // ✅ CONFIRM BOOKING
          }, 1500);
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setErrorMsg("Hết thời gian chờ thanh toán.");
          setStatus("error");
        }
      } catch {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setErrorMsg("Không thể kết nối máy chủ.");
          setStatus("error");
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [payment, isOnline, status, bookingId, onConfirm]);

  /* ======================= RENDER ======================= */

  const renderOnlinePayment = () => {
    if (!payment) {
      return (
        <p className="text-red-500 text-center">❌ Thiếu dữ liệu thanh toán</p>
      );
    }

    if (status === "success") {
      return (
        <div className="text-center py-8">
          <CheckCircleIcon className="w-14 h-14 text-green-500 mx-auto" />
          <p className="mt-3 text-lg font-bold text-slate-800">
            Thanh toán thành công!
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Đang xác nhận lịch hẹn...
          </p>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="text-center py-8">
          <p className="text-red-600 font-bold">{errorMsg}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 text-center">
        <img
          src={payment.qrUrl}
          alt="QR"
          className="w-52 h-52 mx-auto border rounded-lg"
        />

        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-slate-600">Số tiền</p>
          <p className="text-2xl font-bold text-green-600">
            {payment.amount.toLocaleString("vi-VN")}đ
          </p>
        </div>

        <div className="bg-cyan-50 rounded-lg p-3">
          <p className="text-xs text-slate-600 mb-1">Nội dung chuyển khoản</p>
          <p className="font-bold text-cyan-700">
            {payment.bankInfo.transferContent}
          </p>
        </div>
      </div>
    );
  };

  /* ======================= UI ======================= */

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center mb-4">
          {isOnline ? "Thanh toán Online" : "Xác nhận lịch hẹn"}
        </h2>

        <div className="bg-slate-50 p-4 rounded-lg border mb-5">
          <p className="font-bold">BS. {appointment.doctor.name}</p>
          <p className="text-sm text-slate-600">
            {appointment.doctor.specialty}
          </p>

          <div className="flex justify-between mt-2 text-sm">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {appointment.date}
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {appointment.time}
            </div>
          </div>
        </div>

        {isOnline ? (
          renderOnlinePayment()
        ) : (
          <button
            onClick={() => onConfirm(bookingId)}
            className="w-full py-3 rounded-lg font-bold text-white bg-cyan-600 hover:bg-cyan-700"
          >
            Xác nhận đặt lịch
          </button>
        )}

        <div className="mt-5 pt-4 border-t text-center">
          <button
            onClick={onClose}
            disabled={status === "success"}
            className="w-full text-sm text-slate-500 hover:text-slate-700"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};
