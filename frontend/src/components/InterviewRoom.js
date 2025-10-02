import React, { useState, useEffect, useRef, useCallback } from 'react';
import CodingChallenge from './CodingChallenge';

// This is a simplified mock of the interview flow from Module4.html
const interviewFlow = [
  { type: 'verbal', text: "Hello, I'm Eva, your AI interviewer. Thanks for joining. Let's start with our first question: Can you tell me about a time you had to handle a difficult project deadline?" },
  { type: 'verbal', text: 'That sounds challenging. How do you approach learning a new technology or framework?' },
  { type: 'verbal', text: 'Interesting. What would you say is your biggest strength and how has it helped you in your career?' },
  { type: 'coding', text: "Thank you for sharing that. Now, we'll move on to a short coding challenge. The problem will appear on the 'Coding Challenge' tab." },
  { type: 'post-coding', text: "Thank you for submitting your solution. That concludes our technical assessment. We're now at the end of our scheduled time." },
  { type: 'end', text: "On behalf of the team, thank you for your time today. We'll be in touch with the next steps. Have a great day!" }
];

const codingProblem = {
  title: "Reverse a String",
  description: "Write a Python function to reverse a string without using any built-in reverse functions or slicing shorthands like `[::-1]`.",
  starterCode: "def reverse_string(s):\n  # Your code here\n  pass"
};


