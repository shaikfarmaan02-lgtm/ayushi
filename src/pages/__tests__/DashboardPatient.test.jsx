import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import DashboardPatient from '../DashboardPatient';

// Mock the supabase service
jest.mock('../../services/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    then: jest.fn().mockImplementation(callback => callback({
      data: [
        { id: 1, title: 'Test Appointment', doctor_name: 'Dr. Test', date: new Date().toISOString() }
      ],
      error: null
    }))
  }
}));

// Create a mock store
const mockStore = configureStore({
  reducer: {
    user: () => ({ 
      user: { id: 'test-user-id', role: 'patient', full_name: 'Test Patient' },
      loading: false,
      error: null
    })
  }
});

describe('DashboardPatient Component', () => {
  test('renders patient dashboard with appointments', async () => {
    render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <DashboardPatient />
        </BrowserRouter>
      </Provider>
    );
    
    // Check for dashboard title
    expect(screen.getByText(/patient dashboard/i)).toBeInTheDocument();
    
    // Check for appointment section
    expect(screen.getByText(/upcoming appointments/i)).toBeInTheDocument();
  });
});