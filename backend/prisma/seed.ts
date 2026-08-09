import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isDocker = require('fs').existsSync('/.dockerenv');
if (!isDocker && (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('@postgres:'))) {
  process.env.DATABASE_URL = process.env.DATABASE_URL?.replace('@postgres:', '@localhost:') || "postgresql://hafalanku_user:hafalanku_password@localhost:5432/hafalanku?schema=public";
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default superadmin
  const superadminEmail = 'admin@hafalanku.com';
  const existingSuperadmin = await prisma.user.findUnique({
    where: { email: superadminEmail },
  });

  if (!existingSuperadmin) {
    const passwordHash = await bcrypt.hash('SuperAdmin123!', 12);
    const superadmin = await prisma.user.create({
      data: {
        email: superadminEmail,
        name: 'Super Admin HafalanKu',
        passwordHash,
        role: 'SUPERADMIN',
        isActive: true,
      },
    });

    console.log(`✅ Created default superadmin: ${superadmin.email}`);
  }

  // Create requested superadmin: syarifhusen4@gmail.com
  const userSuperadminEmail = 'syarifhusen4@gmail.com';
  const userPasswordHash = await bcrypt.hash('admin123', 12);

  const syarifUser = await prisma.user.upsert({
    where: { email: userSuperadminEmail },
    update: {
      role: 'SUPERADMIN',
      passwordHash: userPasswordHash,
      isActive: true,
    },
    create: {
      email: userSuperadminEmail,
      name: 'Syarif Husen (Superadmin)',
      passwordHash: userPasswordHash,
      role: 'SUPERADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Created/Updated Superadmin: ${syarifUser.email}`);

  console.log('🌱 Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
