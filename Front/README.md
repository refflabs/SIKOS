<div align="center">

# SIKOS

### Premium Room Boarding & Management Platform with Real-Time Communication

<img src="https://readme-typing-svg.herokuapp.com?font=Outfit&weight=600&size=20&pause=1000&color=B0BA99&center=true&vCenter=true&width=700&lines=Modern+Full-Stack+Boarding+System;React.js+%2B+Laravel+API+%2B+WebSockets;Optimized+for+Ultra-Low+Latency;Interactive+Tenant+and+Admin+Portals" alt="Typing SVG" />

<br>

[![Stars](https://img.shields.io/github/stars/refflabs/SIKOS?style=for-the-badge&color=412D15&logo=github)](https://github.com/refflabs/SIKOS/stargazers)
[![Forks](https://img.shields.io/github/forks/refflabs/SIKOS?style=for-the-badge&color=B0BA99&logo=git)](https://github.com/refflabs/SIKOS/network/members)
[![Issues](https://img.shields.io/github/issues/refflabs/SIKOS?style=for-the-badge&color=8A7056&logo=github)](https://github.com/refflabs/SIKOS/issues)
[![License](https://img.shields.io/github/license/refflabs/SIKOS?style=for-the-badge&color=2E1E0A)](LICENSE)

</div>

---

## 📖 Overview

**SIKOS** is a full-stack room boarding (*kost*) management platform designed to deliver seamless room bookings, manual payment verifications, and real-time communications. 

By combining a robust Laravel backend, a high-performance React frontend, and a Node.js WebSocket infrastructure, SIKOS offers tenant billing control, interactive admin dashboards, and instantaneous updates.

---

## 🛠 Technology Stack

### Frontend
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

### Backend & Database
[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Supabase](https://img.shields.io/badge/Supabase-1C1C1C?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com)

### Real-Time Infrastructure
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)

---

## ✨ Features

- **Auth & Session Persistence**: Secure token management and automatic login recovery.
- **Serverless Payment Verification**: Client-side Base64 receipt compression and direct database storage.
- **In-App Receipt Viewer**: Modern overlay modal for reviewing transactions safely.
- **Low-Latency Engine**: Optimized regional routing (Singapore `sin1`) and async websocket events.
- **Fail-Safe UI**: Integrated React Error Boundary protecting dashboard rendering.
- **Adaptive Theme**: Synchronized dark/light modes built on custom mocca and sage color palettes.

---

## 🏗 Architecture

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

## 📂 Project Structure

```text
SIKOS/
├── Backend/          # Laravel REST API
├── Front/            # React Frontend
├── realtime-server/  # Socket.io Server
├── package.json      # Workspace Dev Scripts
└── README.md         # Project Documentation
```

---

## 🚀 Getting Started

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

## ⚙️ Environment Variables

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

## 📈 Development Progress

```text
■■■■■■■■■■  100%  Backend API Development (Laravel)
■■■■■■■■■■  100%  Frontend Development (React)
■■■■■■■■■■  100%  Realtime Infrastructure (Socket.io)
■■■■■■■■■■  100%  Database Latency Optimization
■■■■■■■■■■  100%  Payment Receipt Integrations
■■■■■■■■■■  100%  Production Vercel Deployments
```

---

## 👥 Contributors

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/refflabs">
        <img src="https://github.com/refflabs.png" width="80px;" style="border-radius: 50%;" alt="Refflabs"/><br />
        <sub><b>Refflabs</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Luthfi0808">
        <img src="https://github.com/Luthfi0808.png" width="80px;" style="border-radius: 50%;" alt="Luthfi0808"/><br />
        <sub><b>Luthfi0808</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
