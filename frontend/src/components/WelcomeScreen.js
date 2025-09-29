import React from 'react';

const WelcomeScreen = ({ onStartHardwareCheck }) => {
  return (
    <div>
      <h1>Welcome to your AI Interview</h1>
      <p>This is an interview with our AI assistant, Eva. Please ensure you are in a quiet environment.</p>
      <button onClick={onStartHardwareCheck}>Start Hardware Check</button>
    </div>
  );
};

export default WelcomeScreen;