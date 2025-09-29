import React from 'react';

const HardwareCheck = ({ onStartInterview }) => {
  return (
    <div>
      <h2>Hardware Check</h2>
      <p>Please allow access to your camera and microphone.</p>
      <button onClick={onStartInterview}>Begin Interview</button>
    </div>
  );
};

export default HardwareCheck;