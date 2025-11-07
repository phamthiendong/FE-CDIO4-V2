

import React from 'react';
import type { Notification } from '../../types/types';
import { BellIcon } from '../icons/BellIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { DocumentTextIcon } from '../icons/DocumentTextIcon';
import { SparklesIcon } from '../icons/SparklesIcon';
import { XMarkIcon } from '../icons/XMarkIcon';
import { EnvelopeIcon } from '../icons/EnvelopeIcon';
import { ChatBubbleLeftRightIcon } from '../icons/ChatBubbleLeftRightIcon';
import { MegaphoneIcon } from '../icons/MegaphoneIcon';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
  onMarkAllAsRead: () => void;
}

const typeDetails = {
    appointment: { icon: CalendarIcon, color: 'text-blue-500', bg: 'bg-blue-100' },
    prescription: { icon: DocumentTextIcon, color: 'text-green-500', bg: 'bg-green-100' },
    followUp: { icon: BellIcon, color: 'text-amber-500', bg: 'bg-amber-100' },
    aiResult: { icon: SparklesIcon, color: 'text-cyan-500', bg: 'bg-cyan-100' },
    human_response: { icon: ChatBubbleLeftRightIcon, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    admin_alert: { icon: MegaphoneIcon, color: 'text-purple-500', bg: 'bg-purple-100' },
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onNotificationClick, onMarkAllAsRead }) => {
  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " năm";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " tháng";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " ngày";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " giờ";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " phút";
    return Math.floor(seconds) + " giây";
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-25 z-50"
      onClick={onClose}
    >
      <div 
        className="absolute top-16 right-4 w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800">Thông báo</h3>
            <div className="flex items-center gap-2">
                 <button 
                    onClick={onMarkAllAsRead} 
                    className="text-xs font-medium text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
                    title="Đánh dấu tất cả là đã đọc"
                >
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>Đánh dấu tất cả</span>
                 </button>
                 <button onClick={onClose} className="text-slate-500 hover:text-slate-800">
                    <XMarkIcon className="w-5 h-5" />
                 </button>
            </div>
        </div>
        <div className="overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(notification => {
              const details = typeDetails[notification.type];
              const Icon = details.icon;
              return (
                <div 
                  key={notification.id} 
                  onClick={() => onNotificationClick(notification)}
                  className={`flex items-start gap-3 p-4 border-b border-slate-100 cursor-pointer ${notification.read ? 'opacity-60' : 'bg-cyan-50/50 hover:bg-cyan-50'}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${details.bg}`}>
                    <Icon className={`w-5 h-5 ${details.color}`} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-slate-700">{notification.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{timeSince(notification.timestamp)} trước</p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2.5 h-2.5 bg-cyan-500 rounded-full mt-1"></div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center p-12 text-slate-500">
              <p>Không có thông báo mới.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};