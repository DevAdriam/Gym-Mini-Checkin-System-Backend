/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Default admin credentials
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gym.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Admin User';
  const hashRounds = parseInt(process.env.HASH_ROUND || '10', 10);

  // Hash the password
  const hashedPassword = await bcrypt.hash(adminPassword, hashRounds);

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('ℹ️  Admin already exists, skipping creation...');
    console.log(`   Email: ${adminEmail}`);
  } else {
    // Create admin
    const admin = await prisma.admin.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        status: 'ACTIVE',
      },
    });

    console.log('✅ Admin created successfully!');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Status: ${admin.status}`);
    console.log(
      `   Password: ${adminPassword} (default - please change after first login)`,
    );
  }

  console.log('✨ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
