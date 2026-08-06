var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminUsers: () => adminUsers,
  adminUsersRelations: () => adminUsersRelations,
  cartItems: () => cartItems,
  cartItemsRelations: () => cartItemsRelations,
  categories: () => categories,
  categoriesRelations: () => categoriesRelations,
  chatConversationStatusEnum: () => chatConversationStatusEnum,
  chatConversations: () => chatConversations,
  chatConversationsRelations: () => chatConversationsRelations,
  chatMessages: () => chatMessages,
  chatMessagesRelations: () => chatMessagesRelations,
  chatSenderTypeEnum: () => chatSenderTypeEnum,
  couponCategories: () => couponCategories,
  couponCategoriesRelations: () => couponCategoriesRelations,
  couponProducts: () => couponProducts,
  couponProductsRelations: () => couponProductsRelations,
  couponRedemptions: () => couponRedemptions,
  couponRedemptionsRelations: () => couponRedemptionsRelations,
  couponScopeEnum: () => couponScopeEnum,
  couponTypeEnum: () => couponTypeEnum,
  coupons: () => coupons,
  couponsRelations: () => couponsRelations,
  cryptoPayments: () => cryptoPayments,
  insertAdminUserSchema: () => insertAdminUserSchema,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertChatConversationSchema: () => insertChatConversationSchema,
  insertChatMessageSchema: () => insertChatMessageSchema,
  insertCouponCategorySchema: () => insertCouponCategorySchema,
  insertCouponProductSchema: () => insertCouponProductSchema,
  insertCouponRedemptionSchema: () => insertCouponRedemptionSchema,
  insertCouponSchema: () => insertCouponSchema,
  insertCryptoPaymentSchema: () => insertCryptoPaymentSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertNotificationTemplateSchema: () => insertNotificationTemplateSchema,
  insertNotificationTypeSchema: () => insertNotificationTypeSchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertPaymentAccountSchema: () => insertPaymentAccountSchema,
  insertPaymentGatewaySchema: () => insertPaymentGatewaySchema,
  insertPaymentTransactionSchema: () => insertPaymentTransactionSchema,
  insertProductReviewSchema: () => insertProductReviewSchema,
  insertProductSchema: () => insertProductSchema,
  insertPurchaseItemSchema: () => insertPurchaseItemSchema,
  insertPurchaseSchema: () => insertPurchaseSchema,
  insertRoleSchema: () => insertRoleSchema,
  insertStockAdjustmentSchema: () => insertStockAdjustmentSchema,
  insertStoreSettingsSchema: () => insertStoreSettingsSchema,
  insertSupplierSchema: () => insertSupplierSchema,
  insertTeamChatConversationSchema: () => insertTeamChatConversationSchema,
  insertTeamChatMessageSchema: () => insertTeamChatMessageSchema,
  insertTeamChatParticipantSchema: () => insertTeamChatParticipantSchema,
  insertUserAddressSchema: () => insertUserAddressSchema,
  insertUserSchema: () => insertUserSchema,
  insertWalletSchema: () => insertWalletSchema,
  insertWalletTopupRequestSchema: () => insertWalletTopupRequestSchema,
  insertWalletTransactionSchema: () => insertWalletTransactionSchema,
  insertWishlistItemSchema: () => insertWishlistItemSchema,
  loginUserSchema: () => loginUserSchema,
  notificationCategoryEnum: () => notificationCategoryEnum,
  notificationChannelEnum: () => notificationChannelEnum,
  notificationTemplates: () => notificationTemplates,
  notificationTypeEnum: () => notificationTypeEnum,
  notificationTypes: () => notificationTypes,
  notifications: () => notifications,
  orderItems: () => orderItems,
  orderItemsRelations: () => orderItemsRelations,
  orderStatusEnum: () => orderStatusEnum,
  orders: () => orders,
  ordersRelations: () => ordersRelations,
  paymentAccounts: () => paymentAccounts,
  paymentGateways: () => paymentGateways,
  paymentMethodEnum: () => paymentMethodEnum,
  paymentStatusEnum: () => paymentStatusEnum,
  paymentTransactions: () => paymentTransactions,
  productReviews: () => productReviews,
  productReviewsRelations: () => productReviewsRelations,
  products: () => products,
  productsRelations: () => productsRelations,
  purchaseItems: () => purchaseItems,
  purchaseStatusEnum: () => purchaseStatusEnum,
  purchases: () => purchases,
  registerUserSchema: () => registerUserSchema,
  reviewStatusEnum: () => reviewStatusEnum,
  roles: () => roles,
  rolesRelations: () => rolesRelations,
  stockAdjustments: () => stockAdjustments,
  storeSettings: () => storeSettings,
  suppliers: () => suppliers,
  teamChatConversations: () => teamChatConversations,
  teamChatConversationsRelations: () => teamChatConversationsRelations,
  teamChatMessages: () => teamChatMessages,
  teamChatMessagesRelations: () => teamChatMessagesRelations,
  teamChatParticipants: () => teamChatParticipants,
  teamChatParticipantsRelations: () => teamChatParticipantsRelations,
  teamChatTypeEnum: () => teamChatTypeEnum,
  userAddresses: () => userAddresses,
  userAddressesRelations: () => userAddressesRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  verificationStatusEnum: () => verificationStatusEnum,
  walletTopupRequests: () => walletTopupRequests,
  walletTopupRequestsRelations: () => walletTopupRequestsRelations,
  walletTopupStatusEnum: () => walletTopupStatusEnum,
  walletTransactionTypeEnum: () => walletTransactionTypeEnum,
  walletTransactions: () => walletTransactions,
  walletTransactionsRelations: () => walletTransactionsRelations,
  wallets: () => wallets,
  walletsRelations: () => walletsRelations,
  wishlistItems: () => wishlistItems,
  wishlistItemsRelations: () => wishlistItemsRelations
});
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users, roles, adminUsers, categories, suppliers, products, orderStatusEnum, paymentStatusEnum, paymentMethodEnum, verificationStatusEnum, paymentAccounts, orders, orderItems, cartItems, wishlistItems, purchaseStatusEnum, purchases, purchaseItems, stockAdjustments, userAddresses, insertUserAddressSchema, usersRelations, userAddressesRelations, rolesRelations, adminUsersRelations, categoriesRelations, productsRelations, ordersRelations, orderItemsRelations, cartItemsRelations, wishlistItemsRelations, insertUserSchema, registerUserSchema, loginUserSchema, insertRoleSchema, insertAdminUserSchema, insertCategorySchema, insertProductSchema, insertOrderSchema, insertOrderItemSchema, insertCartItemSchema, insertWishlistItemSchema, insertSupplierSchema, insertPurchaseSchema, insertPurchaseItemSchema, insertStockAdjustmentSchema, insertPaymentAccountSchema, paymentGateways, paymentTransactions, cryptoPayments, insertCryptoPaymentSchema, insertPaymentGatewaySchema, insertPaymentTransactionSchema, storeSettings, insertStoreSettingsSchema, notificationTypeEnum, notifications, insertNotificationSchema, notificationChannelEnum, notificationCategoryEnum, notificationTypes, insertNotificationTypeSchema, notificationTemplates, insertNotificationTemplateSchema, chatConversationStatusEnum, chatSenderTypeEnum, chatConversations, chatMessages, chatConversationsRelations, chatMessagesRelations, insertChatConversationSchema, insertChatMessageSchema, teamChatTypeEnum, teamChatConversations, teamChatParticipants, teamChatMessages, teamChatConversationsRelations, teamChatParticipantsRelations, teamChatMessagesRelations, insertTeamChatConversationSchema, insertTeamChatParticipantSchema, insertTeamChatMessageSchema, walletTransactionTypeEnum, walletTopupStatusEnum, wallets, walletTransactions, walletTopupRequests, walletsRelations, walletTransactionsRelations, walletTopupRequestsRelations, insertWalletSchema, insertWalletTransactionSchema, insertWalletTopupRequestSchema, couponTypeEnum, couponScopeEnum, coupons, couponCategories, couponProducts, couponRedemptions, couponsRelations, couponCategoriesRelations, couponProductsRelations, couponRedemptionsRelations, insertCouponSchema, insertCouponCategorySchema, insertCouponProductSchema, insertCouponRedemptionSchema, reviewStatusEnum, productReviews, productReviewsRelations, insertProductReviewSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: varchar("email").notNull().unique(),
      passwordHash: varchar("password_hash").notNull(),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      mobile: varchar("mobile"),
      shippingAddress: jsonb("shipping_address").$type(),
      profileImageUrl: varchar("profile_image_url"),
      isActive: boolean("is_active").default(true),
      emailVerified: boolean("email_verified").default(false),
      emailVerificationToken: varchar("email_verification_token"),
      emailVerificationExpires: timestamp("email_verification_expires"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    roles = pgTable("roles", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name").notNull().unique(),
      displayName: varchar("display_name").notNull(),
      description: text("description"),
      permissions: jsonb("permissions").$type().notNull(),
      isSystem: boolean("is_system").default(false),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    adminUsers = pgTable("admin_users", {
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    categories = pgTable("categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name").notNull(),
      slug: varchar("slug").notNull().unique(),
      description: text("description"),
      imageUrl: varchar("image_url"),
      isFeatured: boolean("is_featured").notNull().default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    suppliers = pgTable("suppliers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name").notNull(),
      contactPerson: varchar("contact_person"),
      email: varchar("email"),
      phone: varchar("phone"),
      address: text("address"),
      city: varchar("city"),
      notes: text("notes"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    products = pgTable("products", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name").notNull(),
      slug: varchar("slug").notNull().unique(),
      description: text("description"),
      shortDescription: varchar("short_description"),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
      compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
      sku: varchar("sku").unique(),
      stock: integer("stock").notNull().default(0),
      lowStockThreshold: integer("low_stock_threshold").default(10),
      categoryId: varchar("category_id").references(() => categories.id),
      supplierId: varchar("supplier_id").references(() => suppliers.id),
      imageUrl: varchar("image_url"),
      imageUrls: jsonb("image_urls").$type().default([]),
      tags: text("tags").array().default([]),
      isActive: boolean("is_active").notNull().default(true),
      isFeatured: boolean("is_featured").notNull().default(false),
      ratingAverage: decimal("rating_average", { precision: 3, scale: 2 }).default("0"),
      ratingCount: integer("rating_count").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    orderStatusEnum = pgEnum("order_status", [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded"
    ]);
    paymentStatusEnum = pgEnum("payment_status", [
      "pending",
      "processing",
      "completed",
      "failed",
      "refunded"
    ]);
    paymentMethodEnum = pgEnum("payment_method", [
      "easypaisa",
      "jazzcash",
      "hbl_bank",
      "cod"
    ]);
    verificationStatusEnum = pgEnum("verification_status", [
      "pending",
      "approved",
      "rejected"
    ]);
    paymentAccounts = pgTable("payment_accounts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      method: varchar("method").notNull(),
      // 'hbl', 'jazzcash', 'easypaisa'
      bankName: varchar("bank_name"),
      // null for mobile wallets
      accountNumber: varchar("account_number").notNull(),
      accountHolderName: varchar("account_holder_name").notNull(),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    orders = pgTable("orders", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderNumber: varchar("order_number").notNull().unique(),
      userId: varchar("user_id").references(() => users.id),
      guestName: varchar("guest_name"),
      guestEmail: varchar("guest_email"),
      guestPhone: varchar("guest_phone"),
      guestToken: varchar("guest_token"),
      // unguessable capability token for guest proof upload
      status: orderStatusEnum("status").notNull().default("pending"),
      paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
      paymentMethod: varchar("payment_method"),
      // Changed to varchar to avoid enum conflicts
      subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
      shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).notNull().default("0"),
      discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
      couponCode: varchar("coupon_code"),
      walletAmountUsed: decimal("wallet_amount_used", { precision: 10, scale: 2 }).default("0"),
      total: decimal("total", { precision: 10, scale: 2 }).notNull(),
      shippingAddress: jsonb("shipping_address").$type(),
      paymentDetails: jsonb("payment_details").$type(),
      paymentScreenshotUrl: text("payment_screenshot_url"),
      transactionId: varchar("transaction_id"),
      trackingNumber: varchar("tracking_number"),
      verificationStatus: varchar("verification_status").default("pending"),
      verificationNote: text("verification_note"),
      verifiedBy: varchar("verified_by").references(() => adminUsers.id),
      verifiedAt: timestamp("verified_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    orderItems = pgTable("order_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderId: varchar("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
      productId: varchar("product_id").references(() => products.id).notNull(),
      quantity: integer("quantity").notNull(),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      total: decimal("total", { precision: 10, scale: 2 }).notNull()
    });
    cartItems = pgTable("cart_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      productId: varchar("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
      quantity: integer("quantity").notNull(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    wishlistItems = pgTable("wishlist_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      productId: varchar("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    purchaseStatusEnum = pgEnum("purchase_status", [
      "pending",
      "ordered",
      "received",
      "partially_received",
      "cancelled"
    ]);
    purchases = pgTable("purchases", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      purchaseNumber: varchar("purchase_number").notNull().unique(),
      supplierId: varchar("supplier_id").references(() => suppliers.id),
      status: varchar("status").notNull().default("pending"),
      subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
      shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0"),
      otherCosts: decimal("other_costs", { precision: 10, scale: 2 }).default("0"),
      total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0"),
      notes: text("notes"),
      expectedDate: timestamp("expected_date"),
      receivedDate: timestamp("received_date"),
      createdBy: varchar("created_by").references(() => adminUsers.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    purchaseItems = pgTable("purchase_items", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      purchaseId: varchar("purchase_id").references(() => purchases.id, { onDelete: "cascade" }).notNull(),
      productId: varchar("product_id").references(() => products.id).notNull(),
      quantity: integer("quantity").notNull(),
      receivedQuantity: integer("received_quantity").default(0),
      costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
      total: decimal("total", { precision: 10, scale: 2 }).notNull()
    });
    stockAdjustments = pgTable("stock_adjustments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      productId: varchar("product_id").references(() => products.id).notNull(),
      previousStock: integer("previous_stock").notNull(),
      newStock: integer("new_stock").notNull(),
      adjustmentType: varchar("adjustment_type").notNull(),
      // 'purchase', 'sale', 'manual', 'return', 'damage'
      reason: text("reason"),
      referenceId: varchar("reference_id"),
      // orderId or purchaseId
      referenceType: varchar("reference_type"),
      // 'order' or 'purchase'
      createdBy: varchar("created_by").references(() => adminUsers.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    userAddresses = pgTable("user_addresses", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      label: varchar("label").default("Home"),
      firstName: varchar("first_name").notNull(),
      lastName: varchar("last_name"),
      address: text("address").notNull(),
      city: varchar("city").notNull(),
      postalCode: varchar("postal_code"),
      phone: varchar("phone").notNull(),
      isDefault: boolean("is_default").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertUserAddressSchema = createInsertSchema(userAddresses).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    usersRelations = relations(users, ({ many }) => ({
      orders: many(orders),
      cartItems: many(cartItems),
      wishlistItems: many(wishlistItems),
      addresses: many(userAddresses)
    }));
    userAddressesRelations = relations(userAddresses, ({ one }) => ({
      user: one(users, { fields: [userAddresses.userId], references: [users.id] })
    }));
    rolesRelations = relations(roles, ({ many }) => ({
      adminUsers: many(adminUsers)
    }));
    adminUsersRelations = relations(adminUsers, ({ one }) => ({
      roleData: one(roles, {
        fields: [adminUsers.roleId],
        references: [roles.id]
      })
    }));
    categoriesRelations = relations(categories, ({ many }) => ({
      products: many(products)
    }));
    productsRelations = relations(products, ({ one, many }) => ({
      category: one(categories, {
        fields: [products.categoryId],
        references: [categories.id]
      }),
      orderItems: many(orderItems),
      cartItems: many(cartItems),
      wishlistItems: many(wishlistItems)
    }));
    ordersRelations = relations(orders, ({ one, many }) => ({
      user: one(users, {
        fields: [orders.userId],
        references: [users.id]
      }),
      items: many(orderItems)
    }));
    orderItemsRelations = relations(orderItems, ({ one }) => ({
      order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id]
      }),
      product: one(products, {
        fields: [orderItems.productId],
        references: [products.id]
      })
    }));
    cartItemsRelations = relations(cartItems, ({ one }) => ({
      user: one(users, {
        fields: [cartItems.userId],
        references: [users.id]
      }),
      product: one(products, {
        fields: [cartItems.productId],
        references: [products.id]
      })
    }));
    wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
      user: one(users, {
        fields: [wishlistItems.userId],
        references: [users.id]
      }),
      product: one(products, {
        fields: [wishlistItems.productId],
        references: [products.id]
      })
    }));
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    registerUserSchema = z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().optional(),
      mobile: z.string().optional()
    });
    loginUserSchema = z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(1, "Password is required")
    });
    insertRoleSchema = createInsertSchema(roles).pick({
      name: true,
      displayName: true,
      description: true,
      permissions: true,
      isSystem: true
    });
    insertAdminUserSchema = createInsertSchema(adminUsers).pick({
      username: true,
      email: true,
      passwordHash: true,
      role: true,
      roleId: true,
      isActive: true,
      profilePicture: true
    });
    insertCategorySchema = createInsertSchema(categories).pick({
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      isFeatured: true
    });
    insertProductSchema = createInsertSchema(products).pick({
      name: true,
      slug: true,
      description: true,
      shortDescription: true,
      price: true,
      costPrice: true,
      compareAtPrice: true,
      sku: true,
      stock: true,
      lowStockThreshold: true,
      categoryId: true,
      supplierId: true,
      imageUrl: true,
      imageUrls: true,
      isActive: true,
      isFeatured: true
    });
    insertOrderSchema = createInsertSchema(orders).pick({
      userId: true,
      paymentMethod: true,
      subtotal: true,
      shippingCost: true,
      walletAmountUsed: true,
      total: true,
      shippingAddress: true
    });
    insertOrderItemSchema = createInsertSchema(orderItems).pick({
      orderId: true,
      productId: true,
      quantity: true,
      price: true,
      total: true
    });
    insertCartItemSchema = createInsertSchema(cartItems).pick({
      userId: true,
      productId: true,
      quantity: true
    });
    insertWishlistItemSchema = createInsertSchema(wishlistItems).pick({
      userId: true,
      productId: true
    });
    insertSupplierSchema = createInsertSchema(suppliers).pick({
      name: true,
      contactPerson: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      notes: true,
      isActive: true
    });
    insertPurchaseSchema = createInsertSchema(purchases).pick({
      supplierId: true,
      status: true,
      subtotal: true,
      shippingCost: true,
      otherCosts: true,
      total: true,
      notes: true,
      expectedDate: true
    });
    insertPurchaseItemSchema = createInsertSchema(purchaseItems).pick({
      purchaseId: true,
      productId: true,
      quantity: true,
      receivedQuantity: true,
      costPrice: true,
      total: true
    });
    insertStockAdjustmentSchema = createInsertSchema(stockAdjustments).pick({
      productId: true,
      previousStock: true,
      newStock: true,
      adjustmentType: true,
      reason: true,
      referenceId: true,
      referenceType: true
    });
    insertPaymentAccountSchema = createInsertSchema(paymentAccounts).pick({
      method: true,
      bankName: true,
      accountNumber: true,
      accountHolderName: true,
      isActive: true
    });
    paymentGateways = pgTable("payment_gateways", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: varchar("name").notNull(),
      // 'easypaisa', 'jazzcash', 'hbl', 'cod'
      displayName: varchar("display_name").notNull(),
      icon: varchar("icon").default("credit-card"),
      // Icon name for UI display
      description: varchar("description"),
      // Short description of the payment method
      isEnabled: boolean("is_enabled").default(true),
      apiKey: varchar("api_key"),
      apiSecret: varchar("api_secret"),
      webhookUrl: varchar("webhook_url"),
      testMode: boolean("test_mode").default(true),
      configuration: jsonb("configuration"),
      // Additional gateway-specific settings
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    paymentTransactions = pgTable("payment_transactions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderId: varchar("order_id").references(() => orders.id).notNull(),
      gatewayId: varchar("gateway_id").references(() => paymentGateways.id).notNull(),
      gatewayTransactionId: varchar("gateway_transaction_id"),
      amount: varchar("amount").notNull(),
      currency: varchar("currency").default("PKR"),
      status: varchar("status").notNull(),
      // 'pending', 'completed', 'failed', 'cancelled'
      gatewayResponse: jsonb("gateway_response"),
      customerInfo: jsonb("customer_info"),
      // phone number, account number, etc.
      processingFee: varchar("processing_fee").default("0"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    cryptoPayments = pgTable("crypto_payments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      orderId: varchar("order_id").references(() => orders.id).notNull(),
      transactionId: varchar("transaction_id").references(() => paymentTransactions.id),
      gatewayName: varchar("gateway_name").notNull(),
      // 'tron_usdt', 'binance_pay'
      walletAddress: varchar("wallet_address"),
      // Receiving wallet address
      cryptoAmount: varchar("crypto_amount"),
      // Amount in crypto
      cryptoCurrency: varchar("crypto_currency").notNull(),
      // 'USDT', 'TRX', 'BTC', 'BNB', 'ETH'
      network: varchar("network"),
      // 'tron', 'bsc', 'ethereum'
      exchangeRate: varchar("exchange_rate"),
      // Rate at time of payment
      txHash: varchar("tx_hash"),
      // Blockchain transaction hash
      confirmations: integer("confirmations").default(0),
      requiredConfirmations: integer("required_confirmations").default(1),
      externalOrderId: varchar("external_order_id"),
      // ID from payment provider (Binance prepayId, etc.)
      paymentUrl: varchar("payment_url"),
      // URL for customer to complete payment
      qrCode: varchar("qr_code"),
      // QR code URL for payment
      status: varchar("status").notNull().default("pending"),
      // 'pending', 'awaiting_payment', 'confirming', 'completed', 'expired', 'failed'
      expiresAt: timestamp("expires_at"),
      paidAt: timestamp("paid_at"),
      webhookData: jsonb("webhook_data"),
      // Raw webhook payload from provider
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertCryptoPaymentSchema = createInsertSchema(cryptoPayments).pick({
      orderId: true,
      transactionId: true,
      gatewayName: true,
      walletAddress: true,
      cryptoAmount: true,
      cryptoCurrency: true,
      network: true,
      exchangeRate: true,
      txHash: true,
      externalOrderId: true,
      paymentUrl: true,
      qrCode: true,
      status: true,
      expiresAt: true
    });
    insertPaymentGatewaySchema = createInsertSchema(paymentGateways).pick({
      name: true,
      displayName: true,
      icon: true,
      description: true,
      isEnabled: true,
      apiKey: true,
      apiSecret: true,
      webhookUrl: true,
      testMode: true,
      configuration: true
    });
    insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).pick({
      orderId: true,
      gatewayId: true,
      gatewayTransactionId: true,
      amount: true,
      currency: true,
      status: true,
      gatewayResponse: true,
      customerInfo: true,
      processingFee: true
    });
    storeSettings = pgTable("store_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      storeName: varchar("store_name").notNull().default("Shinara Mall"),
      storeLogo: varchar("store_logo"),
      storeEmail: varchar("store_email").notNull().default("contact@shinaramall.com"),
      storePhone: varchar("store_phone").notNull().default("+92 300 1234567"),
      storeAddress: varchar("store_address").default("Lahore, Pakistan"),
      currency: varchar("currency").default("PKR"),
      timezone: varchar("timezone").default("PKT"),
      language: varchar("language").default("en"),
      defaultProductImage: text("default_product_image"),
      defaultCategoryImage: text("default_category_image"),
      orderNotifications: boolean("order_notifications").default(true),
      stockAlerts: boolean("stock_alerts").default(true),
      customerRegistrations: boolean("customer_registrations").default(true),
      paymentUpdates: boolean("payment_updates").default(true),
      marketingEmails: boolean("marketing_emails").default(false),
      guestCheckoutEnabled: boolean("guest_checkout_enabled").default(false),
      shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }).default("300"),
      freeShippingThreshold: decimal("free_shipping_threshold", { precision: 10, scale: 2 }).default("5000"),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertStoreSettingsSchema = createInsertSchema(storeSettings).omit({
      id: true,
      updatedAt: true
    });
    notificationTypeEnum = pgEnum("notification_type", [
      "order_placed",
      "order_status_update",
      "low_stock",
      "chat_message",
      "customer_registration",
      "review_submitted",
      "payment_received",
      "payment_failed",
      "general"
    ]);
    notifications = pgTable("notifications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      recipientType: varchar("recipient_type").notNull(),
      // 'admin' or 'customer'
      recipientId: varchar("recipient_id"),
      // admin user id or customer user id (null for all admins)
      type: notificationTypeEnum("type").notNull(),
      title: varchar("title").notNull(),
      message: text("message").notNull(),
      data: jsonb("data").$type(),
      // Additional data like orderId, productId, etc.
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertNotificationSchema = createInsertSchema(notifications, {
      data: z.record(z.any()).optional()
    }).omit({
      id: true,
      createdAt: true
    });
    notificationChannelEnum = pgEnum("notification_channel", [
      "in_app",
      "email"
    ]);
    notificationCategoryEnum = pgEnum("notification_category", [
      "orders",
      "payments",
      "inventory",
      "customers",
      "communication",
      "system"
    ]);
    notificationTypes = pgTable("notification_types", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      key: varchar("key").notNull().unique(),
      // e.g., 'order_placed', 'low_stock'
      label: varchar("label").notNull(),
      // Human-readable name
      description: text("description"),
      // What this notification does
      category: notificationCategoryEnum("category").notNull(),
      channels: jsonb("channels").$type().default(["in_app", "email"]),
      // Available channels
      isEnabled: boolean("is_enabled").default(true),
      // Global enable/disable
      isEmailEnabled: boolean("is_email_enabled").default(true),
      // Email channel toggle
      isInAppEnabled: boolean("is_in_app_enabled").default(true),
      // In-app channel toggle
      icon: varchar("icon"),
      // Icon name from lucide-react
      priority: varchar("priority").default("normal"),
      // low, normal, high
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertNotificationTypeSchema = createInsertSchema(notificationTypes, {
      channels: z.array(z.string()).optional()
    }).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    notificationTemplates = pgTable("notification_templates", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      typeKey: varchar("type_key").notNull(),
      // References notificationTypes.key
      channel: notificationChannelEnum("channel").notNull().default("email"),
      subject: varchar("subject"),
      // Email subject template
      title: varchar("title").notNull(),
      // Notification title template
      body: text("body").notNull(),
      // Notification body template (supports variables like {{orderNumber}})
      variables: jsonb("variables").$type(),
      // Available variable names
      isActive: boolean("is_active").default(true),
      version: integer("version").default(1),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertNotificationTemplateSchema = createInsertSchema(notificationTemplates, {
      variables: z.array(z.string()).optional()
    }).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    chatConversationStatusEnum = pgEnum("chat_conversation_status", [
      "open",
      "in_progress",
      "resolved",
      "closed"
    ]);
    chatSenderTypeEnum = pgEnum("chat_sender_type", [
      "customer",
      "agent",
      "system"
    ]);
    chatConversations = pgTable("chat_conversations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      customerId: varchar("customer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      assignedAgentId: varchar("assigned_agent_id").references(() => adminUsers.id, { onDelete: "set null" }),
      status: chatConversationStatusEnum("status").notNull().default("open"),
      subject: varchar("subject"),
      lastMessageAt: timestamp("last_message_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    chatMessages = pgTable("chat_messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      conversationId: varchar("conversation_id").references(() => chatConversations.id, { onDelete: "cascade" }).notNull(),
      senderType: chatSenderTypeEnum("sender_type").notNull(),
      senderId: varchar("sender_id"),
      // customer user id or admin user id
      message: text("message").notNull(),
      isRead: boolean("is_read").default(false),
      attachments: jsonb("attachments").$type(),
      reactions: jsonb("reactions").$type(),
      createdAt: timestamp("created_at").defaultNow()
    });
    chatConversationsRelations = relations(chatConversations, ({ one, many }) => ({
      customer: one(users, {
        fields: [chatConversations.customerId],
        references: [users.id]
      }),
      assignedAgent: one(adminUsers, {
        fields: [chatConversations.assignedAgentId],
        references: [adminUsers.id]
      }),
      messages: many(chatMessages)
    }));
    chatMessagesRelations = relations(chatMessages, ({ one }) => ({
      conversation: one(chatConversations, {
        fields: [chatMessages.conversationId],
        references: [chatConversations.id]
      })
    }));
    insertChatConversationSchema = createInsertSchema(chatConversations).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertChatMessageSchema = createInsertSchema(chatMessages).omit({
      id: true,
      createdAt: true
    });
    teamChatTypeEnum = pgEnum("team_chat_type", [
      "direct",
      "group"
    ]);
    teamChatConversations = pgTable("team_chat_conversations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      type: teamChatTypeEnum("type").notNull().default("direct"),
      title: varchar("title"),
      // Only used for group chats
      description: text("description"),
      // Group description
      createdById: varchar("created_by_id").references(() => adminUsers.id, { onDelete: "set null" }),
      lastMessageAt: timestamp("last_message_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    teamChatParticipants = pgTable("team_chat_participants", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      conversationId: varchar("conversation_id").references(() => teamChatConversations.id, { onDelete: "cascade" }).notNull(),
      adminUserId: varchar("admin_user_id").references(() => adminUsers.id, { onDelete: "cascade" }).notNull(),
      isAdmin: boolean("is_admin").default(false),
      // Group admin (can add/remove members)
      lastReadMessageId: varchar("last_read_message_id"),
      joinedAt: timestamp("joined_at").defaultNow(),
      mutedUntil: timestamp("muted_until")
    });
    teamChatMessages = pgTable("team_chat_messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      conversationId: varchar("conversation_id").references(() => teamChatConversations.id, { onDelete: "cascade" }).notNull(),
      senderId: varchar("sender_id").references(() => adminUsers.id, { onDelete: "set null" }),
      message: text("message").notNull(),
      messageType: varchar("message_type").default("text"),
      // text, image, file, system
      attachments: jsonb("attachments").$type(),
      replyToMessageId: varchar("reply_to_message_id"),
      isEdited: boolean("is_edited").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      editedAt: timestamp("edited_at")
    });
    teamChatConversationsRelations = relations(teamChatConversations, ({ one, many }) => ({
      createdBy: one(adminUsers, {
        fields: [teamChatConversations.createdById],
        references: [adminUsers.id]
      }),
      participants: many(teamChatParticipants),
      messages: many(teamChatMessages)
    }));
    teamChatParticipantsRelations = relations(teamChatParticipants, ({ one }) => ({
      conversation: one(teamChatConversations, {
        fields: [teamChatParticipants.conversationId],
        references: [teamChatConversations.id]
      }),
      adminUser: one(adminUsers, {
        fields: [teamChatParticipants.adminUserId],
        references: [adminUsers.id]
      })
    }));
    teamChatMessagesRelations = relations(teamChatMessages, ({ one }) => ({
      conversation: one(teamChatConversations, {
        fields: [teamChatMessages.conversationId],
        references: [teamChatConversations.id]
      }),
      sender: one(adminUsers, {
        fields: [teamChatMessages.senderId],
        references: [adminUsers.id]
      }),
      replyToMessage: one(teamChatMessages, {
        fields: [teamChatMessages.replyToMessageId],
        references: [teamChatMessages.id]
      })
    }));
    insertTeamChatConversationSchema = createInsertSchema(teamChatConversations).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      lastMessageAt: true
    });
    insertTeamChatParticipantSchema = createInsertSchema(teamChatParticipants).omit({
      id: true,
      joinedAt: true
    });
    insertTeamChatMessageSchema = createInsertSchema(teamChatMessages).omit({
      id: true,
      createdAt: true
    });
    walletTransactionTypeEnum = pgEnum("wallet_transaction_type", [
      "credit",
      // Money added to wallet
      "debit",
      // Money used from wallet
      "refund",
      // Refund credited to wallet
      "topup",
      // Top-up credited after admin approval
      "adjustment"
      // Manual adjustment by admin
    ]);
    walletTopupStatusEnum = pgEnum("wallet_topup_status", [
      "pending",
      "approved",
      "rejected"
    ]);
    wallets = pgTable("wallets", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
      balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    walletTransactions = pgTable("wallet_transactions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      walletId: varchar("wallet_id").references(() => wallets.id, { onDelete: "cascade" }).notNull(),
      type: walletTransactionTypeEnum("type").notNull(),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(),
      description: text("description"),
      referenceType: varchar("reference_type"),
      // 'order', 'topup_request', 'refund', 'manual'
      referenceId: varchar("reference_id"),
      // orderId, topupRequestId, etc.
      createdBy: varchar("created_by"),
      // adminUserId for manual adjustments
      createdAt: timestamp("created_at").defaultNow()
    });
    walletTopupRequests = pgTable("wallet_topup_requests", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      walletId: varchar("wallet_id").references(() => wallets.id, { onDelete: "cascade" }).notNull(),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
      paymentMethod: varchar("payment_method").notNull(),
      // 'easypaisa', 'jazzcash', 'hbl'
      screenshotUrl: text("screenshot_url"),
      transactionId: varchar("transaction_id"),
      status: walletTopupStatusEnum("status").notNull().default("pending"),
      adminNote: text("admin_note"),
      processedBy: varchar("processed_by").references(() => adminUsers.id),
      processedAt: timestamp("processed_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    walletsRelations = relations(wallets, ({ one, many }) => ({
      user: one(users, {
        fields: [wallets.userId],
        references: [users.id]
      }),
      transactions: many(walletTransactions),
      topupRequests: many(walletTopupRequests)
    }));
    walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
      wallet: one(wallets, {
        fields: [walletTransactions.walletId],
        references: [wallets.id]
      })
    }));
    walletTopupRequestsRelations = relations(walletTopupRequests, ({ one }) => ({
      wallet: one(wallets, {
        fields: [walletTopupRequests.walletId],
        references: [wallets.id]
      }),
      user: one(users, {
        fields: [walletTopupRequests.userId],
        references: [users.id]
      }),
      processedByAdmin: one(adminUsers, {
        fields: [walletTopupRequests.processedBy],
        references: [adminUsers.id]
      })
    }));
    insertWalletSchema = createInsertSchema(wallets).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
      id: true,
      createdAt: true
    });
    insertWalletTopupRequestSchema = createInsertSchema(walletTopupRequests).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      processedAt: true
    });
    couponTypeEnum = pgEnum("coupon_type", [
      "percentage",
      // Discount as percentage
      "fixed"
      // Fixed amount discount
    ]);
    couponScopeEnum = pgEnum("coupon_scope", [
      "all",
      // Applies to all products
      "category",
      // Applies to specific categories
      "product"
      // Applies to specific products
    ]);
    coupons = pgTable("coupons", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      code: varchar("code").notNull().unique(),
      description: text("description"),
      type: couponTypeEnum("type").notNull(),
      value: decimal("value", { precision: 10, scale: 2 }).notNull(),
      // Percentage or fixed amount
      scope: couponScopeEnum("scope").notNull().default("all"),
      minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
      // Minimum order to apply
      maxDiscountAmount: decimal("max_discount_amount", { precision: 10, scale: 2 }),
      // Cap for percentage discounts
      usageLimit: integer("usage_limit"),
      // Total times coupon can be used
      usageCount: integer("usage_count").notNull().default(0),
      perUserLimit: integer("per_user_limit").default(1),
      // Times per user
      validFrom: timestamp("valid_from"),
      validUntil: timestamp("valid_until"),
      isActive: boolean("is_active").default(true),
      createdBy: varchar("created_by").references(() => adminUsers.id),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    couponCategories = pgTable("coupon_categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      couponId: varchar("coupon_id").references(() => coupons.id, { onDelete: "cascade" }).notNull(),
      categoryId: varchar("category_id").references(() => categories.id, { onDelete: "cascade" }).notNull()
    });
    couponProducts = pgTable("coupon_products", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      couponId: varchar("coupon_id").references(() => coupons.id, { onDelete: "cascade" }).notNull(),
      productId: varchar("product_id").references(() => products.id, { onDelete: "cascade" }).notNull()
    });
    couponRedemptions = pgTable("coupon_redemptions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      couponId: varchar("coupon_id").references(() => coupons.id, { onDelete: "cascade" }).notNull(),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      orderId: varchar("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
      discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
      redeemedAt: timestamp("redeemed_at").defaultNow()
    });
    couponsRelations = relations(coupons, ({ one, many }) => ({
      createdByAdmin: one(adminUsers, {
        fields: [coupons.createdBy],
        references: [adminUsers.id]
      }),
      categories: many(couponCategories),
      products: many(couponProducts),
      redemptions: many(couponRedemptions)
    }));
    couponCategoriesRelations = relations(couponCategories, ({ one }) => ({
      coupon: one(coupons, {
        fields: [couponCategories.couponId],
        references: [coupons.id]
      }),
      category: one(categories, {
        fields: [couponCategories.categoryId],
        references: [categories.id]
      })
    }));
    couponProductsRelations = relations(couponProducts, ({ one }) => ({
      coupon: one(coupons, {
        fields: [couponProducts.couponId],
        references: [coupons.id]
      }),
      product: one(products, {
        fields: [couponProducts.productId],
        references: [products.id]
      })
    }));
    couponRedemptionsRelations = relations(couponRedemptions, ({ one }) => ({
      coupon: one(coupons, {
        fields: [couponRedemptions.couponId],
        references: [coupons.id]
      }),
      user: one(users, {
        fields: [couponRedemptions.userId],
        references: [users.id]
      }),
      order: one(orders, {
        fields: [couponRedemptions.orderId],
        references: [orders.id]
      })
    }));
    insertCouponSchema = createInsertSchema(coupons).omit({
      id: true,
      usageCount: true,
      createdAt: true,
      updatedAt: true
    });
    insertCouponCategorySchema = createInsertSchema(couponCategories).omit({
      id: true
    });
    insertCouponProductSchema = createInsertSchema(couponProducts).omit({
      id: true
    });
    insertCouponRedemptionSchema = createInsertSchema(couponRedemptions).omit({
      id: true,
      redeemedAt: true
    });
    reviewStatusEnum = pgEnum("review_status", [
      "pending",
      // Awaiting moderation
      "approved",
      // Visible to customers
      "rejected"
      // Not displayed
    ]);
    productReviews = pgTable("product_reviews", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      productId: varchar("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
      userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
      orderId: varchar("order_id").references(() => orders.id),
      // Optional: link to verified purchase
      rating: integer("rating").notNull(),
      // 1-5 stars
      title: varchar("title"),
      comment: text("comment"),
      status: reviewStatusEnum("status").notNull().default("pending"),
      moderatedBy: varchar("moderated_by").references(() => adminUsers.id),
      moderatedAt: timestamp("moderated_at"),
      moderationNote: text("moderation_note"),
      isVerifiedPurchase: boolean("is_verified_purchase").default(false),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    productReviewsRelations = relations(productReviews, ({ one }) => ({
      product: one(products, {
        fields: [productReviews.productId],
        references: [products.id]
      }),
      user: one(users, {
        fields: [productReviews.userId],
        references: [users.id]
      }),
      order: one(orders, {
        fields: [productReviews.orderId],
        references: [orders.id]
      }),
      moderatedByAdmin: one(adminUsers, {
        fields: [productReviews.moderatedBy],
        references: [adminUsers.id]
      })
    }));
    insertProductReviewSchema = createInsertSchema(productReviews).omit({
      id: true,
      status: true,
      moderatedBy: true,
      moderatedAt: true,
      moderationNote: true,
      createdAt: true,
      updatedAt: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var connectionString, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, desc, and, ilike, isNull, sql as sql2, count } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // User operations (Internal Auth)
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
        return user;
      }
      async getUserByVerificationToken(token) {
        const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
        return user;
      }
      async createUser(userData) {
        const [user] = await db.insert(users).values({
          email: userData.email.toLowerCase(),
          passwordHash: userData.passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          mobile: userData.mobile,
          isActive: true,
          emailVerificationToken: userData.emailVerificationToken,
          emailVerificationExpires: userData.emailVerificationExpires
        }).returning();
        try {
          const customerName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.email;
          await this.createNotification({
            recipientType: "admin",
            type: "customer_registration",
            title: "New Customer Registration",
            message: `${customerName} has created an account.`,
            data: { userId: user.id, email: user.email }
          });
        } catch (notificationError) {
          console.error("Error creating customer registration notification:", notificationError);
        }
        return user;
      }
      async updateUser(id, data) {
        const [user] = await db.update(users).set({
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return user;
      }
      async getAllCustomers() {
        const result = await db.select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          mobile: users.mobile,
          shippingAddress: users.shippingAddress,
          profileImageUrl: users.profileImageUrl,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          emailVerified: users.emailVerified,
          emailVerificationToken: users.emailVerificationToken,
          emailVerificationExpires: users.emailVerificationExpires
        }).from(users).orderBy(desc(users.createdAt));
        return result;
      }
      // User address operations
      async getUserAddresses(userId) {
        return db.select().from(userAddresses).where(eq(userAddresses.userId, userId)).orderBy(desc(userAddresses.isDefault), desc(userAddresses.createdAt));
      }
      async createUserAddress(data) {
        if (data.isDefault) {
          await db.update(userAddresses).set({ isDefault: false }).where(eq(userAddresses.userId, data.userId));
        }
        const [addr] = await db.insert(userAddresses).values(data).returning();
        return addr;
      }
      async updateUserAddress(id, userId, data) {
        if (data.isDefault) {
          await db.update(userAddresses).set({ isDefault: false }).where(eq(userAddresses.userId, userId));
        }
        const [addr] = await db.update(userAddresses).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId))).returning();
        if (!addr) throw new Error("Address not found");
        return addr;
      }
      async deleteUserAddress(id, userId) {
        const result = await db.delete(userAddresses).where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)));
        return (result.rowCount ?? 0) > 0;
      }
      async setDefaultAddress(id, userId) {
        await db.update(userAddresses).set({ isDefault: false }).where(eq(userAddresses.userId, userId));
        await db.update(userAddresses).set({ isDefault: true, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(userAddresses.id, id), eq(userAddresses.userId, userId)));
      }
      async getAdminUserAddresses(userId) {
        return db.select().from(userAddresses).where(eq(userAddresses.userId, userId)).orderBy(desc(userAddresses.isDefault), desc(userAddresses.createdAt));
      }
      // Admin user operations
      async getAdminUser(id) {
        const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
        return user;
      }
      async getAdminUserByUsername(username) {
        const result = await db.select({
          id: adminUsers.id,
          username: adminUsers.username,
          email: adminUsers.email,
          passwordHash: adminUsers.passwordHash,
          role: adminUsers.role,
          roleId: adminUsers.roleId,
          profilePicture: adminUsers.profilePicture,
          isActive: adminUsers.isActive,
          lastLoginAt: adminUsers.lastLoginAt,
          createdAt: adminUsers.createdAt,
          updatedAt: adminUsers.updatedAt,
          roleData: roles
        }).from(adminUsers).leftJoin(roles, eq(adminUsers.roleId, roles.id)).where(eq(adminUsers.username, username));
        if (!result[0]) return void 0;
        return {
          ...result[0],
          roleData: result[0].roleData ?? void 0
        };
      }
      async getAdminUserByEmail(email) {
        const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
        return user;
      }
      async createAdminUser(userData) {
        const [user] = await db.insert(adminUsers).values(userData).returning();
        return user;
      }
      async getAdminUsers() {
        const result = await db.select({
          id: adminUsers.id,
          username: adminUsers.username,
          email: adminUsers.email,
          passwordHash: adminUsers.passwordHash,
          role: adminUsers.role,
          roleId: adminUsers.roleId,
          profilePicture: adminUsers.profilePicture,
          isActive: adminUsers.isActive,
          lastLoginAt: adminUsers.lastLoginAt,
          createdAt: adminUsers.createdAt,
          updatedAt: adminUsers.updatedAt,
          roleData: roles
        }).from(adminUsers).leftJoin(roles, eq(adminUsers.roleId, roles.id)).orderBy(desc(adminUsers.createdAt));
        return result.map((r) => ({
          ...r,
          roleData: r.roleData ?? void 0
        }));
      }
      async updateAdminUser(id, userData) {
        const [user] = await db.update(adminUsers).set({
          ...userData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(adminUsers.id, id)).returning();
        return user;
      }
      async updateAdminUserPassword(id, passwordHash) {
        const [user] = await db.update(adminUsers).set({
          passwordHash,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(adminUsers.id, id)).returning();
        return user;
      }
      async deleteAdminUser(id) {
        const result = await db.delete(adminUsers).where(eq(adminUsers.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async updateAdminUserLastLogin(id) {
        const [user] = await db.update(adminUsers).set({
          lastLoginAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(adminUsers.id, id)).returning();
        return user;
      }
      // Role operations
      async getRoles() {
        return await db.select().from(roles).orderBy(roles.name);
      }
      async getRole(id) {
        const [role] = await db.select().from(roles).where(eq(roles.id, id));
        return role;
      }
      async getRoleByName(name) {
        const [role] = await db.select().from(roles).where(eq(roles.name, name));
        return role;
      }
      async createRole(roleData) {
        const [role] = await db.insert(roles).values({
          name: roleData.name,
          displayName: roleData.displayName,
          permissions: roleData.permissions,
          description: roleData.description,
          isSystem: roleData.isSystem
        }).returning();
        return role;
      }
      async updateRole(id, roleData) {
        const updateData = { updatedAt: /* @__PURE__ */ new Date() };
        if (roleData.name !== void 0) updateData.name = roleData.name;
        if (roleData.displayName !== void 0) updateData.displayName = roleData.displayName;
        if (roleData.permissions !== void 0) updateData.permissions = roleData.permissions;
        if (roleData.description !== void 0) updateData.description = roleData.description;
        if (roleData.isSystem !== void 0) updateData.isSystem = roleData.isSystem;
        const [role] = await db.update(roles).set(updateData).where(eq(roles.id, id)).returning();
        return role;
      }
      async deleteRole(id) {
        const result = await db.delete(roles).where(eq(roles.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async initializeDefaultRoles() {
        const defaultRoles = [
          {
            name: "super_admin",
            displayName: "Super Admin",
            description: "Full access to all features",
            isSystem: true,
            permissions: {
              dashboard: true,
              products: { view: true, create: true, edit: true, delete: true },
              categories: { view: true, create: true, edit: true, delete: true },
              orders: { view: true, edit: true },
              customers: { view: true },
              inventory: { view: true, adjust: true },
              payments: { view: true, manage: true },
              users: { view: true, create: true, edit: true, delete: true },
              roles: { view: true, create: true, edit: true, delete: true },
              settings: { view: true, edit: true },
              chat: { view: true, respond: true }
            }
          },
          {
            name: "admin",
            displayName: "Admin",
            description: "Manage products, orders, and customers",
            isSystem: true,
            permissions: {
              dashboard: true,
              products: { view: true, create: true, edit: true, delete: true },
              categories: { view: true, create: true, edit: true, delete: true },
              orders: { view: true, edit: true },
              customers: { view: true },
              inventory: { view: true, adjust: true },
              payments: { view: true, manage: false },
              users: { view: false, create: false, edit: false, delete: false },
              roles: { view: false, create: false, edit: false, delete: false },
              settings: { view: true, edit: false },
              chat: { view: true, respond: true }
            }
          },
          {
            name: "manager",
            displayName: "Manager",
            description: "View and manage orders and inventory",
            isSystem: true,
            permissions: {
              dashboard: true,
              products: { view: true, create: false, edit: true, delete: false },
              categories: { view: true, create: false, edit: false, delete: false },
              orders: { view: true, edit: true },
              customers: { view: true },
              inventory: { view: true, adjust: true },
              payments: { view: true, manage: false },
              users: { view: false, create: false, edit: false, delete: false },
              roles: { view: false, create: false, edit: false, delete: false },
              settings: { view: false, edit: false }
            }
          },
          {
            name: "staff",
            displayName: "Staff",
            description: "View products and process orders",
            isSystem: true,
            permissions: {
              dashboard: true,
              products: { view: true, create: false, edit: false, delete: false },
              categories: { view: true, create: false, edit: false, delete: false },
              orders: { view: true, edit: true },
              customers: { view: true },
              inventory: { view: true, adjust: false },
              payments: { view: false, manage: false },
              users: { view: false, create: false, edit: false, delete: false },
              roles: { view: false, create: false, edit: false, delete: false },
              settings: { view: false, edit: false }
            }
          },
          {
            name: "chat_support",
            displayName: "Chat Support",
            description: "Handle customer chat support and live chat inquiries",
            isSystem: true,
            permissions: {
              dashboard: true,
              products: { view: true, create: false, edit: false, delete: false },
              categories: { view: true, create: false, edit: false, delete: false },
              orders: { view: true, edit: false },
              customers: { view: true },
              inventory: { view: false, adjust: false },
              payments: { view: false, manage: false },
              users: { view: false, create: false, edit: false, delete: false },
              roles: { view: false, create: false, edit: false, delete: false },
              settings: { view: false, edit: false },
              chat: { view: true, respond: true }
            }
          }
        ];
        for (const roleData of defaultRoles) {
          const existing = await this.getRoleByName(roleData.name);
          if (!existing) {
            await this.createRole(roleData);
          }
        }
      }
      // Category operations
      async getCategories() {
        return await db.select().from(categories).orderBy(categories.name);
      }
      async getFeaturedCategories() {
        return await db.select().from(categories).where(eq(categories.isFeatured, true)).orderBy(categories.name);
      }
      async getCategory(id) {
        const [category] = await db.select().from(categories).where(eq(categories.id, id));
        return category;
      }
      async createCategory(categoryData) {
        const [category] = await db.insert(categories).values(categoryData).returning();
        return category;
      }
      async updateCategory(id, categoryData) {
        const [category] = await db.update(categories).set(categoryData).where(eq(categories.id, id)).returning();
        return category;
      }
      async deleteCategory(id) {
        const result = await db.delete(categories).where(eq(categories.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Product operations
      async getProducts(filters) {
        const query = db.select().from(products).$dynamic();
        const conditions = [];
        if (filters?.categoryId) {
          conditions.push(eq(products.categoryId, filters.categoryId));
        }
        if (filters?.search) {
          conditions.push(ilike(products.name, `%${filters.search}%`));
        }
        if (filters?.isActive !== void 0) {
          conditions.push(eq(products.isActive, filters.isActive));
        }
        if (filters?.isFeatured !== void 0) {
          conditions.push(eq(products.isFeatured, filters.isFeatured));
        }
        let finalQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;
        finalQuery = finalQuery.orderBy(desc(products.createdAt));
        if (filters?.limit) {
          finalQuery = finalQuery.limit(filters.limit);
        }
        if (filters?.offset) {
          finalQuery = finalQuery.offset(filters.offset);
        }
        return await finalQuery;
      }
      async getProduct(id) {
        const [product] = await db.select().from(products).where(eq(products.id, id));
        return product;
      }
      async getProductBySlug(slug) {
        const [product] = await db.select().from(products).where(eq(products.slug, slug));
        return product;
      }
      // Generate unique slug for product
      async generateUniqueProductSlug(baseSlug, excludeId) {
        let slug = baseSlug;
        let counter = 1;
        while (true) {
          const existing = await this.getProductBySlug(slug);
          if (!existing || excludeId && existing.id === excludeId) {
            return slug;
          }
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
      async createProduct(productData) {
        const uniqueSlug = await this.generateUniqueProductSlug(productData.slug);
        const [product] = await db.insert(products).values({
          ...productData,
          slug: uniqueSlug,
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return product;
      }
      async updateProduct(id, productData) {
        const updateData = { ...productData, updatedAt: /* @__PURE__ */ new Date() };
        if (productData.slug) {
          updateData.slug = await this.generateUniqueProductSlug(productData.slug, id);
        }
        const [product] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
        return product;
      }
      async deleteProduct(id) {
        try {
          const result = await db.delete(products).where(eq(products.id, id));
          return { success: (result.rowCount ?? 0) > 0 };
        } catch (error) {
          if (error.code === "23503") {
            const [updated] = await db.update(products).set({ isActive: false }).where(eq(products.id, id)).returning();
            if (updated) {
              await db.delete(cartItems).where(eq(cartItems.productId, id));
              return { success: true, softDeleted: true };
            }
          }
          throw error;
        }
      }
      // Inventory management
      async reduceProductStock(productId, quantity) {
        const product = await this.getProduct(productId);
        if (!product) return null;
        const newStock = Math.max(0, product.stock - quantity);
        const [updatedProduct] = await db.update(products).set({
          stock: newStock,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(products.id, productId)).returning();
        return updatedProduct;
      }
      async increaseProductStock(productId, quantity) {
        const product = await this.getProduct(productId);
        if (!product) return null;
        const newStock = product.stock + quantity;
        const [updatedProduct] = await db.update(products).set({
          stock: newStock,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(products.id, productId)).returning();
        return updatedProduct;
      }
      // Order operations
      async cancelOrderAndRestoreInventory(orderId) {
        const orderWithItems = await this.getOrderWithItems(orderId);
        if (!orderWithItems) return null;
        for (const item of orderWithItems.items) {
          await this.increaseProductStock(item.productId, item.quantity);
        }
        const [cancelledOrder] = await db.update(orders).set({
          status: "cancelled",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(orders.id, orderId)).returning();
        return cancelledOrder;
      }
      async getOrders(userId, limit, offset) {
        const query = db.select().from(orders).$dynamic();
        let finalQuery = userId ? query.where(eq(orders.userId, userId)) : query;
        finalQuery = finalQuery.orderBy(desc(orders.createdAt));
        if (limit) {
          finalQuery = finalQuery.limit(limit);
        }
        if (offset) {
          finalQuery = finalQuery.offset(offset);
        }
        return await finalQuery;
      }
      async getOrder(id) {
        const [order] = await db.select().from(orders).where(eq(orders.id, id));
        return order;
      }
      async getOrderWithItems(id) {
        const order = await this.getOrder(id);
        if (!order) return void 0;
        const items = await this.getOrderItems(id);
        return { ...order, items };
      }
      async createOrder(orderData) {
        const orderNumber = `PKM-${Date.now()}`;
        const [order] = await db.insert(orders).values({
          ...orderData,
          orderNumber
        }).returning();
        return order;
      }
      async updateOrder(id, orderData) {
        const [order] = await db.update(orders).set({
          ...orderData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(orders.id, id)).returning();
        return order;
      }
      async getPendingOrdersCount() {
        const result = await db.select({ count: count() }).from(orders).where(eq(orders.status, "pending"));
        return result[0]?.count || 0;
      }
      async getCustomerPendingOrdersCount(userId) {
        const result = await db.select({ count: count() }).from(orders).where(and(eq(orders.userId, userId), eq(orders.status, "pending")));
        return result[0]?.count || 0;
      }
      // Order item operations
      async createOrderItem(orderItemData) {
        const [orderItem] = await db.insert(orderItems).values(orderItemData).returning();
        return orderItem;
      }
      async getOrderItems(orderId) {
        return await db.select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          price: orderItems.price,
          total: orderItems.total,
          product: products
        }).from(orderItems).innerJoin(products, eq(orderItems.productId, products.id)).where(eq(orderItems.orderId, orderId));
      }
      // Cart operations
      async getCartItems(userId) {
        return await db.select({
          id: cartItems.id,
          userId: cartItems.userId,
          productId: cartItems.productId,
          quantity: cartItems.quantity,
          createdAt: cartItems.createdAt,
          updatedAt: cartItems.updatedAt,
          product: products
        }).from(cartItems).innerJoin(products, eq(cartItems.productId, products.id)).where(eq(cartItems.userId, userId)).orderBy(desc(cartItems.createdAt));
      }
      async addToCart(cartItemData) {
        const [existingItem] = await db.select().from(cartItems).where(
          and(
            eq(cartItems.userId, cartItemData.userId),
            eq(cartItems.productId, cartItemData.productId)
          )
        );
        if (existingItem) {
          const [updatedItem] = await db.update(cartItems).set({
            quantity: existingItem.quantity + cartItemData.quantity,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(cartItems.id, existingItem.id)).returning();
          return updatedItem;
        } else {
          const [newItem] = await db.insert(cartItems).values(cartItemData).returning();
          return newItem;
        }
      }
      async updateCartItem(id, quantity) {
        const [cartItem] = await db.update(cartItems).set({
          quantity,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(cartItems.id, id)).returning();
        return cartItem;
      }
      async updateCartItemByProductId(userId, productId, quantity) {
        const [cartItem] = await db.update(cartItems).set({
          quantity,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(
          and(
            eq(cartItems.userId, userId),
            eq(cartItems.productId, productId)
          )
        ).returning();
        return cartItem;
      }
      async removeFromCart(id) {
        const result = await db.delete(cartItems).where(eq(cartItems.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async removeFromCartByProductId(userId, productId) {
        const result = await db.delete(cartItems).where(
          and(
            eq(cartItems.userId, userId),
            eq(cartItems.productId, productId)
          )
        );
        return (result.rowCount ?? 0) > 0;
      }
      async clearCart(userId) {
        const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
        return (result.rowCount ?? 0) >= 0;
      }
      // Wishlist operations
      async getWishlistItems(userId) {
        return await db.select({
          id: wishlistItems.id,
          userId: wishlistItems.userId,
          productId: wishlistItems.productId,
          createdAt: wishlistItems.createdAt,
          product: products
        }).from(wishlistItems).innerJoin(products, eq(wishlistItems.productId, products.id)).where(eq(wishlistItems.userId, userId)).orderBy(desc(wishlistItems.createdAt));
      }
      async addToWishlist(wishlistItemData) {
        const [existingItem] = await db.select().from(wishlistItems).where(
          and(
            eq(wishlistItems.userId, wishlistItemData.userId),
            eq(wishlistItems.productId, wishlistItemData.productId)
          )
        );
        if (existingItem) {
          return existingItem;
        }
        const [wishlistItem] = await db.insert(wishlistItems).values(wishlistItemData).returning();
        return wishlistItem;
      }
      async removeFromWishlist(userId, productId) {
        const result = await db.delete(wishlistItems).where(
          and(
            eq(wishlistItems.userId, userId),
            eq(wishlistItems.productId, productId)
          )
        );
        return (result.rowCount ?? 0) > 0;
      }
      async isInWishlist(userId, productId) {
        const [item] = await db.select().from(wishlistItems).where(
          and(
            eq(wishlistItems.userId, userId),
            eq(wishlistItems.productId, productId)
          )
        );
        return !!item;
      }
      async clearWishlist(userId) {
        const result = await db.delete(wishlistItems).where(eq(wishlistItems.userId, userId));
        return (result.rowCount ?? 0) >= 0;
      }
      // Payment gateway operations
      async getPaymentGateways() {
        return await db.select().from(paymentGateways).orderBy(paymentGateways.name);
      }
      async getPaymentGateway(id) {
        const [gateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.id, id));
        return gateway;
      }
      async getPaymentGatewayByName(name) {
        const [gateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.name, name));
        return gateway;
      }
      async createPaymentGateway(gatewayData) {
        const [gateway] = await db.insert(paymentGateways).values({
          ...gatewayData,
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return gateway;
      }
      async updatePaymentGateway(id, gatewayData) {
        const [gateway] = await db.update(paymentGateways).set({
          ...gatewayData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(paymentGateways.id, id)).returning();
        return gateway;
      }
      async deletePaymentGateway(id) {
        const result = await db.delete(paymentGateways).where(eq(paymentGateways.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Payment transaction operations
      async getPaymentTransactions(filters) {
        const query = db.select().from(paymentTransactions).$dynamic();
        const conditions = [];
        if (filters?.orderId) {
          conditions.push(eq(paymentTransactions.orderId, filters.orderId));
        }
        if (filters?.gatewayId) {
          conditions.push(eq(paymentTransactions.gatewayId, filters.gatewayId));
        }
        if (filters?.status) {
          conditions.push(eq(paymentTransactions.status, filters.status));
        }
        let finalQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;
        finalQuery = finalQuery.orderBy(desc(paymentTransactions.createdAt));
        if (filters?.limit) {
          finalQuery = finalQuery.limit(filters.limit);
        }
        if (filters?.offset) {
          finalQuery = finalQuery.offset(filters.offset);
        }
        return await finalQuery;
      }
      async getPaymentTransaction(id) {
        const [transaction] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id));
        return transaction;
      }
      async createPaymentTransaction(transactionData) {
        const [transaction] = await db.insert(paymentTransactions).values({
          ...transactionData,
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return transaction;
      }
      async updatePaymentTransaction(id, transactionData) {
        const [transaction] = await db.update(paymentTransactions).set({
          ...transactionData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(paymentTransactions.id, id)).returning();
        return transaction;
      }
      // Store settings operations (singleton pattern - always returns/updates single row)
      async getStoreSettings() {
        const [settings] = await db.select().from(storeSettings).limit(1);
        if (!settings) {
          const [newSettings] = await db.insert(storeSettings).values({}).returning();
          return newSettings;
        }
        return settings;
      }
      async updateStoreSettings(settingsData) {
        const existing = await this.getStoreSettings();
        const [updated] = await db.update(storeSettings).set({
          ...settingsData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(storeSettings.id, existing.id)).returning();
        return updated;
      }
      // Notification operations
      async getNotifications(recipientType, recipientId) {
        if (recipientId) {
          return await db.select().from(notifications).where(
            and(
              eq(notifications.recipientType, recipientType),
              eq(notifications.recipientId, recipientId)
            )
          ).orderBy(desc(notifications.createdAt)).limit(50);
        } else {
          return await db.select().from(notifications).where(eq(notifications.recipientType, recipientType)).orderBy(desc(notifications.createdAt)).limit(50);
        }
      }
      async getUnreadNotificationCount(recipientType, recipientId) {
        let query;
        if (recipientId) {
          query = await db.select().from(notifications).where(
            and(
              eq(notifications.recipientType, recipientType),
              eq(notifications.recipientId, recipientId),
              eq(notifications.isRead, false)
            )
          );
        } else {
          query = await db.select().from(notifications).where(
            and(
              eq(notifications.recipientType, recipientType),
              eq(notifications.isRead, false)
            )
          );
        }
        return query.length;
      }
      async createNotification(notification) {
        const [created] = await db.insert(notifications).values(notification).returning();
        return created;
      }
      async markNotificationAsRead(id) {
        const [updated] = await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id)).returning();
        return updated;
      }
      async markAllNotificationsAsRead(recipientType, recipientId) {
        if (recipientId) {
          await db.update(notifications).set({ isRead: true }).where(
            and(
              eq(notifications.recipientType, recipientType),
              eq(notifications.recipientId, recipientId)
            )
          );
        } else {
          await db.update(notifications).set({ isRead: true }).where(eq(notifications.recipientType, recipientType));
        }
      }
      async deleteNotification(id) {
        const result = await db.delete(notifications).where(eq(notifications.id, id));
        return true;
      }
      // Chat operations
      async getChatConversations(filters) {
        let conditions = [];
        if (filters?.status) {
          conditions.push(eq(chatConversations.status, filters.status));
        }
        if (filters?.assignedAgentId) {
          conditions.push(eq(chatConversations.assignedAgentId, filters.assignedAgentId));
        }
        if (filters?.unassigned) {
          conditions.push(isNull(chatConversations.assignedAgentId));
        }
        const conversations = await db.select().from(chatConversations).where(conditions.length > 0 ? and(...conditions) : void 0).orderBy(desc(chatConversations.lastMessageAt));
        const conversationsWithDetails = [];
        for (const conv of conversations) {
          const customer = await this.getUser(conv.customerId);
          const agent = conv.assignedAgentId ? await this.getAdminUser(conv.assignedAgentId) : null;
          const unreadCount = await this.getUnreadMessageCount(conv.id, "customer");
          if (customer) {
            conversationsWithDetails.push({
              ...conv,
              customer,
              assignedAgent: agent,
              unreadCount
            });
          }
        }
        return conversationsWithDetails;
      }
      async getChatConversation(id) {
        const [conversation] = await db.select().from(chatConversations).where(eq(chatConversations.id, id));
        if (!conversation) return void 0;
        const customer = await this.getUser(conversation.customerId);
        const agent = conversation.assignedAgentId ? await this.getAdminUser(conversation.assignedAgentId) : null;
        const messages = await this.getChatMessages(id);
        if (!customer) return void 0;
        return {
          ...conversation,
          customer,
          assignedAgent: agent,
          messages
        };
      }
      async getCustomerConversation(customerId) {
        const [conversation] = await db.select().from(chatConversations).where(
          and(
            eq(chatConversations.customerId, customerId),
            sql2`${chatConversations.status} IN ('open', 'in_progress')`
          )
        ).orderBy(desc(chatConversations.createdAt)).limit(1);
        return conversation;
      }
      async createChatConversation(conversation) {
        const [created] = await db.insert(chatConversations).values(conversation).returning();
        return created;
      }
      async updateChatConversation(id, data) {
        const [updated] = await db.update(chatConversations).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(chatConversations.id, id)).returning();
        return updated;
      }
      async assignChatAgent(conversationId, agentId) {
        const [updated] = await db.update(chatConversations).set({
          assignedAgentId: agentId,
          status: "in_progress",
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(chatConversations.id, conversationId)).returning();
        return updated;
      }
      // Chat message operations
      async getChatMessages(conversationId) {
        return db.select().from(chatMessages).where(eq(chatMessages.conversationId, conversationId)).orderBy(chatMessages.createdAt);
      }
      async createChatMessage(message) {
        const [created] = await db.insert(chatMessages).values(message).returning();
        await db.update(chatConversations).set({ lastMessageAt: /* @__PURE__ */ new Date() }).where(eq(chatConversations.id, message.conversationId));
        return created;
      }
      async getChatMessage(messageId) {
        const [msg] = await db.select().from(chatMessages).where(eq(chatMessages.id, messageId));
        return msg;
      }
      async updateChatMessageReactions(messageId, reactions) {
        const [updated] = await db.update(chatMessages).set({ reactions }).where(eq(chatMessages.id, messageId)).returning();
        return updated;
      }
      async markMessagesAsRead(conversationId, senderType) {
        await db.update(chatMessages).set({ isRead: true }).where(
          and(
            eq(chatMessages.conversationId, conversationId),
            eq(chatMessages.senderType, senderType)
          )
        );
      }
      async getUnreadMessageCount(conversationId, senderType) {
        const result = await db.select({ count: count() }).from(chatMessages).where(
          and(
            eq(chatMessages.conversationId, conversationId),
            eq(chatMessages.senderType, senderType),
            eq(chatMessages.isRead, false)
          )
        );
        return result[0]?.count || 0;
      }
      // Crypto payment operations
      async getCryptoPayments(orderId) {
        if (orderId) {
          return db.select().from(cryptoPayments).where(eq(cryptoPayments.orderId, orderId)).orderBy(desc(cryptoPayments.createdAt));
        }
        return db.select().from(cryptoPayments).orderBy(desc(cryptoPayments.createdAt));
      }
      async getCryptoPayment(id) {
        const [payment] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.id, id));
        return payment;
      }
      async getCryptoPaymentByOrderId(orderId) {
        const [payment] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.orderId, orderId));
        return payment;
      }
      async getCryptoPaymentByExternalId(externalOrderId) {
        const [payment] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.externalOrderId, externalOrderId));
        return payment;
      }
      async createCryptoPayment(payment) {
        const [created] = await db.insert(cryptoPayments).values(payment).returning();
        return created;
      }
      async updateCryptoPayment(id, data) {
        const [updated] = await db.update(cryptoPayments).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(cryptoPayments.id, id)).returning();
        return updated;
      }
      // Payment account operations (for manual payment verification)
      async getPaymentAccounts(activeOnly = false) {
        if (activeOnly) {
          return db.select().from(paymentAccounts).where(eq(paymentAccounts.isActive, true)).orderBy(paymentAccounts.method);
        }
        return db.select().from(paymentAccounts).orderBy(paymentAccounts.method);
      }
      async getPaymentAccount(id) {
        const [account] = await db.select().from(paymentAccounts).where(eq(paymentAccounts.id, id));
        return account;
      }
      async getPaymentAccountsByMethod(method) {
        return db.select().from(paymentAccounts).where(
          and(
            eq(paymentAccounts.method, method),
            eq(paymentAccounts.isActive, true)
          )
        );
      }
      async createPaymentAccount(account) {
        const [created] = await db.insert(paymentAccounts).values(account).returning();
        return created;
      }
      async updatePaymentAccount(id, data) {
        const [updated] = await db.update(paymentAccounts).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(paymentAccounts.id, id)).returning();
        return updated;
      }
      async deletePaymentAccount(id) {
        const result = await db.delete(paymentAccounts).where(eq(paymentAccounts.id, id));
        return true;
      }
      // Order verification operations
      async getOrdersPendingVerification() {
        return db.select().from(orders).where(
          and(
            eq(orders.verificationStatus, "pending"),
            sql2`${orders.paymentMethod} != 'cod'`,
            sql2`${orders.paymentMethod} != 'wallet'`
          )
        ).orderBy(desc(orders.createdAt));
      }
      async verifyOrderPayment(orderId, adminId, approved, note) {
        const verificationStatus = approved ? "approved" : "rejected";
        const paymentStatus = approved ? "completed" : "failed";
        const orderStatus = approved ? "processing" : "pending";
        const transactionStatus = approved ? "completed" : "failed";
        const [updated] = await db.update(orders).set({
          verificationStatus,
          paymentStatus,
          status: orderStatus,
          verifiedBy: adminId,
          verifiedAt: /* @__PURE__ */ new Date(),
          verificationNote: note,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(orders.id, orderId)).returning();
        const orderTransactions = await this.getPaymentTransactions({ orderId });
        for (const transaction of orderTransactions) {
          await this.updatePaymentTransaction(transaction.id, {
            status: transactionStatus
          });
        }
        const order = await this.getOrder(orderId);
        if (order) {
          await this.createNotification({
            recipientType: "customer",
            recipientId: order.userId,
            type: approved ? "payment_received" : "payment_failed",
            title: approved ? "Payment Verified" : "Payment Rejected",
            message: approved ? `Your payment for order #${order.orderNumber} has been verified.` : `Your payment for order #${order.orderNumber} was rejected. ${note || "Please contact support."}`,
            data: { orderId: order.id, orderNumber: order.orderNumber }
          });
        }
        return updated;
      }
      // ==================== TEAM CHAT OPERATIONS ====================
      async getTeamChatConversations(userId) {
        const userParticipations = await db.select().from(teamChatParticipants).where(eq(teamChatParticipants.adminUserId, userId));
        const conversationIds = userParticipations.map((p) => p.conversationId);
        if (conversationIds.length === 0) {
          return [];
        }
        const conversations = await db.select().from(teamChatConversations).where(sql2`${teamChatConversations.id} IN (${sql2.join(conversationIds.map((id) => sql2`${id}`), sql2`, `)})`).orderBy(desc(teamChatConversations.lastMessageAt));
        const conversationsWithDetails = [];
        for (const conv of conversations) {
          const participants = await this.getTeamChatParticipants(conv.id);
          const [lastMessage] = await db.select().from(teamChatMessages).where(eq(teamChatMessages.conversationId, conv.id)).orderBy(desc(teamChatMessages.createdAt)).limit(1);
          const userParticipant = userParticipations.find((p) => p.conversationId === conv.id);
          let unreadCount = 0;
          if (userParticipant) {
            const result = await db.select({ count: count() }).from(teamChatMessages).where(
              and(
                eq(teamChatMessages.conversationId, conv.id),
                userParticipant.lastReadMessageId ? sql2`${teamChatMessages.createdAt} > (SELECT created_at FROM team_chat_messages WHERE id = ${userParticipant.lastReadMessageId})` : sql2`1=1`
              )
            );
            unreadCount = result[0]?.count || 0;
          }
          let createdBy = null;
          if (conv.createdById) {
            createdBy = await this.getAdminUser(conv.createdById);
          }
          conversationsWithDetails.push({
            ...conv,
            createdBy: createdBy || null,
            participants,
            lastMessage: lastMessage || null,
            unreadCount
          });
        }
        return conversationsWithDetails;
      }
      async getTeamChatConversation(id) {
        const [conv] = await db.select().from(teamChatConversations).where(eq(teamChatConversations.id, id));
        if (!conv) return void 0;
        const participants = await this.getTeamChatParticipants(id);
        let createdBy = null;
        if (conv.createdById) {
          createdBy = await this.getAdminUser(conv.createdById);
        }
        const [lastMessage] = await db.select().from(teamChatMessages).where(eq(teamChatMessages.conversationId, id)).orderBy(desc(teamChatMessages.createdAt)).limit(1);
        return {
          ...conv,
          createdBy: createdBy || null,
          participants,
          lastMessage: lastMessage || null,
          unreadCount: 0
        };
      }
      async findDirectConversation(userId1, userId2) {
        const user1Convs = await db.select({ conversationId: teamChatParticipants.conversationId }).from(teamChatParticipants).where(eq(teamChatParticipants.adminUserId, userId1));
        for (const { conversationId } of user1Convs) {
          const [conv] = await db.select().from(teamChatConversations).where(and(
            eq(teamChatConversations.id, conversationId),
            eq(teamChatConversations.type, "direct")
          ));
          if (conv) {
            const [participant] = await db.select().from(teamChatParticipants).where(and(
              eq(teamChatParticipants.conversationId, conversationId),
              eq(teamChatParticipants.adminUserId, userId2)
            ));
            if (participant) {
              return conv;
            }
          }
        }
        return void 0;
      }
      async createTeamChatConversation(conversation) {
        const [created] = await db.insert(teamChatConversations).values(conversation).returning();
        return created;
      }
      async updateTeamChatConversation(id, data) {
        const [updated] = await db.update(teamChatConversations).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(teamChatConversations.id, id)).returning();
        return updated;
      }
      async deleteTeamChatConversation(id) {
        await db.delete(teamChatConversations).where(eq(teamChatConversations.id, id));
        return true;
      }
      // Team chat participant operations
      async addTeamChatParticipant(participant) {
        const [created] = await db.insert(teamChatParticipants).values(participant).returning();
        return created;
      }
      async removeTeamChatParticipant(conversationId, userId) {
        await db.delete(teamChatParticipants).where(
          and(
            eq(teamChatParticipants.conversationId, conversationId),
            eq(teamChatParticipants.adminUserId, userId)
          )
        );
        return true;
      }
      async getTeamChatParticipants(conversationId) {
        const participants = await db.select().from(teamChatParticipants).where(eq(teamChatParticipants.conversationId, conversationId));
        const result = [];
        for (const p of participants) {
          const adminUser = await this.getAdminUser(p.adminUserId);
          if (adminUser) {
            result.push({ ...p, adminUser });
          }
        }
        return result;
      }
      async updateTeamChatParticipant(id, data) {
        const [updated] = await db.update(teamChatParticipants).set(data).where(eq(teamChatParticipants.id, id)).returning();
        return updated;
      }
      async isTeamChatParticipant(conversationId, userId) {
        const [participant] = await db.select().from(teamChatParticipants).where(and(
          eq(teamChatParticipants.conversationId, conversationId),
          eq(teamChatParticipants.adminUserId, userId)
        ));
        return !!participant;
      }
      // Team chat message operations
      async getTeamChatMessages(conversationId, limit = 50, before) {
        let conditions = [eq(teamChatMessages.conversationId, conversationId)];
        if (before) {
          conditions.push(sql2`${teamChatMessages.createdAt} < (SELECT created_at FROM team_chat_messages WHERE id = ${before})`);
        }
        const messages = await db.select().from(teamChatMessages).where(and(...conditions)).orderBy(desc(teamChatMessages.createdAt)).limit(limit);
        messages.reverse();
        const result = [];
        for (const msg of messages) {
          let sender = null;
          if (msg.senderId) {
            sender = await this.getAdminUser(msg.senderId);
          }
          result.push({ ...msg, sender: sender || null });
        }
        return result;
      }
      async createTeamChatMessage(message) {
        const [created] = await db.insert(teamChatMessages).values({
          ...message,
          attachments: message.attachments
        }).returning();
        await db.update(teamChatConversations).set({ lastMessageAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq(teamChatConversations.id, message.conversationId));
        return created;
      }
      async updateTeamChatMessage(id, message) {
        const [updated] = await db.update(teamChatMessages).set({ message, isEdited: true, editedAt: /* @__PURE__ */ new Date() }).where(eq(teamChatMessages.id, id)).returning();
        return updated;
      }
      async deleteTeamChatMessage(id) {
        await db.delete(teamChatMessages).where(eq(teamChatMessages.id, id));
        return true;
      }
      async markTeamChatMessagesRead(conversationId, userId, lastMessageId) {
        await db.update(teamChatParticipants).set({ lastReadMessageId: lastMessageId }).where(and(
          eq(teamChatParticipants.conversationId, conversationId),
          eq(teamChatParticipants.adminUserId, userId)
        ));
      }
      async getTeamChatUnreadCount(userId) {
        const userParticipations = await db.select().from(teamChatParticipants).where(eq(teamChatParticipants.adminUserId, userId));
        let totalUnread = 0;
        for (const participation of userParticipations) {
          if (participation.lastReadMessageId) {
            const result = await db.select({ count: count() }).from(teamChatMessages).where(
              and(
                eq(teamChatMessages.conversationId, participation.conversationId),
                sql2`${teamChatMessages.createdAt} > (SELECT created_at FROM team_chat_messages WHERE id = ${participation.lastReadMessageId})`
              )
            );
            totalUnread += result[0]?.count || 0;
          } else {
            const result = await db.select({ count: count() }).from(teamChatMessages).where(eq(teamChatMessages.conversationId, participation.conversationId));
            totalUnread += result[0]?.count || 0;
          }
        }
        return totalUnread;
      }
      // ==================== WALLET OPERATIONS ====================
      async getWallet(id) {
        const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
        return wallet;
      }
      async getWalletByUserId(userId) {
        const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
        return wallet;
      }
      async createWallet(userId) {
        const [wallet] = await db.insert(wallets).values({ userId, balance: "0" }).returning();
        return wallet;
      }
      async updateWalletBalance(walletId, newBalance) {
        const [updated] = await db.update(wallets).set({ balance: newBalance, updatedAt: /* @__PURE__ */ new Date() }).where(eq(wallets.id, walletId)).returning();
        return updated;
      }
      async getAllWallets() {
        const result = await db.select().from(wallets).leftJoin(users, eq(wallets.userId, users.id)).orderBy(desc(wallets.updatedAt));
        return result.map((r) => ({
          ...r.wallets,
          user: r.users
        }));
      }
      // Wallet transaction operations
      async getWalletTransactions(walletId, limit = 50) {
        return db.select().from(walletTransactions).where(eq(walletTransactions.walletId, walletId)).orderBy(desc(walletTransactions.createdAt)).limit(limit);
      }
      async createWalletTransaction(transaction) {
        const [created] = await db.insert(walletTransactions).values(transaction).returning();
        return created;
      }
      // Wallet topup request operations
      async getWalletTopupRequests(status) {
        let query = db.select().from(walletTopupRequests).leftJoin(users, eq(walletTopupRequests.userId, users.id)).leftJoin(adminUsers, eq(walletTopupRequests.processedBy, adminUsers.id)).orderBy(desc(walletTopupRequests.createdAt));
        const result = status ? await query.where(eq(walletTopupRequests.status, status)) : await query;
        return result.map((r) => ({
          ...r.wallet_topup_requests,
          user: r.users,
          processedByAdmin: r.admin_users || null
        }));
      }
      async getWalletTopupRequest(id) {
        const [result] = await db.select().from(walletTopupRequests).leftJoin(users, eq(walletTopupRequests.userId, users.id)).leftJoin(adminUsers, eq(walletTopupRequests.processedBy, adminUsers.id)).where(eq(walletTopupRequests.id, id));
        if (!result) return void 0;
        return {
          ...result.wallet_topup_requests,
          user: result.users,
          processedByAdmin: result.admin_users || null
        };
      }
      async getUserTopupRequests(userId) {
        return db.select().from(walletTopupRequests).where(eq(walletTopupRequests.userId, userId)).orderBy(desc(walletTopupRequests.createdAt));
      }
      async createWalletTopupRequest(request) {
        const [created] = await db.insert(walletTopupRequests).values(request).returning();
        return created;
      }
      async processWalletTopupRequest(id, adminId, approved, note) {
        const [updated] = await db.update(walletTopupRequests).set({
          status: approved ? "approved" : "rejected",
          processedBy: adminId,
          processedAt: /* @__PURE__ */ new Date(),
          adminNote: note,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(walletTopupRequests.id, id)).returning();
        return updated;
      }
      async getPendingTopupRequestsCount() {
        const result = await db.select({ count: count() }).from(walletTopupRequests).where(eq(walletTopupRequests.status, "pending"));
        return result[0]?.count || 0;
      }
      // ==================== COUPON OPERATIONS ====================
      async getCoupons() {
        return db.select().from(coupons).orderBy(desc(coupons.createdAt));
      }
      async getCoupon(id) {
        const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
        if (!coupon) return void 0;
        const cats = await db.select().from(couponCategories).where(eq(couponCategories.couponId, id));
        const prods = await db.select().from(couponProducts).where(eq(couponProducts.couponId, id));
        const redemps = await db.select().from(couponRedemptions).where(eq(couponRedemptions.couponId, id));
        return { ...coupon, categories: cats, products: prods, redemptions: redemps };
      }
      async getCouponByCode(code) {
        const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase()));
        if (!coupon) return void 0;
        const cats = await db.select().from(couponCategories).where(eq(couponCategories.couponId, coupon.id));
        const prods = await db.select().from(couponProducts).where(eq(couponProducts.couponId, coupon.id));
        return { ...coupon, categories: cats, products: prods };
      }
      async createCoupon(coupon) {
        const [created] = await db.insert(coupons).values({
          ...coupon,
          code: coupon.code.toUpperCase()
        }).returning();
        return created;
      }
      async updateCoupon(id, coupon) {
        const updateData = { ...coupon, updatedAt: /* @__PURE__ */ new Date() };
        if (coupon.code) updateData.code = coupon.code.toUpperCase();
        const [updated] = await db.update(coupons).set(updateData).where(eq(coupons.id, id)).returning();
        return updated;
      }
      async deleteCoupon(id) {
        const result = await db.delete(coupons).where(eq(coupons.id, id));
        return true;
      }
      async setCouponCategories(couponId, categoryIds) {
        await db.delete(couponCategories).where(eq(couponCategories.couponId, couponId));
        if (categoryIds.length > 0) {
          await db.insert(couponCategories).values(
            categoryIds.map((categoryId) => ({ couponId, categoryId }))
          );
        }
      }
      async setCouponProducts(couponId, productIds) {
        await db.delete(couponProducts).where(eq(couponProducts.couponId, couponId));
        if (productIds.length > 0) {
          await db.insert(couponProducts).values(
            productIds.map((productId) => ({ couponId, productId }))
          );
        }
      }
      async getCouponRedemptionsByUser(couponId, userId) {
        return db.select().from(couponRedemptions).where(
          and(eq(couponRedemptions.couponId, couponId), eq(couponRedemptions.userId, userId))
        );
      }
      async createCouponRedemption(redemption) {
        const [created] = await db.insert(couponRedemptions).values(redemption).returning();
        return created;
      }
      async incrementCouponUsage(couponId) {
        await db.update(coupons).set({
          usageCount: sql2`${coupons.usageCount} + 1`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(coupons.id, couponId));
      }
      // ==================== PRODUCT REVIEW OPERATIONS ====================
      async getProductReviews(productId, status) {
        const conditions = [eq(productReviews.productId, productId)];
        if (status) {
          conditions.push(eq(productReviews.status, status));
        }
        const results = await db.select().from(productReviews).leftJoin(users, eq(productReviews.userId, users.id)).where(and(...conditions)).orderBy(desc(productReviews.createdAt));
        return results.map((r) => ({
          ...r.product_reviews,
          user: r.users ? {
            id: r.users.id,
            firstName: r.users.firstName,
            lastName: r.users.lastName,
            email: r.users.email
          } : void 0
        }));
      }
      async getAllReviews(status) {
        const baseQuery = db.select().from(productReviews).leftJoin(users, eq(productReviews.userId, users.id)).leftJoin(products, eq(productReviews.productId, products.id)).orderBy(desc(productReviews.createdAt));
        const results = status ? await baseQuery.where(eq(productReviews.status, status)) : await baseQuery;
        return results.map((r) => ({
          ...r.product_reviews,
          user: r.users ? {
            id: r.users.id,
            firstName: r.users.firstName,
            lastName: r.users.lastName,
            email: r.users.email
          } : void 0,
          product: r.products || void 0
        }));
      }
      async getReview(id) {
        const [result] = await db.select().from(productReviews).leftJoin(users, eq(productReviews.userId, users.id)).leftJoin(products, eq(productReviews.productId, products.id)).where(eq(productReviews.id, id));
        if (!result) return void 0;
        return {
          ...result.product_reviews,
          user: result.users ? {
            id: result.users.id,
            firstName: result.users.firstName,
            lastName: result.users.lastName,
            email: result.users.email
          } : void 0,
          product: result.products || void 0
        };
      }
      async getUserReviewForProduct(userId, productId) {
        const [review] = await db.select().from(productReviews).where(and(eq(productReviews.userId, userId), eq(productReviews.productId, productId)));
        return review;
      }
      async hasUserPurchasedProduct(userId, productId) {
        const result = await db.select({ count: count() }).from(orders).innerJoin(orderItems, eq(orders.id, orderItems.orderId)).where(
          and(
            eq(orders.userId, userId),
            eq(orderItems.productId, productId),
            eq(orders.status, "delivered")
          )
        );
        return (result[0]?.count || 0) > 0;
      }
      async createReview(review) {
        const [created] = await db.insert(productReviews).values(review).returning();
        return created;
      }
      async updateReview(id, review) {
        const [updated] = await db.update(productReviews).set({ ...review, updatedAt: /* @__PURE__ */ new Date() }).where(eq(productReviews.id, id)).returning();
        return updated;
      }
      async moderateReview(id, adminId, status, note) {
        const [updated] = await db.update(productReviews).set({
          status,
          moderatedBy: adminId,
          moderatedAt: /* @__PURE__ */ new Date(),
          moderationNote: note,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(productReviews.id, id)).returning();
        await this.updateProductRating(updated.productId);
        return updated;
      }
      async deleteReview(id) {
        const [review] = await db.select().from(productReviews).where(eq(productReviews.id, id));
        if (!review) return false;
        await db.delete(productReviews).where(eq(productReviews.id, id));
        await this.updateProductRating(review.productId);
        return true;
      }
      async updateProductRating(productId) {
        const result = await db.select({
          avgRating: sql2`AVG(${productReviews.rating})`,
          count: count()
        }).from(productReviews).where(and(eq(productReviews.productId, productId), eq(productReviews.status, "approved")));
        const avgRating = result[0]?.avgRating ? parseFloat(result[0].avgRating).toFixed(2) : "0";
        const ratingCount = result[0]?.count || 0;
        await db.update(products).set({
          ratingAverage: avgRating,
          ratingCount,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(products.id, productId));
      }
      async getPendingReviewsCount() {
        const result = await db.select({ count: count() }).from(productReviews).where(eq(productReviews.status, "pending"));
        return result[0]?.count || 0;
      }
      // Supplier operations
      async getSuppliers() {
        return db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
      }
      async getSupplier(id) {
        const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
        return supplier;
      }
      async createSupplier(supplier) {
        const [created] = await db.insert(suppliers).values(supplier).returning();
        return created;
      }
      async updateSupplier(id, supplier) {
        const [updated] = await db.update(suppliers).set({ ...supplier, updatedAt: /* @__PURE__ */ new Date() }).where(eq(suppliers.id, id)).returning();
        return updated;
      }
      async deleteSupplier(id) {
        await db.delete(suppliers).where(eq(suppliers.id, id));
        return true;
      }
      // Purchase operations
      async getPurchases() {
        const purchaseList = await db.select().from(purchases).orderBy(desc(purchases.createdAt));
        const result = await Promise.all(purchaseList.map(async (purchase) => {
          let supplier;
          if (purchase.supplierId) {
            const [s] = await db.select().from(suppliers).where(eq(suppliers.id, purchase.supplierId));
            supplier = s;
          }
          const itemCountResult = await db.select({ count: count() }).from(purchaseItems).where(eq(purchaseItems.purchaseId, purchase.id));
          return {
            ...purchase,
            supplier,
            itemCount: itemCountResult[0]?.count || 0
          };
        }));
        return result;
      }
      async getPurchase(id) {
        const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
        if (!purchase) return void 0;
        let supplier;
        if (purchase.supplierId) {
          const [s] = await db.select().from(suppliers).where(eq(suppliers.id, purchase.supplierId));
          supplier = s;
        }
        const items = await db.select().from(purchaseItems).where(eq(purchaseItems.purchaseId, id));
        const itemsWithProducts = await Promise.all(items.map(async (item) => {
          const [product] = await db.select().from(products).where(eq(products.id, item.productId));
          return { ...item, product };
        }));
        return { ...purchase, supplier, items: itemsWithProducts };
      }
      async createPurchase(purchase, items, adminId) {
        const purchaseNumber = `PO-${Date.now().toString(36).toUpperCase()}`;
        const subtotal = items.reduce((sum, item) => sum + parseFloat(item.costPrice) * item.quantity, 0);
        const total = subtotal + parseFloat(purchase.shippingCost || "0") + parseFloat(purchase.otherCosts || "0");
        const [created] = await db.insert(purchases).values({
          ...purchase,
          purchaseNumber,
          subtotal: subtotal.toString(),
          total: total.toString(),
          createdBy: adminId
        }).returning();
        for (const item of items) {
          await db.insert(purchaseItems).values({
            purchaseId: created.id,
            productId: item.productId,
            quantity: item.quantity,
            costPrice: item.costPrice,
            total: (parseFloat(item.costPrice) * item.quantity).toString()
          });
        }
        return created;
      }
      async updatePurchase(id, purchase) {
        const [updated] = await db.update(purchases).set({ ...purchase, updatedAt: /* @__PURE__ */ new Date() }).where(eq(purchases.id, id)).returning();
        return updated;
      }
      async updatePurchaseStatus(id, status) {
        const updateData = { status, updatedAt: /* @__PURE__ */ new Date() };
        if (status === "received") {
          updateData.receivedDate = /* @__PURE__ */ new Date();
        }
        const [updated] = await db.update(purchases).set(updateData).where(eq(purchases.id, id)).returning();
        return updated;
      }
      async receivePurchase(id, receivedItems, adminId) {
        const purchase = await this.getPurchase(id);
        if (!purchase) throw new Error("Purchase not found");
        let allReceived = true;
        let anyReceived = false;
        for (const receivedItem of receivedItems) {
          const purchaseItem = purchase.items.find((i) => i.id === receivedItem.purchaseItemId);
          if (!purchaseItem) continue;
          const newReceivedQty = (purchaseItem.receivedQuantity || 0) + receivedItem.receivedQuantity;
          await db.update(purchaseItems).set({ receivedQuantity: newReceivedQty }).where(eq(purchaseItems.id, receivedItem.purchaseItemId));
          if (receivedItem.receivedQuantity > 0 && purchaseItem.product) {
            const newStock = purchaseItem.product.stock + receivedItem.receivedQuantity;
            await this.adjustProductStock(
              purchaseItem.productId,
              newStock,
              "purchase",
              `Received from purchase ${purchase.purchaseNumber}`,
              adminId,
              id,
              "purchase"
            );
            if (purchaseItem.costPrice) {
              await db.update(products).set({ costPrice: purchaseItem.costPrice, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, purchaseItem.productId));
            }
          }
          if (newReceivedQty < purchaseItem.quantity) {
            allReceived = false;
          }
          if (newReceivedQty > 0) {
            anyReceived = true;
          }
        }
        let newStatus = "ordered";
        if (allReceived) {
          newStatus = "received";
        } else if (anyReceived) {
          newStatus = "partially_received";
        }
        return this.updatePurchaseStatus(id, newStatus);
      }
      async deletePurchase(id) {
        await db.delete(purchaseItems).where(eq(purchaseItems.purchaseId, id));
        await db.delete(purchases).where(eq(purchases.id, id));
        return true;
      }
      // Stock adjustment operations
      async getStockAdjustments(productId) {
        let query = db.select().from(stockAdjustments).orderBy(desc(stockAdjustments.createdAt));
        let adjustments;
        if (productId) {
          adjustments = await db.select().from(stockAdjustments).where(eq(stockAdjustments.productId, productId)).orderBy(desc(stockAdjustments.createdAt));
        } else {
          adjustments = await db.select().from(stockAdjustments).orderBy(desc(stockAdjustments.createdAt));
        }
        const result = await Promise.all(adjustments.map(async (adj) => {
          const [product] = await db.select().from(products).where(eq(products.id, adj.productId));
          return { ...adj, product };
        }));
        return result;
      }
      async createStockAdjustment(adjustment, adminId) {
        const [created] = await db.insert(stockAdjustments).values({
          ...adjustment,
          createdBy: adminId
        }).returning();
        return created;
      }
      async adjustProductStock(productId, newStock, type, reason, adminId, referenceId, referenceType) {
        const [product] = await db.select().from(products).where(eq(products.id, productId));
        if (!product) throw new Error("Product not found");
        const previousStock = product.stock;
        const [updated] = await db.update(products).set({ stock: newStock, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, productId)).returning();
        await this.createStockAdjustment({
          productId,
          previousStock,
          newStock,
          adjustmentType: type,
          reason,
          referenceId,
          referenceType
        }, adminId);
        const threshold = product.lowStockThreshold || 10;
        if (newStock <= threshold && newStock > 0 && previousStock > threshold) {
          await this.createNotification({
            recipientType: "admin",
            type: "low_stock",
            title: "Low Stock Alert",
            message: `${product.name} is running low on stock (${newStock} remaining).`,
            data: { productId, stock: newStock, threshold }
          });
        } else if (newStock === 0 && previousStock > 0) {
          await this.createNotification({
            recipientType: "admin",
            type: "low_stock",
            title: "Out of Stock Alert",
            message: `${product.name} is now out of stock.`,
            data: { productId, stock: 0 }
          });
        }
        return updated;
      }
      // Inventory & profit analytics
      async getLowStockProducts() {
        return db.select().from(products).where(sql2`${products.stock} <= COALESCE(${products.lowStockThreshold}, 10) AND ${products.isActive} = true`).orderBy(products.stock);
      }
      async getInventorySummary() {
        const allProducts = await db.select().from(products).where(eq(products.isActive, true));
        let totalStock = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let totalValue = 0;
        let totalCostValue = 0;
        for (const product of allProducts) {
          totalStock += product.stock;
          const threshold = product.lowStockThreshold || 10;
          if (product.stock === 0) {
            outOfStockCount++;
          } else if (product.stock <= threshold) {
            lowStockCount++;
          }
          totalValue += parseFloat(product.price) * product.stock;
          if (product.costPrice) {
            totalCostValue += parseFloat(product.costPrice) * product.stock;
          }
        }
        return {
          totalProducts: allProducts.length,
          totalStock,
          lowStockCount,
          outOfStockCount,
          totalValue,
          totalCostValue
        };
      }
      async getProfitAnalytics(startDate, endDate) {
        let ordersQuery = db.select().from(orders).where(eq(orders.status, "delivered"));
        const deliveredOrders = await ordersQuery;
        const filteredOrders = deliveredOrders.filter((order) => {
          if (!order.createdAt) return true;
          const orderDate = new Date(order.createdAt);
          if (startDate && orderDate < startDate) return false;
          if (endDate && orderDate > endDate) return false;
          return true;
        });
        let totalRevenue = 0;
        let totalCost = 0;
        const productProfits = /* @__PURE__ */ new Map();
        for (const order of filteredOrders) {
          totalRevenue += parseFloat(order.total);
          const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
          for (const item of items) {
            const [product] = await db.select().from(products).where(eq(products.id, item.productId));
            if (product) {
              const costPrice = product.costPrice ? parseFloat(product.costPrice) : 0;
              const itemCost = costPrice * item.quantity;
              const itemProfit = parseFloat(item.total) - itemCost;
              totalCost += itemCost;
              const existing = productProfits.get(product.id);
              if (existing) {
                existing.profit += itemProfit;
                existing.quantity += item.quantity;
              } else {
                productProfits.set(product.id, { product, profit: itemProfit, quantity: item.quantity });
              }
            }
          }
        }
        const profit = totalRevenue - totalCost;
        const margin = totalRevenue > 0 ? profit / totalRevenue * 100 : 0;
        const topProfitProducts = Array.from(productProfits.values()).sort((a, b) => b.profit - a.profit).slice(0, 10);
        return {
          totalRevenue,
          totalCost,
          profit,
          margin,
          orderCount: filteredOrders.length,
          topProfitProducts
        };
      }
      async getBalanceSheet(startDate, endDate) {
        let prevStartDate;
        let prevEndDate;
        if (startDate && endDate) {
          const periodDuration = endDate.getTime() - startDate.getTime();
          prevStartDate = new Date(startDate.getTime() - periodDuration);
          prevEndDate = new Date(startDate.getTime());
        }
        const dateConditions = [];
        if (startDate && endDate && prevStartDate) {
          dateConditions.push(
            sql2`${orders.createdAt} >= ${prevStartDate} AND ${orders.createdAt} <= ${endDate}`
          );
        } else if (startDate) {
          dateConditions.push(sql2`${orders.createdAt} >= ${startDate}`);
        } else if (endDate) {
          dateConditions.push(sql2`${orders.createdAt} <= ${endDate}`);
        }
        let allOrders;
        if (dateConditions.length > 0) {
          allOrders = await db.select().from(orders).where(and(...dateConditions));
        } else {
          allOrders = await db.select().from(orders);
        }
        const filteredOrders = allOrders.filter((order) => {
          if (!startDate && !endDate) return true;
          if (!order.createdAt) return true;
          const orderDate = new Date(order.createdAt);
          if (startDate && orderDate < startDate) return false;
          if (endDate && orderDate > endDate) return false;
          return true;
        });
        const prevPeriodOrders = startDate && endDate && prevStartDate && prevEndDate ? allOrders.filter((order) => {
          if (!order.createdAt) return false;
          const orderDate = new Date(order.createdAt);
          return orderDate >= prevStartDate && orderDate < prevEndDate && order.paymentStatus === "completed";
        }) : [];
        const allProducts = await db.select().from(products);
        const productCostMap = /* @__PURE__ */ new Map();
        allProducts.forEach((p) => {
          productCostMap.set(p.id, p.costPrice ? parseFloat(p.costPrice) : 0);
        });
        const inventoryValue = allProducts.filter((p) => p.isActive).reduce((sum, p) => {
          const costPrice = productCostMap.get(p.id) || 0;
          return sum + costPrice * p.stock;
        }, 0);
        const completedOrders = filteredOrders.filter((o) => o.paymentStatus === "completed");
        const cashFromOrders = completedOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
        const pendingPaymentOrders = filteredOrders.filter((o) => o.paymentStatus === "pending" || o.paymentStatus === "processing");
        const pendingPayments = pendingPaymentOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
        const totalAssets = cashFromOrders + inventoryValue + pendingPayments;
        const [allWallets, pendingTopupRequests] = await Promise.all([
          db.select().from(wallets),
          db.select().from(walletTopupRequests).where(eq(walletTopupRequests.status, "pending"))
        ]);
        const customerWalletBalances = allWallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);
        const refundedOrders = filteredOrders.filter((o) => o.status === "refunded" && o.paymentStatus !== "refunded");
        const pendingRefunds = refundedOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
        const pendingTopups = pendingTopupRequests.reduce((sum, r) => sum + parseFloat(r.amount), 0);
        const totalLiabilities = customerWalletBalances + pendingRefunds + pendingTopups;
        const allCompletedOrderIds = [...completedOrders.map((o) => o.id), ...prevPeriodOrders.map((o) => o.id)];
        let allOrderItems = [];
        if (allCompletedOrderIds.length > 0) {
          allOrderItems = await db.select({
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity
          }).from(orderItems).where(sql2`${orderItems.orderId} IN (${sql2.join(allCompletedOrderIds.map((id) => sql2`${id}`), sql2`, `)})`);
        }
        const orderItemsMap = /* @__PURE__ */ new Map();
        allOrderItems.forEach((item) => {
          const existing = orderItemsMap.get(item.orderId) || [];
          existing.push({ productId: item.productId, quantity: item.quantity });
          orderItemsMap.set(item.orderId, existing);
        });
        let totalCost = 0;
        for (const order of completedOrders) {
          const items = orderItemsMap.get(order.id) || [];
          for (const item of items) {
            const costPrice = productCostMap.get(item.productId) || 0;
            totalCost += costPrice * item.quantity;
          }
        }
        const netProfit = cashFromOrders - totalCost;
        const retainedEarnings = totalAssets - totalLiabilities - netProfit;
        const totalEquity = retainedEarnings + netProfit;
        const totalRevenue = cashFromOrders;
        const grossProfit = totalRevenue - totalCost;
        const profitMargin = totalRevenue > 0 ? grossProfit / totalRevenue * 100 : 0;
        const completedOrderCount = completedOrders.length;
        const pendingOrderCount = filteredOrders.filter((o) => o.status === "pending" || o.status === "processing").length;
        const cancelledOrderCount = filteredOrders.filter((o) => o.status === "cancelled").length;
        let periodComparison;
        if (startDate && endDate && prevPeriodOrders.length >= 0) {
          const prevRevenue = prevPeriodOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
          let prevCost = 0;
          for (const order of prevPeriodOrders) {
            const items = orderItemsMap.get(order.id) || [];
            for (const item of items) {
              const costPrice = productCostMap.get(item.productId) || 0;
              prevCost += costPrice * item.quantity;
            }
          }
          const previousPeriodProfit = prevRevenue - prevCost;
          const profitChange = netProfit - previousPeriodProfit;
          const profitChangePercent = previousPeriodProfit > 0 ? profitChange / previousPeriodProfit * 100 : 0;
          periodComparison = { previousPeriodProfit, profitChange, profitChangePercent };
        }
        return {
          assets: {
            cashFromOrders,
            inventoryValue,
            pendingPayments,
            totalAssets
          },
          liabilities: {
            customerWalletBalances,
            pendingRefunds,
            pendingTopups,
            totalLiabilities
          },
          equity: {
            retainedEarnings,
            netProfit,
            totalEquity
          },
          summary: {
            totalRevenue,
            totalCost,
            grossProfit,
            profitMargin,
            orderCount: filteredOrders.length,
            completedOrderCount,
            pendingOrderCount,
            cancelledOrderCount
          },
          periodComparison
        };
      }
      // Notification Types Management
      async getNotificationTypes() {
        return db.select().from(notificationTypes).orderBy(notificationTypes.category, notificationTypes.label);
      }
      async getNotificationTypeByKey(key) {
        const [type] = await db.select().from(notificationTypes).where(eq(notificationTypes.key, key));
        return type;
      }
      async createNotificationType(data) {
        const [created] = await db.insert(notificationTypes).values(data).returning();
        return created;
      }
      async updateNotificationType(id, data) {
        const [updated] = await db.update(notificationTypes).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(notificationTypes.id, id)).returning();
        return updated;
      }
      async toggleNotificationType(id, field, value) {
        const [updated] = await db.update(notificationTypes).set({ [field]: value, updatedAt: /* @__PURE__ */ new Date() }).where(eq(notificationTypes.id, id)).returning();
        return updated;
      }
      async deleteNotificationType(id) {
        const result = await db.delete(notificationTypes).where(eq(notificationTypes.id, id));
        return true;
      }
      // Notification Templates Management
      async getNotificationTemplates() {
        return db.select().from(notificationTemplates).orderBy(notificationTemplates.typeKey);
      }
      async getNotificationTemplatesByType(typeKey) {
        return db.select().from(notificationTemplates).where(eq(notificationTemplates.typeKey, typeKey));
      }
      async getNotificationTemplate(id) {
        const [template] = await db.select().from(notificationTemplates).where(eq(notificationTemplates.id, id));
        return template;
      }
      async createNotificationTemplate(data) {
        const [created] = await db.insert(notificationTemplates).values(data).returning();
        return created;
      }
      async updateNotificationTemplate(id, data) {
        const [existing] = await db.select().from(notificationTemplates).where(eq(notificationTemplates.id, id));
        const newVersion = existing ? (existing.version || 1) + 1 : 1;
        const [updated] = await db.update(notificationTemplates).set({ ...data, version: newVersion, updatedAt: /* @__PURE__ */ new Date() }).where(eq(notificationTemplates.id, id)).returning();
        return updated;
      }
      async toggleNotificationTemplate(id, isActive) {
        const [updated] = await db.update(notificationTemplates).set({ isActive, updatedAt: /* @__PURE__ */ new Date() }).where(eq(notificationTemplates.id, id)).returning();
        return updated;
      }
      async deleteNotificationTemplate(id) {
        await db.delete(notificationTemplates).where(eq(notificationTemplates.id, id));
        return true;
      }
      // Seed default notification types if empty
      async seedNotificationTypes() {
        const existing = await db.select().from(notificationTypes);
        if (existing.length > 0) return;
        const defaultTypes = [
          { key: "order_placed", label: "Order Placed", description: "When a new order is placed", category: "orders", icon: "ShoppingBag", isEnabled: true, isEmailEnabled: true, isInAppEnabled: true },
          { key: "order_status_update", label: "Order Status Update", description: "When order status changes (processing, shipped, delivered)", category: "orders", icon: "Truck", isEnabled: true, isEmailEnabled: true, isInAppEnabled: true },
          { key: "payment_received", label: "Payment Received", description: "When payment is verified", category: "payments", icon: "CreditCard", isEnabled: true, isEmailEnabled: true, isInAppEnabled: true },
          { key: "payment_failed", label: "Payment Failed", description: "When payment verification fails", category: "payments", icon: "AlertCircle", isEnabled: true, isEmailEnabled: true, isInAppEnabled: true },
          { key: "low_stock", label: "Low Stock Alert", description: "When product stock falls below threshold", category: "inventory", icon: "Package", isEnabled: true, isEmailEnabled: false, isInAppEnabled: true },
          { key: "customer_registration", label: "Customer Registration", description: "When a new customer registers", category: "customers", icon: "UserPlus", isEnabled: true, isEmailEnabled: false, isInAppEnabled: true },
          { key: "review_submitted", label: "Review Submitted", description: "When a customer submits a product review", category: "customers", icon: "Star", isEnabled: true, isEmailEnabled: false, isInAppEnabled: true },
          { key: "chat_message", label: "Chat Message", description: "When a new chat message is received", category: "communication", icon: "MessageCircle", isEnabled: true, isEmailEnabled: false, isInAppEnabled: true },
          { key: "general", label: "General Notification", description: "General system notifications", category: "system", icon: "Bell", isEnabled: true, isEmailEnabled: false, isInAppEnabled: true }
        ];
        for (const type of defaultTypes) {
          await db.insert(notificationTypes).values(type);
        }
        await this.seedNotificationTemplates();
      }
      async seedNotificationTemplates() {
        const existing = await db.select().from(notificationTemplates);
        if (existing.length > 0) return;
        const defaultTemplates = [
          // Order notifications - In-App
          { typeKey: "order_placed", channel: "in_app", title: "New Order Received", body: "New order #{{orderNumber}} from {{customerName}} for Rs. {{total}}", variables: ["orderNumber", "customerName", "total"], isActive: true, version: 1 },
          { typeKey: "order_status_update", channel: "in_app", title: "Order #{{orderNumber}} Updated", body: "{{statusMessage}}", variables: ["orderNumber", "status", "statusMessage"], isActive: true, version: 1 },
          // Order notifications - Email
          { typeKey: "order_placed", channel: "email", subject: "Order Confirmation - #{{orderNumber}}", title: "Thank you for your order!", body: "Dear {{customerName}},\n\nYour order #{{orderNumber}} has been placed successfully.\n\nTotal: Rs. {{total}}\nPayment Method: {{paymentMethod}}\n\nThank you for shopping with us!", variables: ["orderNumber", "customerName", "total", "paymentMethod"], isActive: true, version: 1 },
          { typeKey: "order_status_update", channel: "email", subject: "Order Update - #{{orderNumber}}", title: "Your order status has changed", body: "Dear {{customerName}},\n\nYour order #{{orderNumber}} is now {{status}}.\n\n{{statusMessage}}\n\nThank you for shopping with us!", variables: ["orderNumber", "customerName", "status", "statusMessage"], isActive: true, version: 1 },
          // Payment notifications - In-App
          { typeKey: "payment_received", channel: "in_app", title: "Payment Verified", body: "Payment of Rs. {{amount}} for order #{{orderNumber}} has been verified.", variables: ["amount", "orderNumber"], isActive: true, version: 1 },
          { typeKey: "payment_failed", channel: "in_app", title: "Payment Failed", body: "Payment failed for order #{{orderNumber}}. Please try again.", variables: ["orderNumber"], isActive: true, version: 1 },
          // Payment notifications - Email
          { typeKey: "payment_received", channel: "email", subject: "Payment Confirmed - Order #{{orderNumber}}", title: "Payment Verified Successfully", body: "Dear {{customerName}},\n\nYour payment of Rs. {{amount}} for order #{{orderNumber}} has been verified successfully.\n\nYour order will be processed shortly.\n\nThank you!", variables: ["customerName", "amount", "orderNumber"], isActive: true, version: 1 },
          // Inventory notifications - In-App
          { typeKey: "low_stock", channel: "in_app", title: "Low Stock Alert", body: 'Product "{{productName}}" is running low. Only {{stock}} units left.', variables: ["productName", "stock"], isActive: true, version: 1 },
          // Customer notifications - In-App
          { typeKey: "customer_registration", channel: "in_app", title: "New Customer Registered", body: "New customer {{customerName}} ({{email}}) has registered.", variables: ["customerName", "email"], isActive: true, version: 1 },
          { typeKey: "review_submitted", channel: "in_app", title: "New Review Submitted", body: '{{customerName}} left a {{rating}}-star review for "{{productName}}".', variables: ["customerName", "rating", "productName"], isActive: true, version: 1 },
          // Communication notifications - In-App
          { typeKey: "chat_message", channel: "in_app", title: "New Chat Message", body: "You have a new message from {{senderName}}.", variables: ["senderName"], isActive: true, version: 1 },
          // General notifications - In-App
          { typeKey: "general", channel: "in_app", title: "{{title}}", body: "{{message}}", variables: ["title", "message"], isActive: true, version: 1 }
        ];
        for (const template of defaultTemplates) {
          await db.insert(notificationTemplates).values(template);
        }
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/chatWebSocket.ts
var chatWebSocket_exports = {};
__export(chatWebSocket_exports, {
  getOnlineAgents: () => getOnlineAgents,
  isUserOnline: () => isUserOnline,
  setupChatWebSocket: () => setupChatWebSocket
});
import { WebSocketServer, WebSocket } from "ws";
import jwt2 from "jsonwebtoken";
function setupChatWebSocket(server) {
  const wss = new WebSocketServer({
    noServer: true
  });
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    if (pathname === "/ws/chat") {
      wss.handleUpgrade(request, socket, head, (ws2) => {
        wss.emit("connection", ws2, request);
      });
    }
  });
  wss.on("connection", async (ws2, req) => {
    console.log("[Chat WebSocket] New connection established");
    let client = null;
    ws2.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log("[Chat WebSocket] Received message:", message.type);
        switch (message.type) {
          case "auth":
            console.log("[Chat WebSocket] Auth attempt for userType:", message.userType);
            client = await handleAuth(ws2, message);
            if (client) {
              clients.set(client.userId, client);
              console.log("[Chat WebSocket] Auth success for userId:", client.userId);
              ws2.send(JSON.stringify({ type: "auth_success", userId: client.userId }));
            } else {
              console.log("[Chat WebSocket] Auth failed");
              ws2.send(JSON.stringify({ type: "auth_error", error: "Authentication failed" }));
              ws2.close();
            }
            break;
          case "join_conversation":
            if (client) {
              client.conversationId = message.conversationId;
              await handleJoinConversation(client, message.conversationId);
            }
            break;
          case "send_message":
            if (client && client.conversationId) {
              await handleSendMessage(client, message.content, message.attachments);
            }
            break;
          case "typing":
            if (client && client.conversationId) {
              broadcastToConversation(client.conversationId, {
                type: "typing",
                userId: client.userId,
                userType: client.userType
              }, client.userId);
            }
            break;
          case "add_reaction":
            if (client && message.messageId && message.emoji) {
              await handleAddReaction(client, message.messageId, message.emoji);
            }
            break;
          case "mark_read":
            if (client && message.conversationId) {
              const senderType = client.userType === "agent" ? "customer" : "agent";
              await storage.markMessagesAsRead(message.conversationId, senderType);
            }
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws2.send(JSON.stringify({ type: "error", error: "Invalid message format" }));
      }
    });
    ws2.on("close", (code, reason) => {
      console.log("[Chat WebSocket] Connection closed, code:", code, "reason:", reason?.toString());
      if (client) {
        clients.delete(client.userId);
        if (client.conversationId) {
          broadcastToConversation(client.conversationId, {
            type: "user_left",
            userId: client.userId,
            userType: client.userType
          }, client.userId);
        }
      }
    });
    ws2.on("error", (error) => {
      console.error("[Chat WebSocket] Error:", error);
    });
  });
  return wss;
}
async function handleAuth(ws2, message) {
  try {
    if (message.userType === "customer") {
      const token = message.token;
      if (!token) return null;
      const JWT_SECRET3 = process.env.SESSION_SECRET || "shinara-mall-secret-key-change-in-production";
      const decoded = jwt2.verify(token, JWT_SECRET3);
      const user = await storage.getUser(decoded.userId);
      if (!user || !user.isActive) return null;
      return { ws: ws2, userId: user.id, userType: "customer" };
    } else if (message.userType === "agent") {
      const token = message.token;
      if (!token) return null;
      const decoded = jwt2.verify(token, process.env.JWT_SECRET || "admin-secret");
      const admin = await storage.getAdminUser(decoded.adminId);
      if (!admin) return null;
      return { ws: ws2, userId: admin.id, userType: "agent" };
    }
  } catch (error) {
    console.error("Auth error:", error);
  }
  return null;
}
async function handleJoinConversation(client, conversationId) {
  const conversation = await storage.getChatConversation(conversationId);
  if (!conversation) {
    client.ws.send(JSON.stringify({ type: "error", error: "Conversation not found" }));
    return;
  }
  if (client.userType === "customer" && conversation.customerId !== client.userId) {
    client.ws.send(JSON.stringify({ type: "error", error: "Unauthorized" }));
    return;
  }
  const senderType = client.userType === "agent" ? "customer" : "agent";
  await storage.markMessagesAsRead(conversationId, senderType);
  client.ws.send(JSON.stringify({
    type: "conversation_joined",
    conversation,
    messages: conversation.messages || []
  }));
  broadcastToConversation(conversationId, {
    type: "user_joined",
    userId: client.userId,
    userType: client.userType
  }, client.userId);
}
async function handleAddReaction(client, messageId, emoji) {
  const msg = await storage.getChatMessage(messageId);
  if (!msg || msg.conversationId !== client.conversationId) return;
  const reactions = msg.reactions || {};
  const users2 = reactions[emoji] || [];
  const idx = users2.indexOf(client.userId);
  if (idx === -1) {
    reactions[emoji] = [...users2, client.userId];
  } else {
    reactions[emoji] = users2.filter((u) => u !== client.userId);
    if (reactions[emoji].length === 0) delete reactions[emoji];
  }
  const updated = await storage.updateChatMessageReactions(messageId, reactions);
  broadcastToConversation(msg.conversationId, {
    type: "reaction_updated",
    message: updated
  });
}
async function handleSendMessage(client, content, attachments) {
  if (!client.conversationId || !content.trim() && (!attachments || attachments.length === 0)) return;
  const message = await storage.createChatMessage({
    conversationId: client.conversationId,
    senderId: client.userId,
    senderType: client.userType,
    message: content.trim() || " ",
    attachments: attachments || []
  });
  broadcastToConversation(client.conversationId, {
    type: "new_message",
    message
  });
  if (client.userType === "customer") {
    await createAgentNotification(client.conversationId, message);
  } else {
    await createCustomerNotification(client.conversationId, message);
  }
}
function broadcastToConversation(conversationId, message, excludeUserId) {
  clients.forEach((client) => {
    if (client.conversationId === conversationId && client.userId !== excludeUserId) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  });
}
async function createAgentNotification(conversationId, message) {
  const conversation = await storage.getChatConversation(conversationId);
  if (!conversation) return;
  if (conversation.assignedAgentId) {
    const agentClient = clients.get(conversation.assignedAgentId);
    if (!agentClient || agentClient.conversationId !== conversationId) {
      await storage.createNotification({
        recipientType: "admin",
        recipientId: conversation.assignedAgentId,
        type: "chat_message",
        title: "New Chat Message",
        message: `Customer ${conversation.customer?.firstName || "Customer"} sent a message`,
        data: { conversationId, messageId: message.id }
      });
    }
  }
}
async function createCustomerNotification(conversationId, message) {
  const conversation = await storage.getChatConversation(conversationId);
  if (!conversation) return;
  const customerClient = clients.get(conversation.customerId);
  if (!customerClient || customerClient.conversationId !== conversationId) {
    await storage.createNotification({
      recipientType: "customer",
      recipientId: conversation.customerId,
      type: "chat_message",
      title: "New Chat Message",
      message: "Support agent responded to your inquiry",
      data: { conversationId, messageId: message.id }
    });
  }
}
function getOnlineAgents() {
  const agentIds = [];
  clients.forEach((client) => {
    if (client.userType === "agent") {
      agentIds.push(client.userId);
    }
  });
  return agentIds;
}
function isUserOnline(userId) {
  return clients.has(userId);
}
var clients;
var init_chatWebSocket = __esm({
  "server/chatWebSocket.ts"() {
    "use strict";
    init_storage();
    clients = /* @__PURE__ */ new Map();
  }
});

// server/teamChatWebSocket.ts
var teamChatWebSocket_exports = {};
__export(teamChatWebSocket_exports, {
  getOnlineAdmins: () => getOnlineAdmins,
  isAdminOnline: () => isAdminOnline,
  setupTeamChatWebSocket: () => setupTeamChatWebSocket
});
import { WebSocketServer as WebSocketServer2, WebSocket as WebSocket2 } from "ws";
import jwt3 from "jsonwebtoken";
function setupTeamChatWebSocket(server) {
  const wss = new WebSocketServer2({
    noServer: true
  });
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    if (pathname === "/ws/team-chat") {
      wss.handleUpgrade(request, socket, head, (ws2) => {
        wss.emit("connection", ws2, request);
      });
    }
  });
  wss.on("connection", async (ws2, req) => {
    let client = null;
    ws2.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        switch (message.type) {
          case "auth":
            client = await handleAuth2(ws2, message);
            if (client) {
              clients2.set(client.adminId, client);
              ws2.send(JSON.stringify({ type: "auth_success", adminId: client.adminId }));
              broadcastPresence(client.adminId, "online");
            } else {
              ws2.send(JSON.stringify({ type: "auth_error", error: "Authentication failed" }));
              ws2.close();
            }
            break;
          case "join_conversation":
            if (client) {
              await handleJoinConversation2(client, message.conversationId);
            }
            break;
          case "leave_conversation":
            if (client && message.conversationId) {
              client.conversationIds.delete(message.conversationId);
            }
            break;
          case "send_message":
            if (client && message.conversationId) {
              await handleSendMessage2(client, message.conversationId, message.content, message.replyToId);
            }
            break;
          case "typing":
            if (client && message.conversationId) {
              broadcastToConversation2(message.conversationId, {
                type: "typing",
                adminId: client.adminId,
                adminName: client.adminName
              }, client.adminId);
            }
            break;
          case "stop_typing":
            if (client && message.conversationId) {
              broadcastToConversation2(message.conversationId, {
                type: "stop_typing",
                adminId: client.adminId
              }, client.adminId);
            }
            break;
          case "mark_read":
            if (client && message.conversationId && message.lastMessageId) {
              await storage.markTeamChatMessagesRead(message.conversationId, client.adminId, message.lastMessageId);
            }
            break;
          case "get_presence":
            if (client) {
              const onlineAdmins = getOnlineAdmins();
              ws2.send(JSON.stringify({ type: "presence_list", admins: onlineAdmins }));
            }
            break;
        }
      } catch (error) {
        console.error("Team Chat WebSocket message error:", error);
        ws2.send(JSON.stringify({ type: "error", error: "Invalid message format" }));
      }
    });
    ws2.on("close", () => {
      if (client) {
        clients2.delete(client.adminId);
        broadcastPresence(client.adminId, "offline");
      }
    });
    ws2.on("error", (error) => {
      console.error("Team Chat WebSocket error:", error);
    });
  });
  return wss;
}
async function handleAuth2(ws2, message) {
  try {
    const token = message.token;
    if (!token) return null;
    const decoded = jwt3.verify(token, process.env.JWT_SECRET || "admin-secret");
    const admin = await storage.getAdminUser(decoded.adminId);
    if (!admin) return null;
    const conversations = await storage.getTeamChatConversations(admin.id);
    const conversationIds = new Set(conversations.map((c) => c.id));
    return {
      ws: ws2,
      adminId: admin.id,
      adminName: admin.username,
      conversationIds
    };
  } catch (error) {
    console.error("Team Chat auth error:", error);
  }
  return null;
}
async function handleJoinConversation2(client, conversationId) {
  const isParticipant = await storage.isTeamChatParticipant(conversationId, client.adminId);
  if (!isParticipant) {
    client.ws.send(JSON.stringify({ type: "error", error: "Not a participant of this conversation" }));
    return;
  }
  client.conversationIds.add(conversationId);
  const messages = await storage.getTeamChatMessages(conversationId, 50);
  if (messages.length > 0) {
    await storage.markTeamChatMessagesRead(conversationId, client.adminId, messages[0].id);
  }
  client.ws.send(JSON.stringify({
    type: "conversation_joined",
    conversationId,
    messages
  }));
  broadcastToConversation2(conversationId, {
    type: "user_joined",
    adminId: client.adminId,
    adminName: client.adminName
  }, client.adminId);
}
async function handleSendMessage2(client, conversationId, content, replyToId) {
  if (!content.trim()) return;
  const isParticipant = await storage.isTeamChatParticipant(conversationId, client.adminId);
  if (!isParticipant) {
    client.ws.send(JSON.stringify({ type: "error", error: "Not a participant" }));
    return;
  }
  const messageRecord = await storage.createTeamChatMessage({
    conversationId,
    senderId: client.adminId,
    message: content.trim(),
    replyToMessageId: replyToId || null
  });
  const enrichedMessage = {
    ...messageRecord,
    sender: {
      id: client.adminId,
      username: client.adminName
    }
  };
  broadcastToConversation2(conversationId, {
    type: "new_message",
    message: enrichedMessage
  });
  await createMessageNotifications(conversationId, enrichedMessage, client.adminId);
}
function broadcastToConversation2(conversationId, message, excludeAdminId) {
  clients2.forEach((client) => {
    if (client.conversationIds.has(conversationId) && client.adminId !== excludeAdminId) {
      if (client.ws.readyState === WebSocket2.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  });
}
function broadcastPresence(adminId, status) {
  const message = { type: "presence_update", adminId, status };
  clients2.forEach((client) => {
    if (client.ws.readyState === WebSocket2.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  });
}
async function createMessageNotifications(conversationId, msg, senderId) {
  const participants = await storage.getTeamChatParticipants(conversationId);
  for (const participant of participants) {
    if (participant.adminUserId === senderId) continue;
    const participantClient = clients2.get(participant.adminUserId);
    if (!participantClient || !participantClient.conversationIds.has(conversationId)) {
      const msgContent = msg.message || "";
      await storage.createNotification({
        recipientType: "admin",
        recipientId: participant.adminUserId,
        type: "chat_message",
        title: "New Team Message",
        message: `${msg.sender?.username || "Team member"}: ${msgContent.substring(0, 50)}${msgContent.length > 50 ? "..." : ""}`,
        data: { conversationId, messageId: msg.id }
      });
    }
  }
}
function getOnlineAdmins() {
  return Array.from(clients2.keys());
}
function isAdminOnline(adminId) {
  return clients2.has(adminId);
}
var clients2;
var init_teamChatWebSocket = __esm({
  "server/teamChatWebSocket.ts"() {
    "use strict";
    init_storage();
    clients2 = /* @__PURE__ */ new Map();
  }
});

// server/index.ts
import express2 from "express";
import path2 from "path";

// server/routes.ts
init_storage();
import { createServer } from "http";

// server/auth.ts
init_storage();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.SESSION_SECRET || "shinara-mall-secret-key-change-in-production";
var JWT_EXPIRES_IN = "7d";
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
function toSafeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
var isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  const user = await storage.getUser(payload.userId);
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "User not found or inactive" });
  }
  req.user = toSafeUser(user);
  next();
};

// server/routes.ts
init_schema();
init_db();
import bcrypt2 from "bcrypt";
import jwt4 from "jsonwebtoken";
import crypto from "crypto";
import { sql as sql3 } from "drizzle-orm";

// server/notificationHelper.ts
init_db();
init_schema();
var cachedSettings = null;
var cachedNotificationTypes = null;
var cacheExpiresAt = 0;
var CACHE_TTL_MS = 6e4;
var notificationTypeToPreference = {
  "order_placed": "orderNotifications",
  "order_status_update": "orderNotifications",
  "low_stock": "stockAlerts",
  "payment_received": "paymentUpdates",
  "payment_failed": "paymentUpdates",
  "new_customer": "customerRegistrations",
  "customer_registration": "customerRegistrations",
  "review_submitted": null,
  "chat_message": null,
  "wallet_topup_request": "paymentUpdates",
  "wallet_topup_approved": "paymentUpdates",
  "wallet_topup_rejected": "paymentUpdates",
  "general": null
};
async function getNotificationSettings() {
  const now = Date.now();
  if (cachedSettings && cacheExpiresAt > now) {
    return cachedSettings;
  }
  const [settings] = await db.select().from(storeSettings).limit(1);
  cachedSettings = {
    orderNotifications: settings?.orderNotifications ?? true,
    stockAlerts: settings?.stockAlerts ?? true,
    customerRegistrations: settings?.customerRegistrations ?? true,
    paymentUpdates: settings?.paymentUpdates ?? true,
    marketingEmails: settings?.marketingEmails ?? false
  };
  cacheExpiresAt = now + CACHE_TTL_MS;
  return cachedSettings;
}
async function getNotificationTypeSettings() {
  const now = Date.now();
  if (cachedNotificationTypes && cacheExpiresAt > now) {
    return cachedNotificationTypes;
  }
  const types = await db.select().from(notificationTypes);
  cachedNotificationTypes = /* @__PURE__ */ new Map();
  for (const type of types) {
    cachedNotificationTypes.set(type.key, {
      isEnabled: type.isEnabled ?? true,
      isEmailEnabled: type.isEmailEnabled ?? true,
      isInAppEnabled: type.isInAppEnabled ?? true
    });
  }
  return cachedNotificationTypes;
}
async function shouldSendAdminNotification(type) {
  const typeSettings = await getNotificationTypeSettings();
  const typeSetting = typeSettings.get(type);
  if (typeSetting) {
    if (!typeSetting.isEnabled) {
      return false;
    }
    if (!typeSetting.isInAppEnabled) {
      return false;
    }
  }
  const preferenceKey = notificationTypeToPreference[type];
  if (preferenceKey === null) {
    return true;
  }
  const settings = await getNotificationSettings();
  return settings[preferenceKey];
}
async function shouldSendEmailNotification(type) {
  const typeSettings = await getNotificationTypeSettings();
  const typeSetting = typeSettings.get(type);
  if (typeSetting) {
    if (!typeSetting.isEnabled) {
      return false;
    }
    if (!typeSetting.isEmailEnabled) {
      return false;
    }
  }
  return true;
}
function invalidateNotificationSettingsCache() {
  cachedSettings = null;
  cachedNotificationTypes = null;
  cacheExpiresAt = 0;
}

// server/notificationSender.ts
init_storage();
function applyVariables(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = variables[varName];
    return value !== void 0 ? String(value) : match;
  });
}
async function getNotificationContent(type, channel, variables, defaults) {
  try {
    const templates = await storage.getNotificationTemplatesByType(type);
    const template = templates.find((t) => t.channel === channel && t.isActive);
    if (template) {
      return {
        title: applyVariables(template.title || defaults.title, variables),
        message: applyVariables(template.body, variables)
      };
    }
  } catch (error) {
    console.error(`Error fetching template for ${type}:`, error);
  }
  return {
    title: applyVariables(defaults.title, variables),
    message: applyVariables(defaults.message, variables)
  };
}
function mapToSchemaType(type) {
  const mapping = {
    "order_placed": "order_placed",
    "order_status_update": "order_status_update",
    "low_stock": "low_stock",
    "payment_received": "payment_received",
    "payment_failed": "payment_failed",
    "new_customer": "customer_registration",
    "customer_registration": "customer_registration",
    "review_submitted": "review_submitted",
    "chat_message": "chat_message",
    "wallet_topup_request": "general",
    "wallet_topup_approved": "general",
    "wallet_topup_rejected": "general",
    "general": "general"
  };
  return mapping[type] || "general";
}
async function sendAdminNotification(type, variables, defaults, data) {
  try {
    if (!await shouldSendAdminNotification(type)) {
      return false;
    }
    const content = await getNotificationContent(type, "in_app", variables, defaults);
    await storage.createNotification({
      recipientType: "admin",
      type: mapToSchemaType(type),
      title: content.title,
      message: content.message,
      data: { ...data, notificationType: type }
    });
    return true;
  } catch (error) {
    console.error(`Error sending admin notification (${type}):`, error);
    return false;
  }
}
async function sendCustomerNotification(recipientId, type, variables, defaults, data) {
  try {
    const content = await getNotificationContent(type, "in_app", variables, defaults);
    await storage.createNotification({
      recipientType: "customer",
      recipientId,
      type: mapToSchemaType(type),
      title: content.title,
      message: content.message,
      data: { ...data, notificationType: type }
    });
    return true;
  } catch (error) {
    console.error(`Error sending customer notification (${type}):`, error);
    return false;
  }
}
var defaultNotificationMessages = {
  order_placed: {
    title: "New Order Received",
    message: "New order #{{orderNumber}} from {{customerName}} for Rs. {{total}}"
  },
  order_status_update: {
    title: "Order #{{orderNumber}} Updated",
    message: "Order status changed to {{status}}."
  },
  order_cancelled: {
    title: "Order Cancelled",
    message: "Order #{{orderNumber}} was cancelled by {{customerName}}"
  },
  low_stock: {
    title: "Low Stock Alert",
    message: 'Product "{{productName}}" is running low. Only {{stock}} units left.'
  },
  payment_received: {
    title: "Payment Received",
    message: "Payment received for order #{{orderNumber}}. Amount: Rs. {{amount}}"
  },
  payment_verified: {
    title: "Payment Verified",
    message: "Your payment for order #{{orderNumber}} has been verified."
  },
  payment_failed: {
    title: "Payment Failed",
    message: "Payment failed for order #{{orderNumber}}. Please try again."
  },
  customer_registration: {
    title: "New Customer Registered",
    message: "New customer {{customerName}} ({{email}}) has registered."
  },
  review_submitted: {
    title: "New Review Submitted",
    message: '{{customerName}} left a {{rating}}-star review for "{{productName}}".'
  },
  chat_message: {
    title: "New Chat Message",
    message: "You have a new message from {{senderName}}."
  },
  wallet_topup_request: {
    title: "Wallet Top-up Request",
    message: "{{customerName}} requested a wallet top-up of Rs. {{amount}}."
  },
  wallet_topup_approved: {
    title: "Wallet Top-up Approved",
    message: "Your wallet top-up of Rs. {{amount}} has been approved."
  },
  wallet_topup_rejected: {
    title: "Wallet Top-up Rejected",
    message: "Your wallet top-up of Rs. {{amount}} has been rejected."
  }
};

// server/emailService.ts
import { Resend } from "resend";
var resend = new Resend(process.env.RESEND_API_KEY);
var FROM_EMAIL = "Shinara Mall <onboarding@resend.dev>";
async function sendVerificationEmail(to, firstName, verificationToken) {
  const verificationUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "https://shinaramall.com"}/verify-email?token=${verificationToken}`;
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: "Verify Your Email - Shinara Mall",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Shinara Mall</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Welcome, ${firstName || "Valued Customer"}!</h2>
            <p>Thank you for creating an account with Shinara Mall. Please verify your email address to complete your registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
            <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Shinara Mall. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    });
    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: error.message };
  }
}
async function sendOrderConfirmationEmail(to, firstName, orderId, orderTotal, paymentMethod) {
  const orderUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "https://shinaramall.com"}/orders/${orderId}`;
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Order Confirmation #${orderId.slice(-8).toUpperCase()} - Shinara Mall`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Shinara Mall</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Order Confirmed!</h2>
            <p>Hi ${firstName || "Valued Customer"},</p>
            <p>Thank you for your order! We've received it and will process it shortly.</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Total:</strong> Rs. ${parseFloat(orderTotal).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethod}</p>
            </div>
            ${paymentMethod !== "cod" ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;"><strong>Next Step:</strong> Please upload your payment screenshot in your order details to confirm payment.</p>
            </div>
            ` : ""}
            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Order Details
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Shinara Mall. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    });
    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: error.message };
  }
}
async function sendOrderStatusUpdateEmail(to, firstName, orderId, newStatus) {
  const orderUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "https://shinaramall.com"}/orders/${orderId}`;
  const statusMessages = {
    processing: { title: "Order Processing", message: "Your order is being processed and will be shipped soon.", color: "#17a2b8" },
    shipped: { title: "Order Shipped", message: "Great news! Your order has been shipped and is on its way.", color: "#28a745" },
    delivered: { title: "Order Delivered", message: "Your order has been delivered. We hope you enjoy your purchase!", color: "#28a745" },
    cancelled: { title: "Order Cancelled", message: "Your order has been cancelled. If you have any questions, please contact us.", color: "#dc3545" }
  };
  const statusInfo = statusMessages[newStatus] || { title: "Order Update", message: `Your order status has been updated to: ${newStatus}`, color: "#6c757d" };
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `${statusInfo.title} - Order #${orderId.slice(-8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Shinara Mall</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: ${statusInfo.color};">${statusInfo.title}</h2>
            <p>Hi ${firstName || "Valued Customer"},</p>
            <p>${statusInfo.message}</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}</span></p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Order Details
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Shinara Mall. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    });
    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: error.message };
  }
}
async function sendPaymentVerifiedEmail(to, firstName, orderId, orderTotal) {
  const orderUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "https://shinaramall.com"}/orders/${orderId}`;
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: `Payment Confirmed - Order #${orderId.slice(-8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Shinara Mall</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 48px;">\u2705</span>
            </div>
            <h2 style="color: #28a745; text-align: center;">Payment Verified!</h2>
            <p>Hi ${firstName || "Valued Customer"},</p>
            <p>Great news! Your payment of <strong>Rs. ${parseFloat(orderTotal).toLocaleString()}</strong> has been verified successfully.</p>
            <p>Your order is now being processed and will be shipped soon.</p>
            <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> Rs. ${parseFloat(orderTotal).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Payment Status:</strong> <span style="color: #28a745; font-weight: bold;">Verified</span></p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${orderUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Order Details
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">
              \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Shinara Mall. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    });
    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Email service error:", error);
    return { success: false, error: error.message };
  }
}

// server/routes.ts
var getJwtSecret = () => {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  const generatedSecret = crypto.randomBytes(64).toString("hex");
  console.warn("WARNING: SESSION_SECRET not set in environment. Using generated secret. Admin sessions will not persist across server restarts.");
  return generatedSecret;
};
var JWT_SECRET2 = getJwtSecret();
var adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Admin access token required" });
    }
    const decoded = jwt4.verify(token, JWT_SECRET2);
    const admin = await storage.getAdminUser(decoded.adminId);
    if (!admin) {
      return res.status(401).json({ message: "Invalid admin token" });
    }
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid admin token" });
  }
};
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const validation = registerUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validation.error.errors
        });
      }
      const { email, password, firstName, lastName, mobile } = validation.data;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
        mobile,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires
      });
      sendVerificationEmail(email, firstName || "", verificationToken).then((result) => {
        if (!result.success) {
          console.error("Failed to send verification email:", result.error);
        }
      }).catch((err) => console.error("Verification email error:", err));
      const token = generateToken({ userId: user.id, email: user.email });
      res.status(201).json({
        token,
        user: toSafeUser(user),
        message: "Registration successful! Please check your email to verify your account."
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid input",
          errors: validation.error.errors
        });
      }
      const { email, password } = validation.data;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }
      const isValidPassword = await comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const token = generateToken({ userId: user.id, email: user.email });
      res.json({
        token,
        user: toSafeUser(user)
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Verification token is required" });
      }
      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }
      if (user.emailVerificationExpires && /* @__PURE__ */ new Date() > user.emailVerificationExpires) {
        return res.status(400).json({ message: "Verification token has expired. Please request a new one." });
      }
      await storage.updateUser(user.id, {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: /* @__PURE__ */ new Date()
      });
      res.json({ success: true, message: "Email verified successfully!" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });
  app2.post("/api/auth/resend-verification", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await storage.updateUser(userId, {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        updatedAt: /* @__PURE__ */ new Date()
      });
      const result = await sendVerificationEmail(user.email, user.firstName || "", verificationToken);
      if (!result.success) {
        return res.status(500).json({ message: "Failed to send verification email" });
      }
      res.json({ success: true, message: "Verification email sent!" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.patch("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, mobile, shippingAddress } = req.body;
      const allowedUpdates = {
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (typeof firstName === "string") {
        allowedUpdates.firstName = firstName.trim().slice(0, 100);
      }
      if (typeof lastName === "string") {
        allowedUpdates.lastName = lastName.trim().slice(0, 100);
      }
      if (typeof mobile === "string") {
        allowedUpdates.mobile = mobile.trim().slice(0, 20);
      }
      if (shippingAddress && typeof shippingAddress === "object") {
        allowedUpdates.shippingAddress = shippingAddress;
      }
      const updatedUser = await storage.updateUser(userId, allowedUpdates);
      res.json(toSafeUser(updatedUser));
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.post("/api/profile/picture", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { imageData } = req.body;
      if (!imageData || typeof imageData !== "string") {
        return res.status(400).json({ message: "Image data is required" });
      }
      if (!imageData.startsWith("data:image/")) {
        return res.status(400).json({ message: "Invalid image format" });
      }
      const base64Size = imageData.length * 0.75;
      if (base64Size > 2 * 1024 * 1024) {
        return res.status(400).json({ message: "Image size must be less than 2MB" });
      }
      const updatedUser = await storage.updateUser(userId, {
        profileImageUrl: imageData,
        updatedAt: /* @__PURE__ */ new Date()
      });
      res.json({ success: true, profileImageUrl: updatedUser.profileImageUrl });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });
  app2.delete("/api/profile/picture", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      await storage.updateUser(userId, {
        profileImageUrl: null,
        updatedAt: /* @__PURE__ */ new Date()
      });
      res.json({ success: true, message: "Profile picture deleted" });
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      res.status(500).json({ message: "Failed to delete profile picture" });
    }
  });
  app2.get("/api/addresses", isAuthenticated, async (req, res) => {
    try {
      const addresses = await storage.getUserAddresses(req.user.id);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });
  app2.post("/api/addresses", isAuthenticated, async (req, res) => {
    try {
      const { label, firstName, lastName, address, city, postalCode, phone, isDefault } = req.body;
      if (!firstName || !address || !city || !phone) {
        return res.status(400).json({ message: "firstName, address, city and phone are required" });
      }
      const addr = await storage.createUserAddress({
        userId: req.user.id,
        label: label || "Home",
        firstName,
        lastName,
        address,
        city,
        postalCode,
        phone,
        isDefault: !!isDefault
      });
      res.status(201).json(addr);
    } catch (error) {
      res.status(500).json({ message: "Failed to create address" });
    }
  });
  app2.patch("/api/addresses/:id", isAuthenticated, async (req, res) => {
    try {
      const { label, firstName, lastName, address, city, postalCode, phone, isDefault } = req.body;
      const addr = await storage.updateUserAddress(req.params.id, req.user.id, {
        label,
        firstName,
        lastName,
        address,
        city,
        postalCode,
        phone,
        isDefault
      });
      res.json(addr);
    } catch (error) {
      if (error.message === "Address not found") return res.status(404).json({ message: error.message });
      res.status(500).json({ message: "Failed to update address" });
    }
  });
  app2.delete("/api/addresses/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteUserAddress(req.params.id, req.user.id);
      if (!deleted) return res.status(404).json({ message: "Address not found" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete address" });
    }
  });
  app2.post("/api/addresses/:id/default", isAuthenticated, async (req, res) => {
    try {
      await storage.setDefaultAddress(req.params.id, req.user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to set default address" });
    }
  });
  app2.get("/api/admin/customers/:userId/addresses", adminAuth, async (req, res) => {
    try {
      const addresses = await storage.getAdminUserAddresses(req.params.userId);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer addresses" });
    }
  });
  app2.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await storage.getAdminUserByUsername(username);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValidPassword = await bcrypt2.compare(password, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt4.sign(
        { adminId: admin.id, username: admin.username },
        JWT_SECRET2,
        { expiresIn: "24h" }
      );
      const permissions = admin.roleData?.permissions || null;
      res.json({
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          roleId: admin.roleId,
          permissions
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  storage.initializeDefaultRoles().catch(console.error);
  app2.post("/api/admin/change-password", adminAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const adminId = req.admin.id;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      const admin = await storage.getAdminUser(adminId);
      if (!admin) {
        return res.status(404).json({ message: "Admin user not found" });
      }
      const isValidPassword = await bcrypt2.compare(currentPassword, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      const newPasswordHash = await bcrypt2.hash(newPassword, 10);
      await storage.updateAdminUserPassword(adminId, newPasswordHash);
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
  app2.get("/api/admin/profile", adminAuth, async (req, res) => {
    try {
      const adminId = req.admin.id;
      const admin = await storage.getAdminUser(adminId);
      if (!admin) {
        return res.status(404).json({ message: "Admin user not found" });
      }
      let permissions = null;
      if (admin.roleId) {
        const role = await storage.getRole(admin.roleId);
        if (role) {
          permissions = role.permissions;
        }
      }
      res.json({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        roleId: admin.roleId,
        profilePicture: admin.profilePicture,
        permissions
      });
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  app2.patch("/api/admin/profile", adminAuth, async (req, res) => {
    try {
      const adminId = req.admin.id;
      const { username, email } = req.body;
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      if (typeof username === "string" && username.trim()) {
        updates.username = username.trim().slice(0, 50);
      }
      if (typeof email === "string" && email.trim()) {
        updates.email = email.trim().slice(0, 100);
      }
      const updatedAdmin = await storage.updateAdminUser(adminId, updates);
      res.json({
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        profilePicture: updatedAdmin.profilePicture
      });
    } catch (error) {
      console.error("Error updating admin profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.post("/api/admin/profile/picture", adminAuth, async (req, res) => {
    try {
      const adminId = req.admin.id;
      const { imageData } = req.body;
      if (!imageData || typeof imageData !== "string") {
        return res.status(400).json({ message: "Image data is required" });
      }
      if (!imageData.startsWith("data:image/")) {
        return res.status(400).json({ message: "Invalid image format" });
      }
      const base64Size = imageData.length * 0.75;
      if (base64Size > 2 * 1024 * 1024) {
        return res.status(400).json({ message: "Image size must be less than 2MB" });
      }
      const updatedAdmin = await storage.updateAdminUser(adminId, {
        profilePicture: imageData
      });
      res.json({ success: true, profilePicture: updatedAdmin.profilePicture });
    } catch (error) {
      console.error("Error uploading admin profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });
  app2.delete("/api/admin/profile/picture", adminAuth, async (req, res) => {
    try {
      const adminId = req.admin.id;
      await storage.updateAdminUser(adminId, {
        profilePicture: null
      });
      res.json({ success: true, message: "Profile picture deleted" });
    } catch (error) {
      console.error("Error deleting admin profile picture:", error);
      res.status(500).json({ message: "Failed to delete profile picture" });
    }
  });
  app2.get("/api/admin/roles", adminAuth, async (req, res) => {
    try {
      const roles2 = await storage.getRoles();
      res.json(roles2);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });
  app2.get("/api/admin/roles/:id", adminAuth, async (req, res) => {
    try {
      const role = await storage.getRole(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ message: "Failed to fetch role" });
    }
  });
  app2.post("/api/admin/roles", adminAuth, async (req, res) => {
    try {
      const { name, displayName, description, permissions } = req.body;
      const existing = await storage.getRoleByName(name);
      if (existing) {
        return res.status(400).json({ message: "Role name already exists" });
      }
      const role = await storage.createRole({
        name,
        displayName,
        description,
        permissions,
        isSystem: false
      });
      res.json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Failed to create role" });
    }
  });
  app2.patch("/api/admin/roles/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const roleData = req.body;
      const existingRole = await storage.getRole(id);
      if (!existingRole) {
        return res.status(404).json({ message: "Role not found" });
      }
      if (existingRole.isSystem && roleData.name && roleData.name !== existingRole.name) {
        return res.status(400).json({ message: "Cannot change name of system role" });
      }
      const role = await storage.updateRole(id, roleData);
      res.json(role);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });
  app2.delete("/api/admin/roles/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const existingRole = await storage.getRole(id);
      if (!existingRole) {
        return res.status(404).json({ message: "Role not found" });
      }
      if (existingRole.isSystem) {
        return res.status(400).json({ message: "Cannot delete system role" });
      }
      const deleted = await storage.deleteRole(id);
      res.json({ message: "Role deleted successfully" });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ message: "Failed to delete role" });
    }
  });
  app2.get("/api/admin/users", adminAuth, async (req, res) => {
    try {
      const users2 = await storage.getAdminUsers();
      const safeUsers = users2.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        roleId: u.roleId,
        roleData: u.roleData,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/users/:id", adminAuth, async (req, res) => {
    try {
      const user = await storage.getAdminUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/admin/users", adminAuth, async (req, res) => {
    try {
      const { username, email, password, roleId, isActive = true } = req.body;
      const existingUsername = await storage.getAdminUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const existingEmail = await storage.getAdminUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const passwordHash = await bcrypt2.hash(password, 10);
      let roleName = "staff";
      if (roleId) {
        const role = await storage.getRole(roleId);
        if (role) {
          roleName = role.name;
        }
      }
      const user = await storage.createAdminUser({
        username,
        email,
        passwordHash,
        role: roleName,
        roleId,
        isActive
      });
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        isActive: user.isActive,
        createdAt: user.createdAt
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.patch("/api/admin/users/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, password, roleId, isActive } = req.body;
      const existingUser = await storage.getAdminUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const updateData = {};
      if (username && username !== existingUser.username) {
        const existingUsername = await storage.getAdminUserByUsername(username);
        if (existingUsername) {
          return res.status(400).json({ message: "Username already exists" });
        }
        updateData.username = username;
      }
      if (email && email !== existingUser.email) {
        const existingEmail = await storage.getAdminUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
        updateData.email = email;
      }
      if (password) {
        updateData.passwordHash = await bcrypt2.hash(password, 10);
      }
      if (roleId !== void 0) {
        updateData.roleId = roleId;
        if (roleId) {
          const role = await storage.getRole(roleId);
          if (role) {
            updateData.role = role.name;
          }
        }
      }
      if (isActive !== void 0) {
        updateData.isActive = isActive;
      }
      const user = await storage.updateAdminUser(id, updateData);
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.delete("/api/admin/users/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      if (req.admin.id === id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      const existingUser = await storage.getAdminUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const deleted = await storage.deleteAdminUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/categories/featured", async (req, res) => {
    try {
      const categories2 = await storage.getFeaturedCategories();
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching featured categories:", error);
      res.status(500).json({ message: "Failed to fetch featured categories" });
    }
  });
  app2.post("/api/categories", adminAuth, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  app2.patch("/api/categories/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });
  app2.delete("/api/categories/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const {
        categoryId,
        search,
        isActive,
        isFeatured,
        limit = "20",
        offset = "0"
      } = req.query;
      const products2 = await storage.getProducts({
        categoryId,
        search,
        isActive: isActive === "true" ? true : isActive === "false" ? false : void 0,
        isFeatured: isFeatured === "true" ? true : isFeatured === "false" ? false : void 0,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/featured", async (req, res) => {
    try {
      const products2 = await storage.getProducts({
        isFeatured: true,
        isActive: true,
        limit: 8
      });
      res.json(products2);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  app2.post("/api/products", adminAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  app2.patch("/api/products/:id", adminAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  app2.delete("/api/products/:id", adminAuth, async (req, res) => {
    try {
      const result = await storage.deleteProduct(req.params.id);
      if (!result.success) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (result.softDeleted) {
        res.json({ message: "Product has been deactivated (it has order history)", softDeleted: true });
      } else {
        res.json({ message: "Product deleted successfully" });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  app2.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItems2 = await storage.getCartItems(userId);
      res.json(cartItems2);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  app2.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });
  app2.patch("/api/cart/:productId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItemByProductId(userId, req.params.productId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  app2.delete("/api/cart/:productId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const success = await storage.removeFromCartByProductId(userId, req.params.productId);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });
  app2.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  app2.post("/api/cart/merge", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Items must be an array" });
      }
      for (const item of items) {
        if (item.productId && item.quantity > 0) {
          const existingItems = await storage.getCartItems(userId);
          const existing = existingItems.find((ci) => ci.productId === item.productId);
          if (existing) {
            await storage.updateCartItemByProductId(userId, item.productId, existing.quantity + item.quantity);
          } else {
            await storage.addToCart({
              userId,
              productId: item.productId,
              quantity: item.quantity
            });
          }
        }
      }
      const mergedCart = await storage.getCartItems(userId);
      res.json(mergedCart);
    } catch (error) {
      console.error("Error merging cart:", error);
      res.status(500).json({ message: "Failed to merge cart" });
    }
  });
  app2.get("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const wishlistItems2 = await storage.getWishlistItems(userId);
      res.json(wishlistItems2);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });
  app2.post("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      const wishlistItem = await storage.addToWishlist({ userId, productId });
      res.json(wishlistItem);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });
  app2.delete("/api/wishlist/:productId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const success = await storage.removeFromWishlist(userId, req.params.productId);
      if (!success) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      res.json({ message: "Item removed from wishlist" });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });
  app2.get("/api/wishlist/check/:productId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const isInWishlist = await storage.isInWishlist(userId, req.params.productId);
      res.json({ isInWishlist });
    } catch (error) {
      console.error("Error checking wishlist:", error);
      res.status(500).json({ message: "Failed to check wishlist" });
    }
  });
  app2.delete("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      await storage.clearWishlist(userId);
      res.json({ message: "Wishlist cleared" });
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      res.status(500).json({ message: "Failed to clear wishlist" });
    }
  });
  app2.post("/api/wishlist/merge", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Items must be an array" });
      }
      for (const productId of items) {
        if (productId) {
          await storage.addToWishlist({ userId, productId });
        }
      }
      const mergedWishlist = await storage.getWishlistItems(userId);
      res.json(mergedWishlist);
    } catch (error) {
      console.error("Error merging wishlist:", error);
      res.status(500).json({ message: "Failed to merge wishlist" });
    }
  });
  app2.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const orders2 = await storage.getOrders(userId);
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/orders/pending-count", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const count2 = await storage.getCustomerPendingOrdersCount(userId);
      res.json({ count: count2 });
    } catch (error) {
      console.error("Error fetching pending orders count:", error);
      res.status(500).json({ message: "Failed to fetch pending orders count" });
    }
  });
  app2.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const order = await storage.getOrderWithItems(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  app2.post("/api/orders/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.userId !== userId) {
        return res.status(403).json({ message: "You can only cancel your own orders" });
      }
      if (order.status !== "pending" && order.status !== "processing") {
        return res.status(400).json({
          message: "This order cannot be cancelled. Orders can only be cancelled before shipping."
        });
      }
      const updatedOrder = await storage.updateOrder(orderId, { status: "cancelled" });
      if (order.paymentStatus === "completed") {
        await storage.updateOrder(orderId, { paymentStatus: "refunded" });
        const transactions = await storage.getPaymentTransactions({ orderId });
        if (transactions.length > 0) {
          await storage.updatePaymentTransaction(transactions[0].id, { status: "refunded" });
        }
      }
      const walletAmountUsed = parseFloat(order.walletAmountUsed || "0");
      if (walletAmountUsed > 0 && order.userId) {
        const wallet = await storage.getWalletByUserId(order.userId);
        if (wallet) {
          const currentBalance = parseFloat(wallet.balance);
          const newBalance = (currentBalance + walletAmountUsed).toFixed(2);
          await storage.updateWalletBalance(wallet.id, newBalance);
          await storage.createWalletTransaction({
            walletId: wallet.id,
            type: "credit",
            amount: walletAmountUsed.toString(),
            balanceAfter: newBalance,
            description: `Refund for cancelled order #${order.orderNumber || order.id.slice(-8).toUpperCase()}`,
            referenceType: "order",
            referenceId: order.id
          });
        }
      }
      const orderItems2 = await storage.getOrderItems(orderId);
      for (const item of orderItems2) {
        await storage.increaseProductStock(item.productId, item.quantity);
      }
      const user = await storage.getUser(userId);
      const customerName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.email || "Customer";
      const orderNumber = order.id.slice(-8).toUpperCase();
      await sendAdminNotification(
        "order_status_update",
        { orderNumber, customerName, status: "cancelled", statusMessage: `Order was cancelled by ${customerName}` },
        { title: "Order Cancelled by Customer", message: `Order #{{orderNumber}} was cancelled by {{customerName}}` },
        { orderId, userId, reason: "customer_requested" }
      );
      res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });
  app2.post("/api/orders/guest", async (req, res) => {
    try {
      const settings = await storage.getStoreSettings();
      if (!settings.guestCheckoutEnabled) {
        return res.status(403).json({ message: "Guest checkout is not enabled" });
      }
      const { guestName, guestEmail, guestPhone, shippingAddress, paymentMethod, items } = req.body;
      if (!guestName || !guestPhone || !shippingAddress) {
        return res.status(400).json({ message: "Guest name, phone, and shipping address are required" });
      }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      const validPaymentMethods = ["cod", "easypaisa", "jazzcash", "hbl", "bank_transfer"];
      if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({ message: "Invalid payment method" });
      }
      const aggregated = /* @__PURE__ */ new Map();
      for (const item of items) {
        if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
          return res.status(400).json({ message: "Invalid item: productId and positive integer quantity are required" });
        }
        aggregated.set(item.productId, (aggregated.get(item.productId) ?? 0) + item.quantity);
      }
      const validatedItems = [];
      for (const entry of Array.from(aggregated.entries())) {
        const productId = entry[0];
        const quantity = entry[1];
        const product = await storage.getProduct(productId);
        if (!product || !product.isActive) {
          return res.status(400).json({ message: `Product not found: ${productId}` });
        }
        if (product.stock < quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`
          });
        }
        validatedItems.push({ product, quantity });
      }
      const computedSubtotal = validatedItems.reduce(
        (sum, { product, quantity }) => sum + parseFloat(product.price) * quantity,
        0
      );
      const configuredShippingFee = parseFloat(settings?.shippingFee || "300");
      const configuredFreeThreshold = parseFloat(settings?.freeShippingThreshold || "5000");
      const computedShippingCost = configuredFreeThreshold > 0 && computedSubtotal >= configuredFreeThreshold ? 0 : configuredShippingFee;
      const computedTotal = computedSubtotal + computedShippingCost;
      const { randomBytes } = await import("crypto");
      const guestToken = randomBytes(32).toString("hex");
      const orderNumber = `PKM-${Date.now()}`;
      const order = await db.transaction(async (tx) => {
        const [created] = await tx.insert(orders).values({
          orderNumber,
          userId: null,
          guestName,
          guestEmail: guestEmail || null,
          guestPhone,
          guestToken,
          paymentMethod,
          subtotal: computedSubtotal.toString(),
          shippingCost: computedShippingCost.toString(),
          total: computedTotal.toString(),
          shippingAddress,
          status: "pending",
          paymentStatus: "pending",
          verificationStatus: paymentMethod === "cod" ? "approved" : "pending"
        }).returning();
        for (const { product, quantity } of validatedItems) {
          const decrementResult = await tx.execute(
            sql3`UPDATE products SET stock = stock - ${quantity} WHERE id = ${product.id} AND stock >= ${quantity} RETURNING id`
          );
          if (!decrementResult.rows || decrementResult.rows.length === 0) {
            throw new Error(`Insufficient stock for ${product.name} \u2014 the item may have sold out while you were checking out.`);
          }
          await tx.insert(orderItems).values({
            orderId: created.id,
            productId: product.id,
            quantity,
            price: product.price,
            total: (parseFloat(product.price) * quantity).toString()
          });
        }
        return created;
      });
      try {
        await sendAdminNotification(
          "order_placed",
          { orderNumber: order.orderNumber, customerName: guestName + " (Guest)", total: parseFloat(order.total).toLocaleString() },
          defaultNotificationMessages.order_placed,
          { orderId: order.id, total: order.total }
        );
      } catch (notificationError) {
        console.error("Error creating order notification:", notificationError);
      }
      if (guestEmail) {
        try {
          sendOrderConfirmationEmail(
            guestEmail,
            guestName,
            order.id,
            order.total,
            paymentMethod || "Unknown"
          ).catch((err) => console.error("Guest order confirmation email error:", err));
        } catch (emailError) {
          console.error("Error sending guest order confirmation email:", emailError);
        }
      }
      res.json(order);
    } catch (error) {
      console.error("Error creating guest order:", error);
      res.status(500).json({ message: "Failed to create guest order" });
    }
  });
  app2.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { walletAmountUsed, couponId, couponCode, couponDiscount, ...restBody } = req.body;
      const orderData = insertOrderSchema.parse({
        ...restBody,
        userId,
        walletAmountUsed: walletAmountUsed ? walletAmountUsed.toString() : "0",
        couponCode: couponCode || null,
        discountAmount: couponDiscount ? couponDiscount.toString() : "0"
      });
      const cartItems2 = await storage.getCartItems(userId);
      if (!cartItems2 || cartItems2.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      for (const cartItem of cartItems2) {
        const product = await storage.getProduct(cartItem.productId);
        if (!product || product.stock < cartItem.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for product: ${product?.name || "Unknown"}. Available: ${product?.stock || 0}, Requested: ${cartItem.quantity}`
          });
        }
      }
      const walletAmount = parseFloat(walletAmountUsed || "0");
      let walletId = null;
      let newWalletBalance = null;
      if (walletAmount > 0) {
        const wallet = await storage.getWalletByUserId(userId);
        if (!wallet) {
          return res.status(400).json({ message: "Wallet not found" });
        }
        const currentBalance = parseFloat(wallet.balance);
        if (walletAmount > currentBalance) {
          return res.status(400).json({ message: "Insufficient wallet balance" });
        }
        newWalletBalance = (currentBalance - walletAmount).toFixed(2);
        walletId = wallet.id;
        await storage.updateWalletBalance(wallet.id, newWalletBalance);
      }
      const order = await storage.createOrder(orderData);
      if (orderData.paymentMethod === "wallet" || orderData.paymentMethod === "cod") {
        await storage.updateOrder(order.id, {
          verificationStatus: "approved",
          paymentStatus: orderData.paymentMethod === "wallet" ? "completed" : "pending"
        });
      }
      if (walletAmount > 0 && walletId && newWalletBalance !== null) {
        await storage.createWalletTransaction({
          walletId,
          type: "debit",
          amount: walletAmount.toString(),
          balanceAfter: newWalletBalance,
          description: `Order #${order.orderNumber || order.id.slice(-8).toUpperCase()}`,
          referenceType: "order",
          referenceId: order.id
        });
      }
      if (couponId) {
        try {
          await storage.createCouponRedemption({
            couponId,
            userId,
            orderId: order.id,
            discountAmount: couponDiscount ? couponDiscount.toString() : "0"
          });
        } catch (couponError) {
          console.error("Error recording coupon redemption:", couponError);
        }
      }
      for (const cartItem of cartItems2) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
          total: (parseFloat(cartItem.product.price) * cartItem.quantity).toString()
        });
        await storage.reduceProductStock(cartItem.productId, cartItem.quantity);
      }
      await storage.clearCart(userId);
      try {
        const gateways = await storage.getPaymentGateways();
        const gateway = gateways.find((g) => g.name === orderData.paymentMethod);
        if (gateway) {
          const transactionStatus = orderData.paymentMethod === "cod" ? "pending" : "pending";
          await storage.createPaymentTransaction({
            orderId: order.id,
            gatewayId: gateway.id,
            amount: order.total,
            currency: "PKR",
            status: transactionStatus
          });
        }
      } catch (transactionError) {
        console.error("Error creating payment transaction:", transactionError);
      }
      const orderWithItems = await storage.getOrderWithItems(order.id);
      try {
        const user = await storage.getUser(userId);
        const customerName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.email || "Customer";
        const orderNumber = order.id.slice(-8).toUpperCase();
        await sendAdminNotification(
          "order_placed",
          { orderNumber, customerName, total: parseFloat(order.total).toLocaleString() },
          defaultNotificationMessages.order_placed,
          { orderId: order.id, userId, total: order.total }
        );
        for (const cartItem of cartItems2) {
          const updatedProduct = await storage.getProduct(cartItem.productId);
          if (updatedProduct && updatedProduct.stock <= 10) {
            await sendAdminNotification(
              "low_stock",
              { productName: updatedProduct.name, stock: updatedProduct.stock },
              defaultNotificationMessages.low_stock,
              { productId: updatedProduct.id, currentStock: updatedProduct.stock }
            );
          }
        }
      } catch (notificationError) {
        console.error("Error creating order notification:", notificationError);
      }
      try {
        const user = await storage.getUser(userId);
        if (user?.email) {
          sendOrderConfirmationEmail(
            user.email,
            user.firstName || "",
            order.id,
            order.total,
            orderData.paymentMethod || "Unknown"
          ).catch((err) => console.error("Order confirmation email error:", err));
        }
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError);
      }
      res.json(orderWithItems);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  app2.get("/api/admin/orders", adminAuth, async (req, res) => {
    try {
      const { limit = "50", offset = "0" } = req.query;
      const orders2 = await storage.getOrders(
        void 0,
        parseInt(limit),
        parseInt(offset)
      );
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/admin/orders/pending-count", adminAuth, async (req, res) => {
    try {
      const count2 = await storage.getPendingOrdersCount();
      res.json({ count: count2 });
    } catch (error) {
      console.error("Error fetching pending orders count:", error);
      res.status(500).json({ message: "Failed to fetch pending orders count" });
    }
  });
  app2.get("/api/admin/orders/pending-verification", adminAuth, async (req, res) => {
    try {
      const orders2 = await storage.getOrdersPendingVerification();
      res.json(orders2);
    } catch (error) {
      console.error("Error fetching pending verification orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/admin/orders/:id", adminAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const orderItems2 = await storage.getOrderItems(req.params.id);
      res.json({ ...order, items: orderItems2 });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });
  app2.patch("/api/admin/orders/:id", adminAuth, async (req, res) => {
    try {
      const { status, paymentStatus, refundFullToWallet, trackingNumber } = req.body;
      const originalOrder = await storage.getOrder(req.params.id);
      let order;
      if (status === "cancelled") {
        order = await storage.cancelOrderAndRestoreInventory(req.params.id);
        if (originalOrder && originalOrder.userId) {
          const walletAmountUsed = parseFloat(originalOrder.walletAmountUsed || "0");
          const orderTotal = parseFloat(originalOrder.total || "0");
          let refundAmount = walletAmountUsed;
          let refundDescription = `Refund for cancelled order #${originalOrder.orderNumber || originalOrder.id.slice(-8).toUpperCase()}`;
          if (refundFullToWallet && orderTotal > 0) {
            refundAmount = orderTotal;
            refundDescription = `Full refund to wallet for cancelled order #${originalOrder.orderNumber || originalOrder.id.slice(-8).toUpperCase()}`;
          }
          if (refundAmount > 0) {
            let wallet = await storage.getWalletByUserId(originalOrder.userId);
            if (!wallet) {
              wallet = await storage.createWallet(originalOrder.userId);
            }
            const currentBalance = parseFloat(wallet.balance);
            const newBalance = (currentBalance + refundAmount).toFixed(2);
            await storage.updateWalletBalance(wallet.id, newBalance);
            await storage.createWalletTransaction({
              walletId: wallet.id,
              type: "credit",
              amount: refundAmount.toString(),
              balanceAfter: newBalance,
              description: refundDescription,
              referenceType: "order",
              referenceId: originalOrder.id
            });
          }
        }
      } else {
        order = await storage.updateOrder(req.params.id, {
          ...status !== void 0 && { status },
          ...paymentStatus !== void 0 && { paymentStatus },
          ...trackingNumber !== void 0 && { trackingNumber }
        });
      }
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (originalOrder && order.userId && status && originalOrder.status !== status) {
        try {
          const statusMessages = {
            "pending": "Your order is being reviewed.",
            "processing": "Your order is now being processed.",
            "shipped": "Great news! Your order has been shipped.",
            "delivered": "Your order has been delivered. Enjoy!",
            "cancelled": "Your order has been cancelled."
          };
          const orderNumber = order.id.slice(-8).toUpperCase();
          const statusMessage = statusMessages[status] || `Your order status changed to ${status}.`;
          await sendCustomerNotification(
            order.userId,
            "order_status_update",
            { orderNumber, status, statusMessage },
            defaultNotificationMessages.order_status_update,
            { orderId: order.id, status, previousStatus: originalOrder.status }
          );
          if (await shouldSendEmailNotification("order_status_update")) {
            const user = await storage.getUser(order.userId);
            if (user?.email) {
              sendOrderStatusUpdateEmail(
                user.email,
                user.firstName || "",
                order.id,
                status
              ).catch((err) => console.error("Order status email error:", err));
            }
          }
        } catch (notificationError) {
          console.error("Error creating order update notification:", notificationError);
        }
      }
      if (paymentStatus && originalOrder && originalOrder.paymentStatus !== paymentStatus) {
        try {
          const transactions = await storage.getPaymentTransactions({ orderId: order.id });
          if (transactions.length > 0) {
            const statusMapping = {
              "pending": "pending",
              "processing": "processing",
              "completed": "completed",
              "failed": "failed",
              "refunded": "refunded"
            };
            const transactionStatus = statusMapping[paymentStatus] || paymentStatus;
            await storage.updatePaymentTransaction(transactions[0].id, { status: transactionStatus });
          }
        } catch (transactionError) {
          console.error("Error updating payment transaction:", transactionError);
        }
      }
      if (originalOrder && order.userId && paymentStatus && originalOrder.paymentStatus !== paymentStatus) {
        try {
          const paymentMessages = {
            "pending": "Payment is pending for your order.",
            "completed": "Payment received! Thank you for your purchase.",
            "failed": "Payment failed. Please try again or contact support.",
            "refunded": "Your order payment has been refunded."
          };
          const orderNumber = order.id.slice(-8).toUpperCase();
          const paymentType = paymentStatus === "completed" ? "payment_received" : paymentStatus === "failed" ? "payment_failed" : "general";
          await sendCustomerNotification(
            order.userId,
            paymentType,
            { orderNumber, amount: order.total },
            { title: `Payment Update for Order #{{orderNumber}}`, message: paymentMessages[paymentStatus] || `Payment status changed to ${paymentStatus}.` },
            { orderId: order.id, paymentStatus, previousPaymentStatus: originalOrder.paymentStatus }
          );
        } catch (notificationError) {
          console.error("Error creating payment update notification:", notificationError);
        }
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });
  app2.post("/api/admin/inventory/adjust/:productId", adminAuth, async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity, operation } = req.body;
      let updatedProduct;
      if (operation === "increase") {
        updatedProduct = await storage.increaseProductStock(productId, quantity);
      } else if (operation === "decrease") {
        updatedProduct = await storage.reduceProductStock(productId, quantity);
      } else {
        return res.status(400).json({ message: "Invalid operation. Use 'increase' or 'decrease'" });
      }
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error adjusting inventory:", error);
      res.status(500).json({ message: "Failed to adjust inventory" });
    }
  });
  app2.get("/api/admin/suppliers", adminAuth, async (req, res) => {
    try {
      const suppliers2 = await storage.getSuppliers();
      res.json(suppliers2);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });
  app2.get("/api/admin/suppliers/:id", adminAuth, async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });
  app2.post("/api/admin/suppliers", adminAuth, async (req, res) => {
    try {
      const { name, contactPerson, email, phone, address, city, notes, isActive } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Supplier name is required" });
      }
      const supplier = await storage.createSupplier({
        name: name.trim(),
        contactPerson: contactPerson?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        notes: notes?.trim() || null,
        isActive: isActive !== false
      });
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });
  app2.patch("/api/admin/suppliers/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, contactPerson, email, phone, address, city, notes, isActive } = req.body;
      const existingSupplier = await storage.getSupplier(id);
      if (!existingSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      if (name !== void 0) updates.name = name.trim();
      if (contactPerson !== void 0) updates.contactPerson = contactPerson?.trim() || null;
      if (email !== void 0) updates.email = email?.trim() || null;
      if (phone !== void 0) updates.phone = phone?.trim() || null;
      if (address !== void 0) updates.address = address?.trim() || null;
      if (city !== void 0) updates.city = city?.trim() || null;
      if (notes !== void 0) updates.notes = notes?.trim() || null;
      if (isActive !== void 0) updates.isActive = isActive;
      const supplier = await storage.updateSupplier(id, updates);
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });
  app2.delete("/api/admin/suppliers/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const existingSupplier = await storage.getSupplier(id);
      if (!existingSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      await storage.deleteSupplier(id);
      res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });
  app2.get("/api/admin/purchases", adminAuth, async (req, res) => {
    try {
      const purchases2 = await storage.getPurchases();
      res.json(purchases2);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });
  app2.get("/api/admin/purchases/:id", adminAuth, async (req, res) => {
    try {
      const purchase = await storage.getPurchase(req.params.id);
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      res.json(purchase);
    } catch (error) {
      console.error("Error fetching purchase:", error);
      res.status(500).json({ message: "Failed to fetch purchase" });
    }
  });
  app2.post("/api/admin/purchases", adminAuth, async (req, res) => {
    try {
      const { supplierId, items, shippingCost, otherCosts, notes, expectedDate } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "At least one item is required" });
      }
      let subtotal = 0;
      for (const item of items) {
        if (!item.productId || !item.quantity || !item.costPrice) {
          return res.status(400).json({ message: "Each item must have productId, quantity, and costPrice" });
        }
        subtotal += item.quantity * parseFloat(item.costPrice);
      }
      const total = subtotal + parseFloat(shippingCost || 0) + parseFloat(otherCosts || 0);
      const purchase = await storage.createPurchase({
        supplierId: supplierId || null,
        status: "pending",
        subtotal: subtotal.toString(),
        shippingCost: (shippingCost || 0).toString(),
        otherCosts: (otherCosts || 0).toString(),
        total: total.toString(),
        notes: notes || null,
        expectedDate: expectedDate ? new Date(expectedDate) : null
      }, items, req.admin.id);
      res.status(201).json(purchase);
    } catch (error) {
      console.error("Error creating purchase:", error);
      res.status(500).json({ message: "Failed to create purchase" });
    }
  });
  app2.patch("/api/admin/purchases/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { supplierId, shippingCost, otherCosts, notes, expectedDate } = req.body;
      const existingPurchase = await storage.getPurchase(id);
      if (!existingPurchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      if (existingPurchase.status === "received" || existingPurchase.status === "cancelled") {
        return res.status(400).json({ message: "Cannot update a received or cancelled purchase" });
      }
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      if (supplierId !== void 0) updates.supplierId = supplierId;
      if (shippingCost !== void 0) updates.shippingCost = shippingCost.toString();
      if (otherCosts !== void 0) updates.otherCosts = otherCosts.toString();
      if (notes !== void 0) updates.notes = notes;
      if (expectedDate !== void 0) updates.expectedDate = expectedDate ? new Date(expectedDate) : null;
      if (shippingCost !== void 0 || otherCosts !== void 0) {
        const subtotal = parseFloat(existingPurchase.subtotal);
        const newShipping = shippingCost !== void 0 ? parseFloat(shippingCost) : parseFloat(existingPurchase.shippingCost || "0");
        const newOther = otherCosts !== void 0 ? parseFloat(otherCosts) : parseFloat(existingPurchase.otherCosts || "0");
        updates.total = (subtotal + newShipping + newOther).toString();
      }
      const purchase = await storage.updatePurchase(id, updates);
      res.json(purchase);
    } catch (error) {
      console.error("Error updating purchase:", error);
      res.status(500).json({ message: "Failed to update purchase" });
    }
  });
  app2.patch("/api/admin/purchases/:id/status", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const validStatuses = ["pending", "ordered", "received", "partially_received", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const existingPurchase = await storage.getPurchase(id);
      if (!existingPurchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      const purchase = await storage.updatePurchaseStatus(id, status);
      res.json(purchase);
    } catch (error) {
      console.error("Error updating purchase status:", error);
      res.status(500).json({ message: "Failed to update purchase status" });
    }
  });
  app2.post("/api/admin/purchases/:id/receive", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { receivedItems } = req.body;
      const existingPurchase = await storage.getPurchase(id);
      if (!existingPurchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      if (existingPurchase.status === "cancelled") {
        return res.status(400).json({ message: "Cannot receive a cancelled purchase" });
      }
      const purchase = await storage.receivePurchase(id, receivedItems, req.admin.id);
      res.json(purchase);
    } catch (error) {
      console.error("Error receiving purchase:", error);
      res.status(500).json({ message: "Failed to receive purchase" });
    }
  });
  app2.delete("/api/admin/purchases/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const existingPurchase = await storage.getPurchase(id);
      if (!existingPurchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      if (existingPurchase.status === "received" || existingPurchase.status === "partially_received") {
        return res.status(400).json({ message: "Cannot delete a received purchase" });
      }
      await storage.deletePurchase(id);
      res.json({ message: "Purchase deleted successfully" });
    } catch (error) {
      console.error("Error deleting purchase:", error);
      res.status(500).json({ message: "Failed to delete purchase" });
    }
  });
  app2.get("/api/admin/inventory/summary", adminAuth, async (req, res) => {
    try {
      const summary = await storage.getInventorySummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching inventory summary:", error);
      res.status(500).json({ message: "Failed to fetch inventory summary" });
    }
  });
  app2.get("/api/admin/inventory/low-stock", adminAuth, async (req, res) => {
    try {
      const products2 = await storage.getLowStockProducts();
      res.json(products2);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });
  app2.get("/api/admin/inventory/adjustments", adminAuth, async (req, res) => {
    try {
      const { productId } = req.query;
      const adjustments = await storage.getStockAdjustments(
        productId
      );
      res.json(adjustments);
    } catch (error) {
      console.error("Error fetching stock adjustments:", error);
      res.status(500).json({ message: "Failed to fetch stock adjustments" });
    }
  });
  app2.post("/api/admin/inventory/adjust", adminAuth, async (req, res) => {
    try {
      const { productId, newStock, reason, adjustmentType } = req.body;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      if (typeof newStock !== "number" || newStock < 0) {
        return res.status(400).json({ message: "New stock must be a non-negative number" });
      }
      const validTypes = ["manual", "damage", "return", "correction", "other"];
      if (adjustmentType && !validTypes.includes(adjustmentType)) {
        return res.status(400).json({ message: "Invalid adjustment type" });
      }
      const result = await storage.adjustProductStock(
        productId,
        newStock,
        adjustmentType || "manual",
        reason || null,
        req.admin.id
      );
      res.json(result);
    } catch (error) {
      console.error("Error adjusting stock:", error);
      res.status(500).json({ message: "Failed to adjust stock" });
    }
  });
  app2.get("/api/admin/profit-analytics", adminAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : void 0;
      const end = endDate ? new Date(endDate) : void 0;
      const analytics = await storage.getProfitAnalytics(start, end);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching profit analytics:", error);
      res.status(500).json({ message: "Failed to fetch profit analytics" });
    }
  });
  app2.get("/api/admin/balance-sheet", adminAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : void 0;
      const end = endDate ? new Date(endDate) : void 0;
      const balanceSheet = await storage.getBalanceSheet(start, end);
      res.json(balanceSheet);
    } catch (error) {
      console.error("Error fetching balance sheet:", error);
      res.status(500).json({ message: "Failed to fetch balance sheet" });
    }
  });
  app2.get("/api/admin/notification-types", adminAuth, async (req, res) => {
    try {
      await storage.seedNotificationTypes();
      const types = await storage.getNotificationTypes();
      res.json(types);
    } catch (error) {
      console.error("Error fetching notification types:", error);
      res.status(500).json({ message: "Failed to fetch notification types" });
    }
  });
  app2.patch("/api/admin/notification-types/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateNotificationType(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Notification type not found" });
      }
      invalidateNotificationSettingsCache();
      res.json(updated);
    } catch (error) {
      console.error("Error updating notification type:", error);
      res.status(500).json({ message: "Failed to update notification type" });
    }
  });
  app2.patch("/api/admin/notification-types/:id/toggle", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { field, value } = req.body;
      if (!["isEnabled", "isEmailEnabled", "isInAppEnabled"].includes(field)) {
        return res.status(400).json({ message: "Invalid field" });
      }
      const updated = await storage.toggleNotificationType(id, field, value);
      if (!updated) {
        return res.status(404).json({ message: "Notification type not found" });
      }
      invalidateNotificationSettingsCache();
      res.json(updated);
    } catch (error) {
      console.error("Error toggling notification type:", error);
      res.status(500).json({ message: "Failed to toggle notification type" });
    }
  });
  app2.get("/api/admin/notification-templates", adminAuth, async (req, res) => {
    try {
      const templates = await storage.getNotificationTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching notification templates:", error);
      res.status(500).json({ message: "Failed to fetch notification templates" });
    }
  });
  app2.get("/api/admin/notification-templates/by-type/:typeKey", adminAuth, async (req, res) => {
    try {
      const { typeKey } = req.params;
      const templates = await storage.getNotificationTemplatesByType(typeKey);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates by type:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  app2.post("/api/admin/notification-templates", adminAuth, async (req, res) => {
    try {
      const template = await storage.createNotificationTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating notification template:", error);
      res.status(500).json({ message: "Failed to create notification template" });
    }
  });
  app2.patch("/api/admin/notification-templates/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateNotificationTemplate(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating notification template:", error);
      res.status(500).json({ message: "Failed to update notification template" });
    }
  });
  app2.patch("/api/admin/notification-templates/:id/toggle", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const updated = await storage.toggleNotificationTemplate(id, isActive);
      if (!updated) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error toggling notification template:", error);
      res.status(500).json({ message: "Failed to toggle notification template" });
    }
  });
  app2.delete("/api/admin/notification-templates/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotificationTemplate(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification template:", error);
      res.status(500).json({ message: "Failed to delete notification template" });
    }
  });
  app2.get("/api/admin/stats", adminAuth, async (req, res) => {
    try {
      const orders2 = await storage.getOrders();
      const products2 = await storage.getProducts();
      const totalOrders = orders2.length;
      const totalProducts = products2.length;
      const totalRevenue = orders2.filter((order) => order.paymentStatus === "completed").reduce((sum, order) => sum + parseFloat(order.total), 0);
      res.json({
        totalOrders,
        totalProducts,
        totalRevenue,
        totalCustomers: 0
        // This would require a user count query
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app2.post("/api/payment/easypaisa", isAuthenticated, async (req, res) => {
    try {
      const { orderId, amount, phoneNumber } = req.body;
      const gateway = await storage.getPaymentGatewayByName("easypaisa");
      if (!gateway || !gateway.isEnabled) {
        return res.status(400).json({ message: "EasyPaisa payment method is not available" });
      }
      const mockResponse = {
        success: true,
        transactionId: `EP_${Date.now()}`,
        status: "completed",
        message: "Payment processed successfully"
      };
      await storage.createPaymentTransaction({
        orderId,
        gatewayId: gateway.id,
        gatewayTransactionId: mockResponse.transactionId,
        amount,
        currency: "PKR",
        status: mockResponse.status,
        gatewayResponse: mockResponse,
        customerInfo: { phoneNumber },
        processingFee: "0"
      });
      res.json(mockResponse);
    } catch (error) {
      console.error("EasyPaisa payment error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });
  app2.post("/api/payment/jazzcash", isAuthenticated, async (req, res) => {
    try {
      const { orderId, amount, phoneNumber } = req.body;
      const gateway = await storage.getPaymentGatewayByName("jazzcash");
      if (!gateway || !gateway.isEnabled) {
        return res.status(400).json({ message: "JazzCash payment method is not available" });
      }
      const mockResponse = {
        success: true,
        transactionId: `JC_${Date.now()}`,
        status: "completed",
        message: "Payment processed successfully"
      };
      await storage.createPaymentTransaction({
        orderId,
        gatewayId: gateway.id,
        gatewayTransactionId: mockResponse.transactionId,
        amount,
        currency: "PKR",
        status: mockResponse.status,
        gatewayResponse: mockResponse,
        customerInfo: { phoneNumber },
        processingFee: "0"
      });
      res.json(mockResponse);
    } catch (error) {
      console.error("JazzCash payment error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });
  app2.post("/api/payment/hbl", isAuthenticated, async (req, res) => {
    try {
      const { orderId, amount, accountNumber } = req.body;
      const gateway = await storage.getPaymentGatewayByName("hbl");
      if (!gateway || !gateway.isEnabled) {
        return res.status(400).json({ message: "HBL Bank payment method is not available" });
      }
      const mockResponse = {
        success: true,
        transactionId: `HBL_${Date.now()}`,
        status: "pending",
        message: "Bank transfer initiated"
      };
      await storage.createPaymentTransaction({
        orderId,
        gatewayId: gateway.id,
        gatewayTransactionId: mockResponse.transactionId,
        amount,
        currency: "PKR",
        status: mockResponse.status,
        gatewayResponse: mockResponse,
        customerInfo: { accountNumber },
        processingFee: "0"
      });
      res.json(mockResponse);
    } catch (error) {
      console.error("HBL payment error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });
  app2.post("/api/payment/cod", isAuthenticated, async (req, res) => {
    try {
      const { orderId, amount } = req.body;
      const mockResponse = {
        success: true,
        transactionId: `COD_${Date.now()}`,
        status: "pending",
        message: "Cash on Delivery order confirmed. Payment will be collected upon delivery."
      };
      await storage.updateOrder(orderId, {
        paymentStatus: "pending",
        paymentDetails: {
          transactionId: mockResponse.transactionId,
          method: "cod",
          note: "Payment to be collected on delivery"
        }
      });
      res.json(mockResponse);
    } catch (error) {
      console.error("COD payment error:", error);
      res.status(500).json({ message: "COD order processing failed" });
    }
  });
  app2.get("/api/admin/payment-gateways", adminAuth, async (req, res) => {
    try {
      const gateways = await storage.getPaymentGateways();
      res.json(gateways);
    } catch (error) {
      console.error("Error fetching payment gateways:", error);
      res.status(500).json({ message: "Failed to fetch payment gateways" });
    }
  });
  app2.post("/api/admin/payment-gateways", adminAuth, async (req, res) => {
    try {
      const gateway = await storage.createPaymentGateway(req.body);
      res.json(gateway);
    } catch (error) {
      console.error("Error creating payment gateway:", error);
      res.status(500).json({ message: "Failed to create payment gateway" });
    }
  });
  app2.patch("/api/admin/payment-gateways/:id", adminAuth, async (req, res) => {
    try {
      const gateway = await storage.updatePaymentGateway(req.params.id, req.body);
      res.json(gateway);
    } catch (error) {
      console.error("Error updating payment gateway:", error);
      res.status(500).json({ message: "Failed to update payment gateway" });
    }
  });
  app2.get("/api/admin/payment-transactions", adminAuth, async (req, res) => {
    try {
      const { limit = "50", offset = "0", status, gatewayId } = req.query;
      const transactions = await storage.getPaymentTransactions({
        status,
        gatewayId,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching payment transactions:", error);
      res.status(500).json({ message: "Failed to fetch payment transactions" });
    }
  });
  app2.patch("/api/admin/payment-transactions/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedTransaction = await storage.updatePaymentTransaction(id, { status });
      if (!updatedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      if (updatedTransaction.orderId) {
        const paymentStatus = status === "completed" ? "completed" : status === "failed" ? "failed" : status === "refunded" ? "refunded" : "pending";
        await storage.updateOrder(updatedTransaction.orderId, { paymentStatus });
        const order = await storage.getOrder(updatedTransaction.orderId);
        if (order?.userId) {
          const paymentMessages = {
            "pending": "Payment is pending for your order.",
            "completed": "Payment received! Thank you for your purchase.",
            "failed": "Payment failed. Please try again or contact support.",
            "refunded": "Your order payment has been refunded."
          };
          const paymentType = status === "completed" ? "payment_received" : status === "failed" ? "payment_failed" : "general";
          await storage.createNotification({
            recipientType: "customer",
            recipientId: order.userId,
            type: paymentType,
            title: `Payment Update for Order #${order.id.slice(-8).toUpperCase()}`,
            message: paymentMessages[status] || `Payment status changed to ${status}.`,
            data: { orderId: order.id, paymentStatus: status }
          });
        }
      }
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error updating payment transaction:", error);
      res.status(500).json({ message: "Failed to update payment transaction" });
    }
  });
  app2.get("/api/admin/payment-analytics", adminAuth, async (req, res) => {
    try {
      const transactions = await storage.getPaymentTransactions();
      const gateways = await storage.getPaymentGateways();
      const analytics = {
        totalTransactions: transactions.length,
        completedTransactions: transactions.filter((t) => t.status === "completed").length,
        failedTransactions: transactions.filter((t) => t.status === "failed").length,
        pendingTransactions: transactions.filter((t) => t.status === "pending").length,
        totalRevenue: transactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + parseFloat(t.amount), 0),
        gatewayStats: gateways.map((gateway) => {
          const gatewayTransactions = transactions.filter((t) => t.gatewayId === gateway.id);
          return {
            gateway: gateway.displayName,
            totalTransactions: gatewayTransactions.length,
            successRate: gatewayTransactions.length > 0 ? gatewayTransactions.filter((t) => t.status === "completed").length / gatewayTransactions.length * 100 : 0,
            revenue: gatewayTransactions.filter((t) => t.status === "completed").reduce((sum, t) => sum + parseFloat(t.amount), 0)
          };
        })
      };
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching payment analytics:", error);
      res.status(500).json({ message: "Failed to fetch payment analytics" });
    }
  });
  app2.post("/api/admin/initialize-payment-gateways", adminAuth, async (req, res) => {
    try {
      const defaultGateways = [
        {
          name: "easypaisa",
          displayName: "EasyPaisa",
          icon: "smartphone",
          description: "Mobile wallet payments",
          isEnabled: true,
          testMode: true,
          configuration: { supportedOperations: ["wallet_payment", "mobile_account"] }
        },
        {
          name: "jazzcash",
          displayName: "JazzCash",
          icon: "wallet",
          description: "Digital payments made easy",
          isEnabled: true,
          testMode: true,
          configuration: { supportedOperations: ["wallet_payment", "mobile_account"] }
        },
        {
          name: "hbl",
          displayName: "HBL Bank",
          icon: "building",
          description: "Secure bank transfers",
          isEnabled: true,
          testMode: true,
          configuration: { supportedOperations: ["bank_transfer", "online_banking"] }
        },
        {
          name: "cod",
          displayName: "Cash on Delivery",
          icon: "banknote",
          description: "Pay when your order arrives",
          isEnabled: true,
          testMode: false,
          configuration: { supportedOperations: ["cash_payment"] }
        },
        {
          name: "tron_usdt",
          displayName: "Tron USDT (TRC-20)",
          icon: "usdt",
          description: "Pay with USDT on Tron network",
          isEnabled: true,
          testMode: true,
          apiKey: "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          configuration: { walletAddress: "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", network: "tron" }
        },
        {
          name: "binance_pay",
          displayName: "Binance Pay",
          icon: "binance",
          description: "Pay with Binance Pay",
          isEnabled: true,
          testMode: true,
          configuration: { network: "binance", supportedCurrencies: ["USDT", "BUSD", "BNB"] }
        }
      ];
      const createdGateways = [];
      for (const gatewayData of defaultGateways) {
        const existing = await storage.getPaymentGatewayByName(gatewayData.name);
        if (!existing) {
          const gateway = await storage.createPaymentGateway(gatewayData);
          createdGateways.push(gateway);
        }
      }
      res.json({ message: "Payment gateways initialized", gateways: createdGateways });
    } catch (error) {
      console.error("Error initializing payment gateways:", error);
      res.status(500).json({ message: "Failed to initialize payment gateways" });
    }
  });
  app2.post("/api/admin/payment-gateways", adminAuth, async (req, res) => {
    try {
      const { name, displayName, icon, description, isEnabled, testMode, apiKey, apiSecret, webhookUrl, configuration } = req.body;
      const existing = await storage.getPaymentGatewayByName(name);
      if (existing) {
        return res.status(400).json({ message: "Payment gateway with this name already exists" });
      }
      const gateway = await storage.createPaymentGateway({
        name,
        displayName,
        icon: icon || "credit-card",
        description,
        isEnabled: isEnabled ?? true,
        testMode: testMode ?? true,
        apiKey,
        apiSecret,
        webhookUrl,
        configuration
      });
      res.status(201).json(gateway);
    } catch (error) {
      console.error("Error creating payment gateway:", error);
      res.status(500).json({ message: "Failed to create payment gateway" });
    }
  });
  app2.delete("/api/admin/payment-gateways/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const gateway = await storage.getPaymentGateway(id);
      if (!gateway) {
        return res.status(404).json({ message: "Payment gateway not found" });
      }
      const success = await storage.deletePaymentGateway(id);
      if (success) {
        res.json({ message: "Payment gateway deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete payment gateway" });
      }
    } catch (error) {
      console.error("Error deleting payment gateway:", error);
      res.status(500).json({ message: "Failed to delete payment gateway" });
    }
  });
  app2.get("/api/payment-accounts", async (req, res) => {
    try {
      const accounts = await storage.getPaymentAccounts(true);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching payment accounts:", error);
      res.status(500).json({ message: "Failed to fetch payment accounts" });
    }
  });
  app2.get("/api/payment-accounts/method/:method", async (req, res) => {
    try {
      const { method } = req.params;
      const accounts = await storage.getPaymentAccountsByMethod(method);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching payment accounts by method:", error);
      res.status(500).json({ message: "Failed to fetch payment accounts" });
    }
  });
  app2.get("/api/admin/payment-accounts", adminAuth, async (req, res) => {
    try {
      const accounts = await storage.getPaymentAccounts(false);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching payment accounts:", error);
      res.status(500).json({ message: "Failed to fetch payment accounts" });
    }
  });
  app2.post("/api/admin/payment-accounts", adminAuth, async (req, res) => {
    try {
      const { method, bankName, accountNumber, accountHolderName, isActive } = req.body;
      if (!method || !accountNumber || !accountHolderName) {
        return res.status(400).json({ message: "Method, account number, and account holder name are required" });
      }
      const account = await storage.createPaymentAccount({
        method,
        bankName: bankName || null,
        accountNumber,
        accountHolderName,
        isActive: isActive !== false
      });
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating payment account:", error);
      res.status(500).json({ message: "Failed to create payment account" });
    }
  });
  app2.patch("/api/admin/payment-accounts/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const account = await storage.getPaymentAccount(id);
      if (!account) {
        return res.status(404).json({ message: "Payment account not found" });
      }
      const updated = await storage.updatePaymentAccount(id, updates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating payment account:", error);
      res.status(500).json({ message: "Failed to update payment account" });
    }
  });
  app2.delete("/api/admin/payment-accounts/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const account = await storage.getPaymentAccount(id);
      if (!account) {
        return res.status(404).json({ message: "Payment account not found" });
      }
      await storage.deletePaymentAccount(id);
      res.json({ message: "Payment account deleted successfully" });
    } catch (error) {
      console.error("Error deleting payment account:", error);
      res.status(500).json({ message: "Failed to delete payment account" });
    }
  });
  app2.post("/api/orders/guest/:orderId/payment-proof", async (req, res) => {
    try {
      const { orderId } = req.params;
      const { screenshot, transactionId, guestToken } = req.body;
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.userId) {
        return res.status(403).json({ message: "Use the authenticated endpoint for account orders" });
      }
      const orderWithToken = order;
      if (!guestToken || !orderWithToken.guestToken || guestToken !== orderWithToken.guestToken) {
        return res.status(403).json({ message: "Invalid or missing guest token" });
      }
      if (!screenshot || !screenshot.startsWith("data:image/")) {
        return res.status(400).json({ message: "Valid payment screenshot is required" });
      }
      const base64Data = screenshot.split(",")[1];
      if (base64Data && Buffer.from(base64Data, "base64").length > 2 * 1024 * 1024) {
        return res.status(400).json({ message: "Screenshot file size must be less than 2MB" });
      }
      const updated = await storage.updateOrder(orderId, {
        paymentScreenshotUrl: screenshot,
        transactionId: transactionId || null,
        verificationStatus: "pending"
      });
      res.json({
        message: "Payment proof uploaded successfully. Awaiting verification.",
        order: updated
      });
    } catch (error) {
      console.error("Error uploading guest payment proof:", error);
      res.status(500).json({ message: "Failed to upload payment proof" });
    }
  });
  app2.post("/api/orders/:orderId/payment-proof", isAuthenticated, async (req, res) => {
    try {
      const { orderId } = req.params;
      const { screenshot, transactionId } = req.body;
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      if (!screenshot || !screenshot.startsWith("data:image/")) {
        return res.status(400).json({ message: "Valid payment screenshot is required" });
      }
      const base64Data = screenshot.split(",")[1];
      if (base64Data && Buffer.from(base64Data, "base64").length > 2 * 1024 * 1024) {
        return res.status(400).json({ message: "Screenshot file size must be less than 2MB" });
      }
      const updated = await storage.updateOrder(orderId, {
        paymentScreenshotUrl: screenshot,
        transactionId: transactionId || null,
        verificationStatus: "pending"
      });
      res.json({
        message: "Payment proof uploaded successfully. Awaiting verification.",
        order: updated
      });
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      res.status(500).json({ message: "Failed to upload payment proof" });
    }
  });
  app2.post("/api/admin/orders/:orderId/verify-payment", adminAuth, async (req, res) => {
    try {
      const { orderId } = req.params;
      const { approved, note } = req.body;
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const updated = await storage.verifyOrderPayment(orderId, req.admin.id, approved, note);
      await storage.createNotification({
        recipientType: "admin",
        type: approved ? "payment_received" : "payment_failed",
        title: approved ? "Payment Approved" : "Payment Rejected",
        message: `Payment for order #${order.orderNumber} has been ${approved ? "approved" : "rejected"}.`,
        data: { orderId: order.id, orderNumber: order.orderNumber }
      });
      if (approved && order.userId) {
        try {
          const user = await storage.getUser(order.userId);
          if (user?.email) {
            sendPaymentVerifiedEmail(
              user.email,
              user.firstName || "",
              order.id,
              order.total
            ).catch((err) => console.error("Payment verified email error:", err));
          }
        } catch (emailError) {
          console.error("Error sending payment verified email:", emailError);
        }
      }
      res.json({
        message: `Payment ${approved ? "approved" : "rejected"} successfully`,
        order: updated
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });
  app2.post("/api/crypto-payments/create", isAuthenticated, (req, res) => {
    res.status(410).json({ message: "Crypto payments are no longer supported. Please use manual payment verification." });
  });
  app2.get("/api/crypto-payments/:orderId/status", isAuthenticated, (req, res) => {
    res.status(410).json({ message: "Crypto payments are no longer supported." });
  });
  app2.post("/api/webhooks/tron", (req, res) => {
    res.status(410).json({ message: "Tron USDT payments are no longer supported." });
  });
  app2.post("/api/webhooks/binance", (req, res) => {
    res.status(410).json({ returnCode: "SUCCESS", returnMessage: "Binance Pay is no longer supported." });
  });
  app2.post("/api/admin/crypto-payments/:id/confirm", adminAuth, (req, res) => {
    res.status(410).json({ message: "Crypto payments are no longer supported." });
  });
  app2.get("/api/admin/crypto-payments", adminAuth, (req, res) => {
    res.json([]);
  });
  app2.get("/api/store-settings", async (req, res) => {
    try {
      const settings = await storage.getStoreSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching store settings:", error);
      res.status(500).json({ message: "Failed to fetch store settings" });
    }
  });
  app2.put("/api/admin/store-settings", adminAuth, async (req, res) => {
    try {
      const updateData = {};
      const allowedFields = [
        "storeName",
        "storeLogo",
        "storeEmail",
        "storePhone",
        "storeAddress",
        "currency",
        "timezone",
        "language",
        "orderNotifications",
        "stockAlerts",
        "customerRegistrations",
        "paymentUpdates",
        "marketingEmails",
        "defaultProductImage",
        "defaultCategoryImage",
        "guestCheckoutEnabled",
        "shippingFee",
        "freeShippingThreshold"
      ];
      for (const field of allowedFields) {
        if (req.body[field] !== void 0) {
          updateData[field] = req.body[field];
        }
      }
      const updated = await storage.updateStoreSettings(updateData);
      invalidateNotificationSettingsCache();
      res.json(updated);
    } catch (error) {
      console.error("Error updating store settings:", error);
      res.status(500).json({ message: "Failed to update store settings" });
    }
  });
  app2.get("/api/admin/notifications", adminAuth, async (req, res) => {
    try {
      const notifications2 = await storage.getNotifications("admin");
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.get("/api/admin/notifications/count", adminAuth, async (req, res) => {
    try {
      const count2 = await storage.getUnreadNotificationCount("admin");
      res.json({ count: count2 });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });
  app2.patch("/api/admin/notifications/:id/read", adminAuth, async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.post("/api/admin/notifications/read-all", adminAuth, async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead("admin");
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  app2.delete("/api/admin/notifications/:id", adminAuth, async (req, res) => {
    try {
      await storage.deleteNotification(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });
  app2.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const notifications2 = await storage.getNotifications("customer", userId);
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching customer notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.get("/api/notifications/count", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const count2 = await storage.getUnreadNotificationCount("customer", userId);
      res.json({ count: count2 });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });
  app2.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.post("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsAsRead("customer", userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  app2.post("/api/chat/upload", isAuthenticated, async (req, res) => {
    try {
      const { data, name, type } = req.body;
      if (!data || !name) return res.status(400).json({ message: "Missing file data" });
      const fs2 = await import("fs");
      const path3 = await import("path");
      const uploadDir = path3.join(process.cwd(), "uploads", "chat");
      if (!fs2.existsSync(uploadDir)) fs2.mkdirSync(uploadDir, { recursive: true });
      const ext = name.split(".").pop() || "bin";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = path3.join(uploadDir, fileName);
      const base64Data = data.replace(/^data:[^;]+;base64,/, "");
      fs2.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      res.json({ url: `/uploads/chat/${fileName}`, name, type: type || "application/octet-stream" });
    } catch (error) {
      console.error("Chat upload error:", error);
      res.status(500).json({ message: "Upload failed" });
    }
  });
  app2.post("/api/chat/conversation/:id/messages/:msgId/reactions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { emoji } = req.body;
      const conversation = await storage.getChatConversation(req.params.id);
      if (!conversation || conversation.customerId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      const msg = await storage.getChatMessage(req.params.msgId);
      if (!msg) return res.status(404).json({ message: "Message not found" });
      const reactions = msg.reactions || {};
      const users2 = reactions[req.body.emoji] || [];
      const idx = users2.indexOf(userId);
      if (idx === -1) reactions[emoji] = [...users2, userId];
      else {
        reactions[emoji] = users2.filter((u) => u !== userId);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      }
      const updated = await storage.updateChatMessageReactions(req.params.msgId, reactions);
      res.json(updated);
    } catch (error) {
      console.error("Chat reaction error:", error);
      res.status(500).json({ message: "Failed to update reaction" });
    }
  });
  app2.get("/api/chat/conversation", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      let conversation = await storage.getCustomerConversation(userId);
      if (!conversation) {
        conversation = await storage.createChatConversation({
          customerId: userId,
          status: "open"
        });
      }
      const fullConversation = await storage.getChatConversation(conversation.id);
      res.json(fullConversation);
    } catch (error) {
      console.error("Error getting chat conversation:", error);
      res.status(500).json({ message: "Failed to get conversation" });
    }
  });
  app2.get("/api/chat/conversation/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const conversation = await storage.getChatConversation(req.params.id);
      if (!conversation || conversation.customerId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      const messages = await storage.getChatMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error getting messages:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });
  app2.post("/api/chat/conversation/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const { content } = req.body;
      const conversation = await storage.getChatConversation(req.params.id);
      if (!conversation || conversation.customerId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      const message = await storage.createChatMessage({
        conversationId: req.params.id,
        senderId: userId,
        senderType: "customer",
        message: content.trim()
      });
      if (conversation.assignedAgentId) {
        await storage.createNotification({
          recipientType: "admin",
          recipientId: conversation.assignedAgentId,
          type: "chat_message",
          title: "New Chat Message",
          message: `Customer ${conversation.customer?.firstName || "Customer"} sent a message`,
          data: { conversationId: req.params.id, messageId: message.id }
        });
      }
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.get("/api/admin/chat/conversations", adminAuth, async (req, res) => {
    try {
      const { status, unassigned, agentId } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (agentId) filters.assignedAgentId = agentId;
      if (unassigned === "true") filters.unassigned = true;
      const conversations = await storage.getChatConversations(filters);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  app2.get("/api/admin/chat/conversations/:id", adminAuth, async (req, res) => {
    try {
      const conversation = await storage.getChatConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });
  app2.get("/api/admin/chat/conversations/:id/messages", adminAuth, async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/admin/chat/conversations/:id/messages", adminAuth, async (req, res) => {
    try {
      const { content } = req.body;
      const adminId = req.admin.id;
      const conversation = await storage.getChatConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      if (!conversation.assignedAgentId) {
        await storage.assignChatAgent(req.params.id, adminId);
      }
      const message = await storage.createChatMessage({
        conversationId: req.params.id,
        senderId: adminId,
        senderType: "agent",
        message: content.trim()
      });
      await storage.createNotification({
        recipientType: "customer",
        recipientId: conversation.customerId,
        type: "chat_message",
        title: "New Chat Message",
        message: "Support agent responded to your inquiry",
        data: { conversationId: req.params.id, messageId: message.id }
      });
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.post("/api/admin/chat/conversations/:id/assign", adminAuth, async (req, res) => {
    try {
      const { agentId } = req.body;
      const conversation = await storage.assignChatAgent(req.params.id, agentId || req.admin.id);
      res.json(conversation);
    } catch (error) {
      console.error("Error assigning agent:", error);
      res.status(500).json({ message: "Failed to assign agent" });
    }
  });
  app2.patch("/api/admin/chat/conversations/:id/status", adminAuth, async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["open", "in_progress", "resolved", "closed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const conversation = await storage.updateChatConversation(req.params.id, { status });
      res.json(conversation);
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });
  app2.post("/api/admin/chat/conversations/:id/read", adminAuth, async (req, res) => {
    try {
      await storage.markMessagesAsRead(req.params.id, "customer");
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });
  app2.get("/api/admin/chat/unread-count", adminAuth, async (req, res) => {
    try {
      const conversations = await storage.getChatConversations();
      let totalUnread = 0;
      for (const conv of conversations) {
        totalUnread += conv.unreadCount || 0;
      }
      res.json({ count: totalUnread });
    } catch (error) {
      console.error("Error getting unread count:", error);
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });
  app2.get("/api/admin/team-chat/conversations", adminAuth, async (req, res) => {
    try {
      const conversations = await storage.getTeamChatConversations(req.admin.id);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching team chat conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  app2.get("/api/admin/team-chat/users", adminAuth, async (req, res) => {
    try {
      const users2 = await storage.getAdminUsers();
      const filteredUsers = users2.filter((u) => u.id !== req.admin.id);
      res.json(filteredUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/admin/team-chat/conversations/:id", adminAuth, async (req, res) => {
    try {
      const isParticipant = await storage.isTeamChatParticipant(req.params.id, req.admin.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Not authorized to view this conversation" });
      }
      const conversation = await storage.getTeamChatConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });
  app2.post("/api/admin/team-chat/conversations/direct", adminAuth, async (req, res) => {
    try {
      const { targetUserId } = req.body;
      if (!targetUserId) {
        return res.status(400).json({ message: "Target user ID is required" });
      }
      const existingConv = await storage.findDirectConversation(req.admin.id, targetUserId);
      if (existingConv) {
        const fullConv2 = await storage.getTeamChatConversation(existingConv.id);
        return res.json(fullConv2);
      }
      const conversation = await storage.createTeamChatConversation({
        type: "direct",
        createdById: req.admin.id
      });
      await storage.addTeamChatParticipant({
        conversationId: conversation.id,
        adminUserId: req.admin.id,
        isAdmin: true
      });
      await storage.addTeamChatParticipant({
        conversationId: conversation.id,
        adminUserId: targetUserId,
        isAdmin: false
      });
      const fullConv = await storage.getTeamChatConversation(conversation.id);
      res.json(fullConv);
    } catch (error) {
      console.error("Error creating direct conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });
  app2.post("/api/admin/team-chat/conversations/group", adminAuth, async (req, res) => {
    try {
      const { title, description, memberIds } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Group title is required" });
      }
      if (!memberIds || memberIds.length < 1) {
        return res.status(400).json({ message: "At least one other member is required" });
      }
      const conversation = await storage.createTeamChatConversation({
        type: "group",
        title,
        description,
        createdById: req.admin.id
      });
      await storage.addTeamChatParticipant({
        conversationId: conversation.id,
        adminUserId: req.admin.id,
        isAdmin: true
      });
      for (const memberId of memberIds) {
        await storage.addTeamChatParticipant({
          conversationId: conversation.id,
          adminUserId: memberId,
          isAdmin: false
        });
      }
      const fullConv = await storage.getTeamChatConversation(conversation.id);
      res.json(fullConv);
    } catch (error) {
      console.error("Error creating group conversation:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });
  app2.patch("/api/admin/team-chat/conversations/:id", adminAuth, async (req, res) => {
    try {
      const { title, description } = req.body;
      const isParticipant = await storage.isTeamChatParticipant(req.params.id, req.admin.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const conversation = await storage.updateTeamChatConversation(req.params.id, { title, description });
      res.json(conversation);
    } catch (error) {
      console.error("Error updating conversation:", error);
      res.status(500).json({ message: "Failed to update conversation" });
    }
  });
  app2.delete("/api/admin/team-chat/conversations/:id", adminAuth, async (req, res) => {
    try {
      const conversation = await storage.getTeamChatConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      await storage.removeTeamChatParticipant(req.params.id, req.admin.id);
      const remainingParticipants = await storage.getTeamChatParticipants(req.params.id);
      if (remainingParticipants.length === 0) {
        await storage.deleteTeamChatConversation(req.params.id);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving conversation:", error);
      res.status(500).json({ message: "Failed to leave conversation" });
    }
  });
  app2.post("/api/admin/team-chat/conversations/:id/members", adminAuth, async (req, res) => {
    try {
      const { userId } = req.body;
      const conversation = await storage.getTeamChatConversation(req.params.id);
      if (!conversation || conversation.type !== "group") {
        return res.status(400).json({ message: "Can only add members to group chats" });
      }
      const isParticipant = await storage.isTeamChatParticipant(req.params.id, req.admin.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const alreadyMember = await storage.isTeamChatParticipant(req.params.id, userId);
      if (alreadyMember) {
        return res.status(400).json({ message: "User is already a member" });
      }
      await storage.addTeamChatParticipant({
        conversationId: req.params.id,
        adminUserId: userId,
        isAdmin: false
      });
      const updatedConv = await storage.getTeamChatConversation(req.params.id);
      res.json(updatedConv);
    } catch (error) {
      console.error("Error adding member:", error);
      res.status(500).json({ message: "Failed to add member" });
    }
  });
  app2.delete("/api/admin/team-chat/conversations/:id/members/:userId", adminAuth, async (req, res) => {
    try {
      const conversation = await storage.getTeamChatConversation(req.params.id);
      if (!conversation || conversation.type !== "group") {
        return res.status(400).json({ message: "Can only remove members from group chats" });
      }
      const participants = await storage.getTeamChatParticipants(req.params.id);
      const currentUserParticipant = participants.find((p) => p.adminUserId === req.admin.id);
      if (!currentUserParticipant) {
        return res.status(403).json({ message: "Not authorized" });
      }
      if (!currentUserParticipant.isAdmin && req.params.userId !== req.admin.id) {
        return res.status(403).json({ message: "Only group admins can remove other members" });
      }
      await storage.removeTeamChatParticipant(req.params.id, req.params.userId);
      const updatedConv = await storage.getTeamChatConversation(req.params.id);
      res.json(updatedConv);
    } catch (error) {
      console.error("Error removing member:", error);
      res.status(500).json({ message: "Failed to remove member" });
    }
  });
  app2.get("/api/admin/team-chat/conversations/:id/messages", adminAuth, async (req, res) => {
    try {
      const isParticipant = await storage.isTeamChatParticipant(req.params.id, req.admin.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const limit = parseInt(req.query.limit) || 50;
      const before = req.query.before;
      const messages = await storage.getTeamChatMessages(req.params.id, limit, before);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/admin/team-chat/conversations/:id/messages", adminAuth, async (req, res) => {
    try {
      const { message, replyToMessageId } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }
      const isParticipant = await storage.isTeamChatParticipant(req.params.id, req.admin.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const newMessage = await storage.createTeamChatMessage({
        conversationId: req.params.id,
        senderId: req.admin.id,
        message: message.trim(),
        replyToMessageId
      });
      const sender = await storage.getAdminUser(req.admin.id);
      res.json({ ...newMessage, sender });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.post("/api/admin/team-chat/conversations/:id/read", adminAuth, async (req, res) => {
    try {
      const { lastMessageId } = req.body;
      if (!lastMessageId) {
        return res.status(400).json({ message: "Last message ID is required" });
      }
      await storage.markTeamChatMessagesRead(req.params.id, req.admin.id, lastMessageId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });
  app2.get("/api/admin/team-chat/unread-count", adminAuth, async (req, res) => {
    try {
      const count2 = await storage.getTeamChatUnreadCount(req.admin.id);
      res.json({ count: count2 });
    } catch (error) {
      console.error("Error getting unread count:", error);
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });
  app2.get("/api/wallet", isAuthenticated, async (req, res) => {
    try {
      let wallet = await storage.getWalletByUserId(req.user.id);
      if (!wallet) {
        wallet = await storage.createWallet(req.user.id);
      }
      res.json(wallet);
    } catch (error) {
      console.error("Error getting wallet:", error);
      res.status(500).json({ message: "Failed to get wallet" });
    }
  });
  app2.get("/api/wallet/transactions", isAuthenticated, async (req, res) => {
    try {
      const wallet = await storage.getWalletByUserId(req.user.id);
      if (!wallet) {
        return res.json([]);
      }
      const limit = parseInt(req.query.limit) || 50;
      const transactions = await storage.getWalletTransactions(wallet.id, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error getting wallet transactions:", error);
      res.status(500).json({ message: "Failed to get wallet transactions" });
    }
  });
  app2.get("/api/wallet/topup-requests", isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getUserTopupRequests(req.user.id);
      res.json(requests);
    } catch (error) {
      console.error("Error getting topup requests:", error);
      res.status(500).json({ message: "Failed to get topup requests" });
    }
  });
  app2.post("/api/wallet/topup-request", isAuthenticated, async (req, res) => {
    try {
      const { amount, paymentMethod, screenshotUrl, transactionId } = req.body;
      if (!amount || !paymentMethod || !screenshotUrl) {
        return res.status(400).json({ message: "Amount, payment method, and screenshot are required" });
      }
      if (parseFloat(amount) < 100) {
        return res.status(400).json({ message: "Minimum topup amount is Rs. 100" });
      }
      let wallet = await storage.getWalletByUserId(req.user.id);
      if (!wallet) {
        wallet = await storage.createWallet(req.user.id);
      }
      const request = await storage.createWalletTopupRequest({
        walletId: wallet.id,
        userId: req.user.id,
        amount: amount.toString(),
        paymentMethod,
        screenshotUrl,
        transactionId: transactionId || null
      });
      await sendAdminNotification(
        "wallet_topup_request",
        {
          customerName: req.user.firstName || req.user.email,
          amount: parseFloat(amount).toLocaleString(),
          paymentMethod
        },
        defaultNotificationMessages.wallet_topup_request,
        { topupRequestId: request.id, userId: req.user.id, amount }
      );
      res.status(201).json(request);
    } catch (error) {
      console.error("Error creating topup request:", error);
      res.status(500).json({ message: "Failed to create topup request" });
    }
  });
  app2.get("/api/admin/wallets", adminAuth, async (req, res) => {
    try {
      const wallets2 = await storage.getAllWallets();
      res.json(wallets2);
    } catch (error) {
      console.error("Error getting wallets:", error);
      res.status(500).json({ message: "Failed to get wallets" });
    }
  });
  app2.get("/api/admin/wallets/topup-requests/pending-count", adminAuth, async (req, res) => {
    try {
      const count2 = await storage.getPendingTopupRequestsCount();
      res.json({ count: count2 });
    } catch (error) {
      console.error("Error getting pending count:", error);
      res.status(500).json({ message: "Failed to get pending count" });
    }
  });
  app2.get("/api/admin/wallets/topup-requests", adminAuth, async (req, res) => {
    try {
      const status = req.query.status;
      const requests = await storage.getWalletTopupRequests(status);
      res.json(requests);
    } catch (error) {
      console.error("Error getting topup requests:", error);
      res.status(500).json({ message: "Failed to get topup requests" });
    }
  });
  app2.get("/api/admin/wallets/:userId", adminAuth, async (req, res) => {
    try {
      const wallet = await storage.getWalletByUserId(req.params.userId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      const transactions = await storage.getWalletTransactions(wallet.id, 100);
      res.json({ wallet, transactions });
    } catch (error) {
      console.error("Error getting wallet:", error);
      res.status(500).json({ message: "Failed to get wallet" });
    }
  });
  app2.post("/api/admin/wallets/topup-requests/:id/process", adminAuth, async (req, res) => {
    try {
      const { approved, note } = req.body;
      if (typeof approved !== "boolean") {
        return res.status(400).json({ message: "Approved status is required" });
      }
      const request = await storage.getWalletTopupRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Topup request not found" });
      }
      if (request.status !== "pending") {
        return res.status(400).json({ message: "Request has already been processed" });
      }
      const updatedRequest = await storage.processWalletTopupRequest(
        req.params.id,
        req.admin.id,
        approved,
        note
      );
      if (approved) {
        const wallet = await storage.getWallet(request.walletId);
        if (wallet) {
          const currentBalance = parseFloat(wallet.balance);
          const topupAmount = parseFloat(request.amount);
          const newBalance = (currentBalance + topupAmount).toFixed(2);
          await storage.updateWalletBalance(wallet.id, newBalance);
          await storage.createWalletTransaction({
            walletId: wallet.id,
            type: "topup",
            amount: request.amount,
            balanceAfter: newBalance,
            description: `Wallet top-up via ${request.paymentMethod}`,
            referenceType: "topup_request",
            referenceId: request.id,
            createdBy: req.admin.id
          });
          await sendCustomerNotification(
            request.userId,
            "wallet_topup_approved",
            { amount: topupAmount.toLocaleString() },
            defaultNotificationMessages.wallet_topup_approved,
            { topupRequestId: request.id, amount: request.amount }
          );
        }
      } else {
        await sendCustomerNotification(
          request.userId,
          "wallet_topup_rejected",
          { amount: parseFloat(request.amount).toLocaleString(), reason: note || "Please contact support for more information." },
          defaultNotificationMessages.wallet_topup_rejected,
          { topupRequestId: request.id, amount: request.amount }
        );
      }
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error processing topup request:", error);
      res.status(500).json({ message: "Failed to process topup request" });
    }
  });
  app2.post("/api/admin/wallets/:userId/add-funds", adminAuth, async (req, res) => {
    try {
      const { amount, description } = req.body;
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      let wallet = await storage.getWalletByUserId(req.params.userId);
      if (!wallet) {
        wallet = await storage.createWallet(req.params.userId);
      }
      const currentBalance = parseFloat(wallet.balance);
      const addAmount = parseFloat(amount);
      const newBalance = (currentBalance + addAmount).toFixed(2);
      await storage.updateWalletBalance(wallet.id, newBalance);
      await storage.createWalletTransaction({
        walletId: wallet.id,
        type: "credit",
        amount: amount.toString(),
        balanceAfter: newBalance,
        description: description || "Manual credit by admin",
        referenceType: "manual",
        createdBy: req.admin.id
      });
      await sendCustomerNotification(
        req.params.userId,
        "wallet_topup_approved",
        { amount: addAmount.toLocaleString() },
        { title: "Funds Added to Wallet", message: "Rs. {{amount}} has been added to your wallet." },
        { amount, source: "admin_credit" }
      );
      res.json({ success: true, newBalance });
    } catch (error) {
      console.error("Error adding funds:", error);
      res.status(500).json({ message: "Failed to add funds" });
    }
  });
  app2.post("/api/admin/wallets/:userId/deduct-funds", adminAuth, async (req, res) => {
    try {
      const { amount, description } = req.body;
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      const wallet = await storage.getWalletByUserId(req.params.userId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      const currentBalance = parseFloat(wallet.balance);
      const deductAmount = parseFloat(amount);
      if (deductAmount > currentBalance) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }
      const newBalance = (currentBalance - deductAmount).toFixed(2);
      await storage.updateWalletBalance(wallet.id, newBalance);
      await storage.createWalletTransaction({
        walletId: wallet.id,
        type: "adjustment",
        amount: (-deductAmount).toString(),
        balanceAfter: newBalance,
        description: description || "Manual deduction by admin",
        referenceType: "manual",
        createdBy: req.admin.id
      });
      res.json({ success: true, newBalance });
    } catch (error) {
      console.error("Error deducting funds:", error);
      res.status(500).json({ message: "Failed to deduct funds" });
    }
  });
  app2.get("/api/admin/coupons", adminAuth, async (req, res) => {
    try {
      const coupons2 = await storage.getCoupons();
      res.json(coupons2);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });
  app2.get("/api/admin/coupons/:id", adminAuth, async (req, res) => {
    try {
      const coupon = await storage.getCoupon(req.params.id);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }
      res.json(coupon);
    } catch (error) {
      console.error("Error fetching coupon:", error);
      res.status(500).json({ message: "Failed to fetch coupon" });
    }
  });
  app2.post("/api/admin/coupons", adminAuth, async (req, res) => {
    try {
      const { categoryIds, productIds, ...couponData } = req.body;
      const existing = await storage.getCouponByCode(couponData.code);
      if (existing) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
      const coupon = await storage.createCoupon(couponData);
      if (couponData.scope === "category" && categoryIds?.length > 0) {
        await storage.setCouponCategories(coupon.id, categoryIds);
      }
      if (couponData.scope === "product" && productIds?.length > 0) {
        await storage.setCouponProducts(coupon.id, productIds);
      }
      res.json(coupon);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });
  app2.patch("/api/admin/coupons/:id", adminAuth, async (req, res) => {
    try {
      const { categoryIds, productIds, ...couponData } = req.body;
      if (couponData.code) {
        const existing = await storage.getCouponByCode(couponData.code);
        if (existing && existing.id !== req.params.id) {
          return res.status(400).json({ message: "Coupon code already exists" });
        }
      }
      const coupon = await storage.updateCoupon(req.params.id, couponData);
      if (categoryIds !== void 0) {
        await storage.setCouponCategories(coupon.id, categoryIds || []);
      }
      if (productIds !== void 0) {
        await storage.setCouponProducts(coupon.id, productIds || []);
      }
      res.json(coupon);
    } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });
  app2.delete("/api/admin/coupons/:id", adminAuth, async (req, res) => {
    try {
      await storage.deleteCoupon(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });
  app2.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, cartItems: cartItems2, userId } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Coupon code is required" });
      }
      const coupon = await storage.getCouponByCode(code);
      if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon code" });
      }
      if (!coupon.isActive) {
        return res.status(400).json({ message: "This coupon is no longer active" });
      }
      const now = /* @__PURE__ */ new Date();
      if (coupon.validFrom && new Date(coupon.validFrom) > now) {
        return res.status(400).json({ message: "This coupon is not yet active" });
      }
      if (coupon.validUntil && new Date(coupon.validUntil) < now) {
        return res.status(400).json({ message: "This coupon has expired" });
      }
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "This coupon has reached its usage limit" });
      }
      if (userId && coupon.perUserLimit) {
        const userRedemptions = await storage.getCouponRedemptionsByUser(coupon.id, userId);
        if (userRedemptions.length >= coupon.perUserLimit) {
          return res.status(400).json({ message: "You have already used this coupon the maximum number of times" });
        }
      }
      let eligibleTotal = 0;
      let applicableItems = [];
      if (!cartItems2 || cartItems2.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      for (const item of cartItems2) {
        let isEligible = false;
        if (coupon.scope === "all") {
          isEligible = true;
        } else if (coupon.scope === "category" && coupon.categories) {
          const product = await storage.getProduct(item.productId);
          isEligible = product ? coupon.categories.some((c) => c.categoryId === product.categoryId) : false;
        } else if (coupon.scope === "product" && coupon.products) {
          isEligible = coupon.products.some((p) => p.productId === item.productId);
        }
        if (isEligible) {
          eligibleTotal += parseFloat(item.price) * item.quantity;
          applicableItems.push(item.productId);
        }
      }
      if (eligibleTotal === 0) {
        return res.status(400).json({ message: "No items in your cart are eligible for this coupon" });
      }
      if (coupon.minOrderAmount && eligibleTotal < parseFloat(coupon.minOrderAmount)) {
        return res.status(400).json({
          message: `Minimum order amount of Rs. ${coupon.minOrderAmount} required for this coupon`
        });
      }
      let discount = 0;
      if (coupon.type === "percentage") {
        discount = eligibleTotal * parseFloat(coupon.value) / 100;
        if (coupon.maxDiscountAmount) {
          discount = Math.min(discount, parseFloat(coupon.maxDiscountAmount));
        }
      } else {
        discount = Math.min(parseFloat(coupon.value), eligibleTotal);
      }
      res.json({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.type,
          discountValue: coupon.value
        },
        discount: discount.toFixed(2),
        applicableItems,
        message: `Coupon applied! You save Rs. ${discount.toFixed(2)}`
      });
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ message: "Failed to validate coupon" });
    }
  });
  app2.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.productId, "approved");
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  app2.get("/api/products/:productId/can-review", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.productId;
      const existingReview = await storage.getUserReviewForProduct(userId, productId);
      if (existingReview) {
        return res.json({ canReview: false, reason: "You have already reviewed this product", existingReview });
      }
      const hasPurchased = await storage.hasUserPurchasedProduct(userId, productId);
      if (!hasPurchased) {
        return res.json({ canReview: false, reason: "You can only review products you have purchased and received" });
      }
      res.json({ canReview: true });
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      res.status(500).json({ message: "Failed to check review eligibility" });
    }
  });
  app2.post("/api/products/:productId/reviews", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.productId;
      const { rating, title, comment } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      const existingReview = await storage.getUserReviewForProduct(userId, productId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this product" });
      }
      const hasPurchased = await storage.hasUserPurchasedProduct(userId, productId);
      if (!hasPurchased) {
        return res.status(400).json({ message: "You can only review products you have purchased and received" });
      }
      const review = await storage.createReview({
        productId,
        userId,
        rating,
        title: title || null,
        comment: comment || null,
        isVerifiedPurchase: true
      });
      await storage.createNotification({
        recipientType: "admin",
        type: "review_submitted",
        title: "New Product Review",
        message: `A new review has been submitted and is pending moderation.`,
        data: { reviewId: review.id, productId }
      });
      res.json({ success: true, message: "Review submitted successfully and is pending approval" });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });
  app2.patch("/api/products/:productId/reviews", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.productId;
      const { rating, title, comment } = req.body;
      const existingReview = await storage.getUserReviewForProduct(userId, productId);
      if (!existingReview) {
        return res.status(404).json({ message: "You haven't reviewed this product yet" });
      }
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      const updatedReview = await storage.updateReview(existingReview.id, {
        rating: rating || existingReview.rating,
        title: title !== void 0 ? title || null : existingReview.title,
        comment: comment !== void 0 ? comment || null : existingReview.comment,
        status: "pending",
        // Reset to pending for re-moderation
        moderatedBy: null,
        moderatedAt: null,
        moderationNote: null
      });
      await storage.createNotification({
        recipientType: "admin",
        type: "review_submitted",
        title: "Review Updated",
        message: `A customer has updated their review and it requires re-moderation.`,
        data: { reviewId: updatedReview.id, productId }
      });
      res.json({ success: true, message: "Review updated successfully and is pending re-approval", review: updatedReview });
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });
  app2.get("/api/admin/reviews", adminAuth, async (req, res) => {
    try {
      const status = req.query.status;
      const reviews = await storage.getAllReviews(status);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  app2.get("/api/admin/reviews/pending-count", adminAuth, async (req, res) => {
    try {
      const count2 = await storage.getPendingReviewsCount();
      res.json({ count: count2 });
    } catch (error) {
      console.error("Error fetching pending reviews count:", error);
      res.status(500).json({ message: "Failed to fetch pending reviews count" });
    }
  });
  app2.post("/api/admin/reviews/:id/moderate", adminAuth, async (req, res) => {
    try {
      const { status, note } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }
      const review = await storage.moderateReview(req.params.id, req.admin.id, status, note);
      res.json(review);
    } catch (error) {
      console.error("Error moderating review:", error);
      res.status(500).json({ message: "Failed to moderate review" });
    }
  });
  app2.delete("/api/admin/reviews/:id", adminAuth, async (req, res) => {
    try {
      await storage.deleteReview(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });
  app2.get("/robots.txt", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.type("text/plain");
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /api/*

Sitemap: ${baseUrl}/sitemap.xml
`);
  });
  app2.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const products2 = await storage.getProducts();
      const categories2 = await storage.getCategories();
      const urls = [];
      urls.push(`
    <url>
      <loc>${baseUrl}/</loc>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>`);
      urls.push(`
    <url>
      <loc>${baseUrl}/?view=products</loc>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>`);
      urls.push(`
    <url>
      <loc>${baseUrl}/?view=categories</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`);
      urls.push(`
    <url>
      <loc>${baseUrl}/?view=featured</loc>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>`);
      for (const category of categories2) {
        urls.push(`
    <url>
      <loc>${baseUrl}/?view=category-${category.id}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);
      }
      for (const product of products2) {
        urls.push(`
    <url>
      <loc>${baseUrl}/?view=product-${product.id}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`);
      }
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;
      res.type("application/xml");
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });
  const httpServer = createServer(app2);
  const { setupChatWebSocket: setupChatWebSocket2 } = await Promise.resolve().then(() => (init_chatWebSocket(), chatWebSocket_exports));
  setupChatWebSocket2(httpServer);
  const { setupTeamChatWebSocket: setupTeamChatWebSocket2 } = await Promise.resolve().then(() => (init_teamChatWebSocket(), teamChatWebSocket_exports));
  setupTeamChatWebSocket2(httpServer);
  return httpServer;
}

// server/log.ts
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// server/static.ts
import express from "express";
import fs from "fs";
import path from "path";
function serveStatic(app2) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.warn(`[static] dist/public not found at ${distPath} \u2014 skipping static file serving`);
    app2.use("*", (_req, res) => {
      res.status(404).json({ message: "Not found" });
    });
    return;
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use((req, res, next) => {
  const allowed = [
    "https://shinaramall.com",
    "https://www.shinaramall.com"
  ];
  const origin = req.headers.origin || "";
  if (allowed.includes(origin) || origin.endsWith(".replit.dev") || origin.endsWith(".janeway.replit.dev") || origin.endsWith(".replit.app")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use("/uploads", express2.static(path2.join(process.cwd(), "uploads")));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
