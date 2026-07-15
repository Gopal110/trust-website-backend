const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const dbUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trust_db';

const username = 'admin'; // Change this to your username
const newPassword = 'newpassword123'; // Change this to your desired password

async function run() {
  try {
    console.log('Connecting to database:', dbUri);
    await mongoose.connect(dbUri);
    console.log('Connected!');

    const user = await User.findOne({ username });
    if (!user) {
      console.log(`User "${username}" not found. Creating a new one...`);
      const newUser = new User({ username, password: newPassword });
      await newUser.save();
      console.log(`Successfully created user "${username}" with password: "${newPassword}"`);
    } else {
      user.password = newPassword;
      await user.save();
      console.log(`Successfully reset password for user "${username}" to: "${newPassword}"`);
    }
  } catch (error) {
    console.error('Error running reset:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
