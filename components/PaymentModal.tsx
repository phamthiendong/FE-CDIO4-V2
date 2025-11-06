import React, { useState, useEffect } from "react";

interface Doctor {
  name: string;
  specialty: string;
  consultationFee: number;
}

interface PendingAppointment {
  date: string;
  time: string;
  type: "online" | "offline";
  doctor: Doctor;
}

interface PaymentModalProps {
  appointment: PendingAppointment;
  onClose: () => void;
  onConfirm: () => void;
}

type PaymentStatus = "loading" | "qr_display" | "polling" | "success" | "error";

interface SePayResponse {
  orderCode: string;
  amount: number;
  qrUrl: string;
  bankInfo: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
    transferContent: string;
  };
}

const API_BASE = "https://72fa8b08b84a.ngrok-free.app/api/v1/payments/sepay";

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

const StethoscopeIcon = ({ className }: { className?: string }) => (
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
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

export const PaymentModal: React.FC<PaymentModalProps> = ({
  appointment,
  onClose,
  onConfirm,
}) => {
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [payment, setPayment] = useState<SePayResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const isOnline = appointment.type === "online";

  // 1 Tạo payment khi mount
  useEffect(() => {
    if (!isOnline) return;

    const createPayment = async () => {
      try {
        console.log("Creating payment...");
        setStatus("loading");

        const res = await fetch(`${API_BASE}/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderCode: `CLINIC${Date.now()}`,
            amount: Number(appointment.doctor.consultationFee),
          }),
        });

        console.log("📡 Create response status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Create failed:", errorText);
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }

        const data: SePayResponse = await res.json();
        console.log("Payment created:", data);

        setPayment(data);
        setStatus("qr_display");
      } catch (err) {
        console.error("Create payment error:", err);
        setErrorMsg(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    };

    createPayment();
  }, [appointment, isOnline]);

  // 2 Polling sau khi có payment
  useEffect(() => {
    if (!payment || status === "success" || status === "error") {
      console.log("Polling stopped. Status:", status, "Payment:", !!payment);
      return;
    }

    console.log("🔄 Starting polling for:", payment.orderCode);
    let pollAttempts = 0;
    const maxAttempts = 24;

    const intervalId = setInterval(async () => {
      pollAttempts++;
      console.log(`\nPoll #${pollAttempts}/${maxAttempts}`);

      try {
        const url = `${API_BASE}/check/${payment.orderCode}`;
        console.log("📞 Calling:", url);

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true", // Skip ngrok warning
          },
        });

        console.log("📡 Response status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`❌ HTTP ${res.status}:`, errorText);
          return;
        }

        const result = await res.json();
        console.log("📥 Result:", JSON.stringify(result, null, 2));

        // ✅ Check payment status
        const isPaid = result.isPaid === true || result.status === "PAID";
        console.log("💰 isPaid:", isPaid);

        if (isPaid) {
          console.log("🎉 PAYMENT CONFIRMED!");
          clearInterval(intervalId);
          setStatus("success");
        } else if (pollAttempts >= maxAttempts) {
          console.warn("⏰ Timeout reached");
          clearInterval(intervalId);
          setErrorMsg("Hết thời gian chờ");
        } else {
          console.log("⏳ Still waiting...");
        }
      } catch (err) {
        console.error("💥 Poll error:", err);
        if (pollAttempts >= maxAttempts) {
          clearInterval(intervalId);
          setErrorMsg("Không thể kết nối server");
        }
      }
    }, 5000);

    return () => {
      console.log("Cleaning up polling interval");
      clearInterval(intervalId);
    };
  }, [payment, status]);

  // 3️⃣ Auto close sau khi success
  useEffect(() => {
    if (status === "success") {
      console.log("Success! Auto-closing in 2.5s");
      const timer = setTimeout(() => onConfirm(), 2500);
      return () => clearTimeout(timer);
    }
  }, [status, onConfirm]);

  // 4️⃣ Manual check button
  const checkStatus = async () => {
    if (!payment) return;

    console.log("Manual check triggered");
    try {
      const res = await fetch(`${API_BASE}/check/${payment.orderCode}`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const result = await res.json();
      console.log("Manual check result:", result);

      if (result.isPaid === true || result.status === "PAID") {
        setStatus("success");
      } else {
        alert("Chưa nhận được thanh toán. Vui lòng thử lại sau!");
      }
    } catch (err) {
      console.error(" Manual check error:", err);
      alert("Không thể kiểm tra trạng thái!");
    }
  };

  const renderOnlinePaymentContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center py-8">
            <LoadingSpinner className="w-10 h-10 text-cyan-600 mx-auto" />
            <p className="mt-3 text-slate-600 text-sm font-medium">
              Đang tạo mã thanh toán...
            </p>
          </div>
        );

      case "qr_display":
      case "polling":
        if (!payment) return null;
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <img
                src={payment.qrUrl}
                alt="SePay QR Code"
                className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-slate-200 rounded-lg object-contain bg-white shadow-sm"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://via.placeholder.com/200x200.png?text=QR+Error";
                }}
              />

              <p className="mt-3 text-slate-600 text-center text-xs sm:text-sm px-2">
                Quét mã bằng app ngân hàng hoặc ví điện tử
              </p>

              <button
                onClick={checkStatus}
                className="mt-3 px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-cyan-700 transition shadow-sm"
              >
                🔄 Kiểm tra ngay
              </button>
            </div>

            <div className="space-y-3 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-slate-600 mb-1">Số tiền</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  {payment.amount.toLocaleString("vi-VN")}đ
                </p>
              </div>

              <div className="bg-cyan-50 rounded-lg p-3">
                <p className="text-xs text-slate-600 mb-1">
                  Nội dung chuyển khoản
                </p>
                <p className="text-sm sm:text-base font-bold text-cyan-700 break-all">
                  {payment.bankInfo.transferContent}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 text-xs sm:text-sm text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Ngân hàng:</span>
                  <span className="font-semibold">
                    {payment.bankInfo.bankCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">STK:</span>
                  <span className="font-semibold">
                    {payment.bankInfo.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tên TK:</span>
                  <span className="font-semibold text-right">
                    {payment.bankInfo.accountName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-14 h-14 sm:w-16 sm:h-16 text-green-500 mx-auto" />
            <p className="mt-3 text-lg sm:text-xl font-bold text-slate-800">
              Thanh toán thành công!
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Lịch hẹn của bạn đã được xác nhận
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center py-8">
            <p className="text-red-600 font-semibold text-sm mb-2">
              Đã xảy ra lỗi
            </p>
            {errorMsg && (
              <p className="text-xs text-slate-600 mb-4">{errorMsg}</p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700"
            >
              Thử lại
            </button>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-3 sm:mb-4">
          {isOnline ? "Thanh toán SePay" : "Xác nhận Lịch hẹn"}
        </h2>

        <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200 mb-4 sm:mb-5">
          <p className="font-bold text-slate-800 text-sm sm:text-base">
            BS. {appointment.doctor.name}
          </p>
          <p className="text-xs sm:text-sm text-slate-600">
            {appointment.doctor.specialty}
          </p>

          <div className="mt-2 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-slate-700">
              <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">{appointment.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <ClockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-medium">{appointment.time}</span>
            </div>
          </div>

          <div className="mt-2 text-xs sm:text-sm font-medium text-cyan-800 bg-cyan-100 px-2 py-1 rounded-md inline-flex items-center gap-1.5">
            <StethoscopeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{isOnline ? "Tư vấn Online" : "Khám tại quầy"}</span>
          </div>
        </div>

        {isOnline ? (
          renderOnlinePaymentContent()
        ) : (
          <div className="text-center">
            <p className="text-slate-600 mb-5 text-sm sm:text-base">
              Bạn sẽ thanh toán chi phí khám trực tiếp tại quầy
            </p>
            <button
              onClick={onConfirm}
              className="w-full py-2.5 sm:py-3 border border-transparent rounded-lg sm:rounded-full shadow-sm text-sm sm:text-base font-bold text-white bg-cyan-600 hover:bg-cyan-700"
            >
              Gửi yêu cầu đặt hẹn
            </button>
          </div>
        )}

        <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="w-full text-xs sm:text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50 py-2"
            disabled={status === "success"}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Demo() {
  const [showModal, setShowModal] = useState(false);

  const mockAppointment: PendingAppointment = {
    date: "15/11/2025",
    time: "10:00",
    type: "online",
    doctor: {
      name: "Nguyễn Văn A",
      specialty: "Tim mạch",
      consultationFee: 6000,
    },
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700"
      >
        Mở Modal Thanh Toán
      </button>

      {showModal && (
        <PaymentModal
          appointment={mockAppointment}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            alert("Đặt lịch thành công!");
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
