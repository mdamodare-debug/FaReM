# FFMA - Setup Instructions

This document provides step-by-step instructions to initialize the FFMA project across Backend, Web Frontend, and Mobile applications.

## Prerequisites
- PostgreSQL 14+ with PostGIS extension (or Supabase project)
- Redis Server (for Celery)
- Python 3.10+
- Node.js 18+

## 1. Environment Variables

### Backend (`backend/.env`)
Create an `.env` file in the `backend/` directory with the following variables:
```env
DEBUG=True
SECRET_KEY=your-secure-django-secret-key
DATABASE_URL=postgis://postgres:password@localhost:5432/postgres
REDIS_URL=redis://localhost:6379/0
MSG91_AUTH_KEY=your-msg91-key
INTERAKT_API_KEY=your-interakt-key
RESEND_API_KEY=your-resend-key
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

## 2. Database Initialization (Supabase / Postgres)

1. Connect to your database.
2. Run the SQL script located at `supabase/schema_and_rls.sql` to enable PostGIS and configure initial roles.

## 3. Backend Setup (Django)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run Migrations:
   ```bash
   python manage.py makemigrations
   python manage.py makemigrations core
   python manage.py migrate
   ```
5. Create Superuser:
   ```bash
   python manage.py createsuperuser
   # (Assign the user to Role.ADMIN via DJango admin shell if required)
   ```
6. Start the development server:
   ```bash
   python manage.py runserver
   ```
7. In a new terminal, start Celery:
   ```bash
   cd backend
   celery -A ffma worker -l info
   # Start beat for scheduled tasks
   celery -A ffma beat -l info
   ```

## 4. Admin Web Interface (React)

1. Open a terminal and navigate to the web directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   # Ensure tailwindcss, react-router-dom are installed if missing
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 5. Field Staff Mobile App (React Native/Expo)

1. Open a terminal and navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   # Ensure @react-navigation/native, @react-navigation/stack are installed
   ```
3. Start the Expo server:
   ```bash
   npx expo start
   ```

## Next Steps
- Open the Web Interface and configure standard `CropMaster` entries.
- Use the web interface to Bulk Import your first set of `Farmers`.
- Log into the Mobile application as Field Staff to view your assigned Farmers and start logging visits.
