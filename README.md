# Ayushi Healthcare Platform

Ayushi is a comprehensive healthcare platform built with Vite, React, and Supabase, designed to connect patients with healthcare providers through a modern, responsive interface.

## Features

- **Role-based Access Control**: Separate dashboards for patients, doctors, pharmacists, and administrators
- **Appointment Management**: Book, manage, and track medical appointments
- **Prescription System**: Doctors can write prescriptions that pharmacists can fill
- **Video Consultations**: Real-time video calls between patients and doctors
- **Health Analytics**: Track and visualize health metrics
- **AI-powered Chatbot**: Get instant answers to health-related questions
- **Dark Mode Support**: Comfortable viewing experience in any lighting condition

## Tech Stack

- **Frontend**: React 18, Redux Toolkit, React Router v6
- **UI Libraries**: Material UI, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Authentication, Database, Storage)
- **Video**: WebRTC (via simple-peer), Socket.io
- **Testing**: Jest, React Testing Library
- **Build Tool**: Vite

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Setup

1. Clone the repository:
```bash
git clone <repo-url> ayushi
cd ayushi
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your Supabase credentials and other configuration:
```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. Start the development server:
```bash
npm run dev
```

## Supabase Setup

1. Create a new Supabase project
2. Set up the following tables (see SQL migrations in `/supabase/migrations`):
   - user_profiles
   - appointments
   - prescriptions
   - medical_records
   - pharmacy_inventory
   - chatbot_conversations
   - error_logs

3. Configure Storage buckets:
   - `medical-files`: For patient medical documents
   - `profile-images`: For user profile pictures

4. Set up Row Level Security (RLS) policies for each table

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Lint code
npm run lint
```

## Project Structure

- `/src`: Source code
  - `/assets`: Static assets
  - `/components`: Reusable React components
  - `/pages`: Main application views
  - `/schemas`: Database schema definitions
  - `/services`: API and external service integrations
  - `/store`: Redux state management
- `/public`: Static files
- `/supabase`: Supabase configuration and migrations

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.