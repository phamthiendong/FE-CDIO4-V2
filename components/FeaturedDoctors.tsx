
import React from 'react';
import { DoctorList } from './DoctorList';
import { INITIAL_DOCTORS } from '../constants';
import type { Doctor } from '../types';

interface FeaturedDoctorsProps {
  onStart: () => void;
}

const featuredDoctors = INITIAL_DOCTORS.slice(0, 3);

export const FeaturedDoctors: React.FC<FeaturedDoctorsProps> = ({ onStart }) => {
  // When a featured doctor is clicked on the homepage, we want to start the app flow
  // rather than go directly to their profile.
  const handleSelectDoctor = (doctor: Doctor) => {
    onStart();
  };

  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Gặp gỡ các bác sĩ tiêu biểu</h2>
        <p className="mt-4 text-lg text-slate-600">Đội ngũ chuyên gia tận tâm và giàu kinh nghiệm của chúng tôi.</p>
      </div>
      <DoctorList doctors={featuredDoctors} onSelectDoctor={handleSelectDoctor} />
    </section>
  );
};
