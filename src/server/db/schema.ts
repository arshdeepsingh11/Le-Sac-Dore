import { bigserial, boolean, date, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"), // customer | admin
  phone: text("phone"),
  address: jsonb("address").$type<Record<string, string>>(),
  marketing: boolean("marketing").notNull().default(false),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // sha256 of the cookie token
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const visitors = pgTable("visitors", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  firstSeen: timestamp("first_seen", { withTimezone: true }).notNull().defaultNow(),
  lastSeen: timestamp("last_seen", { withTimezone: true }).notNull().defaultNow(),
  country: text("country"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  referrer: text("referrer"),
  landingPath: text("landing_path"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  pageViews: integer("page_views").notNull().default(0),
  isDemo: boolean("is_demo").notNull().default(false),
});

export const events = pgTable(
  "events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    visitorId: uuid("visitor_id"),
    userId: uuid("user_id"),
    sessionId: text("session_id"),
    type: text("type").notNull(),
    path: text("path"),
    productId: text("product_id"),
    meta: jsonb("meta").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("events_created_idx").on(t.createdAt), index("events_visitor_idx").on(t.visitorId), index("events_user_idx").on(t.userId), index("events_product_idx").on(t.productId)],
);

export const wishlist = pgTable(
  "wishlist",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: text("number").notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  visitorId: uuid("visitor_id"),
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  status: integer("status").notNull().default(0), // 0 received · 1 prepared · 2 shipped · 3 delivered
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  tax: integer("tax").notNull(),
  total: integer("total").notNull(),
  shipMethod: text("ship_method").notNull(),
  payMethod: text("pay_method").notNull(),
  shipTo: jsonb("ship_to").$type<Record<string, string>>().notNull(),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  qty: integer("qty").notNull(),
  unitPrice: integer("unit_price").notNull(),
});

export type PassportEvent = { date: string; type: string; note: string };

export const passports = pgTable("passports", {
  serial: text("serial").primaryKey(),
  productId: text("product_id").notNull(),
  color: text("color").notNull(),
  artisanId: text("artisan_id").notNull(),
  inspectorId: text("inspector_id").notNull(),
  madeOn: date("made_on").notNull(),
  hours: integer("hours").notNull(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  ownerUserId: uuid("owner_user_id").references(() => users.id, { onDelete: "set null" }),
  registeredAt: timestamp("registered_at", { withTimezone: true }),
  history: jsonb("history").$type<PassportEvent[]>().notNull().default([]),
  isSample: boolean("is_sample").notNull().default(false),
});

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  visitorId: uuid("visitor_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  productId: text("product_id").notNull(),
  color: text("color").notNull(),
  boutique: text("boutique").notNull(),
  date: date("date").notNull(),
  slot: text("slot").notNull(),
  kind: text("kind").notNull(), // boutique | video
  status: text("status").notNull().default("requested"), // requested | confirmed | completed | cancelled
  notes: text("notes"),
  holdUntil: timestamp("hold_until", { withTimezone: true }).notNull(),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const subscribers = pgTable("subscribers", {
  email: text("email").primaryKey(),
  source: text("source").notNull().default("footer"),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Idempotent bootstrap — mirrors the Drizzle schema above. */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'customer',
  phone text,
  address jsonb,
  marketing boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz
);
CREATE TABLE IF NOT EXISTS sessions (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now(),
  country text, city text, device text, browser text, os text,
  referrer text, landing_path text, utm_source text, utm_medium text, utm_campaign text,
  page_views integer NOT NULL DEFAULT 0,
  is_demo boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS events (
  id bigserial PRIMARY KEY,
  visitor_id uuid,
  user_id uuid,
  session_id text,
  type text NOT NULL,
  path text,
  product_id text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS events_created_idx ON events (created_at);
CREATE INDEX IF NOT EXISTS events_visitor_idx ON events (visitor_id);
CREATE INDEX IF NOT EXISTS events_user_idx ON events (user_id);
CREATE INDEX IF NOT EXISTS events_product_idx ON events (product_id);
CREATE TABLE IF NOT EXISTS wishlist (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  visitor_id uuid,
  email text NOT NULL,
  name text NOT NULL,
  phone text,
  status integer NOT NULL DEFAULT 0,
  subtotal integer NOT NULL,
  shipping integer NOT NULL,
  tax integer NOT NULL,
  total integer NOT NULL,
  ship_method text NOT NULL,
  pay_method text NOT NULL,
  ship_to jsonb NOT NULL,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS order_items (
  id bigserial PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  name text NOT NULL,
  color text NOT NULL,
  qty integer NOT NULL,
  unit_price integer NOT NULL
);
CREATE TABLE IF NOT EXISTS passports (
  serial text PRIMARY KEY,
  product_id text NOT NULL,
  color text NOT NULL,
  artisan_id text NOT NULL,
  inspector_id text NOT NULL,
  made_on date NOT NULL,
  hours integer NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  owner_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  registered_at timestamptz,
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_sample boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  visitor_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  product_id text NOT NULL,
  color text NOT NULL,
  boutique text NOT NULL,
  date date NOT NULL,
  slot text NOT NULL,
  kind text NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  notes text,
  hold_until timestamptz NOT NULL,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS subscribers (
  email text PRIMARY KEY,
  source text NOT NULL DEFAULT 'footer',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;
