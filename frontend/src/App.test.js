import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the welcome screen on initial load', () => {
  render(<App />);
  const welcomeHeader = screen.getByText(/AI-powered interview for the Senior Python Developer role/i);
  expect(welcomeHeader).toBeInTheDocument();
});