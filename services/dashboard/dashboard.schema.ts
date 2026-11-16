import { z } from "zod";

export const dashboardQuerySchema = z.object({
  range: z.enum(["7", "30", "90"]).default("30").transform(Number),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
