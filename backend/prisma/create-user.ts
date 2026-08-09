import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root directory .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Override for local host instead of docker container name 'postgres'
process.env.DATABASE_URL = "postgresql://hafalanku_user:hafalanku_password@localhost:5432/hafalanku?schema=public";

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'syarifhusen4@gmail.com';
  const password = 'Hanin.218';
  
  console.log(`Checking if user ${email} already exists...`);
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name: 'Syarif Husen',
        passwordHash,
        role: 'SUPERADMIN',
        isActive: true,
      },
    });

    console.log(`✅ Created user: ${user.email} (SUPERADMIN)`);
  } else {
    console.log(`ℹ️ User ${email} already exists.`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Error creating user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
