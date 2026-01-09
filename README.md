# LMS Demo - EveryCRED Integration

A modern Learning Management System (LMS) with seamless credential issuance powered by EveryCRED.

## Project Structure

```
LMS-Demo/
├── frontend/          # Next.js frontend application
│   ├── app/          # Next.js app router pages
│   ├── components/   # React components
│   ├── lib/          # Utility functions
│   ├── public/       # Static assets
│   └── ...
├── backend/          # Backend API (FastAPI - place your boilerplate here)
└── ...
```

## Frontend Setup

The frontend is a Next.js application located in the `frontend/` directory.

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
cd frontend
pnpm install
```

### Development

```bash
cd frontend
pnpm dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
cd frontend
pnpm build
pnpm start
```

## Backend Setup

Place your backend boilerplate code in the `backend/` folder. The backend should handle EveryCRED API integration and provide REST endpoints for the frontend.

## Features

- Dashboard with student statistics
- Student management
- Course management
- Credential issuance via EveryCRED
- Modern, responsive UI with glassmorphism design
