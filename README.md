# UHS - Universal Health System

UHS is a full-stack healthcare management system built for a university final year project. It includes patient, doctor, and admin portals with real persistence through MySQL, role-based authentication, appointment booking, doctor approvals, prescriptions, lab reports, AI-style prediction history, and a free OpenStreetMap hospital finder.

## Features

- Patient, doctor, and admin authentication with JWT and refresh tokens
- Doctor registration with pending approval workflow
- Admin dashboard for patients, doctors, appointments, and doctor approvals
- Patient dashboard for appointments, medical records, prescriptions, lab reports, AI predictions, diet plans, and workout plans
- Doctor dashboard for appointment actions, consultation notes, prescriptions, lab tests, diet/workout recommendations, and report uploads
- Appointment booking with double-booking protection
- File uploads for avatars, reports, prescriptions, and lab documents
- Socket.IO notifications foundation
- Prisma ORM with MySQL
- OpenStreetMap + React Leaflet hospital map
- Browser geolocation and Overpass API nearby hospital search within 10 km
- Free hospital search through OpenStreetMap/Nominatim, no paid map API key required

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- Framer Motion
- React Leaflet / Leaflet
- Node.js
- Express
- Prisma ORM
- MySQL / MariaDB through XAMPP
- JWT
- bcrypt
- Multer
- Nodemailer
- Socket.IO

## Project Structure

```text
UHS/
  client/      React frontend
  server/      Express API
  shared/      Shared TypeScript contracts
  prisma/      Prisma schema
  scripts/     Local setup automation
  uploads/     Runtime uploaded files, ignored except .gitkeep
```

## Prerequisites

- Node.js 20 or newer
- XAMPP with MySQL/MariaDB running on port `3306`
- npm

## Setup

Install dependencies:

```bash
npm install
```

Start XAMPP MySQL, then run:

```bash
npm run dev
```

The `predev` setup script automatically:

- creates local `.env` files if missing
- creates the `uhs` MySQL database if it does not exist
- generates Prisma Client
- applies the Prisma schema
- seeds the required admin account from local environment values

Frontend:

```text
http://localhost:5173
```

Backend health check:

```text
http://localhost:4000/api/health
```

## Environment

Local environment files are intentionally ignored by Git:

- `.env`
- `server/.env`

Use the example files as templates:

- `.env.example`
- `server/.env.example`

Do not commit real database passwords, JWT secrets, SMTP credentials, or admin credentials.

## Useful Commands

```bash
npm run dev
npm run build
npm run setup
npm run db:generate
npm run db:push
npm run db:seed
```

## Authentication Flow

- Patients can register and login immediately.
- Doctors register with credentials and stay pending.
- Admin reviews pending doctors and approves or rejects them.
- Approved doctors appear in Find Doctors and Book Appointment.
- Pending/rejected doctors cannot access the doctor portal.

## Maps

The Nearby Hospitals page uses only free services:

- OpenStreetMap map tiles
- React Leaflet
- Browser Geolocation API
- Overpass API for nearby hospital/clinic data
- Nominatim for searching hospitals by name

No Google Maps API key is required.

## Security Notes

- Passwords are hashed with bcrypt.
- Refresh tokens are hashed before storage.
- Access tokens are short-lived.
- Uploaded files are allow-listed and size-limited.
- Runtime uploads and environment files are ignored by Git.
- Replace local development secrets before production deployment.
