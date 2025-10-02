import React from 'react';

const WelcomeScreen = ({ onStartHardwareCheck }) => {
  return (
    <section className="page">
      <h1 className="welcome-message">AI-powered interview for the Senior Python Developer role</h1>
      <ul className="instructions-list">
        <li>
          <i data-lucide="bot" className="icon"></i>
          <span>This is a conversational interview with our AI agent, <strong>Eva</strong>.</span>
        </li>
        <li>
          <i data-lucide="mic" className="icon"></i>
          <span>Eva will ask you questions verbally. Please respond clearly when prompted.</span>
        </li>
        <li>
          <i data-lucide="code-2" className="icon"></i>
          <span>The interview also includes a <strong>coding challenge</strong>.</span>
        </li>
        <li>
          <i data-lucide="clock" className="icon"></i>
          <span>The entire session will take approximately <strong>20 minutes</strong>.</span>
        </li>
      </ul>
      <button onClick={onStartHardwareCheck} className="btn btn-primary">
        Get Started
      </button>
    </section>
  );
};

export default WelcomeScreen;