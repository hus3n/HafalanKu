import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root directory .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Override for local host instead of docker container name 'postgres'
// process.env.DATABASE_URL = "postgresql://hafalanku_user:hafalanku_password@localhost:5432/hafalanku?schema=public";

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'syarifhusen4@gmail.com';
  const password = 'admin123';
  
  console.log(`Checking if user ${email} already exists...`);
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  const passwordHash = await bcrypt.hash(password, 12);

  if (!existingUser) {
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
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });
    console.log(`✅ Updated password for existing user: ${email} to admin123`);
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
