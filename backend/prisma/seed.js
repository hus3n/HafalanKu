"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));

dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
dotenv_1.default.config();

const prisma = new client_1.PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');
    
    // Create default superadmin
    const superadminEmail = 'admin@hafalanku.com';
    try {
        const existingSuperadmin = await prisma.user.findUnique({
            where: { email: superadminEmail },
        });
        if (!existingSuperadmin) {
            const passwordHash = await bcrypt_1.default.hash('SuperAdmin123!', 12);
            const superadmin = await prisma.user.create({
                data: {
                    email: superadminEmail,
                    name: 'Super Admin HafalanKu',
                    passwordHash,
                    role: 'SUPERADMIN',
                    isActive: true,
                    isEmailVerified: true,
                },
            });
            console.log(`✅ Created default superadmin: ${superadmin.email}`);
        }
    } catch (e) {
        console.warn('⚠️ Superadmin seed notice:', e?.message || e);
    }

    // Create requested superadmin: syarifhusen4@gmail.com
    try {
        const userSuperadminEmail = 'syarifhusen4@gmail.com';
        const userPasswordHash = await bcrypt_1.default.hash('admin123', 12);
        const syarifUser = await prisma.user.upsert({
            where: { email: userSuperadminEmail },
            update: {
                role: 'SUPERADMIN',
                passwordHash: userPasswordHash,
                isActive: true,
                isEmailVerified: true,
                loginAttempts: 0,
                lockedUntil: null,
            },
            create: {
                email: userSuperadminEmail,
                name: 'Syarif Husen (Superadmin)',
                passwordHash: userPasswordHash,
                role: 'SUPERADMIN',
                isActive: true,
                isEmailVerified: true,
                loginAttempts: 0,
                lockedUntil: null,
            },
        });
        console.log(`✅ Created/Updated Superadmin: ${syarifUser.email}`);
    } catch (e) {
        console.warn('⚠️ Syarif Superadmin seed notice:', e?.message || e);
    }

    // Setup Admin: atlasgege6@gmail.com & Ustadz: husen@gmail.com & Link all classes/data
    try {
        const adminEmail = 'atlasgege6@gmail.com';
        const ustadzEmail = 'husen@gmail.com';
        const commonPasswordHash = await bcrypt_1.default.hash('admin123', 12);

        // 1. Upsert Admin User
        let adminUser = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (!adminUser) {
            adminUser = await prisma.user.create({
                data: {
                    email: adminEmail,
                    name: 'Admin SDMPK',
                    passwordHash: commonPasswordHash,
                    role: 'ADMIN',
                    isActive: true,
                    isEmailVerified: true,
                    loginAttempts: 0,
                    lockedUntil: null,
                },
            });
            console.log(`✅ Created Admin user: ${adminUser.email}`);
        } else {
            adminUser = await prisma.user.update({
                where: { id: adminUser.id },
                data: {
                    passwordHash: commonPasswordHash,
                    role: 'ADMIN',
                    isActive: true,
                    isEmailVerified: true,
                    loginAttempts: 0,
                    lockedUntil: null,
                },
            });
            console.log(`✅ Updated Admin user: ${adminUser.email}`);
        }

        // 2. Ensure Organization exists and is owned by Admin
        let org = await prisma.organization.findUnique({
            where: { adminId: adminUser.id },
        });

        if (!org) {
            // Check if any org exists without admin or create new
            const existingOrg = await prisma.organization.findFirst();
            if (existingOrg) {
                org = await prisma.organization.update({
                    where: { id: existingOrg.id },
                    data: { adminId: adminUser.id },
                });
            } else {
                org = await prisma.organization.create({
                    data: {
                        name: 'SD Muhammadiyah Bayat',
                        adminId: adminUser.id,
                    },
                });
            }
            console.log(`✅ Linked Organization ${org.name} to Admin`);
        }

        // Ensure Admin has organizationId set
        if (adminUser.organizationId !== org.id) {
            adminUser = await prisma.user.update({
                where: { id: adminUser.id },
                data: { organizationId: org.id },
            });
        }

        // 3. Upsert Ustadz User
        let ustadzUser = await prisma.user.findUnique({
            where: { email: ustadzEmail },
        });

        if (!ustadzUser) {
            ustadzUser = await prisma.user.create({
                data: {
                    email: ustadzEmail,
                    name: 'Ustadz Husen',
                    passwordHash: commonPasswordHash,
                    role: 'USER',
                    isActive: true,
                    isEmailVerified: true,
                    loginAttempts: 0,
                    lockedUntil: null,
                    organizationId: org.id,
                },
            });
            console.log(`✅ Created Ustadz user: ${ustadzUser.email}`);
        } else {
            ustadzUser = await prisma.user.update({
                where: { id: ustadzUser.id },
                data: {
                    passwordHash: commonPasswordHash,
                    role: 'USER',
                    isActive: true,
                    isEmailVerified: true,
                    loginAttempts: 0,
                    lockedUntil: null,
                    organizationId: org.id,
                },
            });
            console.log(`✅ Updated Ustadz user: ${ustadzUser.email}`);
        }

        // 4. Link ALL Kelas to Ustadz
        const updatedKelas = await prisma.kelas.updateMany({
            data: { userId: ustadzUser.id },
        });
        console.log(`✅ Linked ${updatedKelas.count} kelas to Ustadz (${ustadzUser.email})`);

        // 5. Link ALL Santri to Ustadz
        const updatedSantri = await prisma.santri.updateMany({
            data: { userId: ustadzUser.id },
        });
        console.log(`✅ Linked ${updatedSantri.count} santri to Ustadz (${ustadzUser.email})`);

        // 6. Link ALL Hafalan to Ustadz
        const updatedHafalan = await prisma.hafalan.updateMany({
            data: { userId: ustadzUser.id },
        });
        console.log(`✅ Linked ${updatedHafalan.count} hafalan records to Ustadz (${ustadzUser.email})`);

        // 7. Link ALL MurajaahSchedule to Ustadz
        const updatedMurajaah = await prisma.murajaahSchedule.updateMany({
            data: { userId: ustadzUser.id },
        });
        console.log(`✅ Linked ${updatedMurajaah.count} murajaah schedules to Ustadz (${ustadzUser.email})`);

        // 8. Link ALL MurajaahHistory to Ustadz
        const updatedMurajaahHist = await prisma.murajaahHistory.updateMany({
            data: { userId: ustadzUser.id },
        });
        console.log(`✅ Linked ${updatedMurajaahHist.count} murajaah histories to Ustadz (${ustadzUser.email})`);

        // 9. Link ALL Absensi to Ustadz
        const updatedAbsensi = await prisma.absensi.updateMany({
            data: { userId: ustadzUser.id },
        });
        console.log(`✅ Linked ${updatedAbsensi.count} absensi records to Ustadz (${ustadzUser.email})`);

    } catch (e) {
        console.warn('⚠️ Admin/Ustadz organization setup notice:', e?.message || e);
    }

    // Seed default approved reviews if empty
    try {
        const reviewCount = await prisma.review.count();
        if (reviewCount === 0) {
            await prisma.review.createMany({
                data: [
                    {
                        name: 'Ustadz Faisal Ridwan',
                        roleOrTitle: 'Koordinator Tahfidz TPQ Baitul Qur\'an',
                        rating: 5,
                        comment: 'Alhamdulillah, HafalanKu sangat mempermudah pemantauan setoran dan jadwal murajaah santri kami. Fitur integrasi WhatsApp ke wali santri membuat orang tua lebih proaktif mendampingi ananda di rumah.',
                        isApproved: true,
                    },
                    {
                        name: 'Ibu Hj. Siti Nurhaliza',
                        roleOrTitle: 'Wali Santri Kelas Juz \'Amma',
                        rating: 5,
                        comment: 'Sangat bersyukur dengan adanya HafalanKu. Setiap kali anak saya setor hafalan di madrasah, langsung ada laporan rekap dan notifikasi murajaah di WhatsApp. Tampilan aplikasinya sangat rapi dan mudah dimengerti.',
                        isApproved: true,
                    },
                    {
                        name: 'Ustadz M. Syarif Hidayatullah',
                        roleOrTitle: 'Pengasuh Pesantren Tahfidz Nurul Huda',
                        rating: 5,
                        comment: 'Platform manajemen tahfidz paling lengkap dan modern. Rekap mutabaah otomatis, sistem penilaian mumtaz hingga maqbul sangat terstruktur. Sangat kami rekomendasikan untuk pondok pesantren dan rumah tahfidz.',
                        isApproved: true,
                    },
                ],
            });
            console.log('✅ Seeded initial customer reviews');
        }
    } catch (e) {
        console.warn('⚠️ Review seed notice:', e?.message || e);
    }

    console.log('🌱 Seeding finished successfully.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error (non-fatal):', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