const InterviewRoom = ({ transcript, evaState, sendAudio }) => {
  const [activeTab, setActiveTab] = useState('conversation');
  const [timeRemaining, setTimeRemaining] = useState(20 * 60);
  const [isCodingTabEnabled, setIsCodingTabEnabled] = useState(false);
  const [notifyCodingTab, setNotifyCodingTab] = useState(false);

  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const [statusText, setStatusText] = useState('Connecting to Eva...');
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [endMessage, setEndMessage] = useState('');

  const [currentFlowIndex, setCurrentFlowIndex] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const endInterview = useCallback((message) => {
    setInterviewEnded(prevEnded => {
      if (prevEnded) return true;
      setEndMessage(message);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      return true;
    });
  }, []);

  // Timer effect
  useEffect(() => {
    if (interviewEnded) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endInterview("Interview time has expired.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [interviewEnded, endInterview]);

  // Get user media
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Failed to get media", err));

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startListening = useCallback((question) => {
    setStatusText(question);
  }, []);

  const aiSpeak = useCallback((text, isFinal = false) => {
    setStatusText('Eva is speaking...');
    const speakDuration = Math.max(2000, text.length * 60);
    setTimeout(() => {
      if (isFinal) {
        endInterview("Interview Complete");
      } else {
        startListening(text);
      }
    }, speakDuration);
  }, [endInterview, startListening]);

  const aiSpeakAndTransitionToCode = useCallback((text) => {
    setStatusText('Eva is speaking...');
    const speakDuration = Math.max(2000, text.length * 60);
    setTimeout(() => {
      setStatusText('Please proceed to the coding challenge.');
      setIsCodingTabEnabled(true);
      setNotifyCodingTab(true);
    }, speakDuration);
  }, []);

  // Main interview flow logic
  useEffect(() => {
    const processFlow = () => {
      if (interviewEnded || currentFlowIndex >= interviewFlow.length) {
        endInterview("You have completed all questions.");
        return;
      }

      const item = interviewFlow[currentFlowIndex];

      if (item.type === 'verbal' || item.type === 'post-coding' || item.type === 'end') {
        aiSpeak(item.text, item.type === 'end');
      } else if (item.type === 'coding') {
        aiSpeakAndTransitionToCode(item.text);
      }
    };

    const startTimeout = setTimeout(processFlow, 2000);
    return () => clearTimeout(startTimeout);
  }, [currentFlowIndex, interviewEnded, endInterview, aiSpeak, aiSpeakAndTransitionToCode]);

  // This simulates the user finishing their answer and the AI "thinking"
  const handleUserResponse = () => {
    if (evaState === 'Listening...') {
      sendAudio(); // Send simulated audio to backend
      setStatusText('Thinking...');
      setTimeout(() => {
        setCurrentFlowIndex(prev => prev + 1);
      }, 2000);
    }
  };

  const switchTab = (tab) => {
    if (tab === 'coding') {
      setNotifyCodingTab(false);
    }
    setActiveTab(tab);
  };

  const handleMicToggle = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = !isMicEnabled);
      setIsMicEnabled(!isMicEnabled);
    }
  };

  const handleVideoToggle = () => {
     if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => track.enabled = !isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const handleCodeSubmit = () => {
    switchTab('conversation');
    setCurrentFlowIndex(prev => prev + 1); // Move to post-coding question
  };

  if (interviewEnded) {
    return (
      <div className="page">
        <div className="ai-conversation-view">
          <div style={{background:'var(--card-background)', padding:'40px', borderRadius:'12px', border: '1px solid var(--border-color)', textAlign: 'center'}}>
            <i data-lucide="check-circle" style={{color:'var(--success-color)', width: '48px', height: '48px'}}></i>
            <h2 style={{fontSize:'1.5rem', margin:'16px 0'}}>{endMessage}</h2>
            <p className="transcript-text" style={{color:'var(--text-color-medium)'}}>You may now close this window.</p>
            <button className="btn btn-primary" style={{marginTop:'24px'}} onClick={() => window.close()}>Close Window</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="page">
      <div className="interview-room">
        <div className="interview-header">
          <div className="proctoring-notice" title="To ensure a fair and consistent process for all candidates, AI-powered proctoring is enabled.">
            <i data-lucide="shield"></i> <span>AI Proctoring Active</span>
          </div>
          <span className="timer">{Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')} remaining</span>
        </div>

        <div className="interview-tabs">
          <button className={`tab-button ${activeTab === 'conversation' ? 'active' : ''}`} onClick={() => switchTab('conversation')}>
            Conversation
          </button>
          <button
            className={`tab-button ${activeTab === 'coding' ? 'active' : ''} ${notifyCodingTab ? 'notify' : ''}`}
            onClick={() => switchTab('coding')}
            disabled={!isCodingTabEnabled}
          >
            Coding Challenge
          </button>
        </div>

        <div className="interview-tab-content">
          <div className={`tab-panel ${activeTab === 'conversation' ? 'active' : ''}`}>
             <div className="ai-conversation-view">
                <div className={`ai-avatar ${evaState === 'Speaking...' ? 'speaking' : ''} ${evaState === 'Listening...' ? 'listening' : ''}`}>
                    <div className="orb"></div>
                </div>
                <div className="conversation-status">
                    <p className="status-text">{statusText}</p>
                    <p className="transcript-text">
                      {transcript.map((t, i) => <span key={i}>{t.text}</span>)}
                    </p>
                    {/* This button replaces the old one from App.js */}
                    {evaState === 'Listening...' && (
                       <button onClick={handleUserResponse} className="btn btn-primary" style={{marginTop: '20px'}}>
                         Click to Speak (Simulated)
                       </button>
                    )}
                </div>
            </div>
          </div>
          <div className={`tab-panel ${activeTab === 'coding' ? 'active' : ''}`}>
            {isCodingTabEnabled && (
              <CodingChallenge
                problem={codingProblem}
                onCodeRun={() => alert("Run feature not implemented.")}
                onCodeSubmit={handleCodeSubmit}
              />
            )}
          </div>
        </div>

        <div className="candidate-video-container">
          <div className={`video-feed-container ${!isVideoEnabled ? 'video-off' : ''}`}>
            <video ref={videoRef} autoPlay muted playsInline></video>
            <div className="avatar-placeholder">You</div>
          </div>
          <div className="call-controls">
            <button className="control-btn" title="Mute/Unmute" onClick={handleMicToggle}>
              <i data-lucide={isMicEnabled ? 'mic' : 'mic-off'}></i>
            </button>
            <button className="control-btn" title="Stop/Start Video" onClick={handleVideoToggle}>
              <i data-lucide={isVideoEnabled ? 'video' : 'video-off'}></i>
            </button>
            <button className="control-btn danger" title="Finish Interview" onClick={() => endInterview('Interview finished by candidate.')}>
              <i data-lucide="phone-off"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InterviewRoom;