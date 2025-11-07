import React from 'react';
import type { Doctor } from '@/types/types';
import { DoctorCard } from './DoctorCard';

interface DoctorListProps {
  doctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
}

// FIX: Changed component definition to not use React.FC to resolve potential typing issues.
export const DoctorList = ({ doctors, onSelectDoctor }: DoctorListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {doctors.map(doctor => (
        <DoctorCard key={doctor.id} doctor={doctor} onSelectDoctor={onSelectDoctor} />
      ))}
    </div>
  );
};
