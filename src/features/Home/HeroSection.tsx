
import React from 'react';

interface HeroSectionProps {
    onStart: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => {
  return (
    <section className="text-center py-16 md:py-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          Sức khỏe trong tầm tay, tư vấn thông minh cùng <span className="text-cyan-600">AI</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Nhận chẩn đoán sơ bộ, tìm bác sĩ phù hợp và bắt đầu tư vấn chỉ trong vài phút.
        </p>
        <div className="mt-10">
          <button
            onClick={onStart}
            className="px-10 py-4 bg-cyan-600 text-white font-bold text-lg rounded-full hover:bg-cyan-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300 shadow-lg"
          >
            Bắt đầu ngay
          </button>
        </div>
      </div>
    </section>
  );
};
