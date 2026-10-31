const fs = require('fs');
const path = require('path');
const os = require('os');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const dotenv = require('dotenv');
dotenv.config(); // MUST be called first so env vars are available to all modules
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'mynameisgopal';
}



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Ensure local uploads directory exists (guarded for read-only serverless filesystems)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (e) {
    // In serverless environments (e.g. Vercel), root filesystem is read-only
  }
}

// Route Imports
const bannerRoutes = require('./routes/bannerRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const eventRoutes = require('./routes/eventRoutes');
const blogRoutes = require('./routes/blogRoutes');
const contactRoutes = require('./routes/contactRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const trustInfoRoutes = require('./routes/trustInfoRoutes');
const donationRoutes = require('./routes/donationRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Optimization Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());

// Verified Allowed Origins for CORS
const allowedOrigins = [
  'https://shri-shiv-charan-dharmarth-manav-seva-trust.com',
  'https://www.shri-shiv-charan-dharmarth-manav-seva-trust.com',
  'https://client-dsvvv.vercel.app',
  'https://trust-website-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];

if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach(url => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Server-to-server, curl, Postman, or same-origin
  if (allowedOrigins.includes(origin)) return true;
  // Allow all Vercel deployment and preview URLs
  if (/^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin)) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400 // Cache preflight for 24 hours
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Express 5 compatible mongo sanitization (safely sanitizes body and params without breaking query getter)
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    mongoSanitize.sanitize(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    mongoSanitize.sanitize(req.params);
  }
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded media
app.use('/uploads', express.static(os.tmpdir())); // Fallback for serverless ephemeral files

// Database Connection Manager (Compatible with Vercel Serverless & standalone Node)
let cachedConnection = null;
let connectingPromise = null;

async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    throw new Error('MONGODB_URI environment variable is not defined.');
  }

  if (mongoose.connection.readyState === 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  if (connectingPromise) {
    return connectingPromise;
  }

  console.log('🔄 Connecting to MongoDB Atlas...');
  connectingPromise = mongoose.connect(dbUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
    bufferCommands: false
  }).then(conn => {
    cachedConnection = conn;
    connectingPromise = null;
    console.log('✅ MongoDB connected successfully to database:', mongoose.connection.name || 'trust_db');
    // Ensure default admin account is provisioned securely without altering existing collections
    ensureDefaultAdmin().catch(err => console.error('Admin auto-check notice:', err.message));
    return cachedConnection;
  }).catch(err => {
    connectingPromise = null;
    console.error('❌ MongoDB Atlas connection error:', err.message);
    throw err;
  });

  return connectingPromise;
}

// Ensure required admin GOPAL_DIXIT exists in the production database
async function ensureDefaultAdmin() {
  try {
    const User = require('./models/User');
    const targetUsername = 'GOPAL_DIXIT';
    const targetPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Dixit766';
    const targetPhone = '7668473135';

    const existing = await User.findOne({
      username: { $regex: new RegExp(`^${targetUsername}$`, 'i') }
    });

    if (!existing) {
      console.log(`👤 Provisioning admin account "${targetUsername}" in database ${mongoose.connection.name}...`);
      const newAdmin = new User({
        username: targetUsername,
        password: targetPassword,
        role: 'admin',
        phone: targetPhone
      });
      await newAdmin.save();
      console.log(`✅ Admin account "${targetUsername}" successfully provisioned.`);
    }
  } catch (err) {
    console.error('Notice on ensureDefaultAdmin:', err.message);
  }
}

// Initial connection attempt on cold start
connectDB().catch(err => {
  console.error('Initial MongoDB connection deferred:', err.message);
});

// Middleware to verify database connection before processing API routes
app.use(async (req, res, next) => {
  // Allow root health check and OPTIONS preflight requests without DB connection
  if (req.path === '/' || req.method === 'OPTIONS') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection unavailable for request:', req.path);
    return res.status(503).json({
      error: 'Database Unavailable',
      message: 'Database service is currently unavailable. Please verify Atlas connection string and network access.'
    });
  }
});

// API Routes
app.use('/api/banners', bannerRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/trust-info', trustInfoRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// Health Check Endpoint
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'active',
    service: 'Shri Shivcharan Trust API',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: `Route ${req.originalUrl} not found` });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({
      error: 'CORS Forbidden',
      message: err.message
    });
  }

  console.error('Unhandled server error:', err.message);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : err.message
  });
});

// Start server on Render or local environment
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;