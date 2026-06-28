# SIKOS

A premium room boarding (kost) management platform featuring manual payment verification, low-latency API routing, and real-time tenant communication.

[![Stars](https://img.shields.io/github/stars/refflabs/SIKOS?style=flat-square&color=8A7056)](https://github.com/refflabs/SIKOS/stargazers)
[![Forks](https://img.shields.io/github/forks/refflabs/SIKOS?style=flat-square&color=B0BA99)](https://github.com/refflabs/SIKOS/network/members)
[![Issues](https://img.shields.io/github/issues/refflabs/SIKOS?style=flat-square&color=412D15)](https://github.com/refflabs/SIKOS/issues)
[![License](https://img.shields.io/github/license/refflabs/SIKOS?style=flat-square&color=2E1E0A)](LICENSE)

---

## Features

- **Auth & Session Persistence**: Secure token management and automatic login recovery.
- **Serverless Payment Verification**: Client-side Base64 receipt compression and direct database storage.
- **In-App Receipt Viewer**: Modern overlay modal for reviewing transactions safely.
- **Low-Latency Engine**: Optimized regional routing (Singapore `sin1`) and async websocket events.
- **Fail-Safe UI**: Integrated React Error Boundary protecting dashboard rendering.
- **Adaptive Theme**: Synchronized dark/light modes built on custom mocca and sage color palettes.

---

## Architecture

```text
               ┌────────────────────────┐
               │    React JS (Vite)     │◀┐
               │        Frontend        │ │
               └───────────┬────────────┘ │
                           │              │
                   JSON    │              │ Socket.io
                 REST API  │              │ Event Streams
                           ▼              │
               ┌────────────────────────┐ │
               │   Laravel PHP (API)    │ │
               │     Backend Host       │ │
               └───────────┬────────────┘ │
                           │              │
                     Async │              │
                   Webhook │              │
                           ▼              │
               ┌────────────────────────┐ │
               │   Node.js Socket.io    │─┘
               │    Realtime Server     │
               └────────────────────────┘
```

---

## Tech Stack

### Frontend
- React.js (Vite)
- React Query (TanStack) & Context API
- TailwindCSS & Lucide Icons

### Backend
- PHP Laravel (REST API)
- PostgreSQL (Supabase Serverless)
- Eloquent ORM

### Realtime Infrastructure
- Node.js & Express.js
- Socket.io (Hosted on Hugging Face Spaces)

---

## Project Structure

```text
SIKOS/
├── Backend/          # Laravel REST API
├── Front/            # React Frontend
├── realtime-server/  # Socket.io Server
├── package.json      # Workspace Dev Scripts
└── README.md         # Project Documentation
```

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/refflabs/SIKOS.git
cd SIKOS
```

### 2. Configure and Run Backend
Make sure you have PHP 8.1+ and Composer installed.
```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### 3. Configure and Run Frontend
```bash
cd ../Front
npm install
npm run dev
```

### 4. Run Realtime Socket Server
```bash
cd ../realtime-server
npm install
npm run dev
```

---

## Environment Variables

### Backend (.env)
```env
DB_CONNECTION=pgsql
DB_HOST=your-supabase-url.supabase.co
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-password
REALTIME_SERVER_URL=http://localhost:6001
REALTIME_SOCKET_SECRET=your-socket-shared-secret
```

### Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_SOCKET_URL=http://127.0.0.1:6001
VITE_APP_URL=http://127.0.0.1:5173
```

---

## Contributors

- **Refflabs** - [GitHub Profile](https://github.com/refflabs)
- **Luthfi0808** - [GitHub Profile](https://github.com/Luthfi0808)

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
