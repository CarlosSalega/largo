import type { PrismaClient } from "@prisma/client";
import type { User } from "@/lib/db/types";

// ---------------------------------------------------------------------------
// Seed admin user
// ---------------------------------------------------------------------------

export async function seedUsers(prisma: PrismaClient): Promise<User> {
  const adminEmail = "admin@largo.com";

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin",
      role: "ADMIN",
      image: null,
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
