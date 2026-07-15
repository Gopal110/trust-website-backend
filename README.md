# 🕉️ Shri Shivcharan Trust — Backend API

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" />
  <img src="https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render" />
</p>

> REST API backend for **Shri Shivcharan Charitable Trust** — built with Node.js, Express, MongoDB Atlas, and Cloudinary.

---

## 🌐 Live API

> **[https://trust-website-backend.onrender.com](https://trust-website-backend.onrender.com)** *(update after deployment)*

---

## ✨ Features

- 🔒 JWT Authentication & Authorization
- 👑 Admin dashboard API
- 🖼️ Gallery & Banner management
- 📅 Events & Blog CRUD
- 📬 Contact & Volunteer form submissions
- 💰 Donation records
- ☁️ Cloudinary image uploads
- 🔑 Encrypted data storage
- 🛡️ CORS-protected endpoints

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5 | Web framework |
| MongoDB | Atlas | Database |
| Mongoose | 9 | ODM |
| JWT | 9 | Authentication |
| Cloudinary | 2 | Image storage |
| Multer | 2 | File uploads |
| bcryptjs | 3 | Password hashing |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/trust-website-backend.git
cd trust-website-backend

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
# Edit .env with your real credentials
```

### Environment Variables

Create a `.env` file (see `.env.example` for all keys):

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
ENCRYPTION_KEY=your_32_char_key
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Development

```bash
npm run dev
# Server runs at http://localhost:5000
```

### Production

```bash
npm start
```

---

## 📁 Project Structure

```
server/
├── config/           # DB and service configuration
├── controllers/      # Route handler logic
├── middleware/       # Auth, upload, error handlers
├── models/           # Mongoose data models
├── routes/           # Express route definitions
├── utils/            # Helper utilities
├── uploads/          # Local media (gitignored, use Cloudinary)
└── server.js         # Application entry point
```

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/users/login` | Admin login |
| GET | `/api/banners` | Get all banners |
| GET/POST | `/api/gallery` | Gallery images |
| GET/POST | `/api/events` | Events |
| GET/POST | `/api/blogs` | Blog posts |
| POST | `/api/contacts` | Submit contact form |
| POST | `/api/volunteers` | Submit volunteer form |
| GET | `/api/donations` | Donation records |
| GET | `/api/trust-info` | Trust information |
| GET | `/api/dashboard` | Admin dashboard stats |

---

## 🔗 Related Repositories

- **Frontend**: [trust-website-frontend](https://github.com/YOUR_USERNAME/trust-website-frontend)

---

## 🚢 Deployment

This project is deployed on **Render**. Every push to the `main` branch triggers an automatic deployment.

**Required Environment Variables on Render:**
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `ENCRYPTION_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## 🌱 Seed Admin User

On first startup with a fresh database, the server **automatically creates a default admin**:
- **Username**: `admin`
- **Password**: `adminpassword123`

> ⚠️ Change these credentials immediately after first login!

---

## 📄 License

This project is private. All rights reserved — Shri Shivcharan Charitable Trust.
