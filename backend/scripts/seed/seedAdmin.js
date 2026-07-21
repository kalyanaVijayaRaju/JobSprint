/**
 * Seeds the admin user account.
 * Creates a single admin user with a known password for development.
 * Idempotent — skips if admin already exists.
 */

import bcrypt from 'bcryptjs';
import User from '../../src/models/User.js';
import { printHeader } from './utils/progress.js';

const ADMIN_EMAIL = 'admin@jobsprint.com';
const ADMIN_PASSWORD = 'JobSprint@2024';

const seedAdmin = async () => {
  printHeader('Seeding Admin User');

  // Check if admin already exists
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`  ⏭️  Admin user already exists: ${ADMIN_EMAIL}`);
    return existing._id;
  }

  // Pre-hash password to bypass the pre-save hook during insertMany
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);

  const admin = await User.create({
    email: ADMIN_EMAIL,
    passwordHash,
    role: 'admin',
    isVerified: true,
    isActive: true,
    lastLoginAt: new Date(),
  });

  console.log(`  ✔ Admin user created: ${ADMIN_EMAIL}`);
  console.log(`  🔑 Password: ${ADMIN_PASSWORD}`);

  return admin._id;
};

export default seedAdmin;
