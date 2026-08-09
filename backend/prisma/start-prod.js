const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Running database setup and superadmin check...');
  const email = 'syarifhusen4@gmail.com';
  const passwordHash = await bcrypt.hash('admin123', 12);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email,
        name: 'Syarif Husen',
        passwordHash,
        role: 'SUPERADMIN',
        isActive: true,
      },
    });
    console.log(`✅ Created Superadmin: ${email}`);
  } else {
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });
    console.log(`✅ Updated password for Superadmin: ${email}`);
  }
}

main()
  .catch(e => {
    console.error('❌ Error during superadmin setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
