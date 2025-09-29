import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the welcome screen on initial load', () => {
  render(<App />);
  const welcomeHeader = screen.getByText(/Welcome to your AI Interview/i);
  expect(welcomeHeader).toBeInTheDocument();
});