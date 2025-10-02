import React, { useState, useRef, useEffect } from 'react';
import CodingChallenge from './CodingChallenge';

const InterviewRoom = ({ transcript, evaState, sendAudio }) => {
  const [showCodingChallenge, setShowCodingChallenge] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    async function getMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        // Optionally, update a state to show an error to the user
      }
    }
    getMedia();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStartRecording = () => {
    if (streamRef.current && evaState === 'Listening...') {
      setIsRecording(true);
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result.split(',')[1];
          sendAudio(base64Audio);
        };
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleCodingChallenge = () => {
    setShowCodingChallenge(!showCodingChallenge);
  };

  return (
    <div id="interview-room">
      <div id="video-feeds">
        <div id="candidate-video-container">
          <h3>Your Video</h3>
          <video ref={videoRef} id="candidate-video" autoPlay muted></video>
        </div>
        <div id="eva-avatar-container">
          <h3>Eva</h3>
          <div id="eva-avatar">
            <p>{isRecording ? 'Recording...' : evaState}</p>
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

      <div id="controls">
        <button
          onMouseDown={handleStartRecording}
          onMouseUp={handleStopRecording}
          onTouchStart={handleStartRecording}
          onTouchEnd={handleStopRecording}
          disabled={evaState !== 'Listening...'}
          className={isRecording ? 'recording' : ''}
        >
          {isRecording ? 'Recording...' : 'Hold to Speak'}
        </button>
      </div>

      <div id="coding-challenge-tab">
        <button onClick={toggleCodingChallenge}>Show/Hide Coding Challenge</button>
      </div>
      <CodingChallenge show={showCodingChallenge} />
    </div>
  );
};

export default InterviewRoom;