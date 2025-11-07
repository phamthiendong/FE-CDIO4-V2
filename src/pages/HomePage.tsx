import React from 'react';
import { HeroSection } from '@/features/Home/HeroSection'; 
import { HowItWorks } from '@/features/Home/HowItWorks';   
import { FeaturedDoctors } from '@/features/doctor/components/FeaturedDoctors';

interface HomePageProps {
  onStart: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
  return (
    <div className="space-y-20 md:space-y-28">
      <HeroSection onStart={onStart} />
      <HowItWorks />
      <FeaturedDoctors onStart={onStart} />
    </div>
  );
};