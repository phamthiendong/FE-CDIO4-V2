

import React, { useState } from 'react';
import type { User, Appointment, MedicalRecord, Doctor } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface PatientProfilePageProps {
  currentUser: User;
  appointments: Appointment[];
  onUpdateProfile: (updatedProfile: Partial<User>) => void;
  onViewMedicalRecord: (recordId: string) => void;
  doctors: Doctor[];
}

type ProfileTab = 'info' | 'relatives' | 'history';

export const PatientProfilePage: React.FC<PatientProfilePageProps> = (props) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return <ProfileInfoTab currentUser={props.currentUser} onUpdateProfile={props.onUpdateProfile} />;
       case 'relatives':
        return <RelativesTab currentUser={props.currentUser} onUpdateProfile={props.onUpdateProfile} />;
      case 'history':
        return <MedicalHistoryTab 
                  appointments={props.appointments} 
                  onViewMedicalRecord={props.onViewMedicalRecord} 
                  doctors={props.doctors}
                  currentUser={props.currentUser}
                />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Hồ sơ Bệnh nhân</h1>
          <p className="text-slate-600 mt-1">Quản lý thông tin cá nhân và xem lại lịch sử khám bệnh của bạn.</p>
        </div>
        <div className="flex border-b border-slate-200">
          <TabButton
            label="Thông tin Cá nhân"
            isActive={activeTab === 'info'}
            onClick={() => setActiveTab('info')}
          />
           <TabButton
            label="Người thân"
            isActive={activeTab === 'relatives'}
            onClick={() => setActiveTab('relatives')}
          />
          <TabButton
            label="Lịch sử Khám bệnh"
            isActive={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          />
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-semibold text-sm transition-colors ${
      isActive
        ? 'border-b-2 border-cyan-600 text-cyan-600'
        : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    {label}
  </button>
);

const ProfileInfoTab: React.FC<{ currentUser: User; onUpdateProfile: (data: Partial<User>) => void }> = ({ currentUser, onUpdateProfile }) => {
    const [formData, setFormData] = useState({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        insuranceNumber: currentUser.insuranceNumber || '',
        medicalHistorySummary: currentUser.medicalHistorySummary || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateProfile(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Họ và Tên" name="name" value={formData.name} onChange={handleChange} />
                <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
                <InputField label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange} />
                <InputField label="Số BHYT" name="insuranceNumber" value={formData.insuranceNumber} onChange={handleChange} />
            </div>
            <InputField label="Địa chỉ" name="address" value={formData.address} onChange={handleChange} />
            <div>
                 <label htmlFor="medicalHistorySummary" className="block text-sm font-medium text-slate-700 mb-1">Tóm tắt Bệnh nền</label>
                 <textarea
                    id="medicalHistorySummary" name="medicalHistorySummary"
                    value={formData.medicalHistorySummary} onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
                    placeholder="VD: Hen suyễn, dị ứng phấn hoa..."
                 />
            </div>
             <div className="text-right">
                <button type="submit" className="px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-700">Lưu thay đổi</button>
             </div>
        </form>
    )
};

const RelativesTab: React.FC<{ currentUser: User; onUpdateProfile: (data: Partial<User>) => void; }> = ({ currentUser, onUpdateProfile }) => {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');

  const handleAddRelative = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && relationship.trim()) {
      const newRelative = { id: `rel-${Date.now()}`, name, relationship };
      const updatedRelatives = [...(currentUser.relatives || []), newRelative];
      onUpdateProfile({ relatives: updatedRelatives });
      setName('');
      setRelationship('');
      setShowForm(false);
    }
  };

  const handleDeleteRelative = (relativeId: string) => {
    const updatedRelatives = (currentUser.relatives || []).filter(r => r.id !== relativeId);
    onUpdateProfile({ relatives: updatedRelatives });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-800">Danh sách Người thân</h3>
        {!showForm && (
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 text-sm">
                <UserPlusIcon className="w-5 h-5" /><span>Thêm người thân</span>
            </button>
        )}
      </div>
      
      {showForm && (
        <form onSubmit={handleAddRelative} className="p-4 bg-slate-50 border rounded-lg mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Họ và tên" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            <InputField label="Mối quan hệ" name="relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-200 font-semibold rounded-lg text-sm">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg text-sm">Lưu</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {(currentUser.relatives || []).length > 0 ? (
          (currentUser.relatives || []).map(relative => (
            <div key={relative.id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
              <div>
                <p className="font-semibold text-slate-800">{relative.name}</p>
                <p className="text-sm text-slate-500">{relative.relationship}</p>
              </div>
              <button onClick={() => handleDeleteRelative(relative.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
            </div>
          ))
        ) : (
          <p className="text-slate-500 text-center py-8">Chưa có người thân nào được thêm.</p>
        )}
      </div>
    </div>
  );
}

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; }> = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input
      type={type} id={name} name={name} value={value} onChange={onChange} required
      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
    />
  </div>
);

// Re-using a simplified version of AppointmentsPage content
const MedicalHistoryTab: React.FC<Pick<PatientProfilePageProps, 'appointments' | 'onViewMedicalRecord' | 'doctors' | 'currentUser'>> = ({ appointments, onViewMedicalRecord, doctors, currentUser }) => (
     <div className="space-y-6">
        {appointments.length > 0 ? (
          appointments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(apt => {
            const currentDoctorState = doctors.find(d => d.id === apt.doctor.id);
            const hasReviewed = currentDoctorState?.reviews.some(r => r.author === currentUser?.name);
            
            return (
              <div key={apt.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="font-bold text-slate-800">Khám với {apt.doctor.name} - <span className="text-cyan-700">{apt.doctor.specialty}</span></p>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                        <CalendarIcon className="w-4 h-4" />
                        {apt.date}
                    </p>
                </div>
                <div>
                  {apt.status === 'Đã hoàn thành' && apt.medicalRecordId && (
                     <button 
                      onClick={() => onViewMedicalRecord(apt.medicalRecordId!)}
                      className="flex items-center gap-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 text-sm"
                    >
                      <DocumentTextIcon className="w-5 h-5" />
                      <span>Xem bệnh án</span>
                    </button>
                  )}
                  {apt.status === 'Sắp diễn ra' && <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">Sắp diễn ra</span>}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-slate-800">Chưa có lịch sử khám bệnh</h2>
            <p className="mt-2 text-slate-500">Các cuộc hẹn đã hoàn thành của bạn sẽ xuất hiện ở đây.</p>
          </div>
        )}
      </div>
);