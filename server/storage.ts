import {
  users,
  adminUsers,
  roles,
  categories,
  products,
  suppliers,
  purchases,
  purchaseItems,
  stockAdjustments,
  orders,
  orderItems,
  cartItems,
  wishlistItems,
  paymentGateways,
  paymentTransactions,
  cryptoPayments,
  paymentAccounts,
  storeSettings,
  notifications,
  notificationTypes,
  notificationTemplates,
  chatConversations,
  chatMessages,
  teamChatConversations,
  teamChatParticipants,
  teamChatMessages,
  wallets,
  walletTransactions,
  walletTopupRequests,
  coupons,
  couponCategories,
  couponProducts,
  couponRedemptions,
  productReviews,
  type User,
  type InsertUser,
  type SafeUser,
  type AdminUser,
  type InsertAdminUser,
  type Role,
  type InsertRole,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type UpdateOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartItem,
  type InsertCartItem,
  type WishlistItem,
  type InsertWishlistItem,
  type PaymentGateway,
  type InsertPaymentGateway,
  type PaymentTransaction,
  type InsertPaymentTransaction,
  type CryptoPayment,
  type InsertCryptoPayment,
  type PaymentAccount,
  type InsertPaymentAccount,
  type StoreSettings,
  type InsertStoreSettings,
  type Notification,
  type InsertNotification,
  type NotificationType as NotificationTypeRecord,
  type InsertNotificationType,
  type NotificationTemplate,
  type InsertNotificationTemplate,
  type ChatConversation,
  type InsertChatConversation,
  type ChatMessage,
  type InsertChatMessage,
  type ChatConversationWithDetails,
  type TeamChatConversation,
  type InsertTeamChatConversation,
  type TeamChatParticipant,
  type InsertTeamChatParticipant,
  type TeamChatMessage,
  type InsertTeamChatMessage,
  type TeamChatConversationWithDetails,
  type TeamChatMessageWithSender,
  type Wallet,
  type InsertWallet,
  type WalletTransaction,
  type InsertWalletTransaction,
  type WalletTopupRequest,
  type InsertWalletTopupRequest,
  type WalletWithUser,
  type WalletTopupRequestWithDetails,
  type Coupon,
  type InsertCoupon,
  type CouponCategory,
  type InsertCouponCategory,
  type CouponProduct,
  type InsertCouponProduct,
  type CouponRedemption,
  type InsertCouponRedemption,
  type CouponWithDetails,
  type ProductReview,
  type InsertProductReview,
  type ProductReviewWithDetails,
  type Supplier,
  type InsertSupplier,
  type Purchase,
  type InsertPurchase,
  type PurchaseItem,
  type InsertPurchaseItem,
  type StockAdjustment,
  type InsertStockAdjustment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, ilike, isNull, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (Internal Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: { email: string; passwordHash: string; firstName?: string; lastName?: string; mobile?: string; emailVerificationToken?: string; emailVerificationExpires?: Date }): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getAllCustomers(): Promise<SafeUser[]>;
  
  // Admin user operations
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<(AdminUser & { roleData?: Role }) | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  getAdminUsers(): Promise<(AdminUser & { roleData?: Role })[]>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminUser(id: string, user: Partial<InsertAdminUser>): Promise<AdminUser>;
  updateAdminUserPassword(id: string, passwordHash: string): Promise<AdminUser>;
  deleteAdminUser(id: string): Promise<boolean>;
  updateAdminUserLastLogin(id: string): Promise<AdminUser>;
  
  // Role operations
  getRoles(): Promise<Role[]>;
  getRole(id: string): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, role: Partial<InsertRole>): Promise<Role>;
  deleteRole(id: string): Promise<boolean>;
  initializeDefaultRoles(): Promise<void>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getFeaturedCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;
  
  // Product operations
  getProducts(filters?: { 
    categoryId?: string; 
    search?: string; 
    isActive?: boolean; 
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<{ success: boolean; softDeleted?: boolean }>;
  
  // Order operations
  getOrders(userId?: string, limit?: number, offset?: number): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderWithItems(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: UpdateOrder): Promise<Order>;
  getPendingOrdersCount(): Promise<number>;
  getCustomerPendingOrdersCount(userId: string): Promise<number>;
  
  // Order item operations
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<(OrderItem & { product: Product })[]>;
  
  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  updateCartItemByProductId(userId: string, productId: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<boolean>;
  removeFromCartByProductId(userId: string, productId: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;
  
  // Wishlist operations
  getWishlistItems(userId: string): Promise<(WishlistItem & { product: Product })[]>;
  addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(userId: string, productId: string): Promise<boolean>;
  isInWishlist(userId: string, productId: string): Promise<boolean>;
  clearWishlist(userId: string): Promise<boolean>;
  
  // Payment gateway operations
  getPaymentGateways(): Promise<PaymentGateway[]>;
  getPaymentGateway(id: string): Promise<PaymentGateway | undefined>;
  getPaymentGatewayByName(name: string): Promise<PaymentGateway | undefined>;
  createPaymentGateway(gatewayData: InsertPaymentGateway): Promise<PaymentGateway>;
  updatePaymentGateway(id: string, gatewayData: Partial<InsertPaymentGateway>): Promise<PaymentGateway>;
  deletePaymentGateway(id: string): Promise<boolean>;
  
  // Payment transaction operations
  getPaymentTransactions(filters?: any): Promise<PaymentTransaction[]>;
  getPaymentTransaction(id: string): Promise<PaymentTransaction | undefined>;
  createPaymentTransaction(transactionData: InsertPaymentTransaction): Promise<PaymentTransaction>;
  updatePaymentTransaction(id: string, transactionData: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction>;
  
  // Store settings operations
  getStoreSettings(): Promise<StoreSettings>;
  updateStoreSettings(settings: Partial<InsertStoreSettings>): Promise<StoreSettings>;
  
  // Notification operations
  getNotifications(recipientType: string, recipientId?: string): Promise<Notification[]>;
  getUnreadNotificationCount(recipientType: string, recipientId?: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification>;
  markAllNotificationsAsRead(recipientType: string, recipientId?: string): Promise<void>;
  deleteNotification(id: string): Promise<boolean>;
  
  // Chat operations
  getChatConversations(filters?: { status?: string; assignedAgentId?: string; unassigned?: boolean }): Promise<ChatConversationWithDetails[]>;
  getChatConversation(id: string): Promise<ChatConversationWithDetails | undefined>;
  getCustomerConversation(customerId: string): Promise<ChatConversation | undefined>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  updateChatConversation(id: string, data: Partial<InsertChatConversation>): Promise<ChatConversation>;
  assignChatAgent(conversationId: string, agentId: string): Promise<ChatConversation>;
  
  // Chat message operations
  getChatMessages(conversationId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessagesAsRead(conversationId: string, senderType: string): Promise<void>;
  getUnreadMessageCount(conversationId: string, senderType: string): Promise<number>;
  
  // Team chat operations (employee internal chat)
  getTeamChatConversations(userId: string): Promise<TeamChatConversationWithDetails[]>;
  getTeamChatConversation(id: string): Promise<TeamChatConversationWithDetails | undefined>;
  findDirectConversation(userId1: string, userId2: string): Promise<TeamChatConversation | undefined>;
  createTeamChatConversation(conversation: InsertTeamChatConversation): Promise<TeamChatConversation>;
  updateTeamChatConversation(id: string, data: Partial<InsertTeamChatConversation>): Promise<TeamChatConversation>;
  deleteTeamChatConversation(id: string): Promise<boolean>;
  
  // Team chat participant operations
  addTeamChatParticipant(participant: InsertTeamChatParticipant): Promise<TeamChatParticipant>;
  removeTeamChatParticipant(conversationId: string, userId: string): Promise<boolean>;
  getTeamChatParticipants(conversationId: string): Promise<(TeamChatParticipant & { adminUser: AdminUser })[]>;
  updateTeamChatParticipant(id: string, data: Partial<InsertTeamChatParticipant>): Promise<TeamChatParticipant>;
  isTeamChatParticipant(conversationId: string, userId: string): Promise<boolean>;
  
  // Team chat message operations
  getTeamChatMessages(conversationId: string, limit?: number, before?: string): Promise<TeamChatMessageWithSender[]>;
  createTeamChatMessage(message: InsertTeamChatMessage): Promise<TeamChatMessage>;
  updateTeamChatMessage(id: string, message: string): Promise<TeamChatMessage>;
  deleteTeamChatMessage(id: string): Promise<boolean>;
  markTeamChatMessagesRead(conversationId: string, userId: string, lastMessageId: string): Promise<void>;
  getTeamChatUnreadCount(userId: string): Promise<number>;
  
  // Crypto payment operations (deprecated - kept for backward compatibility)
  getCryptoPayments(orderId?: string): Promise<CryptoPayment[]>;
  getCryptoPayment(id: string): Promise<CryptoPayment | undefined>;
  getCryptoPaymentByOrderId(orderId: string): Promise<CryptoPayment | undefined>;
  getCryptoPaymentByExternalId(externalOrderId: string): Promise<CryptoPayment | undefined>;
  createCryptoPayment(payment: InsertCryptoPayment): Promise<CryptoPayment>;
  updateCryptoPayment(id: string, data: Partial<CryptoPayment>): Promise<CryptoPayment>;
  
  // Payment account operations (for manual payment verification)
  getPaymentAccounts(activeOnly?: boolean): Promise<PaymentAccount[]>;
  getPaymentAccount(id: string): Promise<PaymentAccount | undefined>;
  getPaymentAccountsByMethod(method: string): Promise<PaymentAccount[]>;
  createPaymentAccount(account: InsertPaymentAccount): Promise<PaymentAccount>;
  updatePaymentAccount(id: string, data: Partial<InsertPaymentAccount>): Promise<PaymentAccount>;
  deletePaymentAccount(id: string): Promise<boolean>;
  
  // Order verification operations
  getOrdersPendingVerification(): Promise<Order[]>;
  verifyOrderPayment(orderId: string, adminId: string, approved: boolean, note?: string): Promise<Order>;
  
  // Wallet operations
  getWallet(id: string): Promise<Wallet | undefined>;
  getWalletByUserId(userId: string): Promise<Wallet | undefined>;
  createWallet(userId: string): Promise<Wallet>;
  updateWalletBalance(walletId: string, newBalance: string): Promise<Wallet>;
  getAllWallets(): Promise<WalletWithUser[]>;
  
  // Wallet transaction operations
  getWalletTransactions(walletId: string, limit?: number): Promise<WalletTransaction[]>;
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
  
  // Wallet topup request operations
  getWalletTopupRequests(status?: string): Promise<WalletTopupRequestWithDetails[]>;
  getWalletTopupRequest(id: string): Promise<WalletTopupRequestWithDetails | undefined>;
  getUserTopupRequests(userId: string): Promise<WalletTopupRequest[]>;
  createWalletTopupRequest(request: InsertWalletTopupRequest): Promise<WalletTopupRequest>;
  processWalletTopupRequest(id: string, adminId: string, approved: boolean, note?: string): Promise<WalletTopupRequest>;
  getPendingTopupRequestsCount(): Promise<number>;
  
  // Coupon operations
  getCoupons(): Promise<Coupon[]>;
  getCoupon(id: string): Promise<CouponWithDetails | undefined>;
  getCouponByCode(code: string): Promise<CouponWithDetails | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon>;
  deleteCoupon(id: string): Promise<boolean>;
  setCouponCategories(couponId: string, categoryIds: string[]): Promise<void>;
  setCouponProducts(couponId: string, productIds: string[]): Promise<void>;
  getCouponRedemptionsByUser(couponId: string, userId: string): Promise<CouponRedemption[]>;
  createCouponRedemption(redemption: InsertCouponRedemption): Promise<CouponRedemption>;
  incrementCouponUsage(couponId: string): Promise<void>;
  
  // Product review operations
  getProductReviews(productId: string, status?: string): Promise<ProductReviewWithDetails[]>;
  getAllReviews(status?: string): Promise<ProductReviewWithDetails[]>;
  getReview(id: string): Promise<ProductReviewWithDetails | undefined>;
  getUserReviewForProduct(userId: string, productId: string): Promise<ProductReview | undefined>;
  hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean>;
  createReview(review: InsertProductReview): Promise<ProductReview>;
  updateReview(id: string, review: Partial<ProductReview>): Promise<ProductReview>;
  moderateReview(id: string, adminId: string, status: string, note?: string): Promise<ProductReview>;
  deleteReview(id: string): Promise<boolean>;
  updateProductRating(productId: string): Promise<void>;
  getPendingReviewsCount(): Promise<number>;
  
  // Supplier operations
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: string): Promise<boolean>;
  
  // Purchase operations
  getPurchases(): Promise<(Purchase & { supplier?: Supplier; itemCount?: number })[]>;
  getPurchase(id: string): Promise<(Purchase & { supplier?: Supplier; items: (PurchaseItem & { product?: Product })[] }) | undefined>;
  createPurchase(purchase: InsertPurchase, items: { productId: string; quantity: number; costPrice: string }[], adminId: string): Promise<Purchase>;
  updatePurchase(id: string, purchase: Partial<InsertPurchase>): Promise<Purchase>;
  updatePurchaseStatus(id: string, status: string): Promise<Purchase>;
  receivePurchase(id: string, receivedItems: { purchaseItemId: string; receivedQuantity: number }[], adminId: string): Promise<Purchase>;
  deletePurchase(id: string): Promise<boolean>;
  
  // Stock adjustment operations
  getStockAdjustments(productId?: string): Promise<(StockAdjustment & { product?: Product })[]>;
  createStockAdjustment(adjustment: InsertStockAdjustment, adminId: string): Promise<StockAdjustment>;
  adjustProductStock(productId: string, newStock: number, type: string, reason: string, adminId: string, referenceId?: string, referenceType?: string): Promise<Product>;
  
  // Inventory & profit analytics
  getLowStockProducts(): Promise<Product[]>;
  getInventorySummary(): Promise<{ totalProducts: number; totalStock: number; lowStockCount: number; outOfStockCount: number; totalValue: number; totalCostValue: number }>;
  getProfitAnalytics(startDate?: Date, endDate?: Date): Promise<{ totalRevenue: number; totalCost: number; profit: number; margin: number; orderCount: number; topProfitProducts: { product: Product; profit: number; quantity: number }[] }>;
  getBalanceSheet(startDate?: Date, endDate?: Date): Promise<{
    assets: {
      cashFromOrders: number;
      inventoryValue: number;
      pendingPayments: number;
      totalAssets: number;
    };
    liabilities: {
      customerWalletBalances: number;
      pendingRefunds: number;
      pendingTopups: number;
      totalLiabilities: number;
    };
    equity: {
      retainedEarnings: number;
      netProfit: number;
      totalEquity: number;
    };
    summary: {
      totalRevenue: number;
      totalCost: number;
      grossProfit: number;
      profitMargin: number;
      orderCount: number;
      completedOrderCount: number;
      pendingOrderCount: number;
      cancelledOrderCount: number;
    };
    periodComparison?: {
      previousPeriodProfit: number;
      profitChange: number;
      profitChangePercent: number;
    };
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (Internal Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.emailVerificationToken, token));
    return user;
  }

  async createUser(userData: { email: string; passwordHash: string; firstName?: string; lastName?: string; mobile?: string; emailVerificationToken?: string; emailVerificationExpires?: Date }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email.toLowerCase(),
        passwordHash: userData.passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        mobile: userData.mobile,
        isActive: true,
        emailVerificationToken: userData.emailVerificationToken,
        emailVerificationExpires: userData.emailVerificationExpires,
      })
      .returning();
    
    // Create notification for new customer registration
    try {
      const customerName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email;
      await this.createNotification({
        recipientType: 'admin',
        type: 'customer_registration',
        title: 'New Customer Registration',
        message: `${customerName} has created an account.`,
        data: { userId: user.id, email: user.email },
      });
    } catch (notificationError) {
      console.error("Error creating customer registration notification:", notificationError);
    }
    
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllCustomers(): Promise<SafeUser[]> {
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
      emailVerificationExpires: users.emailVerificationExpires,
    }).from(users).orderBy(desc(users.createdAt));
    return result;
  }

  // Admin user operations
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user;
  }

  async getAdminUserByUsername(username: string): Promise<(AdminUser & { roleData?: Role }) | undefined> {
    const result = await db
      .select({
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
        roleData: roles,
      })
      .from(adminUsers)
      .leftJoin(roles, eq(adminUsers.roleId, roles.id))
      .where(eq(adminUsers.username, username));
    if (!result[0]) return undefined;
    return {
      ...result[0],
      roleData: result[0].roleData ?? undefined,
    };
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return user;
  }

  async createAdminUser(userData: InsertAdminUser): Promise<AdminUser> {
    const [user] = await db.insert(adminUsers).values(userData).returning();
    return user;
  }

  async getAdminUsers(): Promise<(AdminUser & { roleData?: Role })[]> {
    const result = await db
      .select({
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
        roleData: roles,
      })
      .from(adminUsers)
      .leftJoin(roles, eq(adminUsers.roleId, roles.id))
      .orderBy(desc(adminUsers.createdAt));
    return result.map(r => ({
      ...r,
      roleData: r.roleData ?? undefined,
    }));
  }

  async updateAdminUser(id: string, userData: Partial<InsertAdminUser>): Promise<AdminUser> {
    const [user] = await db
      .update(adminUsers)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, id))
      .returning();
    return user;
  }

  async updateAdminUserPassword(id: string, passwordHash: string): Promise<AdminUser> {
    const [user] = await db
      .update(adminUsers)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, id))
      .returning();
    return user;
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    const result = await db.delete(adminUsers).where(eq(adminUsers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateAdminUserLastLogin(id: string): Promise<AdminUser> {
    const [user] = await db
      .update(adminUsers)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, id))
      .returning();
    return user;
  }

  // Role operations
  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles).orderBy(roles.name);
  }

  async getRole(id: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role;
  }

  async createRole(roleData: InsertRole): Promise<Role> {
    const [role] = await db.insert(roles).values({
      name: roleData.name,
      displayName: roleData.displayName,
      permissions: roleData.permissions as any,
      description: roleData.description,
      isSystem: roleData.isSystem,
    }).returning();
    return role;
  }

  async updateRole(id: string, roleData: Partial<InsertRole>): Promise<Role> {
    const updateData: any = { updatedAt: new Date() };
    if (roleData.name !== undefined) updateData.name = roleData.name;
    if (roleData.displayName !== undefined) updateData.displayName = roleData.displayName;
    if (roleData.permissions !== undefined) updateData.permissions = roleData.permissions;
    if (roleData.description !== undefined) updateData.description = roleData.description;
    if (roleData.isSystem !== undefined) updateData.isSystem = roleData.isSystem;
    
    const [role] = await db
      .update(roles)
      .set(updateData)
      .where(eq(roles.id, id))
      .returning();
    return role;
  }

  async deleteRole(id: string): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async initializeDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: 'super_admin',
        displayName: 'Super Admin',
        description: 'Full access to all features',
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
          chat: { view: true, respond: true },
        },
      },
      {
        name: 'admin',
        displayName: 'Admin',
        description: 'Manage products, orders, and customers',
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
          chat: { view: true, respond: true },
        },
      },
      {
        name: 'manager',
        displayName: 'Manager',
        description: 'View and manage orders and inventory',
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
          settings: { view: false, edit: false },
        },
      },
      {
        name: 'staff',
        displayName: 'Staff',
        description: 'View products and process orders',
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
          settings: { view: false, edit: false },
        },
      },
      {
        name: 'chat_support',
        displayName: 'Chat Support',
        description: 'Handle customer chat support and live chat inquiries',
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
          chat: { view: true, respond: true },
        },
      },
    ];

    for (const roleData of defaultRoles) {
      const existing = await this.getRoleByName(roleData.name);
      if (!existing) {
        await this.createRole(roleData);
      }
    }
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getFeaturedCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isFeatured, true)).orderBy(categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Product operations
  async getProducts(filters?: { 
    categoryId?: string; 
    search?: string; 
    isActive?: boolean; 
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    const query = db.select().from(products).$dynamic();
    
    const conditions = [];
    
    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    
    if (filters?.search) {
      conditions.push(ilike(products.name, `%${filters.search}%`));
    }
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(products.isActive, filters.isActive));
    }
    
    if (filters?.isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, filters.isFeatured));
    }
    
    let finalQuery = conditions.length > 0 
      ? query.where(and(...conditions))
      : query;
    
    finalQuery = finalQuery.orderBy(desc(products.createdAt));
    
    if (filters?.limit) {
      finalQuery = finalQuery.limit(filters.limit);
    }
    
    if (filters?.offset) {
      finalQuery = finalQuery.offset(filters.offset);
    }
    
    return await finalQuery;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  // Generate unique slug for product
  async generateUniqueProductSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await this.getProductBySlug(slug);
      if (!existing || (excludeId && existing.id === excludeId)) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    // Ensure unique slug
    const uniqueSlug = await this.generateUniqueProductSlug(productData.slug);
    
    const [product] = await db.insert(products).values({
      ...(productData as any),
      slug: uniqueSlug,
      updatedAt: new Date(),
    }).returning();
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product> {
    // If slug is being updated, ensure it's unique
    const updateData: any = { ...(productData as any), updatedAt: new Date() };
    if (productData.slug) {
      updateData.slug = await this.generateUniqueProductSlug(productData.slug, id);
    }
    
    const [product] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<{ success: boolean; softDeleted?: boolean }> {
    try {
      const result = await db.delete(products).where(eq(products.id, id));
      return { success: (result.rowCount ?? 0) > 0 };
    } catch (error: any) {
      if (error.code === '23503') {
        const [updated] = await db
          .update(products)
          .set({ isActive: false })
          .where(eq(products.id, id))
          .returning();
        
        if (updated) {
          await db.delete(cartItems).where(eq(cartItems.productId, id));
          return { success: true, softDeleted: true };
        }
      }
      throw error;
    }
  }

  // Inventory management
  async reduceProductStock(productId: string, quantity: number): Promise<Product | null> {
    // Get current product
    const product = await this.getProduct(productId);
    if (!product) return null;

    // Calculate new stock
    const newStock = Math.max(0, product.stock - quantity);
    
    // Update product stock
    const [updatedProduct] = await db
      .update(products)
      .set({ 
        stock: newStock,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();
    
    return updatedProduct;
  }

  async increaseProductStock(productId: string, quantity: number): Promise<Product | null> {
    // Get current product
    const product = await this.getProduct(productId);
    if (!product) return null;

    // Calculate new stock
    const newStock = product.stock + quantity;
    
    // Update product stock
    const [updatedProduct] = await db
      .update(products)
      .set({ 
        stock: newStock,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId))
      .returning();
    
    return updatedProduct;
  }

  // Order operations
  async cancelOrderAndRestoreInventory(orderId: string): Promise<Order | null> {
    // Get order with items
    const orderWithItems = await this.getOrderWithItems(orderId);
    if (!orderWithItems) return null;
    
    // Restore inventory for each item
    for (const item of orderWithItems.items) {
      await this.increaseProductStock(item.productId, item.quantity);
    }
    
    // Update order status to cancelled
    const [cancelledOrder] = await db
      .update(orders)
      .set({ 
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    
    return cancelledOrder;
  }

  async getOrders(userId?: string, limit?: number, offset?: number): Promise<Order[]> {
    const query = db.select().from(orders).$dynamic();
    
    let finalQuery = userId 
      ? query.where(eq(orders.userId, userId))
      : query;
    
    finalQuery = finalQuery.orderBy(desc(orders.createdAt));
    
    if (limit) {
      finalQuery = finalQuery.limit(limit);
    }
    
    if (offset) {
      finalQuery = finalQuery.offset(offset);
    }
    
    return await finalQuery;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderWithItems(id: string): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    const items = await this.getOrderItems(id);
    return { ...order, items };
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const orderNumber = `PKM-${Date.now()}`;
    const [order] = await db.insert(orders).values({
      ...orderData,
      orderNumber,
    }).returning();
    return order;
  }

  async updateOrder(id: string, orderData: UpdateOrder): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({
        ...orderData,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async getPendingOrdersCount(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, 'pending'));
    return result[0]?.count || 0;
  }

  async getCustomerPendingOrdersCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.status, 'pending')));
    return result[0]?.count || 0;
  }

  // Order item operations
  async createOrderItem(orderItemData: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(orderItemData).returning();
    return orderItem;
  }

  async getOrderItems(orderId: string): Promise<(OrderItem & { product: Product })[]> {
    return await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        total: orderItems.total,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItemData.userId),
          eq(cartItems.productId, cartItemData.productId)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updatedItem] = await db
        .update(cartItems)
        .set({
          quantity: existingItem.quantity + cartItemData.quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    } else {
      // Create new cart item
      const [newItem] = await db.insert(cartItems).values(cartItemData).returning();
      return newItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [cartItem] = await db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, id))
      .returning();
    return cartItem;
  }

  async updateCartItemByProductId(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const [cartItem] = await db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.productId, productId)
        )
      )
      .returning();
    return cartItem;
  }

  async removeFromCart(id: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async removeFromCartByProductId(userId: string, productId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(
      and(
        eq(cartItems.userId, userId),
        eq(cartItems.productId, productId)
      )
    );
    return (result.rowCount ?? 0) > 0;
  }

  async clearCart(userId: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return (result.rowCount ?? 0) >= 0;
  }

  // Wishlist operations
  async getWishlistItems(userId: string): Promise<(WishlistItem & { product: Product })[]> {
    return await db
      .select({
        id: wishlistItems.id,
        userId: wishlistItems.userId,
        productId: wishlistItems.productId,
        createdAt: wishlistItems.createdAt,
        product: products,
      })
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .where(eq(wishlistItems.userId, userId))
      .orderBy(desc(wishlistItems.createdAt));
  }

  async addToWishlist(wishlistItemData: InsertWishlistItem): Promise<WishlistItem> {
    // Check if item already exists in wishlist
    const [existingItem] = await db
      .select()
      .from(wishlistItems)
      .where(
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

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    const result = await db.delete(wishlistItems).where(
      and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, productId)
      )
    );
    return (result.rowCount ?? 0) > 0;
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const [item] = await db
      .select()
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.userId, userId),
          eq(wishlistItems.productId, productId)
        )
      );
    return !!item;
  }

  async clearWishlist(userId: string): Promise<boolean> {
    const result = await db.delete(wishlistItems).where(eq(wishlistItems.userId, userId));
    return (result.rowCount ?? 0) >= 0;
  }

  // Payment gateway operations
  async getPaymentGateways(): Promise<PaymentGateway[]> {
    return await db.select().from(paymentGateways).orderBy(paymentGateways.name);
  }

  async getPaymentGateway(id: string): Promise<PaymentGateway | undefined> {
    const [gateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.id, id));
    return gateway;
  }

  async getPaymentGatewayByName(name: string): Promise<PaymentGateway | undefined> {
    const [gateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.name, name));
    return gateway;
  }

  async createPaymentGateway(gatewayData: InsertPaymentGateway): Promise<PaymentGateway> {
    const [gateway] = await db.insert(paymentGateways).values({
      ...gatewayData,
      updatedAt: new Date(),
    }).returning();
    return gateway;
  }

  async updatePaymentGateway(id: string, gatewayData: Partial<InsertPaymentGateway>): Promise<PaymentGateway> {
    const [gateway] = await db
      .update(paymentGateways)
      .set({
        ...gatewayData,
        updatedAt: new Date(),
      })
      .where(eq(paymentGateways.id, id))
      .returning();
    return gateway;
  }

  async deletePaymentGateway(id: string): Promise<boolean> {
    const result = await db.delete(paymentGateways).where(eq(paymentGateways.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Payment transaction operations
  async getPaymentTransactions(filters?: { 
    orderId?: string; 
    gatewayId?: string; 
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaymentTransaction[]> {
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
    
    let finalQuery = conditions.length > 0 
      ? query.where(and(...conditions))
      : query;
    
    finalQuery = finalQuery.orderBy(desc(paymentTransactions.createdAt));
    
    if (filters?.limit) {
      finalQuery = finalQuery.limit(filters.limit);
    }
    
    if (filters?.offset) {
      finalQuery = finalQuery.offset(filters.offset);
    }
    
    return await finalQuery;
  }

  async getPaymentTransaction(id: string): Promise<PaymentTransaction | undefined> {
    const [transaction] = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id));
    return transaction;
  }

  async createPaymentTransaction(transactionData: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const [transaction] = await db.insert(paymentTransactions).values({
      ...transactionData,
      updatedAt: new Date(),
    }).returning();
    return transaction;
  }

  async updatePaymentTransaction(id: string, transactionData: Partial<InsertPaymentTransaction>): Promise<PaymentTransaction> {
    const [transaction] = await db
      .update(paymentTransactions)
      .set({
        ...transactionData,
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.id, id))
      .returning();
    return transaction;
  }

  // Store settings operations (singleton pattern - always returns/updates single row)
  async getStoreSettings(): Promise<StoreSettings> {
    const [settings] = await db.select().from(storeSettings).limit(1);
    
    if (!settings) {
      // Create default settings if none exist
      const [newSettings] = await db.insert(storeSettings).values({}).returning();
      return newSettings;
    }
    
    return settings;
  }

  async updateStoreSettings(settingsData: Partial<InsertStoreSettings>): Promise<StoreSettings> {
    // First ensure settings exist
    const existing = await this.getStoreSettings();
    
    const [updated] = await db
      .update(storeSettings)
      .set({
        ...settingsData,
        updatedAt: new Date(),
      })
      .where(eq(storeSettings.id, existing.id))
      .returning();
    
    return updated;
  }

  // Notification operations
  async getNotifications(recipientType: string, recipientId?: string): Promise<Notification[]> {
    if (recipientId) {
      return await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.recipientType, recipientType),
            eq(notifications.recipientId, recipientId)
          )
        )
        .orderBy(desc(notifications.createdAt))
        .limit(50);
    } else {
      // For admin notifications without specific recipient (broadcast to all admins)
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.recipientType, recipientType))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
    }
  }

  async getUnreadNotificationCount(recipientType: string, recipientId?: string): Promise<number> {
    let query;
    if (recipientId) {
      query = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.recipientType, recipientType),
            eq(notifications.recipientId, recipientId),
            eq(notifications.isRead, false)
          )
        );
    } else {
      query = await db
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.recipientType, recipientType),
            eq(notifications.isRead, false)
          )
        );
    }
    return query.length;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async markAllNotificationsAsRead(recipientType: string, recipientId?: string): Promise<void> {
    if (recipientId) {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(
          and(
            eq(notifications.recipientType, recipientType),
            eq(notifications.recipientId, recipientId)
          )
        );
    } else {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.recipientType, recipientType));
    }
  }

  async deleteNotification(id: string): Promise<boolean> {
    const result = await db.delete(notifications).where(eq(notifications.id, id));
    return true;
  }

  // Chat operations
  async getChatConversations(filters?: { status?: string; assignedAgentId?: string; unassigned?: boolean }): Promise<ChatConversationWithDetails[]> {
    let conditions: any[] = [];
    
    if (filters?.status) {
      conditions.push(eq(chatConversations.status, filters.status as any));
    }
    if (filters?.assignedAgentId) {
      conditions.push(eq(chatConversations.assignedAgentId, filters.assignedAgentId));
    }
    if (filters?.unassigned) {
      conditions.push(isNull(chatConversations.assignedAgentId));
    }
    
    const conversations = await db
      .select()
      .from(chatConversations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(chatConversations.lastMessageAt));
    
    // Fetch customer and agent details for each conversation
    const conversationsWithDetails: ChatConversationWithDetails[] = [];
    for (const conv of conversations) {
      const customer = await this.getUser(conv.customerId);
      const agent = conv.assignedAgentId ? await this.getAdminUser(conv.assignedAgentId) : null;
      
      // Get unread count for agent (messages from customer that are unread)
      const unreadCount = await this.getUnreadMessageCount(conv.id, 'customer');
      
      if (customer) {
        conversationsWithDetails.push({
          ...conv,
          customer,
          assignedAgent: agent,
          unreadCount,
        });
      }
    }
    
    return conversationsWithDetails;
  }

  async getChatConversation(id: string): Promise<ChatConversationWithDetails | undefined> {
    const [conversation] = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.id, id));
    
    if (!conversation) return undefined;
    
    const customer = await this.getUser(conversation.customerId);
    const agent = conversation.assignedAgentId ? await this.getAdminUser(conversation.assignedAgentId) : null;
    const messages = await this.getChatMessages(id);
    
    if (!customer) return undefined;
    
    return {
      ...conversation,
      customer,
      assignedAgent: agent,
      messages,
    };
  }

  async getCustomerConversation(customerId: string): Promise<ChatConversation | undefined> {
    // Get the most recent open or in-progress conversation for the customer
    const [conversation] = await db
      .select()
      .from(chatConversations)
      .where(
        and(
          eq(chatConversations.customerId, customerId),
          sql`${chatConversations.status} IN ('open', 'in_progress')`
        )
      )
      .orderBy(desc(chatConversations.createdAt))
      .limit(1);
    
    return conversation;
  }

  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [created] = await db.insert(chatConversations).values(conversation).returning();
    return created;
  }

  async updateChatConversation(id: string, data: Partial<InsertChatConversation>): Promise<ChatConversation> {
    const [updated] = await db
      .update(chatConversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(chatConversations.id, id))
      .returning();
    return updated;
  }

  async assignChatAgent(conversationId: string, agentId: string): Promise<ChatConversation> {
    const [updated] = await db
      .update(chatConversations)
      .set({ 
        assignedAgentId: agentId, 
        status: 'in_progress',
        updatedAt: new Date() 
      })
      .where(eq(chatConversations.id, conversationId))
      .returning();
    return updated;
  }

  // Chat message operations
  async getChatMessages(conversationId: string): Promise<ChatMessage[]> {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db.insert(chatMessages).values(message).returning();
    
    // Update the conversation's lastMessageAt
    await db
      .update(chatConversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatConversations.id, message.conversationId));
    
    return created;
  }

  async markMessagesAsRead(conversationId: string, senderType: string): Promise<void> {
    // Mark all messages from the specified sender type as read
    await db
      .update(chatMessages)
      .set({ isRead: true })
      .where(
        and(
          eq(chatMessages.conversationId, conversationId),
          eq(chatMessages.senderType, senderType as any)
        )
      );
  }

  async getUnreadMessageCount(conversationId: string, senderType: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.conversationId, conversationId),
          eq(chatMessages.senderType, senderType as any),
          eq(chatMessages.isRead, false)
        )
      );
    return result[0]?.count || 0;
  }

  // Crypto payment operations
  async getCryptoPayments(orderId?: string): Promise<CryptoPayment[]> {
    if (orderId) {
      return db.select().from(cryptoPayments).where(eq(cryptoPayments.orderId, orderId)).orderBy(desc(cryptoPayments.createdAt));
    }
    return db.select().from(cryptoPayments).orderBy(desc(cryptoPayments.createdAt));
  }

  async getCryptoPayment(id: string): Promise<CryptoPayment | undefined> {
    const [payment] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.id, id));
    return payment;
  }

  async getCryptoPaymentByOrderId(orderId: string): Promise<CryptoPayment | undefined> {
    const [payment] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.orderId, orderId));
    return payment;
  }

  async getCryptoPaymentByExternalId(externalOrderId: string): Promise<CryptoPayment | undefined> {
    const [payment] = await db.select().from(cryptoPayments).where(eq(cryptoPayments.externalOrderId, externalOrderId));
    return payment;
  }

  async createCryptoPayment(payment: InsertCryptoPayment): Promise<CryptoPayment> {
    const [created] = await db.insert(cryptoPayments).values(payment).returning();
    return created;
  }

  async updateCryptoPayment(id: string, data: Partial<CryptoPayment>): Promise<CryptoPayment> {
    const [updated] = await db
      .update(cryptoPayments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(cryptoPayments.id, id))
      .returning();
    return updated;
  }

  // Payment account operations (for manual payment verification)
  async getPaymentAccounts(activeOnly: boolean = false): Promise<PaymentAccount[]> {
    if (activeOnly) {
      return db.select().from(paymentAccounts).where(eq(paymentAccounts.isActive, true)).orderBy(paymentAccounts.method);
    }
    return db.select().from(paymentAccounts).orderBy(paymentAccounts.method);
  }

  async getPaymentAccount(id: string): Promise<PaymentAccount | undefined> {
    const [account] = await db.select().from(paymentAccounts).where(eq(paymentAccounts.id, id));
    return account;
  }

  async getPaymentAccountsByMethod(method: string): Promise<PaymentAccount[]> {
    return db.select().from(paymentAccounts).where(
      and(
        eq(paymentAccounts.method, method),
        eq(paymentAccounts.isActive, true)
      )
    );
  }

  async createPaymentAccount(account: InsertPaymentAccount): Promise<PaymentAccount> {
    const [created] = await db.insert(paymentAccounts).values(account).returning();
    return created;
  }

  async updatePaymentAccount(id: string, data: Partial<InsertPaymentAccount>): Promise<PaymentAccount> {
    const [updated] = await db
      .update(paymentAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(paymentAccounts.id, id))
      .returning();
    return updated;
  }

  async deletePaymentAccount(id: string): Promise<boolean> {
    const result = await db.delete(paymentAccounts).where(eq(paymentAccounts.id, id));
    return true;
  }

  // Order verification operations
  async getOrdersPendingVerification(): Promise<Order[]> {
    return db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.verificationStatus, 'pending'),
          sql`${orders.paymentMethod} != 'cod'`,
          sql`${orders.paymentMethod} != 'wallet'`
        )
      )
      .orderBy(desc(orders.createdAt));
  }

  async verifyOrderPayment(orderId: string, adminId: string, approved: boolean, note?: string): Promise<Order> {
    const verificationStatus = approved ? 'approved' : 'rejected';
    const paymentStatus = approved ? 'completed' : 'failed';
    const orderStatus = approved ? 'processing' : 'pending';
    const transactionStatus = approved ? 'completed' : 'failed';
    
    const [updated] = await db
      .update(orders)
      .set({
        verificationStatus,
        paymentStatus,
        status: orderStatus,
        verifiedBy: adminId,
        verifiedAt: new Date(),
        verificationNote: note,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    
    // Also update the corresponding payment transaction status
    const orderTransactions = await this.getPaymentTransactions({ orderId });
    for (const transaction of orderTransactions) {
      await this.updatePaymentTransaction(transaction.id, {
        status: transactionStatus,
      });
    }
    
    // Create notification for customer
    const order = await this.getOrder(orderId);
    if (order) {
      await this.createNotification({
        recipientType: 'customer',
        recipientId: order.userId,
        type: approved ? 'payment_received' : 'payment_failed',
        title: approved ? 'Payment Verified' : 'Payment Rejected',
        message: approved 
          ? `Your payment for order #${order.orderNumber} has been verified.`
          : `Your payment for order #${order.orderNumber} was rejected. ${note || 'Please contact support.'}`,
        data: { orderId: order.id, orderNumber: order.orderNumber },
      });
    }
    
    return updated;
  }

  // ==================== TEAM CHAT OPERATIONS ====================

  async getTeamChatConversations(userId: string): Promise<TeamChatConversationWithDetails[]> {
    // Get all conversations where user is a participant
    const userParticipations = await db
      .select()
      .from(teamChatParticipants)
      .where(eq(teamChatParticipants.adminUserId, userId));

    const conversationIds = userParticipations.map(p => p.conversationId);
    
    if (conversationIds.length === 0) {
      return [];
    }

    const conversations = await db
      .select()
      .from(teamChatConversations)
      .where(sql`${teamChatConversations.id} IN (${sql.join(conversationIds.map(id => sql`${id}`), sql`, `)})`)
      .orderBy(desc(teamChatConversations.lastMessageAt));

    // Fetch details for each conversation
    const conversationsWithDetails: TeamChatConversationWithDetails[] = [];

    for (const conv of conversations) {
      // Get participants with user details
      const participants = await this.getTeamChatParticipants(conv.id);
      
      // Get last message
      const [lastMessage] = await db
        .select()
        .from(teamChatMessages)
        .where(eq(teamChatMessages.conversationId, conv.id))
        .orderBy(desc(teamChatMessages.createdAt))
        .limit(1);

      // Get unread count for this user
      const userParticipant = userParticipations.find(p => p.conversationId === conv.id);
      let unreadCount = 0;
      if (userParticipant) {
        const result = await db
          .select({ count: count() })
          .from(teamChatMessages)
          .where(
            and(
              eq(teamChatMessages.conversationId, conv.id),
              userParticipant.lastReadMessageId 
                ? sql`${teamChatMessages.createdAt} > (SELECT created_at FROM team_chat_messages WHERE id = ${userParticipant.lastReadMessageId})`
                : sql`1=1`
            )
          );
        unreadCount = result[0]?.count || 0;
      }

      // Get creator details
      let createdBy = null;
      if (conv.createdById) {
        createdBy = await this.getAdminUser(conv.createdById);
      }

      conversationsWithDetails.push({
        ...conv,
        createdBy: createdBy || null,
        participants,
        lastMessage: lastMessage || null,
        unreadCount,
      });
    }

    return conversationsWithDetails;
  }

  async getTeamChatConversation(id: string): Promise<TeamChatConversationWithDetails | undefined> {
    const [conv] = await db
      .select()
      .from(teamChatConversations)
      .where(eq(teamChatConversations.id, id));

    if (!conv) return undefined;

    const participants = await this.getTeamChatParticipants(id);
    
    let createdBy = null;
    if (conv.createdById) {
      createdBy = await this.getAdminUser(conv.createdById);
    }

    const [lastMessage] = await db
      .select()
      .from(teamChatMessages)
      .where(eq(teamChatMessages.conversationId, id))
      .orderBy(desc(teamChatMessages.createdAt))
      .limit(1);

    return {
      ...conv,
      createdBy: createdBy || null,
      participants,
      lastMessage: lastMessage || null,
      unreadCount: 0,
    };
  }

  async findDirectConversation(userId1: string, userId2: string): Promise<TeamChatConversation | undefined> {
    // Find a direct conversation between two users
    const user1Convs = await db
      .select({ conversationId: teamChatParticipants.conversationId })
      .from(teamChatParticipants)
      .where(eq(teamChatParticipants.adminUserId, userId1));

    for (const { conversationId } of user1Convs) {
      const [conv] = await db
        .select()
        .from(teamChatConversations)
        .where(and(
          eq(teamChatConversations.id, conversationId),
          eq(teamChatConversations.type, 'direct')
        ));

      if (conv) {
        // Check if userId2 is also a participant
        const [participant] = await db
          .select()
          .from(teamChatParticipants)
          .where(and(
            eq(teamChatParticipants.conversationId, conversationId),
            eq(teamChatParticipants.adminUserId, userId2)
          ));

        if (participant) {
          return conv;
        }
      }
    }

    return undefined;
  }

  async createTeamChatConversation(conversation: InsertTeamChatConversation): Promise<TeamChatConversation> {
    const [created] = await db
      .insert(teamChatConversations)
      .values(conversation)
      .returning();
    return created;
  }

  async updateTeamChatConversation(id: string, data: Partial<InsertTeamChatConversation>): Promise<TeamChatConversation> {
    const [updated] = await db
      .update(teamChatConversations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teamChatConversations.id, id))
      .returning();
    return updated;
  }

  async deleteTeamChatConversation(id: string): Promise<boolean> {
    await db.delete(teamChatConversations).where(eq(teamChatConversations.id, id));
    return true;
  }

  // Team chat participant operations
  async addTeamChatParticipant(participant: InsertTeamChatParticipant): Promise<TeamChatParticipant> {
    const [created] = await db
      .insert(teamChatParticipants)
      .values(participant)
      .returning();
    return created;
  }

  async removeTeamChatParticipant(conversationId: string, userId: string): Promise<boolean> {
    await db.delete(teamChatParticipants).where(
      and(
        eq(teamChatParticipants.conversationId, conversationId),
        eq(teamChatParticipants.adminUserId, userId)
      )
    );
    return true;
  }

  async getTeamChatParticipants(conversationId: string): Promise<(TeamChatParticipant & { adminUser: AdminUser })[]> {
    const participants = await db
      .select()
      .from(teamChatParticipants)
      .where(eq(teamChatParticipants.conversationId, conversationId));

    const result: (TeamChatParticipant & { adminUser: AdminUser })[] = [];
    for (const p of participants) {
      const adminUser = await this.getAdminUser(p.adminUserId);
      if (adminUser) {
        result.push({ ...p, adminUser });
      }
    }

    return result;
  }

  async updateTeamChatParticipant(id: string, data: Partial<InsertTeamChatParticipant>): Promise<TeamChatParticipant> {
    const [updated] = await db
      .update(teamChatParticipants)
      .set(data)
      .where(eq(teamChatParticipants.id, id))
      .returning();
    return updated;
  }

  async isTeamChatParticipant(conversationId: string, userId: string): Promise<boolean> {
    const [participant] = await db
      .select()
      .from(teamChatParticipants)
      .where(and(
        eq(teamChatParticipants.conversationId, conversationId),
        eq(teamChatParticipants.adminUserId, userId)
      ));
    return !!participant;
  }

  // Team chat message operations
  async getTeamChatMessages(conversationId: string, limit: number = 50, before?: string): Promise<TeamChatMessageWithSender[]> {
    let conditions: any[] = [eq(teamChatMessages.conversationId, conversationId)];
    
    if (before) {
      conditions.push(sql`${teamChatMessages.createdAt} < (SELECT created_at FROM team_chat_messages WHERE id = ${before})`);
    }

    const messages = await db
      .select()
      .from(teamChatMessages)
      .where(and(...conditions))
      .orderBy(desc(teamChatMessages.createdAt))
      .limit(limit);

    // Reverse to get oldest first for display
    messages.reverse();

    // Fetch sender details
    const result: TeamChatMessageWithSender[] = [];
    for (const msg of messages) {
      let sender = null;
      if (msg.senderId) {
        sender = await this.getAdminUser(msg.senderId);
      }
      result.push({ ...msg, sender: sender || null });
    }

    return result;
  }

  async createTeamChatMessage(message: InsertTeamChatMessage): Promise<TeamChatMessage> {
    const [created] = await db
      .insert(teamChatMessages)
      .values({
        ...message,
        attachments: message.attachments as any,
      })
      .returning();

    // Update conversation last message time
    await db
      .update(teamChatConversations)
      .set({ lastMessageAt: new Date(), updatedAt: new Date() })
      .where(eq(teamChatConversations.id, message.conversationId));

    return created;
  }

  async updateTeamChatMessage(id: string, message: string): Promise<TeamChatMessage> {
    const [updated] = await db
      .update(teamChatMessages)
      .set({ message, isEdited: true, editedAt: new Date() })
      .where(eq(teamChatMessages.id, id))
      .returning();
    return updated;
  }

  async deleteTeamChatMessage(id: string): Promise<boolean> {
    await db.delete(teamChatMessages).where(eq(teamChatMessages.id, id));
    return true;
  }

  async markTeamChatMessagesRead(conversationId: string, userId: string, lastMessageId: string): Promise<void> {
    await db
      .update(teamChatParticipants)
      .set({ lastReadMessageId: lastMessageId })
      .where(and(
        eq(teamChatParticipants.conversationId, conversationId),
        eq(teamChatParticipants.adminUserId, userId)
      ));
  }

  async getTeamChatUnreadCount(userId: string): Promise<number> {
    const userParticipations = await db
      .select()
      .from(teamChatParticipants)
      .where(eq(teamChatParticipants.adminUserId, userId));

    let totalUnread = 0;

    for (const participation of userParticipations) {
      if (participation.lastReadMessageId) {
        const result = await db
          .select({ count: count() })
          .from(teamChatMessages)
          .where(
            and(
              eq(teamChatMessages.conversationId, participation.conversationId),
              sql`${teamChatMessages.createdAt} > (SELECT created_at FROM team_chat_messages WHERE id = ${participation.lastReadMessageId})`
            )
          );
        totalUnread += result[0]?.count || 0;
      } else {
        // If no last read message, count all messages
        const result = await db
          .select({ count: count() })
          .from(teamChatMessages)
          .where(eq(teamChatMessages.conversationId, participation.conversationId));
        totalUnread += result[0]?.count || 0;
      }
    }

    return totalUnread;
  }

  // ==================== WALLET OPERATIONS ====================
  
  async getWallet(id: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }

  async getWalletByUserId(userId: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return wallet;
  }

  async createWallet(userId: string): Promise<Wallet> {
    const [wallet] = await db.insert(wallets).values({ userId, balance: "0" }).returning();
    return wallet;
  }

  async updateWalletBalance(walletId: string, newBalance: string): Promise<Wallet> {
    const [updated] = await db
      .update(wallets)
      .set({ balance: newBalance, updatedAt: new Date() })
      .where(eq(wallets.id, walletId))
      .returning();
    return updated;
  }

  async getAllWallets(): Promise<WalletWithUser[]> {
    const result = await db
      .select()
      .from(wallets)
      .leftJoin(users, eq(wallets.userId, users.id))
      .orderBy(desc(wallets.updatedAt));
    
    return result.map(r => ({
      ...r.wallets,
      user: r.users!,
    }));
  }

  // Wallet transaction operations
  async getWalletTransactions(walletId: string, limit: number = 50): Promise<WalletTransaction[]> {
    return db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.walletId, walletId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(limit);
  }

  async createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const [created] = await db.insert(walletTransactions).values(transaction).returning();
    return created;
  }

  // Wallet topup request operations
  async getWalletTopupRequests(status?: string): Promise<WalletTopupRequestWithDetails[]> {
    let query = db
      .select()
      .from(walletTopupRequests)
      .leftJoin(users, eq(walletTopupRequests.userId, users.id))
      .leftJoin(adminUsers, eq(walletTopupRequests.processedBy, adminUsers.id))
      .orderBy(desc(walletTopupRequests.createdAt));
    
    const result = status
      ? await query.where(eq(walletTopupRequests.status, status as any))
      : await query;
    
    return result.map(r => ({
      ...r.wallet_topup_requests,
      user: r.users!,
      processedByAdmin: r.admin_users || null,
    }));
  }

  async getWalletTopupRequest(id: string): Promise<WalletTopupRequestWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(walletTopupRequests)
      .leftJoin(users, eq(walletTopupRequests.userId, users.id))
      .leftJoin(adminUsers, eq(walletTopupRequests.processedBy, adminUsers.id))
      .where(eq(walletTopupRequests.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.wallet_topup_requests,
      user: result.users!,
      processedByAdmin: result.admin_users || null,
    };
  }

  async getUserTopupRequests(userId: string): Promise<WalletTopupRequest[]> {
    return db
      .select()
      .from(walletTopupRequests)
      .where(eq(walletTopupRequests.userId, userId))
      .orderBy(desc(walletTopupRequests.createdAt));
  }

  async createWalletTopupRequest(request: InsertWalletTopupRequest): Promise<WalletTopupRequest> {
    const [created] = await db.insert(walletTopupRequests).values(request).returning();
    return created;
  }

  async processWalletTopupRequest(id: string, adminId: string, approved: boolean, note?: string): Promise<WalletTopupRequest> {
    const [updated] = await db
      .update(walletTopupRequests)
      .set({
        status: approved ? "approved" : "rejected",
        processedBy: adminId,
        processedAt: new Date(),
        adminNote: note,
        updatedAt: new Date(),
      })
      .where(eq(walletTopupRequests.id, id))
      .returning();
    
    return updated;
  }

  async getPendingTopupRequestsCount(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(walletTopupRequests)
      .where(eq(walletTopupRequests.status, "pending"));
    return result[0]?.count || 0;
  }

  // ==================== COUPON OPERATIONS ====================

  async getCoupons(): Promise<Coupon[]> {
    return db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async getCoupon(id: string): Promise<CouponWithDetails | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    if (!coupon) return undefined;

    const cats = await db.select().from(couponCategories).where(eq(couponCategories.couponId, id));
    const prods = await db.select().from(couponProducts).where(eq(couponProducts.couponId, id));
    const redemps = await db.select().from(couponRedemptions).where(eq(couponRedemptions.couponId, id));

    return { ...coupon, categories: cats, products: prods, redemptions: redemps };
  }

  async getCouponByCode(code: string): Promise<CouponWithDetails | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase()));
    if (!coupon) return undefined;

    const cats = await db.select().from(couponCategories).where(eq(couponCategories.couponId, coupon.id));
    const prods = await db.select().from(couponProducts).where(eq(couponProducts.couponId, coupon.id));

    return { ...coupon, categories: cats, products: prods };
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [created] = await db.insert(coupons).values({
      ...coupon,
      code: coupon.code.toUpperCase(),
    }).returning();
    return created;
  }

  async updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon> {
    const updateData: any = { ...coupon, updatedAt: new Date() };
    if (coupon.code) updateData.code = coupon.code.toUpperCase();
    
    const [updated] = await db.update(coupons).set(updateData).where(eq(coupons.id, id)).returning();
    return updated;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const result = await db.delete(coupons).where(eq(coupons.id, id));
    return true;
  }

  async setCouponCategories(couponId: string, categoryIds: string[]): Promise<void> {
    await db.delete(couponCategories).where(eq(couponCategories.couponId, couponId));
    if (categoryIds.length > 0) {
      await db.insert(couponCategories).values(
        categoryIds.map(categoryId => ({ couponId, categoryId }))
      );
    }
  }

  async setCouponProducts(couponId: string, productIds: string[]): Promise<void> {
    await db.delete(couponProducts).where(eq(couponProducts.couponId, couponId));
    if (productIds.length > 0) {
      await db.insert(couponProducts).values(
        productIds.map(productId => ({ couponId, productId }))
      );
    }
  }

  async getCouponRedemptionsByUser(couponId: string, userId: string): Promise<CouponRedemption[]> {
    return db.select().from(couponRedemptions).where(
      and(eq(couponRedemptions.couponId, couponId), eq(couponRedemptions.userId, userId))
    );
  }

  async createCouponRedemption(redemption: InsertCouponRedemption): Promise<CouponRedemption> {
    const [created] = await db.insert(couponRedemptions).values(redemption).returning();
    return created;
  }

  async incrementCouponUsage(couponId: string): Promise<void> {
    await db.update(coupons).set({
      usageCount: sql`${coupons.usageCount} + 1`,
      updatedAt: new Date(),
    }).where(eq(coupons.id, couponId));
  }

  // ==================== PRODUCT REVIEW OPERATIONS ====================

  async getProductReviews(productId: string, status?: string): Promise<ProductReviewWithDetails[]> {
    const conditions = [eq(productReviews.productId, productId)];
    if (status) {
      conditions.push(eq(productReviews.status, status as any));
    }

    const results = await db
      .select()
      .from(productReviews)
      .leftJoin(users, eq(productReviews.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(productReviews.createdAt));

    return results.map((r: any) => ({
      ...r.product_reviews,
      user: r.users ? {
        id: r.users.id,
        firstName: r.users.firstName,
        lastName: r.users.lastName,
        email: r.users.email,
      } as any : undefined,
    }));
  }

  async getAllReviews(status?: string): Promise<ProductReviewWithDetails[]> {
    const baseQuery = db
      .select()
      .from(productReviews)
      .leftJoin(users, eq(productReviews.userId, users.id))
      .leftJoin(products, eq(productReviews.productId, products.id))
      .orderBy(desc(productReviews.createdAt));

    const results = status
      ? await baseQuery.where(eq(productReviews.status, status as any))
      : await baseQuery;

    return results.map(r => ({
      ...r.product_reviews,
      user: r.users ? {
        id: r.users.id,
        firstName: r.users.firstName,
        lastName: r.users.lastName,
        email: r.users.email,
      } as any : undefined,
      product: r.products || undefined,
    }));
  }

  async getReview(id: string): Promise<ProductReviewWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(productReviews)
      .leftJoin(users, eq(productReviews.userId, users.id))
      .leftJoin(products, eq(productReviews.productId, products.id))
      .where(eq(productReviews.id, id));

    if (!result) return undefined;

    return {
      ...result.product_reviews,
      user: result.users ? {
        id: result.users.id,
        firstName: result.users.firstName,
        lastName: result.users.lastName,
        email: result.users.email,
      } as any : undefined,
      product: result.products || undefined,
    };
  }

  async getUserReviewForProduct(userId: string, productId: string): Promise<ProductReview | undefined> {
    const [review] = await db
      .select()
      .from(productReviews)
      .where(and(eq(productReviews.userId, userId), eq(productReviews.productId, productId)));
    return review;
  }

  async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const result = await db
      .select({ count: count() })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orders.userId, userId),
          eq(orderItems.productId, productId),
          eq(orders.status, "delivered")
        )
      );
    return (result[0]?.count || 0) > 0;
  }

  async createReview(review: InsertProductReview): Promise<ProductReview> {
    const [created] = await db.insert(productReviews).values(review).returning();
    return created;
  }

  async updateReview(id: string, review: Partial<ProductReview>): Promise<ProductReview> {
    const [updated] = await db
      .update(productReviews)
      .set({ ...review, updatedAt: new Date() })
      .where(eq(productReviews.id, id))
      .returning();
    return updated;
  }

  async moderateReview(id: string, adminId: string, status: string, note?: string): Promise<ProductReview> {
    const [updated] = await db
      .update(productReviews)
      .set({
        status: status as any,
        moderatedBy: adminId,
        moderatedAt: new Date(),
        moderationNote: note,
        updatedAt: new Date(),
      })
      .where(eq(productReviews.id, id))
      .returning();

    // Update product rating if approved or status changed
    await this.updateProductRating(updated.productId);

    return updated;
  }

  async deleteReview(id: string): Promise<boolean> {
    const [review] = await db.select().from(productReviews).where(eq(productReviews.id, id));
    if (!review) return false;

    await db.delete(productReviews).where(eq(productReviews.id, id));
    
    // Update product rating after deletion
    await this.updateProductRating(review.productId);
    
    return true;
  }

  async updateProductRating(productId: string): Promise<void> {
    const result = await db
      .select({
        avgRating: sql<string>`AVG(${productReviews.rating})`,
        count: count(),
      })
      .from(productReviews)
      .where(and(eq(productReviews.productId, productId), eq(productReviews.status, "approved")));

    const avgRating = result[0]?.avgRating ? parseFloat(result[0].avgRating).toFixed(2) : "0";
    const ratingCount = result[0]?.count || 0;

    await db.update(products).set({
      ratingAverage: avgRating,
      ratingCount,
      updatedAt: new Date(),
    }).where(eq(products.id, productId));
  }

  async getPendingReviewsCount(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(productReviews)
      .where(eq(productReviews.status, "pending"));
    return result[0]?.count || 0;
  }

  // Supplier operations
  async getSuppliers(): Promise<Supplier[]> {
    return db.select().from(suppliers).orderBy(desc(suppliers.createdAt));
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [created] = await db.insert(suppliers).values(supplier).returning();
    return created;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const [updated] = await db
      .update(suppliers)
      .set({ ...supplier, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return updated;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
    return true;
  }

  // Purchase operations
  async getPurchases(): Promise<(Purchase & { supplier?: Supplier; itemCount?: number })[]> {
    const purchaseList = await db.select().from(purchases).orderBy(desc(purchases.createdAt));
    
    const result = await Promise.all(purchaseList.map(async (purchase) => {
      let supplier: Supplier | undefined;
      if (purchase.supplierId) {
        const [s] = await db.select().from(suppliers).where(eq(suppliers.id, purchase.supplierId));
        supplier = s;
      }
      
      const itemCountResult = await db
        .select({ count: count() })
        .from(purchaseItems)
        .where(eq(purchaseItems.purchaseId, purchase.id));
      
      return {
        ...purchase,
        supplier,
        itemCount: itemCountResult[0]?.count || 0,
      };
    }));
    
    return result;
  }

  async getPurchase(id: string): Promise<(Purchase & { supplier?: Supplier; items: (PurchaseItem & { product?: Product })[] }) | undefined> {
    const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
    if (!purchase) return undefined;
    
    let supplier: Supplier | undefined;
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

  async createPurchase(purchase: InsertPurchase, items: { productId: string; quantity: number; costPrice: string }[], adminId: string): Promise<Purchase> {
    // Generate purchase number
    const purchaseNumber = `PO-${Date.now().toString(36).toUpperCase()}`;
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.costPrice) * item.quantity), 0);
    const total = subtotal + parseFloat(purchase.shippingCost || "0") + parseFloat(purchase.otherCosts || "0");
    
    const [created] = await db.insert(purchases).values({
      ...purchase,
      purchaseNumber,
      subtotal: subtotal.toString(),
      total: total.toString(),
      createdBy: adminId,
    }).returning();
    
    // Insert purchase items
    for (const item of items) {
      await db.insert(purchaseItems).values({
        purchaseId: created.id,
        productId: item.productId,
        quantity: item.quantity,
        costPrice: item.costPrice,
        total: (parseFloat(item.costPrice) * item.quantity).toString(),
      });
    }
    
    return created;
  }

  async updatePurchase(id: string, purchase: Partial<InsertPurchase>): Promise<Purchase> {
    const [updated] = await db
      .update(purchases)
      .set({ ...purchase, updatedAt: new Date() })
      .where(eq(purchases.id, id))
      .returning();
    return updated;
  }

  async updatePurchaseStatus(id: string, status: string): Promise<Purchase> {
    const updateData: any = { status, updatedAt: new Date() };
    if (status === 'received') {
      updateData.receivedDate = new Date();
    }
    const [updated] = await db
      .update(purchases)
      .set(updateData)
      .where(eq(purchases.id, id))
      .returning();
    return updated;
  }

  async receivePurchase(id: string, receivedItems: { purchaseItemId: string; receivedQuantity: number }[], adminId: string): Promise<Purchase> {
    const purchase = await this.getPurchase(id);
    if (!purchase) throw new Error('Purchase not found');
    
    let allReceived = true;
    let anyReceived = false;
    
    for (const receivedItem of receivedItems) {
      const purchaseItem = purchase.items.find(i => i.id === receivedItem.purchaseItemId);
      if (!purchaseItem) continue;
      
      const newReceivedQty = (purchaseItem.receivedQuantity || 0) + receivedItem.receivedQuantity;
      
      // Update purchase item
      await db.update(purchaseItems)
        .set({ receivedQuantity: newReceivedQty })
        .where(eq(purchaseItems.id, receivedItem.purchaseItemId));
      
      // Update product stock
      if (receivedItem.receivedQuantity > 0 && purchaseItem.product) {
        const newStock = purchaseItem.product.stock + receivedItem.receivedQuantity;
        await this.adjustProductStock(
          purchaseItem.productId,
          newStock,
          'purchase',
          `Received from purchase ${purchase.purchaseNumber}`,
          adminId,
          id,
          'purchase'
        );
        
        // Update product cost price if provided
        if (purchaseItem.costPrice) {
          await db.update(products)
            .set({ costPrice: purchaseItem.costPrice, updatedAt: new Date() })
            .where(eq(products.id, purchaseItem.productId));
        }
      }
      
      if (newReceivedQty < purchaseItem.quantity) {
        allReceived = false;
      }
      if (newReceivedQty > 0) {
        anyReceived = true;
      }
    }
    
    // Update purchase status
    let newStatus = 'ordered';
    if (allReceived) {
      newStatus = 'received';
    } else if (anyReceived) {
      newStatus = 'partially_received';
    }
    
    return this.updatePurchaseStatus(id, newStatus);
  }

  async deletePurchase(id: string): Promise<boolean> {
    await db.delete(purchaseItems).where(eq(purchaseItems.purchaseId, id));
    await db.delete(purchases).where(eq(purchases.id, id));
    return true;
  }

  // Stock adjustment operations
  async getStockAdjustments(productId?: string): Promise<(StockAdjustment & { product?: Product })[]> {
    let query = db.select().from(stockAdjustments).orderBy(desc(stockAdjustments.createdAt));
    
    let adjustments;
    if (productId) {
      adjustments = await db.select().from(stockAdjustments)
        .where(eq(stockAdjustments.productId, productId))
        .orderBy(desc(stockAdjustments.createdAt));
    } else {
      adjustments = await db.select().from(stockAdjustments).orderBy(desc(stockAdjustments.createdAt));
    }
    
    const result = await Promise.all(adjustments.map(async (adj) => {
      const [product] = await db.select().from(products).where(eq(products.id, adj.productId));
      return { ...adj, product };
    }));
    
    return result;
  }

  async createStockAdjustment(adjustment: InsertStockAdjustment, adminId: string): Promise<StockAdjustment> {
    const [created] = await db.insert(stockAdjustments).values({
      ...adjustment,
      createdBy: adminId,
    }).returning();
    return created;
  }

  async adjustProductStock(productId: string, newStock: number, type: string, reason: string, adminId: string, referenceId?: string, referenceType?: string): Promise<Product> {
    // Get current stock
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product) throw new Error('Product not found');
    
    const previousStock = product.stock;
    
    // Update product stock
    const [updated] = await db.update(products)
      .set({ stock: newStock, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning();
    
    // Create stock adjustment record
    await this.createStockAdjustment({
      productId,
      previousStock,
      newStock,
      adjustmentType: type,
      reason,
      referenceId,
      referenceType,
    }, adminId);
    
    // Check for low stock notification
    const threshold = product.lowStockThreshold || 10;
    if (newStock <= threshold && newStock > 0 && previousStock > threshold) {
      await this.createNotification({
        recipientType: 'admin',
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${product.name} is running low on stock (${newStock} remaining).`,
        data: { productId, stock: newStock, threshold },
      });
    } else if (newStock === 0 && previousStock > 0) {
      await this.createNotification({
        recipientType: 'admin',
        type: 'low_stock',
        title: 'Out of Stock Alert',
        message: `${product.name} is now out of stock.`,
        data: { productId, stock: 0 },
      });
    }
    
    return updated;
  }

  // Inventory & profit analytics
  async getLowStockProducts(): Promise<Product[]> {
    return db.select().from(products)
      .where(sql`${products.stock} <= COALESCE(${products.lowStockThreshold}, 10) AND ${products.isActive} = true`)
      .orderBy(products.stock);
  }

  async getInventorySummary(): Promise<{ totalProducts: number; totalStock: number; lowStockCount: number; outOfStockCount: number; totalValue: number; totalCostValue: number }> {
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
      totalCostValue,
    };
  }

  async getProfitAnalytics(startDate?: Date, endDate?: Date): Promise<{ totalRevenue: number; totalCost: number; profit: number; margin: number; orderCount: number; topProfitProducts: { product: Product; profit: number; quantity: number }[] }> {
    // Get delivered orders within date range
    let ordersQuery = db.select().from(orders).where(eq(orders.status, 'delivered'));
    
    const deliveredOrders = await ordersQuery;
    
    // Filter by date if provided
    const filteredOrders = deliveredOrders.filter(order => {
      if (!order.createdAt) return true;
      const orderDate = new Date(order.createdAt);
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
      return true;
    });
    
    let totalRevenue = 0;
    let totalCost = 0;
    const productProfits: Map<string, { product: Product; profit: number; quantity: number }> = new Map();
    
    for (const order of filteredOrders) {
      totalRevenue += parseFloat(order.total);
      
      // Get order items
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
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    // Get top 10 profitable products
    const topProfitProducts = Array.from(productProfits.values())
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10);
    
    return {
      totalRevenue,
      totalCost,
      profit,
      margin,
      orderCount: filteredOrders.length,
      topProfitProducts,
    };
  }

  async getBalanceSheet(startDate?: Date, endDate?: Date): Promise<{
    assets: {
      cashFromOrders: number;
      inventoryValue: number;
      pendingPayments: number;
      totalAssets: number;
    };
    liabilities: {
      customerWalletBalances: number;
      pendingRefunds: number;
      pendingTopups: number;
      totalLiabilities: number;
    };
    equity: {
      retainedEarnings: number;
      netProfit: number;
      totalEquity: number;
    };
    summary: {
      totalRevenue: number;
      totalCost: number;
      grossProfit: number;
      profitMargin: number;
      orderCount: number;
      completedOrderCount: number;
      pendingOrderCount: number;
      cancelledOrderCount: number;
    };
    periodComparison?: {
      previousPeriodProfit: number;
      profitChange: number;
      profitChangePercent: number;
    };
  }> {
    // Calculate date range for previous period comparison
    let prevStartDate: Date | undefined;
    let prevEndDate: Date | undefined;
    if (startDate && endDate) {
      const periodDuration = endDate.getTime() - startDate.getTime();
      prevStartDate = new Date(startDate.getTime() - periodDuration);
      prevEndDate = new Date(startDate.getTime());
    }

    // Build date conditions for SQL query - fetch both current and previous period orders at once
    const dateConditions: any[] = [];
    if (startDate && endDate && prevStartDate) {
      // Fetch orders from both current period and previous period
      dateConditions.push(
        sql`${orders.createdAt} >= ${prevStartDate} AND ${orders.createdAt} <= ${endDate}`
      );
    } else if (startDate) {
      dateConditions.push(sql`${orders.createdAt} >= ${startDate}`);
    } else if (endDate) {
      dateConditions.push(sql`${orders.createdAt} <= ${endDate}`);
    }

    // Fetch orders with SQL date filtering (single query)
    let allOrders;
    if (dateConditions.length > 0) {
      allOrders = await db.select().from(orders).where(and(...dateConditions));
    } else {
      allOrders = await db.select().from(orders);
    }

    // Separate current period and previous period orders
    const filteredOrders = allOrders.filter(order => {
      if (!startDate && !endDate) return true;
      if (!order.createdAt) return true;
      const orderDate = new Date(order.createdAt);
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;
      return true;
    });

    const prevPeriodOrders = (startDate && endDate && prevStartDate && prevEndDate) 
      ? allOrders.filter(order => {
          if (!order.createdAt) return false;
          const orderDate = new Date(order.createdAt);
          return orderDate >= prevStartDate! && orderDate < prevEndDate! && order.paymentStatus === 'completed';
        })
      : [];

    // BATCH FETCH: Get all products once (for inventory and cost calculations)
    const allProducts = await db.select().from(products);
    const productCostMap = new Map<string, number>();
    allProducts.forEach(p => {
      productCostMap.set(p.id, p.costPrice ? parseFloat(p.costPrice) : 0);
    });

    // Calculate inventory value at cost price (only active products)
    const inventoryValue = allProducts
      .filter(p => p.isActive)
      .reduce((sum, p) => {
        const costPrice = productCostMap.get(p.id) || 0;
        return sum + (costPrice * p.stock);
      }, 0);

    // ASSETS
    const completedOrders = filteredOrders.filter(o => o.paymentStatus === 'completed');
    const cashFromOrders = completedOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    
    const pendingPaymentOrders = filteredOrders.filter(o => o.paymentStatus === 'pending' || o.paymentStatus === 'processing');
    const pendingPayments = pendingPaymentOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    
    const totalAssets = cashFromOrders + inventoryValue + pendingPayments;

    // LIABILITIES - batch fetch wallets and topup requests
    const [allWallets, pendingTopupRequests] = await Promise.all([
      db.select().from(wallets),
      db.select().from(walletTopupRequests).where(eq(walletTopupRequests.status, 'pending'))
    ]);
    
    const customerWalletBalances = allWallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);
    
    const refundedOrders = filteredOrders.filter(o => o.status === 'refunded' && o.paymentStatus !== 'refunded');
    const pendingRefunds = refundedOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    
    const pendingTopups = pendingTopupRequests.reduce((sum, r) => sum + parseFloat(r.amount), 0);
    
    const totalLiabilities = customerWalletBalances + pendingRefunds + pendingTopups;

    // BATCH FETCH: Get all order items for completed orders (both periods) in ONE query
    const allCompletedOrderIds = [...completedOrders.map(o => o.id), ...prevPeriodOrders.map(o => o.id)];
    
    let allOrderItems: { orderId: string; productId: string; quantity: number }[] = [];
    if (allCompletedOrderIds.length > 0) {
      allOrderItems = await db
        .select({
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(sql`${orderItems.orderId} IN (${sql.join(allCompletedOrderIds.map(id => sql`${id}`), sql`, `)})`);
    }

    // Group order items by orderId for quick lookup
    const orderItemsMap = new Map<string, { productId: string; quantity: number }[]>();
    allOrderItems.forEach(item => {
      const existing = orderItemsMap.get(item.orderId) || [];
      existing.push({ productId: item.productId, quantity: item.quantity });
      orderItemsMap.set(item.orderId, existing);
    });

    // Calculate COGS for current period using the maps
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

    // SUMMARY
    const totalRevenue = cashFromOrders;
    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    
    const completedOrderCount = completedOrders.length;
    const pendingOrderCount = filteredOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const cancelledOrderCount = filteredOrders.filter(o => o.status === 'cancelled').length;

    // PERIOD COMPARISON using already-fetched data
    let periodComparison: { previousPeriodProfit: number; profitChange: number; profitChangePercent: number } | undefined;
    
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
      const profitChangePercent = previousPeriodProfit > 0 ? (profitChange / previousPeriodProfit) * 100 : 0;
      
      periodComparison = { previousPeriodProfit, profitChange, profitChangePercent };
    }

    return {
      assets: {
        cashFromOrders,
        inventoryValue,
        pendingPayments,
        totalAssets,
      },
      liabilities: {
        customerWalletBalances,
        pendingRefunds,
        pendingTopups,
        totalLiabilities,
      },
      equity: {
        retainedEarnings,
        netProfit,
        totalEquity,
      },
      summary: {
        totalRevenue,
        totalCost,
        grossProfit,
        profitMargin,
        orderCount: filteredOrders.length,
        completedOrderCount,
        pendingOrderCount,
        cancelledOrderCount,
      },
      periodComparison,
    };
  }

  // Notification Types Management
  async getNotificationTypes(): Promise<NotificationTypeRecord[]> {
    return db.select().from(notificationTypes).orderBy(notificationTypes.category, notificationTypes.label);
  }

  async getNotificationTypeByKey(key: string): Promise<NotificationTypeRecord | undefined> {
    const [type] = await db.select().from(notificationTypes).where(eq(notificationTypes.key, key));
    return type;
  }

  async createNotificationType(data: InsertNotificationType): Promise<NotificationTypeRecord> {
    const [created] = await db.insert(notificationTypes).values(data).returning();
    return created;
  }

  async updateNotificationType(id: string, data: Partial<InsertNotificationType>): Promise<NotificationTypeRecord | undefined> {
    const [updated] = await db.update(notificationTypes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notificationTypes.id, id))
      .returning();
    return updated;
  }

  async toggleNotificationType(id: string, field: 'isEnabled' | 'isEmailEnabled' | 'isInAppEnabled', value: boolean): Promise<NotificationTypeRecord | undefined> {
    const [updated] = await db.update(notificationTypes)
      .set({ [field]: value, updatedAt: new Date() })
      .where(eq(notificationTypes.id, id))
      .returning();
    return updated;
  }

  async deleteNotificationType(id: string): Promise<boolean> {
    const result = await db.delete(notificationTypes).where(eq(notificationTypes.id, id));
    return true;
  }

  // Notification Templates Management
  async getNotificationTemplates(): Promise<NotificationTemplate[]> {
    return db.select().from(notificationTemplates).orderBy(notificationTemplates.typeKey);
  }

  async getNotificationTemplatesByType(typeKey: string): Promise<NotificationTemplate[]> {
    return db.select().from(notificationTemplates).where(eq(notificationTemplates.typeKey, typeKey));
  }

  async getNotificationTemplate(id: string): Promise<NotificationTemplate | undefined> {
    const [template] = await db.select().from(notificationTemplates).where(eq(notificationTemplates.id, id));
    return template;
  }

  async createNotificationTemplate(data: InsertNotificationTemplate): Promise<NotificationTemplate> {
    const [created] = await db.insert(notificationTemplates).values(data).returning();
    return created;
  }

  async updateNotificationTemplate(id: string, data: Partial<InsertNotificationTemplate>): Promise<NotificationTemplate | undefined> {
    const [existing] = await db.select().from(notificationTemplates).where(eq(notificationTemplates.id, id));
    const newVersion = existing ? (existing.version || 1) + 1 : 1;
    
    const [updated] = await db.update(notificationTemplates)
      .set({ ...data, version: newVersion, updatedAt: new Date() })
      .where(eq(notificationTemplates.id, id))
      .returning();
    return updated;
  }

  async toggleNotificationTemplate(id: string, isActive: boolean): Promise<NotificationTemplate | undefined> {
    const [updated] = await db.update(notificationTemplates)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(notificationTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteNotificationTemplate(id: string): Promise<boolean> {
    await db.delete(notificationTemplates).where(eq(notificationTemplates.id, id));
    return true;
  }

  // Seed default notification types if empty
  async seedNotificationTypes(): Promise<void> {
    const existing = await db.select().from(notificationTypes);
    if (existing.length > 0) return;

    const defaultTypes: InsertNotificationType[] = [
      { key: 'order_placed', label: 'Order Placed', description: 'When a new order is placed', category: 'orders', icon: 'ShoppingBag', isEnabled: true, isEmailEnabled: true, isInAppEnabled: true },
      { key: 'order_status_update', label: 'Order Status Update', description: 'When order status changes (processing, shipped, delivered)', category: 'orders', icon: 'Truck', isEnabled: true, isEmailEnabled: true, isInAppEnabled: true },
      { key: 'payment_received', label: 'Payment Received', description: 'When payment is verified', category: 'payments', icon: 'CreditCard', isEnabled: true, isEmailEnabled: true, isInAppEnabled: true },
      { key: 'payment_failed', label: 'Payment Failed', description: 'When payment verification fails', category: 'payments', icon: 'AlertCircle', isEnabled: true, isEmailEnabled: true, isInAppEnabled: true },
      { key: 'low_stock', label: 'Low Stock Alert', description: 'When product stock falls below threshold', category: 'inventory', icon: 'Package', isEnabled: true, isEmailEnabled: false, isInAppEnabled: true },
      { key: 'customer_registration', label: 'Customer Registration', description: 'When a new customer registers', category: 'customers', icon: 'UserPlus', isEnabled: true, isEmailEnabled: false, isInAppEnabled: true },
      { key: 'review_submitted', label: 'Review Submitted', description: 'When a customer submits a product review', category: 'customers', icon: 'Star', isEnabled: true, isEmailEnabled: false, isInAppEnabled: true },
      { key: 'chat_message', label: 'Chat Message', description: 'When a new chat message is received', category: 'communication', icon: 'MessageCircle', isEnabled: true, isEmailEnabled: false, isInAppEnabled: true },
      { key: 'general', label: 'General Notification', description: 'General system notifications', category: 'system', icon: 'Bell', isEnabled: true, isEmailEnabled: false, isInAppEnabled: true },
    ];

    for (const type of defaultTypes) {
      await db.insert(notificationTypes).values(type);
    }
  }
}

export const storage = new DatabaseStorage();
