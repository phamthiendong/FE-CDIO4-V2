
import React, { useState } from 'react';
import type { User } from '../../../types/types';

interface UserEditModalProps {
  user: User;
  onClose: () => void;
  onSubmit: (updatedData: Partial<User> & { id: string }) => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSubmit }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ id: user.id, name, email, role });
  };

  const isFormValid = name.trim() !== '' && email.trim() !== '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-slate-900">Chỉnh sửa Người dùng</h2>
          <p className="text-sm text-slate-500">Cập nhật thông tin cho {user.name}.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Họ và Tên</label>
              <input
                type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">Vai trò</label>
              <select
                id="role" value={role} onChange={(e) => setRole(e.target.value as User['role'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white"
                disabled={user.role === 'admin'} // Prevent changing admin role
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="p-4 bg-slate-50 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 font-bold rounded-full hover:bg-slate-300">Hủy</button>
            <button type="submit" disabled={!isFormValid} className="px-4 py-2 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-700 disabled:bg-slate-400">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  );
};
