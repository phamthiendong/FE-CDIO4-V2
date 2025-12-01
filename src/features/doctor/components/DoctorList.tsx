import React, { useEffect, useState } from "react";
import type { Doctor } from "@/types/types";
import { DoctorCard } from "./DoctorCard";
import axios from "axios";

interface DoctorListProps {
  doctors?: Doctor[]; // optional
  onSelectDoctor: (doctor: Doctor) => void;
}

export const DoctorList = ({ doctors, onSelectDoctor }: DoctorListProps) => {
  const [internalDoctors, setInternalDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (doctors && doctors.length > 0) return;

    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:4421/api/v1/doctors");

        const mapped: Doctor[] = res.data.data.map((d: any) => ({
          id: String(d.id),
          userId: String(d.user?.id),

          name: `${d.user?.firstName || ""} ${d.user?.lastName || ""}`.trim(),

          specialty: d.specialty?.name || "General Practice",

          experience: d.experienceYears || 0,

          rating: 5, // BE chưa có rating

          imageUrl:
            d.avatar && d.avatar.length > 5
              ? d.avatar
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  d.user?.firstName || "Doctor"
                )}`,

          consultationFee: d.consultationFee || 0,

          bio: d.bio || "Chưa có mô tả",

          education: d.education ? d.education.split("\n") : [],

          languages: ["Tiếng Việt"],

          reviews: [],

          schedule: [],
        }));

        setInternalDoctors(mapped);
      } catch (err) {
        console.error("Lỗi lấy danh sách bác sĩ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [doctors]);

  const displayDoctors =
    doctors && doctors.length > 0 ? doctors : internalDoctors;

  if (loading && displayDoctors.length === 0) {
    return (
      <div className="text-center py-10">Đang tải danh sách bác sĩ...</div>
    );
  }

  if (!displayDoctors || displayDoctors.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500">
        Không tìm thấy bác sĩ phù hợp.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayDoctors.map((doctor) => (
        <DoctorCard
          key={doctor.id}
          doctor={doctor}
          onSelectDoctor={onSelectDoctor}
        />
      ))}
    </div>
  );
};
