

import React, { useState } from 'react';
import type { Doctor } from '@/types/types';
import { Specialty } from '@/types/types';

interface DoctorProfileManagementPageProps {
  doctor: Doctor;
  onUpdateProfile: (updatedProfile: Partial<Doctor>) => void;
}

export const DoctorProfileManagementPage: React.FC<DoctorProfileManagementPageProps> = ({ doctor, onUpdateProfile }) => {
    const [formData, setFormData] = useState({
        name: doctor.name || '',
        specialty: doctor.specialty || Specialty.GeneralPractice,
        consultationFee: doctor.consultationFee || 0,
        bio: doctor.bio || '',
        education: doctor.education.join('\n') || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumberField = name === 'consultationFee';
        setFormData(prev => ({ 
            ...prev, 
            [name]: isNumberField ? Number(value) : value 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateProfile({
            ...formData,
            education: formData.education.split('\n'),
        });
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <h1 className="text-3xl font-bold text-slate-900">Quản lý Hồ sơ Bác sĩ</h1>
                    <p className="text-slate-600 mt-1">Cập nhật thông tin chuyên môn và cá nhân của bạn.</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <InputField label="Họ và Tên" name="name" value={formData.name} onChange={handleChange} />
                     <div>
                        <label htmlFor="specialty" className="block text-sm font-medium text-slate-700 mb-1">Chuyên khoa</label>
                        <select
                            id="specialty" name="specialty" value={formData.specialty} onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white"
                        >
                            {Object.values(Specialty).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <InputField label="Phí tư vấn (VNĐ)" name="consultationFee" value={String(formData.consultationFee)} onChange={handleChange} type="number" />
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">Tiểu sử</label>
                        <textarea
                            id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={5}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
                        />
                    </div>
                     <div>
                        <label htmlFor="education" className="block text-sm font-medium text-slate-700 mb-1">Học vấn & Bằng cấp (mỗi mục một dòng)</label>
                        <textarea
                            id="education" name="education" value={formData.education} onChange={handleChange} rows={4}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div className="text-right pt-4 border-t">
                        <button type="submit" className="px-8 py-3 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-700">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; }> = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input
      type={type} id={name} name={name} value={value} onChange={onChange}
      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
      required
    />
  </div>
);