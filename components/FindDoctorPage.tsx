

import React, { useState, useMemo } from 'react';
import type { Doctor } from '../types';
import { Specialty } from '../types';
import { DoctorList } from './DoctorList';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';

interface FindDoctorPageProps {
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
}

export const FindDoctorPage: React.FC<FindDoctorPageProps> = ({ doctors, onSelectDoctor }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const filteredAndSortedDoctors = useMemo(() => {
    const filtered = doctors.filter(doctor => {
      const nameMatch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
      const specialtyMatch = selectedSpecialty ? doctor.specialty === selectedSpecialty : true;
      return nameMatch && specialtyMatch;
    });

    if (sortBy === 'rating') {
      return [...filtered].sort((a, b) => b.rating - a.rating);
    }
    // Add more sort options here if needed
    return filtered;
  }, [doctors, searchTerm, selectedSpecialty, sortBy]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Tìm bác sĩ</h1>
        <p className="mt-4 text-lg text-slate-600">
          Tìm kiếm chuyên gia phù hợp với nhu cầu sức khỏe của bạn.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1">
            <label htmlFor="search-doctor" className="block text-sm font-medium text-slate-700 mb-1">
              Tên bác sĩ
            </label>
            <div className="absolute inset-y-0 left-0 top-6 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              id="search-doctor"
              placeholder="VD: Evelyn Reed"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="specialty-filter" className="block text-sm font-medium text-slate-700 mb-1">
              Chuyên khoa
            </label>
            <select
              id="specialty-filter"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-white"
            >
              <option value="">Tất cả chuyên khoa</option>
              {Object.values(Specialty).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1">
            <label htmlFor="sort-by" className="block text-sm font-medium text-slate-700 mb-1">
              Sắp xếp theo
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-white"
            >
              <option value="rating">Đánh giá (cao đến thấp)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Doctor List */}
      <div>
        {filteredAndSortedDoctors.length > 0 ? (
          <DoctorList doctors={filteredAndSortedDoctors} onSelectDoctor={onSelectDoctor} />
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy bác sĩ nào</h2>
            <p className="mt-2 text-slate-500">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
          </div>
        )}
      </div>
    </div>
  );
};