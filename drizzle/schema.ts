import {
  index,
  int,
  longtext,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** One-time, pre-provisioned administrator activation capabilities. */
export const partnerAdminInvites = mysqlTable("partner_admin_invites", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
});

/**
 * Public partner applications. The compact searchable fields support the admin
 * list while `data` retains the full validated, flat form payload.
 */
export const partnerInquiries = mysqlTable(
  "partner_inquiries",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    requestId: varchar("requestId", { length: 36 }).notNull(),
    company: varchar("company", { length: 200 }).notNull(),
    firstName: varchar("firstName", { length: 100 }).notNull(),
    lastName: varchar("lastName", { length: 100 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    partnerships: longtext("partnerships").notNull(),
    data: longtext("data").notNull(),
    submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("partner_inquiries_request_id_unique").on(table.requestId),
    index("partner_inquiries_submitted_at_idx").on(table.submittedAt),
  ]
);

/**
 * File bytes remain in the database and are never mapped to public URLs. Before
 * an inquiry is submitted `inquiryId` is null and the high-entropy `id` is the
 * one-time upload capability; submission claims it inside a database transaction.
 */
export const partnerAssets = mysqlTable(
  "partner_assets",
  {
    id: varchar("id", { length: 96 }).primaryKey(),
    inquiryId: varchar("inquiryId", { length: 64 }),
    role: mysqlEnum("role", ["logo", "asset"]),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 128 }).notNull(),
    size: int("size").notNull(),
    dataBase64: longtext("dataBase64").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    index("partner_assets_inquiry_id_idx").on(table.inquiryId),
    index("partner_assets_created_at_idx").on(table.createdAt),
  ]
);

export type PartnerInquiry = typeof partnerInquiries.$inferSelect;
export type InsertPartnerInquiry = typeof partnerInquiries.$inferInsert;
export type PartnerAsset = typeof partnerAssets.$inferSelect;
export type InsertPartnerAsset = typeof partnerAssets.$inferInsert;

/** Immutable email payload plus durable delivery state; one team alert per inquiry. */
export const partnerNotifications = mysqlTable(
  "partner_notifications",
  {
    inquiryId: varchar("inquiryId", { length: 64 }).primaryKey(),
    payload: longtext("payload").notNull(),
    status: mysqlEnum("status", [
      "pending",
      "sending",
      "sent",
      "failed",
      "needs_review",
    ])
      .default("pending")
      .notNull(),
    attempts: int("attempts").default(0).notNull(),
    claimToken: varchar("claimToken", { length: 36 }),
    leaseUntil: timestamp("leaseUntil"),
    nextAttemptAt: timestamp("nextAttemptAt").defaultNow().notNull(),
    firstAttemptAt: timestamp("firstAttemptAt"),
    providerId: varchar("providerId", { length: 128 }),
    lastError: varchar("lastError", { length: 200 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    sentAt: timestamp("sentAt"),
  },
  table => [
    index("partner_notifications_retry_idx").on(
      table.status,
      table.nextAttemptAt
    ),
  ]
);

export type PartnerNotification = typeof partnerNotifications.$inferSelect;
