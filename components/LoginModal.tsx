

import React, { useState } from 'react';
import type { User, Doctor } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
  users: User[];
  doctors: Doctor[];
  onSignUp: (name: string, email: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, users, doctors, onSignUp }) => {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showDoctorSelection, setShowDoctorSelection] = useState(false);

  const handlePatientLogin = () => {
    // For demo, log in the first patient
    const user = users.find(u => u.role === 'patient');
    if (user) onLogin(user);
  };

  const handleAdminLogin = () => {
    const user = users.find(u => u.role === 'admin');
    if (user) onLogin(user);
  };
  
  const handleDoctorLogin = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      onLogin(user);
    } else {
      console.error(`Could not find user for doctor with userId: ${userId}`);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onSignUp(name, email);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
          {isSigningUp ? 'Đăng ký tài khoản mới' : 'Đăng nhập hoặc Đăng ký'}
        </h2>
        
        {isSigningUp ? (
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Họ và Tên</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                placeholder="Nguyễn Văn An"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
            >
              Đăng ký
            </button>
          </form>
        ) : (
          <div className="space-y-3">
              <button
                onClick={handlePatientLogin}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
              >
                Đăng nhập với tư cách Bệnh nhân
              </button>
              
              <div>
                <button
                    onClick={() => setShowDoctorSelection(prev => !prev)}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                    Đăng nhập với tư cách Bác sĩ
                </button>
                {showDoctorSelection && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-md border border-slate-200 max-h-36 overflow-y-auto">
                        <div className="space-y-1">
                            {doctors.map(doctor => (
                                <button
                                    key={doctor.id}
                                    onClick={() => handleDoctorLogin(doctor.userId)}
                                    className="w-full text-left px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-indigo-100 transition-colors"
                                >
                                    {doctor.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
              </div>

              <button
                onClick={handleAdminLogin}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
              >
                Đăng nhập với tư cách Admin
              </button>
          </div>
        )}
        
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>
            {isSigningUp ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
            <button type="button" onClick={() => setIsSigningUp(!isSigningUp)} className="font-semibold text-cyan-600 hover:text-cyan-700">
              {isSigningUp ? 'Đăng nhập' : 'Đăng ký ngay'}
            </button>
          </p>
        </div>
        
        <div className="mt-4 text-center">
            <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700">Hủy</button>
        </div>
      </div>
    </div>
  );
};