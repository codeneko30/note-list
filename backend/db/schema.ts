import {
    pgTable,

    varchar,
    text,
    boolean,
    integer,
    timestamp
  } from "drizzle-orm/pg-core";
  
  // Users register with a phone number + a 6-digit PIN (hashed).
  export const users = pgTable("users", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    phone: varchar("phone", { length: 20 }).notNull().unique(),

    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull()
  });
  
  // Each user can create an unlimited number of lists (Shopping, TODO, Books...).
  export const lists = pgTable("lists", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id")  .notNull()      .references(() => users.id, { onDelete: "cascade" }),
    

    name: varchar("name", { length: 60 }).notNull(),
    icon: varchar("icon", { length: 10 }).default("📝"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull()
  });
  
  // Items belong to a list. parentId allows nested sub-items (e.g. "Pay bills" -> "Electricity").
  export const items = pgTable("items", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    listId: integer("list_id")   .notNull().references(() => lists.id, { onDelete: "cascade" }),
   
      
    userId: integer("user_id")  .notNull() .references(() => users.id, { onDelete: "cascade" }),
    
     
    parentId: integer("parent_id"),
    title: text("title").notNull(),
    notes: text("notes").default(""),
    done: boolean("done").notNull().default(false),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull()
  });
  