import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./_core/trpc";

// Public inquiry submissions remain public. Global inquiry records and internal
// notes are available only to platform administrators, never ordinary tenants.
export const contactAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["super_admin", "admin"].includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Platform administrator access is required" });
  }
  return next({ ctx });
});
