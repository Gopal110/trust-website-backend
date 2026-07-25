const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const dotenv = require('dotenv');
dotenv.config(); // MUST be called first so env vars are available to all modules
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'mynameisgopal';
}

const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const upload = require('./middleware/upload'); // For media handling

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

// ─── CORS ────────────────────────────────────────────────────────────────────
// Allow: Vercel frontend domain(s) + localhost dev
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  // Production Vercel URLs (set FRONTEND_URL env var on Render to override)
  process.env.FRONTEND_URL,
  // Also support comma-separated list in ALLOWED_ORIGINS env var
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : []),
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      // Allow any *.vercel.app subdomain (preview deployments)
      /\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Pre-flight for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Express 5 compatible mongoSanitize middleware (avoids assigning to getter-only req.query)
app.use((req, res, next) => {
  ['body', 'params', 'headers', 'query'].forEach((key) => {
    if (req[key]) {
      mongoSanitize.sanitize(req[key]);
    }
  });
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded media

// Database Connection
async function connectDB() {
  let dbUri = process.env.MONGODB_URI;

  const startMemoryServer = async () => {
    console.log('ℹ️ Attempting In-Memory MongoDB Server fallback...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        binary: { version: '5.0.26' }
      });
      const memUri = mongoServer.getUri();
      console.log(`✨ In-Memory MongoDB Server started at: ${memUri}`);
      await mongoose.connect(memUri);
      console.log('✅ MongoDB connected successfully (In-Memory)');
    } catch (memErr) {
      console.error('❌ In-Memory MongoDB unavailable:', memErr.message);
    }
  };

  if (!dbUri || dbUri.includes('127.0.0.1') || dbUri.includes('localhost') || dbUri.includes('xxxx')) {
    await startMemoryServer();
  } else {
    try {
      console.log('🔄 Connecting to MongoDB Atlas...');
      await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ MongoDB connected successfully to Remote DB');
    } catch (err) {
      console.error('❌ Remote MongoDB connection error:', err.message);
      console.log('⚠️ Falling back to local In-Memory MongoDB Server so the app remains functional...');
      await startMemoryServer();
    }
  }

  try {
    if (mongoose.connection.readyState === 1) {
      // Auto-create a default admin user if none exists
      const User = require('./models/User');
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 0) {
        const defaultAdmin = new User({
          username: 'admin',
          password: 'adminpassword123',
          role: 'admin'
        });
        await defaultAdmin.save();
        console.log('🎉 Default Admin User Auto-Created!');
        console.log('   Username: admin');
        console.log('   Password: adminpassword123');
      } else {
        console.log('👤 Admin user already exists.');
      }
    }
  } catch (err) {
    console.error('❌ Error initializing default admin user:', err.message);
  }
}

connectDB();

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

app.get('/', (req, res) => {
  res.send('Shri Shivcharan Trust API is active.');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong on the server',
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;