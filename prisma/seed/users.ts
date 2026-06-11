import type { PrismaClient } from "@prisma/client";
import type { User } from "@/lib/db/types";

// ---------------------------------------------------------------------------
// Seed admin user
// ---------------------------------------------------------------------------

export async function seedUsers(prisma: PrismaClient): Promise<User> {
  const adminEmail = "admin@largo.com";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log(
      `✅ Admin user already exists: ${existing.email} (role: ${existing.role})`,
    );
    return existing;
  }

  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Admin",
      emailVerified: false,
      role: "ADMIN",
    },
  });

  console.log(
    `✅ Admin user created: ${adminUser.email} (role: ${adminUser.role})`,
  );
  console.log(
    `   ℹ️  Register via /ingresar with this email to set password via Better Auth.\n`,
  );

  return adminUser;
}
