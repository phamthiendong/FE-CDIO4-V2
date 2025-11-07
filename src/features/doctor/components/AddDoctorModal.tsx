import React, { useState, useRef } from 'react';
import { Specialty, type NewDoctorData } from '@/types/types';
import { PhotoIcon } from '@/components/icons/PhotoIcon';
import { ArrowUpTrayIcon } from '@/components/icons/ArrowUpTrayIcon';

interface AddDoctorModalProps {
  onClose: () => void;
  onSubmit: (data: NewDoctorData) => void;
}

const InputField: React.FC<{ label: string, name: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean, placeholder?: string }> = 
    ({ label, name, value, onChange, type = "text", required = true, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
        />
    </div>
);

export const AddDoctorModal: React.FC<AddDoctorModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Omit<NewDoctorData, 'imageUrl' | 'certificate'>>({
    name: '',
    email: '',
    specialty: Specialty.GeneralPractice,
    experience: 0,
    consultationFee: 0,
    bio: '',
    education: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumberField = ['experience', 'consultationFee'].includes(name);
    setFormData(prev => ({
      ...prev,
      [name]: isNumberField ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificateFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, imageUrl: imageFile, certificate: certificateFile });
  };

  const isFormValid = formData.name.trim() !== '' && formData.email.trim() !== '' && formData.experience > 0 && formData.consultationFee > 0 && formData.bio.trim() !== '' && formData.education.trim() !== '' && imageFile !== null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
            <h2 className="text-xl font-bold text-slate-900">Thêm Bác sĩ mới</h2>
            <p className="text-sm text-slate-500">Nhập thông tin chi tiết cho bác sĩ mới.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Ảnh đại diện</label>
              <div 
                className="mt-1 flex justify-center items-center w-full h-64 border-2 border-slate-300 border-dashed rounded-md cursor-pointer relative"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                    <img src={imagePreview} alt="Xem trước" className="w-full h-full object-cover rounded-md"/>
                ) : (
                    <div className="text-center">
                        <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <p className="mt-2 text-sm text-slate-600">
                            <span className="font-semibold">Nhấp để tải lên</span> hoặc kéo và thả
                        </p>
                        <p className="text-xs text-slate-500">PNG, JPG, GIF lên đến 10MB</p>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField label="Họ và Tên" name="name" value={formData.name} onChange={handleChange} placeholder="VD: BS. Nguyễn Văn A" />
              </div>
              <div className="md:col-span-2">
                <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="VD: nguyenvana@clinic.com" />
              </div>
              
              <div>
                  <label htmlFor="specialty" className="block text-sm font-medium text-slate-700 mb-1">Chuyên khoa</label>
                  <select
                      id="specialty"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-white"
                  >
                      {/* === SỬA LỖI TYPESCRIPT Ở ĐÂY === */}
                      {(Object.values(Specialty) as string[]).map(s => (
                          <option key={s} value={s}>{s}</option>
                      ))}
                      {/* =============================== */}
                  </select>
              </div>
              
              <InputField label="Số năm kinh nghiệm" name="experience" value={formData.experience || ''} onChange={handleChange} type="number" placeholder="VD: 10" />
              <InputField label="Phí tư vấn (VNĐ)" name="consultationFee" value={formData.consultationFee || ''} onChange={handleChange} type="number" placeholder="VD: 500000" />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">Tiểu sử</label>
            <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                required
                placeholder="Mô tả ngắn về kinh nghiệm và chuyên môn của bác sĩ..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="education" className="block text-sm font-medium text-slate-700 mb-1">Học vấn & Bằng cấp</label>
            <textarea
                id="education"
                name="education"
                rows={3}
                value={formData.education}
                onChange={handleChange}
                required
                placeholder="Liệt kê các bằng cấp, mỗi bằng cấp trên một dòng..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
          
          <div className="mt-4">
            <label htmlFor="certificate-upload" className="block text-sm font-medium text-slate-700 mb-1">
                Tải lên Bằng cấp/Chứng chỉ (Ảnh, PDF)
            </label>
            <div className="mt-1 flex items-center gap-3 bg-slate-50 p-3 rounded-md border border-slate-200">
                <label htmlFor="certificate-upload" className="cursor-pointer bg-white py-2 px-3 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-cyan-500 flex items-center gap-2">
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    <span>Chọn tệp</span>
                </label>
                <input id="certificate-upload" name="certificate-upload" type="file" className="sr-only" onChange={handleCertificateChange} accept="image/*,.pdf"/>
                {certificateFile ? (
                    <span className="text-sm text-slate-600 font-medium">{certificateFile.name}</span>
                ) : (
                    <span className="text-sm text-slate-500">Chưa có tệp nào được chọn.</span>
                )}
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="mt-2 sm:mt-0 w-full sm:w-auto px-6 py-2.5 bg-slate-200 text-slate-800 font-bold rounded-full hover:bg-slate-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              Thêm Bác sĩ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};