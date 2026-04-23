import {
  pgTable,
  uuid,
  text,
  timestamp,
  doublePrecision,
  boolean,
  jsonb,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  positionX: doublePrecision("position_x").notNull().default(0),
  positionY: doublePrecision("position_y").notNull().default(0),
  moodColors: text("mood_colors").array().notNull().default([]),
  moodImages: text("mood_images").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const links = pgTable("links", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  url: text("url").notNull(),
  title: text("title").notNull().default(""),
  description: text("description").notNull().default(""),
  image: text("image").notNull().default(""),
  price: text("price").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const roomLinks = pgTable(
  "room_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),
    linkId: uuid("link_id")
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    positionX: doublePrecision("position_x").notNull().default(0),
    positionY: doublePrecision("position_y").notNull().default(0),
    width: doublePrecision("width").notNull().default(260),
    height: doublePrecision("height").notNull().default(200),
    status: text("status").notNull().default("idea"),
    showCaption: boolean("show_caption").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.roomId, t.linkId)]
);

export const sharedPresentations = pgTable("shared_presentations", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  shareToken: text("share_token").notNull().unique(),
  slidesData: jsonb("slides_data").notNull().default([]),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Relations ────────────────────────────────────────────────────
export const projectsRelations = relations(projects, ({ many }) => ({
  rooms: many(rooms),
}));

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  project: one(projects, { fields: [rooms.projectId], references: [projects.id] }),
  roomLinks: many(roomLinks),
}));

export const linksRelations = relations(links, ({ many }) => ({
  roomLinks: many(roomLinks),
}));

export const roomLinksRelations = relations(roomLinks, ({ one }) => ({
  room: one(rooms, { fields: [roomLinks.roomId], references: [rooms.id] }),
  link: one(links, { fields: [roomLinks.linkId], references: [links.id] }),
}));

export const sharedPresentationsRelations = relations(sharedPresentations, ({ one }) => ({
  project: one(projects, {
    fields: [sharedPresentations.projectId],
    references: [projects.id],
  }),
}));

// ── Inferred types ───────────────────────────────────────────────
export type Project = typeof projects.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Link = typeof links.$inferSelect;
export type RoomLink = typeof roomLinks.$inferSelect;
export type SharedPresentation = typeof sharedPresentations.$inferSelect;
