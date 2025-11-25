import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from '../Login';
import '@testing-library/jest-dom';

const MockLogin = () => (
  <Router>
    <Login />
  </Router>
);

describe('Login Component', () => {
  it('renders login form', () => {
    render(<MockLogin />);
    
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });

  it('validates form inputs', () => {
    render(<MockLogin />);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    const errorMessages = screen.getAllByText(/required/i);
    expect(errorMessages.length).toBe(2);
  });
});
