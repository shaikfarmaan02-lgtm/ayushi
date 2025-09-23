import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AIChatbot from '../components/AIChatbot';

// Create a mock reducer
const mockReducer = {
  auth: (state = { user: { id: 'test-user-id' } }) => state
};

// Mock the supabase client
jest.mock('../services/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    then: jest.fn().mockImplementation(callback => callback({ data: [], error: null }))
  }
}));

// Mock speech recognition and synthesis
window.SpeechRecognition = jest.fn().mockImplementation(() => ({
  continuous: true,
  interimResults: true,
  lang: 'en-US',
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn()
}));

window.webkitSpeechRecognition = window.SpeechRecognition;

window.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn().mockReturnValue([])
};

window.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  voice: null,
  rate: 1,
  pitch: 1,
  volume: 1
}));

describe('AIChatbot Component', () => {
  const mockStore = configureStore({
    reducer: mockReducer
  });
  const initialState = {
    auth: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        role: 'patient'
      }
    }
  };
  
  let store;
  
  beforeEach(() => {
    store = mockStore(initialState);
  });
  
  test('renders welcome message on initial load', async () => {
    render(
      <Provider store={store}>
        <AIChatbot />
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Hello Test User/i)).toBeInTheDocument();
    });
  });
  
  test('allows user to send a message', async () => {
    render(
      <Provider store={store}>
        <AIChatbot />
      </Provider>
    );
    
    const inputField = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByLabelText(/send message/i);
    
    fireEvent.change(inputField, { target: { value: 'What are my upcoming appointments?' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText(/What are my upcoming appointments?/i)).toBeInTheDocument();
    });
  });
  
  test('toggles voice input when mic button is clicked', async () => {
    render(
      <Provider store={store}>
        <AIChatbot />
      </Provider>
    );
    
    const micButton = screen.getByLabelText(/toggle voice input/i);
    
    fireEvent.click(micButton);
    
    await waitFor(() => {
      expect(micButton).toHaveAttribute('aria-pressed', 'true');
    });
    
    fireEvent.click(micButton);
    
    await waitFor(() => {
      expect(micButton).toHaveAttribute('aria-pressed', 'false');
    });
  });
});