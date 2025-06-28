import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-container">
      <h1>Build a resume that gets results.</h1>
      <p>Our AI-powered analyzer helps you tailor your resume for any job, boosting your chances of landing an interview.</p>
      <div className="hero-buttons">
        <a href="#analyzer" className="hero-button primary">Analyze My Resume</a>
      </div>
    </div>
  );
};

export default Hero; 