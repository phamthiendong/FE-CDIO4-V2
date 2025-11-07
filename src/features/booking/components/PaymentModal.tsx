
import React, { useState } from 'react';
import type { PendingAppointment } from '../../../types/types';
import { CalendarIcon } from '../../../components/icons/CalendarIcon';
import { ClockIcon } from '../../../components/icons/ClockIcon';
import { VisaIcon } from '../../../components/icons/VisaIcon';
import { MomoIcon } from '../../../components/icons/MomoIcon';
import { StethoscopeIcon } from '../../../components/icons/StethoscopeIcon';

interface PaymentModalProps {
  appointment: PendingAppointment;
  onClose: () => void;
  onConfirm: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ appointment, onClose, onConfirm }) => {
  const [selectedMethod, setSelectedMethod] = useState('visa');
  const isOnline = appointment.type === 'online';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">
          {isOnline ? 'Xác nhận Thanh toán' : 'Xác nhận Lịch hẹn'}
        </h2>
        
        {/* Appointment Details */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            <p className="font-bold text-slate-800">BS. {appointment.doctor.name}</p>
            <p className="text-sm text-slate-600">{appointment.doctor.specialty}</p>
            <div className="mt-2 flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2 text-slate-700">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="font-medium">{appointment.date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <ClockIcon className="w-4 h-4" />
                  <span className="font-medium">{appointment.time}</span>
                </div>
            </div>
             <div className="mt-2 text-sm font-medium text-cyan-800 bg-cyan-100 px-2 py-1 rounded-md inline-flex items-center gap-2">
                <StethoscopeIcon className="w-4 h-4" />
                <span>{isOnline ? 'Tư vấn Online' : 'Khám tại quầy'}</span>
            </div>
        </div>

        {/* Payment Methods */}
        {isOnline && (
            <div>
                <h3 className="font-semibold text-slate-700 mb-3">Chọn phương thức thanh toán</h3>
                <div className="space-y-3">
                    <PaymentOption 
                        id="visa"
                        label="Thẻ Tín dụng / Ghi nợ"
                        icon={VisaIcon}
                        selected={selectedMethod === 'visa'}
                        onSelect={() => setSelectedMethod('visa')}
                    />
                    <PaymentOption 
                        id="momo"
                        label="Ví điện tử MoMo"
                        icon={MomoIcon}
                        selected={selectedMethod === 'momo'}
                        onSelect={() => setSelectedMethod('momo')}
                    />
                </div>
            </div>
        )}

        {/* Total and Confirmation */}
        <div className="mt-6 pt-4 border-t border-slate-200">
            {isOnline ? (
                <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-medium text-slate-600">Tổng cộng</span>
                    <span className="text-2xl font-bold text-green-600">
                        {appointment.doctor.consultationFee.toLocaleString('vi-VN')}đ
                    </span>
                </div>
            ) : (
                <p className="text-center text-slate-600 mb-6">Bạn sẽ thanh toán chi phí khám trực tiếp tại quầy. Lịch hẹn của bạn sẽ được gửi đi để chờ duyệt.</p>
            )}

            <button
                onClick={onConfirm}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-md font-bold text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
            >
              {isOnline ? 'Xác nhận Thanh toán' : 'Gửi yêu cầu đặt hẹn'}
            </button>
            <button onClick={onClose} className="w-full text-center mt-4 text-sm text-slate-500 hover:text-slate-700">
                Hủy
            </button>
        </div>
      </div>
    </div>
  );
};

interface PaymentOptionProps {
    id: string;
    label: string;
    icon: React.ElementType;
    selected: boolean;
    onSelect: () => void;
}
const PaymentOption: React.FC<PaymentOptionProps> = ({ id, label, icon: Icon, selected, onSelect }) => (
    <label htmlFor={id} className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${selected ? 'border-cyan-500 bg-cyan-50' : 'border-slate-300 bg-white hover:bg-slate-50'}`}>
        <div className="flex items-center gap-3">
            <Icon />
            <span className="font-semibold text-slate-800">{label}</span>
        </div>
        <input type="radio" id={id} name="paymentMethod" checked={selected} onChange={onSelect} className="h-4 w-4 text-cyan-600 border-slate-300 focus:ring-cyan-500" />
    </label>
);