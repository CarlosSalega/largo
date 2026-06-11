import type { PrismaClient, User } from "@prisma/client";

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
      // IMPORTANT: Replace with a properly hashed password in production!
      // This is a placeholder for development only.
      // Use: bcrypt.hashSync("Admin123!", 10)
      passwordHash: "$2b$10$PLACEHOLDER_HASH_REPLACE_IN_PRODUCTION",
      role: "ADMIN",
      emailVerified: true,
    },
  });

  console.log(`✅ Admin user created: ${adminUser.email} (role: ${adminUser.role})`);
  console.log(`   ⚠️  Password hash is a placeholder — replace for production use.\n`);

  return adminUser;
}
