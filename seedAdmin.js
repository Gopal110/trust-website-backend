const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Admin user credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_ROLE = 'admin';

async function seedAdmin() {
  try {
    let dbUri = process.env.MONGODB_URI;

    // Use in-memory MongoDB if database URI is local or invalid/missing
    if (!dbUri || dbUri.includes('127.0.0.1') || dbUri.includes('localhost') || dbUri.includes('xxxx')) {
      console.log('ℹ️ No valid MongoDB URI found. Attempting In-Memory MongoDB Server...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create({
          binary: { version: '5.0.26' }
        });
        dbUri = mongoServer.getUri();
        console.log(`✨ In-Memory MongoDB Server started`);
      } catch (memErr) {
        console.error('❌ mongodb-memory-server not installed. Run: npm install mongodb-memory-server --save-dev');
        console.error('   Or set a valid MONGODB_URI in your .env file.');
        process.exit(1);
      }
    }

    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(dbUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: ADMIN_USERNAME });
    if (existingAdmin) {
      console.log(`⚠️  Admin user "${ADMIN_USERNAME}" already exists!`);
      console.log('❌ Skipping user creation.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      role: ADMIN_ROLE
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Admin Credentials:`);
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     ${ADMIN_ROLE}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  IMPORTANT: Change the password after first login!');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed script
seedAdmin();
