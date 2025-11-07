import React from 'react';
import type { MedicalRecord, Doctor } from '@/types/types';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { DocumentTextIcon } from '@/components/icons/DocumentTextIcon';

interface MedicalRecordViewModalProps {
  record: MedicalRecord;
  doctor?: Doctor;
  onClose: () => void;
}

export const MedicalRecordViewModal: React.FC<MedicalRecordViewModalProps> = ({ record, doctor, onClose }) => {
  const formattedSummary = record.consultationSummary.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>')
                                                    .replace(/\n/g, '<br />');

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
            <h2 className="text-xl font-bold text-slate-900">Chi tiết Hồ sơ Bệnh án</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <CalendarIcon className="w-4 h-4" />
                <span>Ngày khám: {record.date}</span>
            </div>
        </div>
        
        <div className="p-6 space-y-6">
            {doctor && (
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
                    <img src={doctor.imageUrl} alt={doctor.name} className="w-12 h-12 rounded-full"/>
                    <div>
                        <p className="font-bold text-slate-800">{doctor.name}</p>
                        <p className="text-sm text-cyan-700">{doctor.specialty}</p>
                    </div>
                </div>
            )}

            <div>
                <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">Chẩn đoán</h3>
                <p className="text-slate-800 font-bold text-lg">{record.assessment}</p>
            </div>
             <div>
                <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">Ghi chú của bác sĩ (SOAP)</h3>
                <div className="text-slate-600 whitespace-pre-wrap text-sm space-y-2">
                    <p><strong>Chủ quan (S):</strong> {record.subjective || 'Không có.'}</p>
                    <p><strong>Khách quan (O):</strong> {record.objective || 'Không có.'}</p>
                    <p><strong>Kế hoạch (P):</strong> {record.plan || 'Không có.'}</p>
                </div>
            </div>
            
             <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                    Tóm tắt bằng AI
                </h3>
                <div 
                  className="prose prose-slate max-w-none text-sm" 
                  dangerouslySetInnerHTML={{ __html: formattedSummary }} 
                />
            </div>

            <div>
                <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">Đơn thuốc</h3>
                {record.prescriptions.length > 0 ? (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600">
                            <tr>
                                <th className="p-2">Tên thuốc</th>
                                <th className="p-2">Liều lượng</th>
                                <th className="p-2">Tần suất</th>
                                <th className="p-2">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {record.prescriptions.map(p => (
                                <tr key={p.id} className="border-b">
                                    <td className="p-2 font-medium text-slate-800">{p.drugName}</td>
                                    <td className="p-2">{p.dosage}</td>
                                    <td className="p-2">{p.frequency}</td>
                                    <td className="p-2">{p.duration}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-slate-500">Không có thuốc nào được kê.</p>
                )}
            </div>
            
            {record.attachments && record.attachments.length > 0 && (
                <div>
                    <h3 className="font-semibold text-slate-700 mb-2 border-b pb-1">Tệp đính kèm</h3>
                    <ul className="space-y-2">
                        {record.attachments.map((file, index) => (
                            <li key={index}>
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-900 bg-cyan-50 p-2 rounded-lg border border-cyan-200">
                                    <DocumentTextIcon className="w-5 h-5" />
                                    <span>{file.name}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}


            <div className="text-right pt-4">
                <button 
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-600 text-white font-bold rounded-full hover:bg-slate-700 transition-colors"
                >
                  Đóng
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};