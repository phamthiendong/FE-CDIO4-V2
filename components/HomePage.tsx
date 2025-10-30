
import React from 'react';
import { HeroSection } from './HeroSection';
import { HowItWorks } from './HowItWorks';
import { FeaturedDoctors } from './FeaturedDoctors';

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
