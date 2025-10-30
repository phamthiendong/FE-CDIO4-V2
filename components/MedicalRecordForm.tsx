

import React, { useState } from 'react';
import type { Appointment, Prescription, MedicalRecord } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface MedicalRecordFormProps {
  appointment: Appointment;
  aiSummary: string;
  isSummarizing: boolean;
  onSave: (recordData: Omit<MedicalRecord, 'id' | 'appointmentId' | 'patientId' | 'doctorId' | 'date' | 'attachments'>) => void;
  getIcd10Suggestions: (summary: string) => Promise<{ code: string, description: string }[]>;
}

export const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({ appointment, aiSummary, isSummarizing, onSave, getIcd10Suggestions }) => {
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [prescriptions, setPrescriptions] = useState<Omit<Prescription, 'id'>[]>([]);
  const [icdSuggestions, setIcdSuggestions] = useState<{ code: string, description: string }[]>([]);
  const [isFetchingIcd, setIsFetchingIcd] = useState(false);

  const formattedSummary = aiSummary.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>')
                                   .replace(/\n/g, '<br />');

  const handleAddPrescription = () => {
    setPrescriptions([...prescriptions, { drugName: '', dosage: '', frequency: '', duration: '' }]);
  };
  
  const handleRemovePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handlePrescriptionChange = (index: number, field: keyof Omit<Prescription, 'id'>, value: string) => {
    const updated = [...prescriptions];
    updated[index][field] = value;
    setPrescriptions(updated);
  };

  const handleFetchIcd = async () => {
    setIsFetchingIcd(true);
    try {
        const suggestions = await getIcd10Suggestions(aiSummary);
        setIcdSuggestions(suggestions);
    } catch (error) {
        console.error("Failed to fetch ICD-10 suggestions:", error);
        alert("Không thể lấy gợi ý mã ICD-10.");
    } finally {
        setIsFetchingIcd(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessment.trim()) {
        alert("Vui lòng nhập chẩn đoán.");
        return;
    }
    const finalPrescriptions: Prescription[] = prescriptions.map((p, index) => ({
      ...p,
      id: `presc-${Date.now()}-${index}`,
    }));
    onSave({
      subjective,
      objective,
      assessment,
      plan,
      prescriptions: finalPrescriptions,
      consultationSummary: aiSummary,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Tạo Hồ sơ Bệnh án (SOAP)</h1>
        <p className="mt-2 text-lg text-slate-600">
          Hoàn tất hồ sơ cho buổi tư vấn với bệnh nhân <span className="font-bold">{appointment.patientId}</span>.
        </p>
      </div>

      {/* AI Summary Section */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-md">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <DocumentTextIcon className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Tóm tắt buổi tư vấn bằng AI</h2>
            {isSummarizing ? (
              <div className="flex items-center gap-2 text-slate-600">
                <LoadingSpinner className="w-5 h-5 text-slate-500" />
                <span>Đang tạo tóm tắt...</span>
              </div>
            ) : (
              <div 
                className="prose prose-slate max-w-none text-sm" 
                dangerouslySetInnerHTML={{ __html: formattedSummary }} 
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Form Fields */}
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 space-y-6">
        <SOAPTextarea label="S: Subjective (Chủ quan)" value={subjective} onChange={e => setSubjective(e.target.value)} placeholder="Triệu chứng, tiền sử bệnh do bệnh nhân cung cấp..."/>
        <SOAPTextarea label="O: Objective (Khách quan)" value={objective} onChange={e => setObjective(e.target.value)} placeholder="Dấu hiệu sinh tồn, kết quả khám lâm sàng, xét nghiệm..."/>
        <div>
          <SOAPTextarea label="A: Assessment (Đánh giá)" value={assessment} onChange={e => setAssessment(e.target.value)} placeholder="Chẩn đoán, mã ICD-10..."/>
          <div className="mt-2">
            <button type="button" onClick={handleFetchIcd} disabled={isFetchingIcd} className="flex items-center gap-2 text-sm font-medium text-cyan-600 hover:text-cyan-800 disabled:opacity-50">
                {isFetchingIcd ? <LoadingSpinner className="w-5 h-5 text-cyan-500" /> : <SparklesIcon className="w-5 h-5" />}
                <span>{isFetchingIcd ? 'Đang tìm...' : 'Gợi ý mã ICD-10 bằng AI'}</span>
            </button>
            {icdSuggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                    {icdSuggestions.map(s => (
                        <button type="button" key={s.code} onClick={() => setAssessment(prev => `${prev ? prev + '\n' : ''}${s.code} - ${s.description}`)} className="text-left text-sm p-2 bg-slate-100 hover:bg-slate-200 rounded-md w-full">
                           <span className="font-bold">{s.code}:</span> {s.description}
                        </button>
                    ))}
                </div>
            )}
          </div>
        </div>
        <div>
          <SOAPTextarea label="P: Plan (Kế hoạch)" value={plan} onChange={e => setPlan(e.target.value)} placeholder="Kế hoạch điều trị, lời dặn, lịch tái khám..."/>
           {/* Prescriptions */}
            <div className="mt-4">
                <h3 className="text-md font-semibold text-slate-700 mb-3">Kê đơn thuốc</h3>
                <div className="space-y-4">
                    {prescriptions.map((p, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-10 gap-2 p-3 bg-slate-50 rounded-lg border">
                        <input type="text" placeholder="Tên thuốc" value={p.drugName} onChange={e => handlePrescriptionChange(index, 'drugName', e.target.value)} required className="md:col-span-3 p-2 border rounded-md" />
                        <input type="text" placeholder="Liều lượng" value={p.dosage} onChange={e => handlePrescriptionChange(index, 'dosage', e.target.value)} required className="md:col-span-2 p-2 border rounded-md" />
                        <input type="text" placeholder="Tần suất" value={p.frequency} onChange={e => handlePrescriptionChange(index, 'frequency', e.target.value)} required className="md:col-span-2 p-2 border rounded-md" />
                        <input type="text" placeholder="Thời gian" value={p.duration} onChange={e => handlePrescriptionChange(index, 'duration', e.target.value)} required className="md:col-span-2 p-2 border rounded-md" />
                        <button type="button" onClick={() => handleRemovePrescription(index)} className="md:col-span-1 flex items-center justify-center text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={handleAddPrescription}
                    className="mt-4 flex items-center gap-2 text-sm font-medium text-cyan-600 hover:text-cyan-800"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>Thêm thuốc</span>
                </button>
            </div>
        </div>
      </div>
      
      <div className="text-center">
         <button
          type="submit"
          className="w-full md:w-auto inline-flex items-center justify-center px-10 py-4 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 shadow-lg"
        >
          Lưu Hồ sơ Bệnh án
        </button>
      </div>

    </form>
  );
};

const SOAPTextarea: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder: string}> = ({label, value, onChange, placeholder}) => (
    <div>
      <label className="block text-lg font-semibold text-slate-700 mb-1">{label}</label>
      <textarea
        rows={3}
        value={value}
        onChange={onChange}
        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
        placeholder={placeholder}
      />
    </div>
);