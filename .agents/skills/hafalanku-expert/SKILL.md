---
name: hafalanku-expert
description: "Master context and architectural memory for the HafalanKu project. Use this skill whenever working on HafalanKu to understand the core logic, access controls, and structures."
---

# HafalanKu Project Architecture & Rules

This document serves as the master memory for the HafalanKu project.

## Technology Stack
- **Frontend**: Next.js 16 (App Router), Tailwind CSS (Vanilla CSS for custom), React Hook Form, TanStack Query, Framer Motion (`motion/react`).
- **Backend**: Fastify, TypeScript, Prisma ORM.
- **Databases**: PostgreSQL (Main DB), MongoDB (Logging/Audit), Redis (Caching & Job Queues).
- **Other**: WhatsApp Gateway API, Telegram Bot API.

## Authorization & Access Control Rules

The application uses an RBAC (Role-Based Access Control) system with three primary roles: `SUPERADMIN`, `ADMIN`, and `USER`.

### 1. `SUPERADMIN`
- **Scope**: Global access. Can view and manage all records across all organizations.
- **Rules**: `buildAccessWhere` returns `{}` for Superadmin, bypassing all filters.

### 2. `ADMIN` (Admin Organisasi)
- **Scope**: Organization-level access. Bound by `organizationId`.
- **Rules**: Can manage users (`USER`), classes, and santris *within* their organization.
- **Frontend Rules**: The Admin's sidebar does **not** display "Hafalan (Riwayat)" or "Hafalan Awal" to prevent them from directly recording Hafalan (which is strictly the `USER`'s responsibility).

### 3. `USER` (Pengajar / Ustadz)
- **Scope**: Personal or Organization-level (depending on affiliation).
- **Rules**:
  - If affiliated with an organization (`organizationId !== null`), their visibility is scoped to the organization. However, they **cannot** access `Kelas` and `Santri` menus (Task-11 rule: `if (role === 'USER' && user?.organizationId) return false;`).
  - If independent (`organizationId === null`), they have personal scope. They can manage their own `Kelas` and up to 20 `Santri`. They are denied access to the WhatsApp Gateway settings.

### Query Scoping (Backend)
All services (`SantriService`, `KelasService`, `HafalanService`) must use the `buildAccessWhere` helper pattern:
```typescript
private buildAccessWhere(user: { userId: string; role: string; orgId?: string | null }) {
  if (user.role === 'SUPERADMIN') return {};
  if (user.orgId) return { user: { organizationId: user.orgId } };
  return { userId: user.userId };
}
```

## Dashboard Statistics Cache
The `DashboardService` utilizes Redis for caching stats (TTL: 300s). Whenever mutations occur in `Santri`, `Kelas`, or `Hafalan`, the `DashboardService.invalidateCache(userId)` method must be called to ensure fresh data.

## Murajaah Logic (Spaced Repetition)
Hafalan entries trigger an auto-upsert in `MurajaahSchedule`. The `priorityScore` is calculated based on the days elapsed since the `lastReviewDate` plus a weight derived from the `predikat` (MUMTAZ=0, JAYYID_JIDDAN=10, JAYYID=20, MAQBUL=35, ULANG=50).

## Environment Configuration
The `.env` file can be mutated via the API at `/api/v1/settings/env` for `SUPERADMIN_PHONE`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `WA_GATEWAY_URL`. This is tightly restricted to `SUPERADMIN` only.

## UI/UX Rules
- Always use `motion-framer` for fluid animations.
- Enforce the `antigravity-design-expert` guidelines (glassmorphism, vibrant colors, premium feel).
- Use `lucide-react` for icons.
