# SkyGuide — Airport Companion

An intelligent airport navigation and accessibility platform that helps travelers find their way through airports using real-time indoor positioning, biometric identity verification, and push notifications for flight updates.

---

## Features

- **Indoor Navigation** — Turn-by-turn directions through airport floor plans using an A* pathfinding engine. Real-time position tracking via WebSocket with dead reckoning from device IMU sensors (accelerometer + gyroscope).
- **Biometric Onboarding** — Two-step enrollment: facial recognition (on-device via face-api.js) followed by travel document upload (passport or national ID) with mock approval flow.
- **Digital Identity & Tickets** — Per-session identity verification gates access to the ticket section. Add and view flight tickets; identity tokens are generated per verified session.
- **Accessibility** — Haptic feedback (configurable intensity), text-to-speech navigation cues, voice control, and per-user accessibility profiles.
- **Flight Tracking** — Simulated real-time flight status updates with subscription-based push notifications (Web Push / VAPID).
- **Session Replay** — Record navigation sessions and replay them for testing or analytics.

---

## Screenshots

### Authentication

<div style="flex-direction:row;">
  <img src="assets/login.jpeg" height="600" width="300">
  <img src="assets/welcome.jpeg" height="600" width="300">
</div>

### Onboarding

> Two-step flow: biometric enrollment followed by document validation (national ID or passport).

<p style="flex-direction:row;">
  <img src="assets/biometric_id.jpeg" height="600" width="300" />
  <img src="assets/travel_doc.jpeg" height="600" width="300" />
  <img src="assets/doc_valid.jpeg" height="600" width="300" />
</p>

> Ticket access is gated by per-session identity verification.

<p style="flex-direction:row;">
  <img src="assets/id_valid.jpeg" height="600" width="300" />
  <img src="assets/digital_id.jpeg" height="600" width="300" />
  <img src="assets/scan_ticket.jpeg" height="600" width="300" />
  <img src="assets/identity.jpeg" height="600" width="300" />
</p>

### Profile

> Manage account settings and accessibility preferences — haptic intensity, voice navigation, and more.

<p style="flex-direction:row;">
  <img src="assets/profile.jpeg" height="660" width="300" />
</p>

### Map & Navigation

> Searchable indoor map with real-time turn-by-turn navigation, next-step instructions, and ETA.

<p style="flex-direction:row;">
  <img src="assets/map.jpeg" height="660" width="300" />
  <img src="assets/map2.jpeg" height="660" width="300" />
</p>

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python), asyncpg, SQLAlchemy 2.0 |
| Database | PostgreSQL 16 (Docker) |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS 4 |
| Maps | Leaflet / react-leaflet |
| Biometrics | face-api.js, react-webcam |
| Real-time | WebSocket (FastAPI), Zustand |
| Push | Web Push API (VAPID / pywebpush) |
| Auth | JWT (python-jose), bcrypt |
| Reverse proxy | Nginx |

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose

---

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd hack-tech-1
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the required values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string — `postgresql+asyncpg://postgres:postgres@localhost:5432/airport_companion` |
| `SECRET_KEY` | At least 32 characters, used for JWT signing |
| `ENCRYPTION_KEY` | 64-character hex string for AES-256-GCM encryption |
| `JWT_EXPIRE_HOURS` | Token lifetime in hours (default: `12`) |
| `VAPID_PUBLIC_KEY` | Web Push public key (generate with pywebpush) |
| `VAPID_PRIVATE_KEY` | Web Push private key |
| `VAPID_CONTACT_EMAIL` | Contact email for push notification provider |
| `CORS_ORIGINS` | Allowed CORS origins (default: `localhost:5173,localhost:443`) |

### 3. Start the database and seed demo data

```bash
./seed.sh
```

This starts the PostgreSQL Docker container, applies `schema_v3.sql`, and loads demo data.

Demo credentials: **`demo` / `hackathon2024`**

### 4. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
cd ..
```

### 5. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 6. Run in development mode

```bash
./dev.sh
```

This starts all three services simultaneously:

| Service | URL |
|---|---|
| FastAPI backend | http://localhost:8000 |
| Swagger API docs | http://localhost:8000/docs |
| Vite dev server | https://localhost:5173 |

The Vite dev server proxies `/api` and `/ws` requests to the backend, so no additional CORS configuration is needed during development.

> **Note:** The frontend dev server uses a self-signed certificate for HTTPS. Accept the browser warning on first load — HTTPS is required for device motion sensors and Web Push.

---

## Production Deployment

```bash
./deploy.sh
```

Builds the frontend, copies static files to `/var/www/airport-companion`, reloads Nginx, and restarts the backend on ports `8000` and `8080`.

Nginx configuration files are in `nginx/`:
- `nginx.conf` — HTTPS with SSL termination
- `nginx-http-only.conf` — HTTP-only (for environments without certificates)

---

## Project Structure

```
hack-tech-1/
├── backend/
│   ├── main.py              # FastAPI app, middleware, route registration
│   ├── auth.py              # JWT and password utilities
│   ├── database.py          # Async SQLAlchemy engine and session factory
│   ├── config.py            # Environment settings (Pydantic BaseSettings)
│   ├── seed.py              # Database seeding script
│   ├── models/              # SQLAlchemy ORM models
│   ├── routers/             # API route handlers
│   ├── schemas/             # Pydantic request/response schemas
│   └── services/            # Business logic (routing, identity, push, etc.)
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios HTTP client
│   │   ├── components/      # UI components (Map, Navigation, Identity, AR, …)
│   │   ├── hooks/           # Custom React hooks (IMU, face-api, WebSocket, …)
│   │   └── pages/           # Route-level page components
│   └── vite.config.js       # Dev proxy configuration
├── nginx/                   # Reverse proxy configs
├── schema_v3.sql            # Full PostgreSQL schema
├── docker-compose.yml       # PostgreSQL container
├── dev.sh                   # Development startup script
├── deploy.sh                # Production deployment script
└── seed.sh                  # Database initialization and seeding
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new user account |
| POST | `/api/auth/login` | Authenticate and receive a JWT |
| GET | `/api/navigation/route` | Calculate an A* path between two points |
| WS | `/ws/positions/{session_id}` | Stream real-time position updates |
| POST | `/api/identity/face/enroll` | Enroll facial biometrics |
| POST | `/api/identity/face/verify` | Verify identity via face recognition |
| POST | `/api/identity/document/upload` | Upload a travel document |
| GET/PUT | `/api/accessibility/profile` | Read or update accessibility preferences |
| GET | `/api/flights` | List subscribed flights |
| POST | `/api/push/subscribe` | Register device for push notifications |
| GET | `/api/push/public-key` | Retrieve VAPID public key |
| GET | `/api/replay` | List recorded navigation sessions |

Full interactive documentation is available at `/docs` (Swagger UI) when the backend is running.
