import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Icons & Components
import { StarIcon } from "@/components/icons/StarIcon";
import { BookingCalendar } from "@/features/booking/components/BookingCalendar";
import { AcademicCapIcon } from "@/components/icons/AcademicCapIcon";
import { LanguageIcon } from "@/components/icons/LanguageIcon";
import { CurrencyDollarIcon } from "@/components/icons/CurrencyDollarIcon";
import { DocumentTextIcon } from "@/components/icons/DocumentTextIcon";

// Types
import type { Doctor, Review } from "@/types/types";

// --- CẤU HÌNH API ---
const API_BASE_URL = "http://localhost:4421/api/v1"; // Đổi port nếu cần

// --- INTERFACE BACKEND ---
interface BackendDoctorResponse {
  id: number;
  userId: number;
  specialtyId: number;
  avatar: string | null;
  certificates: string[];
  experienceYears: number;
  consultationFee: number;
  bio: string | null;
  education: string | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  specialty: {
    name: string;
  };
}

interface BackendReviewResponse {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string | null;
}

// --- COMPONENT CHÍNH ---
// Bỏ props doctor cũ đi vì giờ component tự load dữ liệu
export const DoctorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Lấy ID từ URL
  const navigate = useNavigate();

  // State quản lý dữ liệu
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- GỌI API ---
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Vui lòng đăng nhập để xem thông tin.");
        setIsLoading(false);
        return;
      }

      try {
        // Gọi song song 2 API
        const [docRes, revRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/doctors/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/reviews/doctor/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const backendDoc: BackendDoctorResponse = docRes.data.data;
        const backendReviews: BackendReviewResponse[] = revRes.data.data;

        // Xử lý Reviews
        const mappedReviews: Review[] = backendReviews.map((r) => ({
          id: r.id.toString(),
          author: r.userName || "Ẩn danh",
          rating: r.rating,
          comment: r.comment,
          date: new Date(r.createdAt).toISOString().split("T")[0],
        }));

        const avgRating =
          mappedReviews.length > 0
            ? mappedReviews.reduce((sum, r) => sum + r.rating, 0) /
              mappedReviews.length
            : 5.0;

        // Xử lý Doctor Info
        const mappedDoctor: Doctor = {
          id: backendDoc.id.toString(),
          userId: backendDoc.userId.toString(),
          name: backendDoc.user.lastName
            ? `${backendDoc.user.firstName} ${backendDoc.user.lastName}`
            : backendDoc.user.firstName,
          specialty: backendDoc.specialty?.name || "Chuyên khoa",
          imageUrl:
            backendDoc.avatar ||
            "https://ui-avatars.com/api/?name=Dr&background=0D9488&color=fff",
          experience: backendDoc.experienceYears,
          consultationFee: backendDoc.consultationFee,
          bio: backendDoc.bio || "Chưa có thông tin giới thiệu.",
          education: backendDoc.education
            ? backendDoc.education.split("\n")
            : [],
          certificateUrl: backendDoc.certificates?.[0],
          reviews: mappedReviews,
          rating: avgRating,
          languages: ["Tiếng Việt"], // Fake data vì BE chưa có
          schedule: [], // Sẽ xử lý sau
        };

        setDoctor(mappedDoctor);
      } catch (err: any) {
        console.error(err);
        setError("Không thể tải dữ liệu bác sĩ.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handler Book (Giữ nguyên hoặc sửa logic gọi API sau này)
  const onBook = (
    doc: Doctor,
    slot: { date: string; time: string },
    type: "online" | "offline"
  ) => {
    console.log("Booking:", doc.id, slot, type);
    alert("Chức năng đặt lịch đang phát triển!");
  };

  // --- RENDER UI ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="text-center py-20 text-red-600">
        <h2 className="text-2xl font-bold">
          {error || "Không tìm thấy bác sĩ"}
        </h2>
        <button onClick={() => navigate(-1)} className="mt-4 underline">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-8 bg-slate-50 border-b border-slate-200">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={doctor.imageUrl}
              alt={doctor.name}
              className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-slate-900">
                {doctor.name}
              </h1>
              <p className="text-xl font-medium text-cyan-700 mt-1">
                {doctor.specialty}
              </p>

              <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                <div className="flex items-center gap-1 text-amber-500">
                  <StarIcon className="w-5 h-5" />
                  <span className="font-bold text-slate-700">
                    {doctor.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-slate-500">•</span>
                <span className="text-slate-600">
                  {doctor.experience} năm kinh nghiệm
                </span>
              </div>

              <div className="mt-3 flex items-center justify-center md:justify-start gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full w-fit mx-auto md:mx-0">
                <CurrencyDollarIcon className="w-5 h-5" />
                <span className="font-semibold text-md">
                  {doctor.consultationFee.toLocaleString("vi-VN")}đ / lần tư vấn
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">
                Tiểu sử
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {doctor.bio}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">
                Học vấn & Bằng cấp
              </h2>
              <ul className="space-y-3">
                {doctor.education.map((edu, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <AcademicCapIcon className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                    <span className="text-slate-600">{edu}</span>
                  </li>
                ))}
              </ul>
              {doctor.certificateUrl && (
                <div className="mt-4">
                  <a
                    href={doctor.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-900 bg-cyan-50 px-3 py-2 rounded-lg border border-cyan-200 transition-colors"
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>Xem chứng chỉ/bằng cấp</span>
                  </a>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">
                Ngôn ngữ
              </h2>
              <ul className="space-y-3">
                {doctor.languages.map((lang, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <LanguageIcon className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
                    <span className="text-slate-600">{lang}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">
                Đánh giá từ bệnh nhân ({doctor.reviews.length})
              </h2>
              <div className="space-y-6">
                {doctor.reviews.length > 0 ? (
                  doctor.reviews.map((review) => (
                    <div key={review.id} className="bg-slate-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-slate-700">
                          {review.author}
                        </p>
                        <div className="flex items-center gap-1 text-amber-500">
                          <StarIcon className="w-4 h-4" />
                          <span className="text-sm font-bold text-slate-600">
                            {review.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 mt-2 italic">
                        "{review.comment}"
                      </p>
                      <p className="text-xs text-slate-400 mt-2 text-right">
                        {review.date}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">Chưa có đánh giá nào.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Booking */}
          <div className="lg:col-span-1">
            <BookingCalendar doctor={doctor} onBook={onBook} />
          </div>
        </div>
      </div>
    </div>
  );
};
