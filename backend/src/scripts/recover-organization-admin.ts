/**
 * Script: recover-organization-admin.ts
 *
 * Emergency CLI recovery utility for HafalanKu.
 * Allows linking or creating an Organization Admin, linking an Organization,
 * associating orphaned/restored Santri and Ustadz, ensuring active & verified status,
 * and configuring default admin credentials with bcrypt.
 *
 * Usage:
 *   npx tsx backend/src/scripts/recover-organization-admin.ts [options]
 *
 * Options / Environment Variables:
 *   --email <email>         Admin email (default: admin@hafalanku.com or ADMIN_EMAIL)
 *   --password <password>   Admin password (default: Admin123! or ADMIN_PASSWORD)
 *   --name <name>           Admin display name (default: Admin Lembaga or ADMIN_NAME)
 *   --org <orgName>         Organization name (default: Pondok Pesantren Tahfidz or ORG_NAME)
 *   --phone <phone>         Admin phone number (default: 081234567890 or ADMIN_PHONE)
 *   --all-orphans           Link all orphaned santri & records to this admin (default: true)
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Resolve .env paths
const rootEnvPath = path.resolve(process.cwd(), '.env');
const backendEnvPath = path.resolve(process.cwd(), 'backend', '.env');
const parentEnvPath = path.resolve(__dirname, '../../../.env');

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
} else if (fs.existsSync(parentEnvPath)) {
  dotenv.config({ path: parentEnvPath });
} else {
  dotenv.config();
}

const prisma = new PrismaClient();

// Parse CLI Arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--email' && args[i + 1]) {
      options.email = args[++i];
    } else if (arg === '--password' && args[i + 1]) {
      options.password = args[++i];
    } else if (arg === '--name' && args[i + 1]) {
      options.name = args[++i];
    } else if (arg === '--org' || arg === '--org-name') {
      options.orgName = args[++i];
    } else if (arg === '--phone' && args[i + 1]) {
      options.phone = args[++i];
    } else if (arg === '--org-id' && args[i + 1]) {
      options.orgId = args[++i];
    } else if (arg === '--no-orphans') {
      options.fixOrphans = false;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
==================================================================
           HafalanKu - Organization Admin Recovery CLI
==================================================================
Options:
  --email <email>        Admin email (default: admin@hafalanku.com)
  --password <password>  Admin password (default: Admin123!)
  --name <name>          Admin full name (default: Admin Lembaga)
  --org <orgName>        Organization name (default: Pondok Pesantren Tahfidz)
  --phone <phone>        Admin phone number (default: 081234567890)
  --org-id <uuid>        Target organization UUID if already known
  --no-orphans           Skip re-associating orphaned data
  --help, -h             Show this help screen
==================================================================
`);
    return;
  }

  const email = String(options.email || process.env.ADMIN_EMAIL || 'admin@hafalanku.com').trim().toLowerCase();
  const password = String(options.password || process.env.ADMIN_PASSWORD || 'Admin123!');
  const name = String(options.name || process.env.ADMIN_NAME || 'Admin Lembaga').trim();
  const orgName = String(options.orgName || process.env.ORG_NAME || 'Pondok Pesantren Tahfidz').trim();
  const phone = String(options.phone || process.env.ADMIN_PHONE || '081234567890').trim();
  const targetOrgId = options.orgId ? String(options.orgId) : undefined;
  const fixOrphans = options.fixOrphans !== false;

  console.log('----------------------------------------------------');
  console.log('🔧 Starting HafalanKu Organization Admin Recovery...');
  console.log(`📧 Target Admin Email : ${email}`);
  console.log(`🏢 Organization Name  : ${orgName}`);
  console.log('----------------------------------------------------');

  // 1. Find or create Admin User
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  let adminUser: any;

  if (existingUser) {
    console.log(`🔍 Found existing user for email: ${email} (ID: ${existingUser.id})`);
    adminUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: existingUser.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'ADMIN',
        passwordHash,
        isActive: true,
        isEmailVerified: true,
        loginAttempts: 0,
        lockedUntil: null,
        name: name || existingUser.name,
        phone: phone || existingUser.phone,
      },
    });
    console.log(`✅ Updated user credentials & verified status for ${adminUser.email}`);
  } else {
    console.log(`➕ User not found. Creating new ADMIN user for: ${email}`);
    adminUser = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'ADMIN',
        phone,
        isActive: true,
        isEmailVerified: true,
      },
    });
    console.log(`✅ Successfully created Admin user: ${adminUser.email} (ID: ${adminUser.id})`);
  }

  // 2. Find or create Organization
  let organization = targetOrgId
    ? await prisma.organization.findUnique({ where: { id: targetOrgId } })
    : null;

  if (!organization) {
    organization = await prisma.organization.findUnique({
      where: { adminId: adminUser.id },
    });
  }

  if (!organization && adminUser.organizationId) {
    organization = await prisma.organization.findUnique({
      where: { id: adminUser.organizationId },
    });
  }

  if (!organization) {
    organization = await prisma.organization.findFirst({
      where: { name: orgName },
    });
  }

  if (organization) {
    console.log(`🔍 Found existing Organization: ${organization.name} (ID: ${organization.id})`);
    if (organization.adminId !== adminUser.id) {
      organization = await prisma.organization.update({
        where: { id: organization.id },
        data: { adminId: adminUser.id },
      });
      console.log(`🔗 Set Organization admin to: ${adminUser.email}`);
    }
  } else {
    console.log(`➕ Creating new Organization: "${orgName}"...`);
    organization = await prisma.organization.create({
      data: {
        name: orgName,
        adminId: adminUser.id,
      },
    });
    console.log(`✅ Created Organization: ${organization.name} (ID: ${organization.id})`);
  }

  // Ensure Admin is linked to Organization
  if (adminUser.organizationId !== organization.id) {
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: { organizationId: organization.id },
    });
    console.log(`🔗 Linked Admin user to Organization ID: ${organization.id}`);
  }

  // 3. Link unaffiliated Ustadz / Members (role: 'USER')
  const ustadzUpdate = await prisma.user.updateMany({
    where: {
      role: 'USER',
      OR: [
        { organizationId: null },
        { organizationId: '' },
      ],
    },
    data: {
      organizationId: organization.id,
      isActive: true,
      isEmailVerified: true,
    },
  });
  console.log(`👥 Associated ${ustadzUpdate.count} unaffiliated Ustadz/Members to Organization: "${organization.name}"`);

  // 4. Fix / Associate Orphaned Santri & Data
  let orphanSantriCount = 0;
  let orphanKelasCount = 0;
  let orphanHafalanCount = 0;
  let orphanMurajaahCount = 0;
  let orphanMurajaahHistoryCount = 0;
  let orphanAbsensiCount = 0;

  if (fixOrphans) {
    const allUsers = await prisma.user.findMany({ select: { id: true } });
    const validUserIds = allUsers.map((u) => u.id);

    // Reassociate orphaned Kelas
    const kelasRes = await prisma.kelas.updateMany({
      where: {
        userId: { notIn: validUserIds },
      },
      data: {
        userId: adminUser.id,
      },
    });
    orphanKelasCount = kelasRes.count;

    // Reassociate orphaned Santri
    const santriRes = await prisma.santri.updateMany({
      where: {
        userId: { notIn: validUserIds },
      },
      data: {
        userId: adminUser.id,
      },
    });
    orphanSantriCount = santriRes.count;

    // Reassociate orphaned Hafalan
    const hafalanRes = await prisma.hafalan.updateMany({
      where: {
        userId: { notIn: validUserIds },
      },
      data: {
        userId: adminUser.id,
      },
    });
    orphanHafalanCount = hafalanRes.count;

    // Reassociate orphaned Murajaah Schedule
    const murajaahRes = await prisma.murajaahSchedule.updateMany({
      where: {
        userId: { notIn: validUserIds },
      },
      data: {
        userId: adminUser.id,
      },
    });
    orphanMurajaahCount = murajaahRes.count;

    // Reassociate orphaned Murajaah History
    const murajaahHistRes = await prisma.murajaahHistory.updateMany({
      where: {
        userId: { notIn: validUserIds },
      },
      data: {
        userId: adminUser.id,
      },
    });
    orphanMurajaahHistoryCount = murajaahHistRes.count;

    // Reassociate orphaned Absensi
    const absensiRes = await prisma.absensi.updateMany({
      where: {
        userId: { notIn: validUserIds },
      },
      data: {
        userId: adminUser.id,
      },
    });
    orphanAbsensiCount = absensiRes.count;
  }

  // 5. Gather summary totals for this organization
  const orgUsers = await prisma.user.findMany({
    where: {
      OR: [
        { organizationId: organization.id },
        { id: organization.adminId },
      ],
    },
    select: { id: true },
  });
  const orgUserIds = orgUsers.map((u) => u.id);

  const [totalSantri, totalKelas, totalHafalan, totalMurajaah, totalAbsensi] = await Promise.all([
    prisma.santri.count({ where: { userId: { in: orgUserIds } } }),
    prisma.kelas.count({ where: { userId: { in: orgUserIds } } }),
    prisma.hafalan.count({ where: { userId: { in: orgUserIds } } }),
    prisma.murajaahSchedule.count({ where: { userId: { in: orgUserIds } } }),
    prisma.absensi.count({ where: { userId: { in: orgUserIds } } }),
  ]);

  console.log(`
==================================================================
  🎉 RECOVERY COMPLETED SUCCESSFULLY
==================================================================
  🏢 Organization   : ${organization.name}
     ID             : ${organization.id}

  👤 Admin Account  : ${adminUser.name} (${adminUser.email})
     Role           : ${adminUser.role}
     Status         : Active & Email Verified
     Password       : (Configured with bcrypt salt 12)

  📊 Organization Totals:
     - Members / Ustadz : ${orgUserIds.length}
     - Total Santri     : ${totalSantri}
     - Total Kelas      : ${totalKelas}
     - Total Hafalan    : ${totalHafalan}
     - Murajaah Sched.  : ${totalMurajaah}
     - Absensi Records  : ${totalAbsensi}

  🛠️ Orphaned Data Re-associated to Admin:
     - Santri           : ${orphanSantriCount}
     - Kelas            : ${orphanKelasCount}
     - Hafalan          : ${orphanHafalanCount}
     - Murajaah Sched.  : ${orphanMurajaahCount}
     - Murajaah History : ${orphanMurajaahHistoryCount}
     - Absensi          : ${orphanAbsensiCount}
==================================================================
  Login now with:
  Email    : ${email}
  Password : ${password}
==================================================================
`);
}

main()
  .catch((e) => {
    console.error('❌ Recovery execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
