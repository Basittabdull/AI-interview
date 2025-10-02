import { render, screen } from '@testing-library/react';
import App from './App';
import InterviewRoom from './components/InterviewRoom';

// Mock browser APIs not available in JSDOM
beforeAll(() => {
  // Mock for MediaRecorder
  global.MediaRecorder = jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    ondataavailable: jest.fn(),
    onstop: jest.fn(),
  }));

  // Mock for getUserMedia
  if (!global.navigator.mediaDevices) {
    global.navigator.mediaDevices = {};
  }
  global.navigator.mediaDevices.getUserMedia = jest.fn().mockResolvedValue({
    getTracks: () => [{ stop: jest.fn() }],
  });
});

test('renders the welcome screen on initial load', () => {
  render(<App />);
  const welcomeHeader = screen.getByText(/Welcome to your AI Interview/i);
  expect(welcomeHeader).toBeInTheDocument();
});

test('renders "Hold to Speak" button in InterviewRoom when listening', () => {
  const mockSendAudio = jest.fn();
  render(
    <InterviewRoom
      transcript={[]}
      evaState="Listening..."
      sendAudio={mockSendAudio}
    />
  );

  const speakButton = screen.getByRole('button', { name: /Hold to Speak/i });
  expect(speakButton).toBeInTheDocument();
  expect(speakButton).not.toBeDisabled();
});

test('renders disabled "Recording..." button in InterviewRoom when not listening', () => {
  const mockSendAudio = jest.fn();
  render(
    <InterviewRoom
      transcript={[]}
      evaState="Speaking..."
      sendAudio={mockSendAudio}
    />
  );

  const speakButton = screen.getByRole('button', { name: /Hold to Speak/i });
  expect(speakButton).toBeInTheDocument();
  expect(speakButton).toBeDisabled();
});