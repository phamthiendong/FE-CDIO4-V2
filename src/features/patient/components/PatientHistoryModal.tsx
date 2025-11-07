

import React, { useState } from 'react';
import type { MedicalRecord, User } from '../../../types/types';
import { CalendarIcon } from '../../../components/icons/CalendarIcon';

interface PatientHistoryModalProps {
  patient: User;
  records: MedicalRecord[];
  onClose: () => void;
}

const RecordItem: React.FC<{ record: MedicalRecord }> = ({ record }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border border-slate-200 rounded-lg">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left p-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100"
            >
                <div>
                    {/* FIX: Property 'diagnosis' does not exist on type 'MedicalRecord'. Use 'assessment' instead. */}
                    <p className="font-bold text-slate-800">{record.assessment}</p>
                    <p className="text-sm text-slate-500">{record.date}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isExpanded && (
                <div className="p-4 space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm text-slate-600">Ghi chú của bác sĩ (SOAP)</h4>
                        {/* FIX: Property 'notes' does not exist on type 'MedicalRecord'. Displaying SOAP fields instead. */}
                        <div className="text-sm text-slate-800 mt-1 whitespace-pre-wrap space-y-1">
                          <p><strong>S (Chủ quan):</strong> {record.subjective || 'Không có.'}</p>
                          <p><strong>O (Khách quan):</strong> {record.objective || 'Không có.'}</p>
                          <p><strong>P (Kế hoạch):</strong> {record.plan || 'Không có.'}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-slate-600">Đơn thuốc</h4>
                        {record.prescriptions.length > 0 ? (
                           <ul className="list-disc list-inside mt-1 space-y-1 text-sm">
                               {record.prescriptions.map(p => (
                                   <li key={p.id}>
                                       <span className="font-medium text-slate-800">{p.drugName}</span> - {p.dosage}, {p.frequency}, dùng trong {p.duration}.
                                   </li>
                               ))}
                           </ul>
                        ) : (
                            <p className="text-sm text-slate-500 mt-1">Không có thuốc nào được kê.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export const PatientHistoryModal: React.FC<PatientHistoryModalProps> = ({ patient, records, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 z-10">
            <h2 className="text-xl font-bold text-slate-900">Lịch sử Bệnh án</h2>
            <p className="text-slate-600">Bệnh nhân: <span className="font-semibold">{patient.name}</span></p>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto">
            {records.length > 0 ? (
                records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                    <RecordItem key={record.id} record={record} />
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-slate-500">Bệnh nhân này chưa có hồ sơ bệnh án nào.</p>
                </div>
            )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 text-right">
             <button 
              onClick={onClose}
              className="px-6 py-2 bg-slate-600 text-white font-bold rounded-full hover:bg-slate-700 transition-colors"
            >
              Đóng
            </button>
        </div>
      </div>
    </div>
  );
};