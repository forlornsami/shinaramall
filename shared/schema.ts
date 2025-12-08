import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table for customers (Internal Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  mobile: varchar("mobile"),
  shippingAddress: jsonb("shipping_address").$type<{
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  }>(),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Roles table for access control
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").$type<{
    dashboard: boolean;
    products: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    categories: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    orders: { view: boolean; edit: boolean };
    customers: { view: boolean };
    inventory: { view: boolean; adjust: boolean };
    payments: { view: boolean; manage: boolean };
    users: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    roles: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    settings: { view: boolean; edit: boolean };
    chat?: { view: boolean; respond: boolean };
  }>().notNull(),
  isSystem: boolean("is_system").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin users table (separate from customer users)
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  role: varchar("role").notNull().default("admin"),
  roleId: varchar("role_id").references(() => roles.id),
  profilePicture: text("profile_picture"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  description: text("description"),
  shortDescription: varchar("short_description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  sku: varchar("sku").unique(),
  stock: integer("stock").notNull().default(0),
  categoryId: varchar("category_id").references(() => categories.id),
  imageUrl: varchar("image_url"),
  imageUrls: jsonb("image_urls").$type<string[]>().default([]),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order status enum
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded"
]);

// Payment status enum
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "refunded"
]);

// Payment method enum
export const paymentMethodEnum = pgEnum("payment_method", [
  "easypaisa",
  "jazzcash",
  "hbl_bank",
  "cod"
]);

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").notNull().unique(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  paymentMethod: paymentMethodEnum("payment_method"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb("shipping_address").$type<{
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  }>(),
  paymentDetails: jsonb("payment_details").$type<{
    transactionId?: string;
    gatewayResponse?: any;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

// Shopping cart
export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  productId: varchar("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  cartItems: many(cartItems),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  adminUsers: many(adminUsers),
}));

