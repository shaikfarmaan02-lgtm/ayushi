import '@testing-library/jest-dom';

// Mock the import.meta.env variables
global.import = {
  meta: {
    env: {
      VITE_SUPABASE_URL: 'https://test-supabase-url.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-supabase-key',
      VITE_OPENAI_API_KEY: 'test-openai-key',
      VITE_APP_URL: 'http://localhost:5173',
      VITE_APP_NAME: 'Ayushi Healthcare'
    }
  }
};