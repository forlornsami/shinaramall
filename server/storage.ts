import {
  users,
  adminUsers,
  roles,
  categories,
  products,
  orders,
  orderItems,
  cartItems,
  paymentGateways,
  paymentTransactions,
  storeSettings,
  notifications,
  chatConversations,
  chatMessages,
  type User,
  type UpsertUser,
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
  type PaymentGateway,
  type InsertPaymentGateway,
  type PaymentTransaction,
  type InsertPaymentTransaction,
  type StoreSettings,
  type InsertStoreSettings,
  type Notification,
  type InsertNotification,
  type ChatConversation,
  type InsertChatConversation,
  type ChatMessage,
  type InsertChatMessage,
  type ChatConversationWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, ilike, isNull, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUser(userData.id);
    const isNewUser = !existingUser;
    
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Create notification for new customer registration
    if (isNewUser) {
      try {
        const customerName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user.email || 'New Customer');
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
    }
    
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
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
        isActive: adminUsers.isActive,
        lastLoginAt: adminUsers.lastLoginAt,
        createdAt: adminUsers.createdAt,
        updatedAt: adminUsers.updatedAt,
        roleData: roles,
      })
      .from(adminUsers)
      .leftJoin(roles, eq(adminUsers.roleId, roles.id))
      .where(eq(adminUsers.username, username));
    return result[0];
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
        isActive: adminUsers.isActive,
        lastLoginAt: adminUsers.lastLoginAt,
        createdAt: adminUsers.createdAt,
        updatedAt: adminUsers.updatedAt,
        roleData: roles,
      })
      .from(adminUsers)
      .leftJoin(roles, eq(adminUsers.roleId, roles.id))
      .orderBy(desc(adminUsers.createdAt));
    return result;
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
    return result.rowCount > 0;
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
      ...roleData,
      updatedAt: new Date(),
    }).returning();
    return role;
  }

  async updateRole(id: string, roleData: Partial<InsertRole>): Promise<Role> {
    const [role] = await db
      .update(roles)
      .set({
        ...roleData,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();
    return role;
  }

  async deleteRole(id: string): Promise<boolean> {
    const result = await db.delete(roles).where(eq(roles.id, id));
    return result.rowCount > 0;
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
    return result.rowCount > 0;
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
    let query = db.select().from(products);
    
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
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(products.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
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
      ...productData,
      slug: uniqueSlug,
      updatedAt: new Date(),
    }).returning();
    return product;
  }

  async updateProduct(id: string, productData: Partial<InsertProduct>): Promise<Product> {
    // If slug is being updated, ensure it's unique
    const updateData = { ...productData };
    if (productData.slug) {
      updateData.slug = await this.generateUniqueProductSlug(productData.slug, id);
    }
    
    const [product] = await db
      .update(products)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
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
    let query = db.select().from(orders);
    
    if (userId) {
      query = query.where(eq(orders.userId, userId));
    }
    
    query = query.orderBy(desc(orders.createdAt));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    if (offset) {
      query = query.offset(offset);
    }
    
    return await query;
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
    return result.rowCount >= 0;
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
    let query = db.select().from(paymentTransactions);
    
    if (filters?.orderId) {
      query = query.where(eq(paymentTransactions.orderId, filters.orderId));
    }
    if (filters?.gatewayId) {
      query = query.where(eq(paymentTransactions.gatewayId, filters.gatewayId));
    }
    if (filters?.status) {
      query = query.where(eq(paymentTransactions.status, filters.status));
    }
    
    query = query.orderBy(desc(paymentTransactions.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
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
}

export const storage = new DatabaseStorage();
