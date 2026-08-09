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
const isDocker = require('fs').existsSync('/.dockerenv');
if (!isDocker && (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('@postgres:'))) {
    process.env.DATABASE_URL = process.env.DATABASE_URL?.replace('@postgres:', '@localhost:') || "postgresql://hafalanku_user:hafalanku_password@localhost:5432/hafalanku?schema=public";
}
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    // Create default superadmin
    const superadminEmail = 'admin@hafalanku.com';
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
            },
        });
        console.log(`✅ Created default superadmin: ${superadmin.email}`);
    }
    // Create requested superadmin: syarifhusen4@gmail.com
    const userSuperadminEmail = 'syarifhusen4@gmail.com';
    const userPasswordHash = await bcrypt_1.default.hash('admin123', 12);
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
