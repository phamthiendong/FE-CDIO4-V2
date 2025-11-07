
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

interface NotificationToastProps {
  message: string;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Allow time for fade-out animation before calling onClose
            setTimeout(onClose, 300); 
        }, 4700);

        return () => clearTimeout(timer);
    }, [message, onClose]);


  return (
    <div className={`fixed top-5 right-5 z-[100] w-full max-w-sm p-4 bg-white rounded-xl shadow-lg border border-slate-200 transition-all duration-300 ease-in-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-green-500">
            <CheckCircleIcon className="w-6 h-6" />
        </div>
        <div className="flex-grow">
          <p className="font-semibold text-slate-800">Thành công</p>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
        <div className="flex-shrink-0">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
