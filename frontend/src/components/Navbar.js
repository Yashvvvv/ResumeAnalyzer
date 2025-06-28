import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-logo">
          ResumeWise
        </a>
        <div className="navbar-buttons">
          <a href="#analyzer" className="navbar-button primary">Analyze Resume</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 