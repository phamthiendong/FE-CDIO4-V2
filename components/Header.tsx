

import React from 'react';
import { StethoscopeIcon } from './icons/StethoscopeIcon';
import type { User } from '../types';
import { BellIcon } from './icons/BellIcon';

interface HeaderProps {
  onGoHome: () => void;
  isLoggedIn: boolean;
  currentUser: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onAppointmentsClick: () => void;
  onChatClick: () => void;
  onAboutClick: () => void;
  onDashboardClick: () => void;
  onScheduleClick: () => void;
  onFindDoctorClick: () => void;
  onProfileClick: () => void;
  unreadNotificationCount: number;
  onToggleNotificationPanel: () => void;
}

// FIX: Changed component definition to not use React.FC to resolve potential typing issues.
export const Header = ({ 
  onGoHome, 
  isLoggedIn, 
  currentUser, 
  onLoginClick, 
  onLogout,
  onAppointmentsClick,
  onChatClick,
  onAboutClick,
  onDashboardClick,
  onScheduleClick,
  onFindDoctorClick,
  onProfileClick,
  unreadNotificationCount,
  onToggleNotificationPanel
}: HeaderProps) => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <button onClick={onGoHome} className="flex items-center gap-3 cursor-pointer">
            <StethoscopeIcon className="w-8 h-8 text-cyan-600" />
            <span className="text-xl font-bold text-slate-800">ClinicAI</span>
          </button>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={onGoHome} className="text-slate-600 hover:text-cyan-600 transition-colors">Trang chủ</button>
            
            {isLoggedIn && currentUser?.role === 'admin' && (
              <button onClick={onDashboardClick} className="text-slate-600 hover:text-cyan-600 transition-colors">Bảng điều khiển</button>
            )}

            {isLoggedIn && currentUser?.role === 'doctor' && (
              <>
                <button onClick={onScheduleClick} className="text-slate-600 hover:text-cyan-600 transition-colors">Lịch trình của tôi</button>
                <button onClick={onProfileClick} className="text-slate-600 hover:text-cyan-600 transition-colors">Hồ sơ của tôi</button>
              </>
            )}

            {isLoggedIn && currentUser?.role === 'patient' && (
              <>
                <button onClick={onFindDoctorClick} className="text-slate-600 hover:text-cyan-600 transition-colors">Tìm bác sĩ</button>
                <button onClick={onChatClick} className="text-slate-600 hover:text-cyan-600 transition-colors">AI Chat</button>
                <button onClick={onAppointmentsClick} className="text-slate-600 hover:text-cyan-600 transition-colors">Lịch hẹn</button>
                <button onClick={onProfileClick} className="text-slate-600 hover:text-cyan-600 transition-colors">Hồ sơ của tôi</button>
              </>
            )}

            {!isLoggedIn && (
               <button onClick={onFindDoctorClick} className="text-slate-600 hover:text-cyan-600 transition-colors">Tìm bác sĩ</button>
            )}

            <button onClick={onAboutClick} className="text-slate-600 hover:text-cyan-600 transition-colors">Về chúng tôi</button>
            
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                 <button onClick={onToggleNotificationPanel} className="relative text-slate-600 hover:text-cyan-600">
                    <BellIcon className="w-6 h-6" />
                    {unreadNotificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {unreadNotificationCount}
                        </span>
                    )}
                 </button>
                <span className="font-medium text-slate-700">Chào, {currentUser?.name}!</span>
                <button 
                  onClick={onLogout}
                  className="bg-slate-200 text-slate-800 px-4 py-2 rounded-full hover:bg-slate-300 transition-colors font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-cyan-600 text-white px-4 py-2 rounded-full hover:bg-cyan-700 transition-colors font-medium"
              >
                Đăng nhập
              </button>
            )}
          </nav>
           <div className="md:hidden">
            <button className="text-slate-600 hover:text-cyan-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}