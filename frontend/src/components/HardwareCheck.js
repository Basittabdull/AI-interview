import React, { useState, useEffect, useRef } from 'react';

const StatusIndicator = ({ status, label }) => {
  const isSuccess = status === 'success';
  const icon = isSuccess ? 'check-circle' : 'x-circle';
  const text = `${label} ${isSuccess ? 'detected' : 'not detected'}`;

  return (
    <div className={`status ${isSuccess ? 'success' : 'pending'}`}>
      <i data-lucide={icon}></i>
      <span>{text}</span>
    </div>
  );
};

const HardwareCheck = ({ onStartInterview }) => {
  const [cameraStatus, setCameraStatus] = useState('pending');
  const [micStatus, setMicStatus] = useState('pending');
  const [photoStatus, setPhotoStatus] = useState('pending');
  const [isCheckingMic, setIsCheckingMic] = useState(false);
  const videoRef = useRef(null);
  const micLevelRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);

  const allChecksPassed = cameraStatus === 'success' && micStatus === 'success' && photoStatus === 'success';

  useEffect(() => {
    const initHardware = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraStatus('success');
        setIsCheckingMic(true); // Start checking mic only after permission is granted
      } catch (err) {
        console.error("Error accessing media devices.", err);
        setCameraStatus('error');
        setMicStatus('error');
      }
    };

    initHardware();

    return () => {
      // Stop all tracks when the component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isCheckingMic && streamRef.current) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(streamRef.current);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      let animationFrameId;

      const checkMicLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        if (micLevelRef.current) {
          micLevelRef.current.style.width = `${Math.min(100, average * 2)}%`;
        }
        if (average > 5 && micStatus !== 'success') {
          setMicStatus('success');
        }
        animationFrameId = requestAnimationFrame(checkMicLevel);
      };

      checkMicLevel();

      return () => {
        cancelAnimationFrame(animationFrameId);
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      };
    }
  }, [isCheckingMic, micStatus]);

  const handleTakePhoto = () => {
    // In a real app, you'd capture a frame here. For now, we just toggle status.
    setPhotoStatus('success');
  };

  const canTakePhoto = cameraStatus === 'success' && micStatus === 'success';

  return (
    <section className="page hardware-check-page">
      <h1>Let's Check Your Setup</h1>
      <div className="hardware-check-area">
        <div className="check-item">
          <div className="video-feed-container">
            <video ref={videoRef} autoPlay muted playsInline></video>
          </div>
          <div className="status-indicators">
            <StatusIndicator status={cameraStatus} label="Camera" />
            <StatusIndicator status={micStatus} label="Microphone" />
          </div>
        </div>
        <div className="check-item">
          <p>Please speak to test your microphone.</p>
          <div className="mic-check-container">
            <div className="mic-visualizer">
              <div ref={micLevelRef} className="mic-level"></div>
            </div>
          </div>
          <div style={{ marginTop: '24px' }}>
            <p>Look at the camera for a verification photo.</p>
            <button
              onClick={handleTakePhoto}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={!canTakePhoto}
            >
              Take Photo
            </button>
            <div className={`status ${photoStatus === 'success' ? 'success' : 'pending'}`} style={{ marginTop: '8px', justifyContent: 'center' }}>
              <i data-lucide={photoStatus === 'success' ? 'check-circle' : 'x-circle'}></i>
              <span>Photo {photoStatus === 'success' ? 'taken' : 'not taken'}</span>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onStartInterview}
        className="btn btn-primary"
        disabled={!allChecksPassed}
      >
        Enter Interview
      </button>
    </section>
  );
};

export default HardwareCheck;