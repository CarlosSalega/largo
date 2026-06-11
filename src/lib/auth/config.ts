import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";

import { db } from "@/lib/db/client";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "CUSTOMER",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Link guest orders to the newly registered user
          // Orders placed with the same email before registration get their userId set
          await db.order.updateMany({
            where: {
              customerEmail: user.email,
              userId: null,
            },
            data: {
              userId: user.id,
            },
          });
        },
      },
    },
  },
});
