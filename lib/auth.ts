import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";

const pendingGoogleImages = new Map<string, string>();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const seed = encodeURIComponent(user.email || user.id);
          const dicebearUrl = `https://api.dicebear.com/9.x/glass/svg?seed=${seed}`;
          const hasExternalImage = user.image && !user.image.includes("api.dicebear.com");
          if (hasExternalImage) {
            pendingGoogleImages.set(user.email!, user.image!);
          }
          return {
            data: {
              ...user,
              image: dicebearUrl,
            },
          };
        },
        after: async (user) => {
          const googleImage = pendingGoogleImages.get(user.email);
          if (googleImage) {
            pendingGoogleImages.delete(user.email);
            await db
              .update(userTable)
              .set({ googleImage })
              .where(eq(userTable.id, user.id));
          }
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
