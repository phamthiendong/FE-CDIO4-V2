import React, { useState, useMemo, useEffect } from "react";
import type { Doctor } from "@/types/types";
import { Specialty } from "@/types/types";
import { DoctorList } from "@/features/doctor/components/DoctorList";
import { MagnifyingGlassIcon } from "@/components/icons/MagnifyingGlassIcon";
import axios from "axios";

interface FindDoctorPageProps {
  onSelectDoctor: (doctor: Doctor) => void;
}

export const FindDoctorPage: React.FC<FindDoctorPageProps> = ({
  onSelectDoctor,
}) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await axios.get("http://localhost:4421/api/v1/doctors");

      const mapped: Doctor[] = res.data.data.map((d: any) => ({
        id: String(d.id),
        userId: String(d.user?.id),

        name: `${d.user?.firstName || ""} ${d.user?.lastName || ""}`.trim(),

        specialty: d.specialty?.name || "General Practice",

        experience: d.experienceYears || 0,

        rating: 5,

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

      setDoctors(mapped);
    };

    fetchDoctors();
  }, []);

  const filteredAndSortedDoctors = useMemo(() => {
    const filtered = doctors.filter((doctor) => {
      const nameMatch = doctor.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const specialtyMatch = selectedSpecialty
        ? doctor.specialty === selectedSpecialty
        : true;

      return nameMatch && specialtyMatch;
    });

    if (sortBy === "rating") {
      return [...filtered].sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [doctors, searchTerm, selectedSpecialty, sortBy]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
          Tìm bác sĩ
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Tìm kiếm chuyên gia phù hợp với nhu cầu sức khỏe của bạn.
        </p>
      </div>

      {/* FILTER */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SEARCH */}
          <div className="relative md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên bác sĩ
            </label>
            <div className="absolute inset-y-0 left-0 top-6 flex items-center pl-3 pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="VD: Thạch Bảo Lộc"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md"
            />
          </div>

          {/* SPECIALTY */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Chuyên khoa
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white"
            >
              <option value="">Tất cả chuyên khoa</option>
              {(Object.values(Specialty) as string[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* SORT */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Sắp xếp theo
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white"
            >
              <option value="rating">Đánh giá (cao đến thấp)</option>
            </select>
          </div>
        </div>
      </div>

      {/* LIST */}
      <DoctorList
        doctors={filteredAndSortedDoctors}
        onSelectDoctor={onSelectDoctor}
      />
    </div>
  );
};