export const adminUsersRelations = relations(adminUsers, ({ one }) => ({
  roleData: one(roles, {
    fields: [adminUsers.roleId],
    references: [roles.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Registration validation schema (client-side)
export const registerUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  mobile: z.string().optional(),
});

// Login validation schema
export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export const insertRoleSchema = createInsertSchema(roles).pick({
  name: true,
  displayName: true,
  description: true,
  permissions: true,
  isSystem: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).pick({
  username: true,
  email: true,
  passwordHash: true,
  role: true,
  roleId: true,
  isActive: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  isFeatured: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  slug: true,
  description: true,
  shortDescription: true,
  price: true,
  compareAtPrice: true,
  sku: true,
  stock: true,
  categoryId: true,
  imageUrl: true,
  imageUrls: true,
  isActive: true,
  isFeatured: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  paymentMethod: true,
  subtotal: true,
  shippingCost: true,
  total: true,
  shippingAddress: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
  total: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  productId: true,
  quantity: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, 'passwordHash'>;
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

// Permission types
export type RolePermissions = {
  dashboard: boolean;
  products: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  categories: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  orders: { view: boolean; edit: boolean };
  customers: { view: boolean };
  inventory: { view: boolean; adjust: boolean };
  payments: { view: boolean; manage: boolean };
  users: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  roles: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  settings: { view: boolean; edit: boolean };
  chat?: { view: boolean; respond: boolean };
};
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type UpdateOrder = Partial<InsertOrder> & {
  status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  paymentStatus?: "pending" | "processing" | "completed" | "failed" | "refunded";
  paymentDetails?: { transactionId?: string; gatewayResponse?: any; method?: string; note?: string };
};
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// Payment gateway configuration table
export const paymentGateways = pgTable("payment_gateways", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // 'easypaisa', 'jazzcash', 'hbl', 'cod'
  displayName: varchar("display_name").notNull(),
  icon: varchar("icon").default("credit-card"), // Icon name for UI display
  description: varchar("description"), // Short description of the payment method
  isEnabled: boolean("is_enabled").default(true),
  apiKey: varchar("api_key"),
  apiSecret: varchar("api_secret"),
  webhookUrl: varchar("webhook_url"),
  testMode: boolean("test_mode").default(true),
  configuration: jsonb("configuration"), // Additional gateway-specific settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment transactions table for tracking
export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id).notNull(),
  gatewayId: varchar("gateway_id").references(() => paymentGateways.id).notNull(),
  gatewayTransactionId: varchar("gateway_transaction_id"),
  amount: varchar("amount").notNull(),
  currency: varchar("currency").default("PKR"),
  status: varchar("status").notNull(), // 'pending', 'completed', 'failed', 'cancelled'
  gatewayResponse: jsonb("gateway_response"),
  customerInfo: jsonb("customer_info"), // phone number, account number, etc.
  processingFee: varchar("processing_fee").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for payment management
export const insertPaymentGatewaySchema = createInsertSchema(paymentGateways).pick({
  name: true,
  displayName: true,
  icon: true,
  description: true,
  isEnabled: true,
  apiKey: true,
  apiSecret: true,
  webhookUrl: true,
  testMode: true,
  configuration: true,
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).pick({
  orderId: true,
  gatewayId: true,
  gatewayTransactionId: true,
  amount: true,
  currency: true,
  status: true,
  gatewayResponse: true,
  customerInfo: true,
  processingFee: true,
});

// Additional types
export type PaymentGateway = typeof paymentGateways.$inferSelect;
export type InsertPaymentGateway = z.infer<typeof insertPaymentGatewaySchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;

// Store settings table (singleton - only one row)
export const storeSettings = pgTable("store_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeName: varchar("store_name").notNull().default("Eshaal Store"),
  storeLogo: varchar("store_logo"),
  storeEmail: varchar("store_email").notNull().default("contact@eshaalstore.pk"),
  storePhone: varchar("store_phone").notNull().default("+92 300 1234567"),
  storeAddress: varchar("store_address").default("Lahore, Pakistan"),
  currency: varchar("currency").default("PKR"),
  timezone: varchar("timezone").default("PKT"),
  language: varchar("language").default("en"),
  orderNotifications: boolean("order_notifications").default(true),
  stockAlerts: boolean("stock_alerts").default(true),
  customerRegistrations: boolean("customer_registrations").default(true),
  paymentUpdates: boolean("payment_updates").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStoreSettingsSchema = createInsertSchema(storeSettings).omit({
  id: true,
  updatedAt: true,
});

export type StoreSettings = typeof storeSettings.$inferSelect;
export type InsertStoreSettings = z.infer<typeof insertStoreSettingsSchema>;

// Notification type enum
export const notificationTypeEnum = pgEnum("notification_type", [
  "order_placed",
  "order_status_update",
  "low_stock",
  "chat_message",
  "customer_registration",
  "payment_received",
  "payment_failed",
  "general"
]);

// Notifications table for both admin and customer notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientType: varchar("recipient_type").notNull(), // 'admin' or 'customer'
  recipientId: varchar("recipient_id"), // admin user id or customer user id (null for all admins)
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data").$type<Record<string, any>>(), // Additional data like orderId, productId, etc.
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Chat conversation status enum
export const chatConversationStatusEnum = pgEnum("chat_conversation_status", [
  "open",
  "in_progress",
  "resolved",
  "closed"
]);

// Chat sender type enum
export const chatSenderTypeEnum = pgEnum("chat_sender_type", [
  "customer",
  "agent",
  "system"
]);

// Chat conversations table
export const chatConversations = pgTable("chat_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  assignedAgentId: varchar("assigned_agent_id").references(() => adminUsers.id, { onDelete: "set null" }),
  status: chatConversationStatusEnum("status").notNull().default("open"),
  subject: varchar("subject"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").references(() => chatConversations.id, { onDelete: "cascade" }).notNull(),
  senderType: chatSenderTypeEnum("sender_type").notNull(),
  senderId: varchar("sender_id"), // customer user id or admin user id
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat relations
export const chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
  customer: one(users, {
    fields: [chatConversations.customerId],
    references: [users.id],
  }),
  assignedAgent: one(adminUsers, {
    fields: [chatConversations.assignedAgentId],
    references: [adminUsers.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  conversation: one(chatConversations, {
    fields: [chatMessages.conversationId],
    references: [chatConversations.id],
  }),
}));

// Chat insert schemas
export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Chat types
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Extended chat types with relations
export type ChatConversationWithDetails = ChatConversation & {
  customer: User;
  assignedAgent?: AdminUser | null;
  messages?: ChatMessage[];
  unreadCount?: number;
};
