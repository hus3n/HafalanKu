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
            },
            create: {
                email: userSuperadminEmail,
                name: 'Syarif Husen (Superadmin)',
                passwordHash: userPasswordHash,
                role: 'SUPERADMIN',
                isActive: true,
                isEmailVerified: true,
            },
        });
        console.log(`✅ Created/Updated Superadmin: ${syarifUser.email}`);
    } catch (e) {
        console.warn('⚠️ Syarif Superadmin seed notice:', e?.message || e);
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
