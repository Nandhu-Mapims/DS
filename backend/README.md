# Discharge Summary Workflow — Backend

Node.js + Express + MongoDB backend with JWT auth, role-based access, and Premium Discharge Templates.

## Setup

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set at least:
   - `MONGO_URI` — MongoDB connection string (e.g. `mongodb://localhost:27017/discharge-summary-db`)
   - `JWT_SECRET` — Secret for signing JWTs
   - `PORT` — Server port (default 4000)

3. **MongoDB**
   Ensure MongoDB is running locally or use a cloud URI.

4. **Seed**
   ```bash
   npm run seed
   ```
   Creates 3 default templates and users:
   - `doctor@hospital.com` / `doctor123` (DOCTOR)
   - `chief@hospital.com` / `chief123` (CHIEF)
   - `admin@hospital.com` / `admin123` (ADMIN)

## Run locally

- **Development (nodemon):**
  ```bash
  npm run dev
  ```
- **Production:**
  ```bash
  npm start
  ```

Server listens on `http://localhost:4000` (or your `PORT`).

## API base and frontend

- Base URL: `http://localhost:4000/api`
- Set frontend env: `VITE_API_URL=http://localhost:4000/api`
- Discharge routes use **singular** path: `/api/discharge`, `/api/discharge/:id`, `/api/discharge/pending`, `/api/discharge/verified`, `/api/discharge/:id/ai-enhance`, `/api/discharge/:id/chief-edit`, `/api/discharge/:id/approve`, `/api/discharge/:id/reject`, `/api/discharge/:id/pdf`, `/api/discharge/:id/whatsapp`.

## Endpoints summary

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | - | Login (email, password) |
| POST | /api/auth/register | - | Register (email, password, name?, role?) |
| GET | /api/templates | * | List active templates |
| GET | /api/templates/:id | * | Template detail |
| POST | /api/templates | ADMIN | Create template |
| PUT | /api/templates/:id | ADMIN | Update template |
| PATCH | /api/templates/:id/toggle | ADMIN | Activate/deactivate |
| GET | /api/discharge | DOCTOR/CHIEF/ADMIN | List (query: status, search, fromDate, toDate, department) |
| GET | /api/discharge/pending | CHIEF/ADMIN | Chief queue list |
| GET | /api/discharge/verified | CHIEF/ADMIN | Verified (approved) list |
| POST | /api/discharge | DOCTOR/ADMIN | Create draft (uhid, ipid, mobile, templateId?) |
| GET | /api/discharge/:id | * | Get one |
| PUT / PATCH | /api/discharge/:id | DOCTOR/ADMIN | Update draft |
| POST | /api/discharge/:id/ai-enhance | DOCTOR/ADMIN | AI enhance (uses template) |
| POST | /api/discharge/:id/submit | DOCTOR/ADMIN | Submit for approval |
| PUT | /api/discharge/:id/chief-edit | CHIEF/ADMIN | Save chief edits |
| POST | /api/discharge/:id/approve | CHIEF/ADMIN | Approve (sets finalVerifiedText, triggers WhatsApp stub) |
| POST | /api/discharge/:id/reject | CHIEF/ADMIN | Reject with remarks |
| GET | /api/discharge/:id/pdf | * | Download as HTML (placeholder for PDF) |
| POST | /api/discharge/:id/whatsapp | CHIEF/ADMIN | Resend WhatsApp (stub) |

All discharge and template routes (except auth) require `Authorization: Bearer <token>`.

## Response shape

- Success: `{ success: true, data, message? }`
- Error: `{ success: false, message, error? }`

## Status transitions

- DRAFT → AI_ENHANCED, DRAFT
- AI_ENHANCED → PENDING_APPROVAL, DRAFT
- PENDING_APPROVAL → CHIEF_EDITED, APPROVED, REJECTED
- CHIEF_EDITED → APPROVED, REJECTED
- REJECTED → DRAFT
- APPROVED — terminal

Invalid transitions return 400.
