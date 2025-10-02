import React, { useState, useEffect, useRef } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import HardwareCheck from './components/HardwareCheck';
import InterviewRoom from './components/InterviewRoom';
import './App.css';

function App() {
  const [appState, setAppState] = useState('welcome'); // welcome, hardware, interview
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const themeSwitcherRef = useRef(null);

  // This state is related to the interview and will be used by the InterviewRoom component
  const [transcript, setTranscript] = useState([]);
  const [evaState, setEvaState] = useState('Connecting...');
  const socket = useRef(null);

  // Theme switcher logic
  const setTheme = (selectedTheme) => {
    document.body.dataset.theme = selectedTheme;
    localStorage.setItem('talentflow-theme', selectedTheme);
    setIsThemeDropdownOpen(false);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('talentflow-theme') || 'ocean';
    setTheme(savedTheme);
  }, []);

  // Initialize and update Lucide icons
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // Close theme dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (themeSwitcherRef.current && !themeSwitcherRef.current.contains(event.target)) {
        setIsThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // WebSocket connection logic - will be fully managed within InterviewRoom later
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
          setTimeout(() => setEvaState('Listening...'), 2000); // Simulate audio playback
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

  const handleStartHardwareCheck = () => setAppState('hardware');
  const handleStartInterview = () => setAppState('interview');

  // This function will be passed to InterviewRoom where the UI trigger will be
  const sendAudio = () => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN && evaState === 'Listening...') {
      const simulatedAudioData = 'simulated audio chunk';
      socket.current.send(JSON.stringify({ type: 'audio_chunk', payload: simulatedAudioData }));
      console.log('Sent simulated audio data to server.');
      setEvaState('Processing...');
    }
  };

  const renderPage = () => {
    switch (appState) {
      case 'hardware':
        return <HardwareCheck onStartInterview={handleStartInterview} />;
      case 'interview':
        return <InterviewRoom transcript={transcript} evaState={evaState} sendAudio={sendAudio} />;
      case 'welcome':
      default:
        return <WelcomeScreen onStartHardwareCheck={handleStartHardwareCheck} />;
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          TalentFlow
        </div>
        <div className="theme-switcher" ref={themeSwitcherRef}>
          <button onClick={() => setIsThemeDropdownOpen(prev => !prev)} title="Change theme">
            <i data-lucide="palette"></i>
          </button>
          <div className={`dropdown ${isThemeDropdownOpen ? 'show' : ''}`}>
            <div className="option" onClick={() => setTheme('ocean')}>
              <span className="swatch" style={{ backgroundColor: '#0891B2' }}></span> Ocean
            </div>
            <div className="option" onClick={() => setTheme('dark')}>
              <span className="swatch" style={{ backgroundColor: '#1F2937' }}></span> Dark
            </div>
          </div>
        </div>
      </header>

      <main className="page-container">
        {renderPage()}
      </main>

      <footer className="app-footer">
        <a href="#privacy">Privacy Policy</a> &bull; <a href="#support">Technical Support</a>
      </footer>
    </>
  );
}

export default App;