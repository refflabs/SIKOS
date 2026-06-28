<div align="center">

# 🚀 SIKOS

### Modern Room Boarding & Management Platform with Real-Time Communication

<img src="https://readme-typing-svg.herokuapp.com?font=JetBrains+Mono&weight=600&size=24&pause=1000&color=B0BA99&center=true&vCenter=true&random=false&width=700&lines=Full-Stack+Boarding+System;React+Vite+Frontend;Laravel+REST+API;Realtime+Socket.io+Infrastructure" />

<br>

![GitHub Repo stars](https://img.shields.io/github/stars/refflabs/SIKOS?style=for-the-badge&color=412D15)
![GitHub forks](https://img.shields.io/github/forks/refflabs/SIKOS?style=for-the-badge&color=B0BA99)
![GitHub issues](https://img.shields.io/github/issues/refflabs/SIKOS?style=for-the-badge&color=8A7056)
![GitHub last commit](https://img.shields.io/github/last-commit/refflabs/SIKOS?style=for-the-badge&color=2E1E0A)

<br>

![Visitors](https://komarev.com/ghpvc/?username=refflabs&repo=SIKOS&style=for-the-badge&color=B0BA99)

</div>

---

# 📖 Overview

**SIKOS** is a premium, full-stack room boarding (*kost*) management platform designed to deliver seamless room bookings, manual payment verifications, and real-time communications. 

By combining a robust Laravel backend, a high-performance React frontend, and a Node.js WebSocket infrastructure, SIKOS offers tenant billing control, interactive admin dashboards, and instantaneous updates.

---

# ✨ Key Features

* 🔐 **Secure Auth & Token Persistence** — Persistent login state with automatic session restoration and role-based route guards.
* 📸 **Manual Payment Verification** — Client-side Base64 receipt compression and serverless-friendly storage.
* 👁️ **In-App Receipt Viewer** — Seamless modal popup for review, bypassing browser data URL security blocks.
* ⚡ **Low-Latency Real-Time Engine** — Singapore-region database routing combined with asynchronous non-blocking websocket broadcasts.
* 🛡️ **Resilient Frontend Architecture** — Global React Error Boundaries to prevent runtime layout failures.
* 🎨 **Adaptive Sage/Mocca Theme** — Adaptive dark and light modes styled with custom premium color schemes and interactive micro-animations.

---

# 🏗 Architecture

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

# 🛠 Technology Stack

### Frontend
* **Core:** React.js (Vite), JavaScript ES6+
* **State & Query:** React Query (TanStack) & Context API
* **Styling:** CSS variables + TailwindCSS utility tokens
* **Icons:** Lucide React

### Backend
* **Core:** PHP Laravel (REST API)
* **Database:** PostgreSQL (Supabase Serverless)
* **ORM:** Eloquent ORM with Eager Loading optimizations

### Realtime Server
* **Core:** Node.js, Express.js
* **Engine:** Socket.io (Deployed on Hugging Face Spaces)

---

# 📂 Project Structure

```text
SIKOS/
│
├── Backend/          # Laravel REST API project
│
├── Front/            # React + Vite Frontend application
│
├── realtime-server/  # Node.js Socket.io server
│
├── package.json      # Root package runner script helper
└── README.md         # Documentation
```

---

# 🚀 Quick Start

## Clone & Setup Directory

```bash
git clone https://github.com/refflabs/SIKOS.git
cd SIKOS
```

## Running Services Locally

### 1. Backend Setup (Laravel)
Make sure you have PHP 8.1+ and Composer installed.
```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### 2. Frontend Setup (React)
```bash
cd Front
npm install
npm run dev
```

### 3. Realtime Socket Server Setup (Node)
```bash
cd realtime-server
npm install
npm run dev
```

---

# ⚙️ Environment Configurations

Create a `.env` file in the **Backend/** directory:
```env
APP_ENV=local
APP_KEY=base64:xxx...
DB_CONNECTION=pgsql
DB_HOST=your-supabase-url.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-password
REALTIME_SERVER_URL=http://localhost:6001
REALTIME_SOCKET_SECRET=your-socket-shared-secret
```

Create a `.env` file in the **Front/** directory:
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_SOCKET_URL=http://127.0.0.1:6001
VITE_APP_URL=http://127.0.0.1:5173
```

---

# 📈 Development Progress

```text
Backend API (Laravel)    ██████████ 100%
Frontend App (React)     ██████████ 100%
Realtime Socket Engine   ██████████ 100%
Database Routing Fixes   ██████████ 100%
Payment Integrations     ██████████ 100%
Vercel Production Deploy ██████████ 100%
```

---

# 🗺 Roadmap

* [x] Optimized Database Latency (Singapore Region Routing)
* [x] Stable User Authentication & Token Refresh Redirections
* [x] Base64 Manual Payment Receipt Uploads (Serverless Safe)
* [x] In-App Receipt Modal Viewer (Security Compliant)
* [x] Non-Blocking Asynchronous Realtime Broadcasting
* [x] Premium Theme Contrast Syncing & Button Micro-animations
* [x] Global React Error Boundary Protection
* [ ] Push Notification System
* [ ] Automated Room Invoice PDF Generator

---

# 📊 Repository Analytics

<p align="center">
  <img height="170" src="https://github-readme-stats.vercel.app/api?username=refflabs&show_icons=true&theme=default" />
  <img height="170" src="https://github-readme-stats.vercel.app/api/top-langs/?username=refflabs&layout=compact&theme=default" />
</p>

---

# 👥 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/refflabs">
        <img src="https://github.com/refflabs.png" width="100px;" alt="Refflabs"/>
        <br />
        <b>Refflabs</b>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Luthfi0808">
        <img src="https://github.com/Luthfi0808.png" width="100px;" alt="Luthfi0808"/>
        <br />
        <b>Luthfi0808</b>
      </a>
    </td>
  </tr>
</table>

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome!
1. Fork the repository
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">

### Built with ❤️ for Better Boarding Experience

#### SIKOS © 2026

</div>
