import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Stats from '../components/Stats';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <Footer />
    </div>
  );
};

export default LandingPage;