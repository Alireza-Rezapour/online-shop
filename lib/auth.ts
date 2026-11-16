import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin } from "better-auth/plugins";
import prisma from "./prisma";
import { hasPersianCharacters } from "./validations/auth";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  // Lets sign-up accept firstName / lastName (they are columns on the User model)
  user: {
    additionalFields: {
      firstName: { type: "string", required: false },
      lastName: { type: "string", required: false },
    },
  },

  databaseHooks: {
    user: {
      create: {
        // Runs on the server for every new user: trims firstName / lastName,
        // saves them in their own columns, and builds `name` from them
        before: async (user) => {
          const { firstName, lastName } = user as typeof user & {
            firstName?: string | null;
            lastName?: string | null;
          };

          const first = firstName?.trim() ?? "";
          const last = lastName?.trim() ?? "";

          return {
            data: {
              ...user,
              firstName: first || null,
              lastName: last || null,
              name: `${first} ${last}`.trim() || user.name,
            },
          };
        },
      },
    },
  },

  // Server-side guard: the form already checks this, but never trust the client
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") return;

      const password = ctx.body?.password;
      if (typeof password === "string" && hasPersianCharacters(password)) {
        throw new APIError("BAD_REQUEST", {
          message: "PASSWORD_HAS_PERSIAN_CHARACTERS",
        });
      }
    }),
  },

  plugins: [admin()],
});
