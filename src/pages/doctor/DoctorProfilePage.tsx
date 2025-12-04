import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import type { Doctor, Review } from "@/types/types";
import { StarIcon } from "@/components/icons/StarIcon";
import { BookingCalendar } from "@/features/booking/components/BookingCalendar";
import { AcademicCapIcon } from "@/components/icons/AcademicCapIcon";
import { LanguageIcon } from "@/components/icons/LanguageIcon";
import { CurrencyDollarIcon } from "@/components/icons/CurrencyDollarIcon";
import { DocumentTextIcon } from "@/components/icons/DocumentTextIcon";

// ✅ API BASE
const API_BASE = "http://localhost:4421/api/v1";

interface DoctorProfilePageProps {
  onBook: (
    doctor: Doctor,
    slot: { date: string; time: string; scheduleId: number },
    type: "online" | "offline"
  ) => void;
}

export const DoctorProfilePage: React.FC<DoctorProfilePageProps> = ({
  onBook,
}) => {
  const { id } = useParams(); // /doctors/:id
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  // ========================= LOAD DOCTOR + REVIEWS =========================
  useEffect(() => {
    if (!id) return;

    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const [doctorRes, reviewRes] = await Promise.all([
          axios.get(`${API_BASE}/doctors/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/reviews/doctor/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const backendDoctor = doctorRes.data.data;
        const backendReviews = reviewRes.data.data;

        // ✅ MAP REVIEW
        const reviews: Review[] = backendReviews.map((r: any) => ({
          id: r.id.toString(),
          author: r.userName || "Ẩn danh",
          rating: r.rating,
          comment: r.comment,
          date: new Date(r.createdAt).toISOString().split("T")[0],
        }));

        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 5;

        // ✅ MAP DOCTOR DB → FRONTEND
        const mappedDoctor: Doctor = {
          id: backendDoctor.id.toString(),
          userId: backendDoctor.user.id.toString(),
          name: backendDoctor.user.lastName
            ? `${backendDoctor.user.firstName} ${backendDoctor.user.lastName}`
            : backendDoctor.user.firstName,
          specialty: backendDoctor.specialty?.name,
          experience: backendDoctor.experienceYears,
          rating: avgRating,
          imageUrl:
            backendDoctor.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              backendDoctor.user.firstName
            )}`,
          consultationFee: backendDoctor.consultationFee,
          bio: backendDoctor.bio || "Chưa có mô tả",
          education: backendDoctor.education
            ? backendDoctor.education.split("\n")
            : [],
          certificateUrl: backendDoctor.certificates?.[0],
          languages: ["Tiếng Việt"],
          reviews,
          schedule: [],
        };

        setDoctor(mappedDoctor);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu bác sĩ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  // ========================= UI =========================
  if (loading) {
    return <div className="text-center py-20">Đang tải hồ sơ bác sĩ...</div>;
  }

  if (!doctor) {
    return (
      <div className="text-center py-20 text-red-500">Không thấy bác sĩ</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* HEADER */}
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

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-amber-500">
                  <StarIcon className="w-5 h-5" />
                  <span className="font-bold text-slate-700">
                    {doctor.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-slate-600">
                  {doctor.experience} năm kinh nghiệm
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full w-fit">
                <CurrencyDollarIcon className="w-5 h-5" />
                <span className="font-semibold">
                  {doctor.consultationFee.toLocaleString("vi-VN")}đ / lần
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-3">Tiểu sử</h2>
              <p className="text-slate-600">{doctor.bio}</p>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">Học vấn</h2>
              <ul className="space-y-2">
                {doctor.education.map((edu, i) => (
                  <li key={i} className="flex gap-2">
                    <AcademicCapIcon className="w-5 h-5 text-cyan-600" />
                    <span>{edu}</span>
                  </li>
                ))}
              </ul>

              {doctor.certificateUrl && (
                <a
                  href={doctor.certificateUrl}
                  target="_blank"
                  className="inline-flex mt-4 items-center gap-2 text-cyan-700"
                >
                  <DocumentTextIcon className="w-5 h-5" /> Xem chứng chỉ
                </a>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold mb-3">
                Đánh giá ({doctor.reviews.length})
              </h2>

              {doctor.reviews.length === 0 && (
                <p className="text-slate-500">Chưa có đánh giá</p>
              )}

              {doctor.reviews.map((r) => (
                <div key={r.id} className="bg-slate-50 p-3 rounded mb-3">
                  <div className="flex justify-between">
                    <strong>{r.author}</strong>
                    <span>⭐ {r.rating}</span>
                  </div>
                  <p className="italic mt-1">"{r.comment}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <BookingCalendar doctor={doctor} onBook={onBook} />
          </div>
        </div>
      </div>
    </div>
  );
};
