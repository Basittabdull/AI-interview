import React, { useState } from 'react';
import CodingChallenge from './CodingChallenge';

const InterviewRoom = ({ transcript, evaState }) => {
  const [showCodingChallenge, setShowCodingChallenge] = useState(false);

  const toggleCodingChallenge = () => {
    setShowCodingChallenge(!showCodingChallenge);
  };

  return (
    <div>
      <div id="video-feeds">
        <div id="candidate-video-container">
          <h3>Your Video</h3>
          <video id="candidate-video" autoPlay muted></video>
        </div>
        <div id="eva-avatar-container">
          <h3>Eva</h3>
          <div id="eva-avatar">
            <p>{evaState}</p>
          </div>
        </div>
      </div>
      <div id="transcript-container">
        <h3>Live Transcript</h3>
        <div id="transcript">
          {transcript.map((entry, index) => (
            <p key={index}>
              <strong>{entry.speaker}:</strong> {entry.text}
            </p>
          ))}
        </div>
      </div>
      <div id="coding-challenge-tab">
        <button onClick={toggleCodingChallenge}>Show/Hide Coding Challenge</button>
      </div>
      {showCodingChallenge && <CodingChallenge />}
    </div>
  );
};

export default InterviewRoom;