import React, { useState, useEffect } from "react";
// 1. Import useNavigate và jwtDecode
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import {
  Mail,
  Lock,
  User,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  X,
} from "lucide-react";

// Để test local, đảm bảo bọc trong Router
import { BrowserRouter } from "react-router-dom";

const API_URL = "http://localhost:4421/api/v1/auth";

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: any) => void;
  users?: any[];
  doctors?: any[];
  onSignUp: (name: string, email: string) => void;
}

// Định nghĩa kiểu dữ liệu trong Token
interface DecodedToken {
  id: number;
  email: string;
  role: string; // 'admin' | 'doctor' | 'patient'
  exp: number;
  iat: number;
}

type ViewType =
  | "login"
  | "signup"
  | "forgot"
  | "verify"
  | "verify-signup"
  | "reset"
  | "success";

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onLogin,
  onSignUp,
}) => {
  const [view, setView] = useState<ViewType>("login");

  // 2. Khởi tạo hook navigate
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  // LOGIC QUAN TRỌNG: Lưu token JWT tạm thời nhận từ backend để dùng cho bước xác thực tiếp theo
  const [tempToken, setTempToken] = useState<string>("");

  // Timer đếm ngược
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((view === "verify" || view === "verify-signup") && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, timer]);

  const resetForm = () => {
    setVerificationCode(["", "", "", "", "", ""]);
    setError("");
    setTimer(60);
    setTempToken(""); // Reset token tạm
  };

  const handleStartVerification = (
    type: "forgot" | "signup",
    token: string
  ) => {
    setTimer(60);
    setVerificationCode(["", "", "", "", "", ""]);
    setTempToken(token); // Lưu JWT token nhận được từ Backend
    setView(type === "signup" ? "verify-signup" : "verify");
  };

  // Helper gọi API
  const apiCall = async (endpoint: string, method: string, body: any) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        // Backend trả về lỗi dạng { message: string, ... }
        throw new Error(result.message || "Đã có lỗi xảy ra");
      }
      return result; // Trả về toàn bộ response body { message, data }
    } catch (err: any) {
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        throw new Error("Không thể kết nối đến Server (localhost).");
      }
      throw new Error(err.message || "Lỗi kết nối");
    }
  };

  // --- XỬ LÝ INPUT MÃ 6 SỐ ---
  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  // --- 1. FLOW ĐĂNG KÝ (SIGN UP) ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Gọi API Register
      // Backend mong đợi: { email, password, firstName, lastName }
      const res = await apiCall("/register", "POST", {
        email,
        password,
        firstName,
        lastName,
      });

      setLoading(false);
      // Backend trả về: { data: { verificationToken: "...", user: {...} } }
      if (res.data && res.data.verificationToken) {
        handleStartVerification("signup", res.data.verificationToken);
      } else {
        setError("Không nhận được mã xác thực từ server.");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  const handleVerifySignupCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Backend AuthService.verifyVerificationCode cần:
      // 1. token (JWT đã lưu ở bước trước)
      // 2. code (6 số user nhập)
      await apiCall("/verification-codes/verify", "POST", {
        token: tempToken, // Quan trọng: Gửi JWT token
        code: code, // Quan trọng: Gửi mã OTP
      });

      setLoading(false);

      const fullName = `${lastName} ${firstName}`.trim();
      onSignUp(fullName, email);
      alert("Tài khoản đã kích hoạt thành công! Vui lòng đăng nhập.");
      resetForm();
      setView("login");
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  const handleResendSignupCode = async () => {
    try {
      const res = await apiCall("/verification-codes", "POST", { email });
      // Nếu resend trả về token mới, cập nhật lại
      if (res.data && res.data.verificationToken) {
        setTempToken(res.data.verificationToken);
      }
      setTimer(60);
      alert("Mã kích hoạt mới đã được gửi!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // --- 2. FLOW QUÊN MẬT KHẨU (FORGOT PASSWORD) ---
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Gọi API request reset
      const res = await apiCall("/password-resets", "POST", { email });
      setLoading(false);

      // Backend trả về { data: { token: "..." } }
      if (res.data && res.data.token) {
        handleStartVerification("forgot", res.data.token);
      } else {
        setError("Lỗi phản hồi từ server");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Gọi API verify code
      const res = await apiCall("/password-resets/verify", "POST", {
        token: tempToken,
        code: code,
      });

      setLoading(false);
      // Backend trả về token mới dùng để đổi mật khẩu (không chứa mã code nữa)
      if (res.data && res.data.token) {
        setTempToken(res.data.token); // Cập nhật token mới
        setView("reset");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  const handleResendResetCode = async () => {
    try {
      const res = await apiCall("/password-resets", "POST", { email });
      if (res.data && res.data.token) {
        setTempToken(res.data.token);
      }
      setTimer(60);
      alert("Mã đặt lại mật khẩu đã được gửi lại!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Mật khẩu quá ngắn");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Gọi PUT /password
      // Backend DTO: ResetPasswordDto { token, newPassword }
      await apiCall("/password", "PUT", {
        token: tempToken,
        newPassword: password,
      });

      setLoading(false);
      setView("success");
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  // --- 3. FLOW ĐĂNG NHẬP (LOGIN) - ĐÃ CẬP NHẬT LOGIC MỚI ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiCall("/login", "POST", { email, password });
      setLoading(false);

      const data = res.data;

      // Trường hợp tài khoản chưa active
      if (data.verificationToken && !data.accessToken) {
        alert("Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.");
        handleStartVerification("signup", data.verificationToken);
        return;
      }

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // --- BẮT ĐẦU: Logic Giải mã Token & Điều hướng ---
        try {
          // Giải mã token để lấy role
          const decoded: DecodedToken = jwtDecode(data.accessToken);
          console.log("Thông tin Token:", decoded);

          // Gộp role vào user object (vì API user info ko có role, ta lấy từ token)
          const userWithRole = { ...data.user, role: decoded.role };
          localStorage.setItem("user", JSON.stringify(userWithRole));

          // Cập nhật state User cho App
          onLogin(userWithRole);

          // Điều hướng dựa trên Role
          const role = decoded.role?.toLowerCase();

          if (role === "admin") {
            navigate("/admin/dashboard");
          } else if (role === "doctor") {
            navigate("/doctor/dashboard");
          } else {
            // Mặc định cho patient hoặc user thường
            navigate("/dashboard");
          }
        } catch (decodeError) {
          console.error("Lỗi giải mã token:", decodeError);
          // Fallback: Vẫn cho login nhưng không redirect đặc biệt hoặc về trang chủ
          localStorage.setItem("user", JSON.stringify(data.user));
          onLogin(data.user);
          onClose();
        }
        // --- KẾT THÚC: Logic Giải mã ---
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  const handleSocialLogin = () => {
    alert(
      "Cần tích hợp Google OAuth Client SDK để lấy authorization code trước khi gọi API /social-login"
    );
  };

  // --- RENDER UI (Giữ nguyên UI gốc) ---
  const handleBack = () => {
    setError("");
    if (view === "success") setView("login");
    else if (view === "verify") setView("forgot");
    else if (view === "verify-signup") setView("signup");
    else if (view === "reset") setView("verify");
    else setView("login");
  };

  return (
    <div
      className="fixed inset-0 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-[400px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Gradient */}
        <div className="bg-gradient-to-r from-[#0891B2] to-[#056b83] p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative">
            {view !== "login" && view !== "signup" && (
              <button
                onClick={handleBack}
                className="absolute -left-2 top-0 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="absolute -top-5 -right-5 p-2 hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-3xl font-bold text-center">
              {view === "login" && "Đăng nhập"}
              {view === "signup" && "Đăng ký"}
              {view === "forgot" && "Quên mật khẩu"}
              {(view === "verify" || view === "verify-signup") && "Xác thực"}
              {view === "reset" && "Đổi mật khẩu"}
              {view === "success" && "Thành công"}
            </h2>
            <p className="text-center text-[#E6F8FB] mt-2 text-sm">
              {view === "login" && "Chào mừng bạn quay trở lại!"}
              {view === "signup" && "Tạo tài khoản mới để bắt đầu"}
              {view === "forgot" && "Nhập email để nhận mã xác thực"}
              {view === "verify" && "Nhập mã OTP 6 số từ email"}
              {view === "verify-signup" && "Nhập mã kích hoạt tài khoản"}
            </p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
              <X className="w-4 h-4" /> {error}
            </div>
          )}

          {/* FORM LOGIN */}
          {view === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0891B2] outline-none"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0891B2] outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setView("forgot");
                    resetForm();
                  }}
                  className="text-sm text-[#0891B2] font-medium hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0891B2] text-white py-3 rounded-xl font-bold hover:bg-[#06788f] transition-all disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>

              <div className="relative my-6 text-center text-sm text-slate-500">
                <span className="bg-white px-4 relative z-10">Hoặc</span>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSocialLogin}
                className="w-full flex items-center justify-center gap-3 py-3 border-2 border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                </svg>
                Google
              </button>

              <p className="text-center text-sm text-slate-600 mt-6">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setView("signup");
                    resetForm();
                  }}
                  className="text-[#0891B2] font-bold hover:underline"
                >
                  Đăng ký ngay
                </button>
              </p>
            </form>
          )}

          {/* FORM SIGNUP */}
          {view === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Họ
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0891B2] outline-none"
                    placeholder="Nguyễn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tên
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0891B2] outline-none"
                    placeholder="Văn A"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0891B2] outline-none"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0891B2] outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0891B2] text-white py-3 rounded-xl font-bold hover:bg-[#06788f] transition-all disabled:opacity-50"
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </button>
              <p className="text-center text-sm text-slate-600 mt-4">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    resetForm();
                  }}
                  className="text-[#0891B2] font-bold hover:underline"
                >
                  Đăng nhập
                </button>
              </p>
            </form>
          )}

          {/* FORM FORGOT PASSWORD */}
          {view === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0891B2] outline-none"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0891B2] text-white py-3 rounded-xl font-bold hover:bg-[#06788f] transition-all disabled:opacity-50"
              >
                {loading ? "Đang gửi..." : "Gửi mã xác thực"}
              </button>
              <p className="text-center text-sm text-slate-600 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    resetForm();
                  }}
                  className="text-[#0891B2] font-bold hover:underline"
                >
                  Quay lại đăng nhập
                </button>
              </p>
            </form>
          )}

          {/* FORM VERIFICATION CODE (Dùng chung cho Signup & Forgot) */}
          {(view === "verify" || view === "verify-signup") && (
            <form
              onSubmit={
                view === "verify"
                  ? handleVerifyResetCode
                  : handleVerifySignupCode
              }
              className="space-y-6"
            >
              <div className="flex gap-2 justify-center">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0891B2] outline-none"
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0891B2] text-white py-3 rounded-xl font-bold hover:bg-[#06788f] transition-all disabled:opacity-50"
              >
                {loading ? "Đang xác thực..." : "Xác thực"}
              </button>
              <p className="text-center text-sm text-slate-600">
                Không nhận được mã?{" "}
                <button
                  type="button"
                  onClick={
                    view === "verify"
                      ? handleResendResetCode
                      : handleResendSignupCode
                  }
                  disabled={timer > 0}
                  className={`font-bold ${
                    timer > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-[#0891B2] hover:underline"
                  }`}
                >
                  {timer > 0 ? `Gửi lại (${timer}s)` : "Gửi lại mã"}
                </button>
              </p>
            </form>
          )}

          {/* FORM RESET PASSWORD */}
          {view === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0891B2] outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0891B2] outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0891B2] text-white py-3 rounded-xl font-bold hover:bg-[#06788f] transition-all disabled:opacity-50"
              >
                {loading ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}

          {/* SUCCESS VIEW */}
          {view === "success" && (
            <div className="text-center space-y-6 py-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Thành công!
                </h3>
                <p className="text-slate-600">Mật khẩu đã được cập nhật.</p>
              </div>
              <button
                onClick={() => {
                  setView("login");
                  resetForm();
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="w-full bg-[#0891B2] text-white py-3 rounded-xl font-bold hover:bg-[#06788f] transition-all"
              >
                Đăng nhập ngay
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isOpen, setIsOpen] = useState(true);

  // Test local
  return (
    <BrowserRouter>
      {!isOpen ? (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <button
            onClick={() => setIsOpen(true)}
            className="px-6 py-3 bg-[#0891B2] text-white rounded-xl shadow-lg"
          >
            Mở Đăng Nhập
          </button>
        </div>
      ) : (
        <LoginModal
          onClose={() => setIsOpen(false)}
          onLogin={(user) => {
            console.log("Login success:", user);
          }}
          onSignUp={(name, email) => {
            console.log("Signup success:", name, email);
          }}
        />
      )}
    </BrowserRouter>
  );
}
