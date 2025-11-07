
import React, { useState } from 'react';
import type { Appointment } from '@/types/types';
import { StarIcon } from '@/components/icons/StarIcon';

interface ReviewModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSubmit: (appointment: Appointment, rating: number, comment: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ appointment, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(appointment, rating, comment);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Đánh giá buổi tư vấn</h2>
        <p className="text-center text-slate-600 mb-6">Chia sẻ trải nghiệm của bạn với {appointment.doctor.name}</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-lg font-semibold text-slate-700 mb-3 text-center">
              Xếp hạng của bạn
            </label>
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <StarIcon 
                    className={`w-10 h-10 cursor-pointer transition-colors ${
                      (hoverRating || rating) >= star ? 'text-amber-400' : 'text-slate-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-lg font-semibold text-slate-700 mb-2">
              Để lại bình luận (tùy chọn)
            </label>
            <textarea
              id="comment"
              rows={4}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              placeholder="Bác sĩ rất tận tâm..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="mt-2 sm:mt-0 w-full sm:w-auto px-6 py-2.5 bg-slate-200 text-slate-800 font-bold rounded-full hover:bg-slate-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={rating === 0}
              className="w-full sm:w-auto px-6 py-2.5 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              Gửi đánh giá
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
