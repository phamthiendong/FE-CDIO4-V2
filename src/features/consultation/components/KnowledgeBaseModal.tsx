import React, { useState, useEffect } from 'react';
import { Specialty, type KnowledgeBaseItem } from "@/types/types";

interface KnowledgeBaseModalProps {
  onClose: () => void;
  onSubmit: (data: Omit<KnowledgeBaseItem, 'id'>, id?: string) => void;
  initialData: KnowledgeBaseItem | null;
}

type FormData = Omit<KnowledgeBaseItem, 'id'>;

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<FormData>({
    symptom: '',
    diagnosis: '',
    recommendedSpecialty: Specialty.GeneralPractice,
    treatmentSuggestion: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        symptom: initialData.symptom,
        diagnosis: initialData.diagnosis,
        recommendedSpecialty: initialData.recommendedSpecialty,
        treatmentSuggestion: initialData.treatmentSuggestion,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, initialData?.id || undefined);
  };
  
  const isFormValid = formData.symptom.trim() && formData.diagnosis.trim() && formData.treatmentSuggestion.trim();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
            <h2 className="text-xl font-bold text-slate-900">
              {initialData ? 'Chỉnh sửa Kiến thức AI' : 'Thêm Kiến thức AI mới'}
            </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="symptom" className="block text-sm font-medium text-slate-700 mb-1">Triệu chứng/Câu hỏi</label>
            <textarea
                id="symptom" name="symptom" rows={3} value={formData.symptom} onChange={handleChange} required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
                placeholder="VD: Đau đầu, buồn nôn, nhạy cảm ánh sáng"
            />
          </div>
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-slate-700 mb-1">Chẩn đoán Sơ bộ</label>
            <input
                type="text" id="diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
                placeholder="VD: Đau nửa đầu (Migraine)"
            />
          </div>
           <div>
              <label htmlFor="recommendedSpecialty" className="block text-sm font-medium text-slate-700 mb-1">Chuyên khoa Gợi ý</label>
              <select
                  id="recommendedSpecialty" name="recommendedSpecialty" value={formData.recommendedSpecialty} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white"
              >
                  {Object.values(Specialty).map(s => (
                      <option key={s} value={s}>{s}</option>
                  ))}
              </select>
          </div>
           <div>
            <label htmlFor="treatmentSuggestion" className="block text-sm font-medium text-slate-700 mb-1">Gợi ý Xử lý/Phản hồi</label>
            <textarea
                id="treatmentSuggestion" name="treatmentSuggestion" rows={4} value={formData.treatmentSuggestion} onChange={handleChange} required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
                placeholder="VD: Nghỉ ngơi trong phòng tối, yên tĩnh. Uống thuốc giảm đau..."
            />
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3 pt-4 border-t border-slate-200">
            <button 
              type="button" onClick={onClose}
              className="mt-2 sm:mt-0 w-full sm:w-auto px-6 py-2.5 bg-slate-200 text-slate-800 font-bold rounded-full hover:bg-slate-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit" disabled={!isFormValid}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {initialData ? 'Lưu thay đổi' : 'Thêm kiến thức'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
