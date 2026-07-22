import {
  pgTable,
  text,
  serial,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadsTable = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    businessName: text("business_name"),
    packageInterest: text("package_interest"),
    preferredTime: text("preferred_time"),
    preferredDate: text("preferred_date"),
    preferredSlot: text("preferred_slot"),
    message: text("message"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // One booking per (date, slot). Partial: leads without a slot don't clash.
    uniqueIndex("leads_date_slot_unique")
      .on(table.preferredDate, table.preferredSlot)
      .where(
        sql`${table.preferredDate} IS NOT NULL AND ${table.preferredSlot} IS NOT NULL`,
      ),
  ],
);

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
