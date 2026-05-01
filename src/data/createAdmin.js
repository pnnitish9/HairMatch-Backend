/**
 * Creates an admin user.
 * Run: node src/data/createAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'hairmatch' });

  const email    = 'admin@hairmatch.com';
  const password = 'Admin@123456';
  const name     = 'Admin';

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    await existing.save();
    console.log(`✅ Existing user "${email}" promoted to admin.`);
  } else {
    await User.create({ name, email, password, role: 'admin' });
    console.log(`✅ Admin created — Email: ${email}  Password: ${password}`);
  }

  process.exit(0);
};

createAdmin().catch((e) => { console.error(e); process.exit(1); });
