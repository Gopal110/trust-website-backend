const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('./models/User');

const TARGET_USERNAME = process.env.ADMIN_SEED_USERNAME || 'GOPAL_DIXIT';
const TARGET_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'Dixit766';
const TARGET_ROLE = 'admin';
const TARGET_PHONE = '7668473135';

async function seedAdmin() {
  try {
    const dbUri = process.env.MONGODB_URI;
    if (!dbUri) {
      console.error('❌ MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(dbUri, { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 });
    console.log(`✅ Connected to MongoDB database: ${mongoose.connection.name}`);

    // Check if target user already exists
    const existingUser = await User.findOne({
      username: { $regex: new RegExp(`^${TARGET_USERNAME}$`, 'i') }
    });

    if (existingUser) {
      console.log(`⚠️ User "${existingUser.username}" already exists.`);
      console.log(`🔄 Updating password and phone for existing user...`);
      existingUser.username = TARGET_USERNAME;
      existingUser.password = TARGET_PASSWORD; // User.pre('save') handles bcrypt hashing
      existingUser.role = TARGET_ROLE;
      existingUser.phone = TARGET_PHONE;
      await existingUser.save();
      console.log(`✅ Admin user "${TARGET_USERNAME}" credentials updated successfully!`);
    } else {
      console.log(`👤 Creating new admin account for "${TARGET_USERNAME}"...`);
      const newAdmin = new User({
        username: TARGET_USERNAME,
        password: TARGET_PASSWORD,
        role: TARGET_ROLE,
        phone: TARGET_PHONE
      });
      await newAdmin.save();
      console.log(`✅ Admin account "${TARGET_USERNAME}" created successfully!`);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📋 Admin Provisioning Status: SUCCESS`);
    console.log(`   Username: ${TARGET_USERNAME}`);
    console.log(`   Role:     ${TARGET_ROLE}`);
    console.log(`   Phone:    ${TARGET_PHONE}`);
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.connection.close();
    console.log('✅ Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Provisioning error:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

seedAdmin();
