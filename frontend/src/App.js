import React, { useState, useEffect, useRef } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import HardwareCheck from './components/HardwareCheck';
import InterviewRoom from './components/InterviewRoom';
import './App.css';

function App() {
  const [appState, setAppState] = useState('welcome'); // welcome, hardware, interview
  const [transcript, setTranscript] = useState([]); // Store transcript as an array of objects
  const [evaState, setEvaState] = useState('Connecting...'); // Connecting..., Listening..., Speaking...
  const socket = useRef(null);

  useEffect(() => {
    if (appState === 'interview') {
      socket.current = new WebSocket('ws://localhost:8000/ws');

      socket.current.onopen = () => {
        console.log('WebSocket connection established');
        setEvaState('Listening...');
      };

      socket.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'audio') {
          console.log('Received audio from Eva:', message.payload);
          setEvaState('Speaking...');
          // In a real app, you would play the audio here
          setTimeout(() => {
            setEvaState('Listening...');
          }, 2000);
        } else if (message.type === 'transcript') {
          setTranscript(prev => [...prev, { speaker: 'You', text: message.payload }]);
        }
      };

      socket.current.onclose = () => {
        console.log('WebSocket connection closed');
        setEvaState('Offline');
      };

      socket.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setEvaState('Error');
      };

      return () => {
        if (socket.current) {
          socket.current.close();
        }
      };
    }
  }, [appState]);

  const handleStartHardwareCheck = () => {
    setAppState('hardware');
  };

  const handleStartInterview = () => {
    setAppState('interview');
  };

  const sendAudio = () => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN && evaState === 'Listening...') {
      const simulatedAudioData = 'simulated audio chunk';
      socket.current.send(JSON.stringify({ type: 'audio_chunk', payload: simulatedAudioData }));
      console.log('Sent simulated audio data to server.');
      setEvaState('Processing...');
    }
  };

  return (
    <div className="container">
      {appState === 'welcome' && <WelcomeScreen onStartHardwareCheck={handleStartHardwareCheck} />}
      {appState === 'hardware' && <HardwareCheck onStartInterview={handleStartInterview} />}
      {appState === 'interview' && (
        <>
          <InterviewRoom transcript={transcript} evaState={evaState} />
          <button onClick={sendAudio} disabled={evaState !== 'Listening...'}>
            {evaState === 'Listening...' ? 'Click to Speak (Simulated)' : 'Eva is speaking or processing...'}
          </button>
        </>
      )}
    </div>
  );
}

export default App;