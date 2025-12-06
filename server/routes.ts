import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertProductSchema, insertCategorySchema, insertOrderSchema, insertCartItemSchema } from "@shared/schema";

// Admin JWT middleware
const adminAuth = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Admin access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin-secret') as any;
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth for customers
  await setupAuth(app);

  // Customer auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin auth routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const admin = await storage.getAdminUserByUsername(username);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { adminId: admin.id, username: admin.username },
        process.env.JWT_SECRET || 'admin-secret',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Initialize default roles on startup
  storage.initializeDefaultRoles().catch(console.error);

  // ==================== ROLE MANAGEMENT ====================
  
  // Get all roles
  app.get('/api/admin/roles', adminAuth, async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  // Get single role
  app.get('/api/admin/roles/:id', adminAuth, async (req, res) => {
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

  // Create role
  app.post('/api/admin/roles', adminAuth, async (req, res) => {
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
        isSystem: false,
      });
      res.json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  // Update role
  app.patch('/api/admin/roles/:id', adminAuth, async (req, res) => {
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

  // Delete role
  app.delete('/api/admin/roles/:id', adminAuth, async (req, res) => {
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

  // ==================== USER MANAGEMENT ====================
  
  // Get all admin users
  app.get('/api/admin/users', adminAuth, async (req, res) => {
    try {
      const users = await storage.getAdminUsers();
      const safeUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        roleId: u.roleId,
        roleData: u.roleData,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get single admin user
  app.get('/api/admin/users/:id', adminAuth, async (req, res) => {
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
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Create admin user
  app.post('/api/admin/users', adminAuth, async (req, res) => {
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

      const passwordHash = await bcrypt.hash(password, 10);
      
      let roleName = 'staff';
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
        isActive,
      });

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        roleId: user.roleId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update admin user
  app.patch('/api/admin/users/:id', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, password, roleId, isActive } = req.body;

      const existingUser = await storage.getAdminUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updateData: any = {};

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
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }

      if (roleId !== undefined) {
        updateData.roleId = roleId;
        if (roleId) {
          const role = await storage.getRole(roleId);
          if (role) {
            updateData.role = role.name;
          }
        }
      }

      if (isActive !== undefined) {
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
        updatedAt: user.updatedAt,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete admin user
  app.delete('/api/admin/users/:id', adminAuth, async (req: any, res) => {
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

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', adminAuth, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch('/api/categories/:id', adminAuth, async (req, res) => {
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

  app.delete('/api/categories/:id', adminAuth, async (req, res) => {
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

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const { 
        categoryId, 
        search, 
        isActive, 
        isFeatured, 
        limit = '20', 
        offset = '0' 
      } = req.query;
      
      const products = await storage.getProducts({
        categoryId: categoryId as string,
        search: search as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/featured', async (req, res) => {
    try {
      const products = await storage.getProducts({ 
        isFeatured: true, 
        isActive: true,
        limit: 8 
      });
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
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

  app.post('/api/products', adminAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch('/api/products/:id', adminAuth, async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', adminAuth, async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId,
      });
      const cartItem = await storage.addToCart(cartItemData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.patch('/api/cart/:id', isAuthenticated, async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req, res) => {
    try {
      const success = await storage.removeFromCart(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId,
      });

      // Create order
      const order = await storage.createOrder(orderData);

      // Get cart items and create order items
      const cartItems = await storage.getCartItems(userId);
      
      // Check stock availability before processing
      for (const cartItem of cartItems) {
        const product = await storage.getProduct(cartItem.productId);
        if (!product || product.stock < cartItem.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for product: ${product?.name || 'Unknown'}. Available: ${product?.stock || 0}, Requested: ${cartItem.quantity}` 
          });
        }
      }
      
      for (const cartItem of cartItems) {
        // Create order item
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
          total: (parseFloat(cartItem.product.price) * cartItem.quantity).toString(),
        });
        
        // Update product inventory
        await storage.reduceProductStock(cartItem.productId, cartItem.quantity);
      }

      // Clear cart
      await storage.clearCart(userId);

      // Return order with items
      const orderWithItems = await storage.getOrderWithItems(order.id);
      res.json(orderWithItems);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Admin order routes
  app.get('/api/admin/orders', adminAuth, async (req, res) => {
    try {
      const { limit = '50', offset = '0' } = req.query;
      const orders = await storage.getOrders(
        undefined, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      res.json(orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch('/api/admin/orders/:id', adminAuth, async (req, res) => {
    try {
      const { status, paymentStatus } = req.body;
      
      // If status is being changed to cancelled, restore inventory
      if (status === 'cancelled') {
        const order = await storage.cancelOrderAndRestoreInventory(req.params.id);
        res.json(order);
      } else {
        const order = await storage.updateOrder(req.params.id, {
          status,
          paymentStatus,
        });
        res.json(order);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Admin inventory management routes
  app.post('/api/admin/inventory/adjust/:productId', adminAuth, async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity, operation } = req.body; // operation: 'increase' or 'decrease'
      
      let updatedProduct;
      if (operation === 'increase') {
        updatedProduct = await storage.increaseProductStock(productId, quantity);
      } else if (operation === 'decrease') {
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

  // Admin dashboard stats
  app.get('/api/admin/stats', adminAuth, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      const products = await storage.getProducts();
      
      const totalOrders = orders.length;
      const totalProducts = products.length;
      const totalRevenue = orders
        .filter(order => order.paymentStatus === 'completed')
        .reduce((sum, order) => sum + parseFloat(order.total), 0);

      res.json({
        totalOrders,
        totalProducts,
        totalRevenue,
        totalCustomers: 0, // This would require a user count query
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Payment gateway routes (with transaction tracking)
  app.post('/api/payment/easypaisa', isAuthenticated, async (req, res) => {
    try {
      const { orderId, amount, phoneNumber } = req.body;
      
      // Get EasyPaisa gateway
      const gateway = await storage.getPaymentGatewayByName('easypaisa');
      if (!gateway || !gateway.isEnabled) {
        return res.status(400).json({ message: 'EasyPaisa payment method is not available' });
      }
      
      // Mock EasyPaisa payment processing
      const mockResponse = {
        success: true,
        transactionId: `EP_${Date.now()}`,
        status: 'completed',
        message: 'Payment processed successfully',
      };
      
      // Create transaction record
      await storage.createPaymentTransaction({
        orderId,
        gatewayId: gateway.id,
        gatewayTransactionId: mockResponse.transactionId,
        amount,
        currency: 'PKR',
        status: mockResponse.status,
        gatewayResponse: mockResponse,
        customerInfo: { phoneNumber },
        processingFee: '0',
      });

      res.json(mockResponse);
    } catch (error) {
      console.error("EasyPaisa payment error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  app.post('/api/payment/jazzcash', isAuthenticated, async (req, res) => {
    try {
      const { orderId, amount, phoneNumber } = req.body;
      
      // Get JazzCash gateway
      const gateway = await storage.getPaymentGatewayByName('jazzcash');
      if (!gateway || !gateway.isEnabled) {
        return res.status(400).json({ message: 'JazzCash payment method is not available' });
      }
      
      // Mock JazzCash payment processing
      const mockResponse = {
        success: true,
        transactionId: `JC_${Date.now()}`,
        status: 'completed',
        message: 'Payment processed successfully',
      };
      
      // Create transaction record
      await storage.createPaymentTransaction({
        orderId,
        gatewayId: gateway.id,
        gatewayTransactionId: mockResponse.transactionId,
        amount,
        currency: 'PKR',
        status: mockResponse.status,
        gatewayResponse: mockResponse,
        customerInfo: { phoneNumber },
        processingFee: '0',
      });

      res.json(mockResponse);
    } catch (error) {
      console.error("JazzCash payment error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  app.post('/api/payment/hbl', isAuthenticated, async (req, res) => {
    try {
      const { orderId, amount, accountNumber } = req.body;
      
      // Get HBL gateway
      const gateway = await storage.getPaymentGatewayByName('hbl');
      if (!gateway || !gateway.isEnabled) {
        return res.status(400).json({ message: 'HBL Bank payment method is not available' });
      }
      
      // Mock HBL bank transfer processing
      const mockResponse = {
        success: true,
        transactionId: `HBL_${Date.now()}`,
        status: 'pending',
        message: 'Bank transfer initiated',
      };
      
      // Create transaction record
      await storage.createPaymentTransaction({
        orderId,
        gatewayId: gateway.id,
        gatewayTransactionId: mockResponse.transactionId,
        amount,
        currency: 'PKR',
        status: mockResponse.status,
        gatewayResponse: mockResponse,
        customerInfo: { accountNumber },
        processingFee: '0',
      });

      res.json(mockResponse);
    } catch (error) {
      console.error("HBL payment error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  // Cash on Delivery (COD) payment route
  app.post('/api/payment/cod', isAuthenticated, async (req, res) => {
    try {
      const { orderId, amount } = req.body;
      
      // For COD, we just mark the order as confirmed with pending payment
      const mockResponse = {
        success: true,
        transactionId: `COD_${Date.now()}`,
        status: 'pending',
        message: 'Cash on Delivery order confirmed. Payment will be collected upon delivery.',
      };
      
      // Update order status (payment will be collected on delivery)
      await storage.updateOrder(orderId, {
        paymentStatus: 'pending',
        paymentDetails: {
          transactionId: mockResponse.transactionId,
          method: 'cod',
          note: 'Payment to be collected on delivery'
        }
      });

      res.json(mockResponse);
    } catch (error) {
      console.error("COD payment error:", error);
      res.status(500).json({ message: "COD order processing failed" });
    }
  });

  // Admin payment gateway management routes
  app.get('/api/admin/payment-gateways', adminAuth, async (req, res) => {
    try {
      const gateways = await storage.getPaymentGateways();
      res.json(gateways);
    } catch (error) {
      console.error("Error fetching payment gateways:", error);
      res.status(500).json({ message: "Failed to fetch payment gateways" });
    }
  });

  app.post('/api/admin/payment-gateways', adminAuth, async (req, res) => {
    try {
      const gateway = await storage.createPaymentGateway(req.body);
      res.json(gateway);
    } catch (error) {
      console.error("Error creating payment gateway:", error);
      res.status(500).json({ message: "Failed to create payment gateway" });
    }
  });

  app.patch('/api/admin/payment-gateways/:id', adminAuth, async (req, res) => {
    try {
      const gateway = await storage.updatePaymentGateway(req.params.id, req.body);
      res.json(gateway);
    } catch (error) {
      console.error("Error updating payment gateway:", error);
      res.status(500).json({ message: "Failed to update payment gateway" });
    }
  });

  app.get('/api/admin/payment-transactions', adminAuth, async (req, res) => {
    try {
      const { limit = '50', offset = '0', status, gatewayId } = req.query;
      const transactions = await storage.getPaymentTransactions({
        status: status as string,
        gatewayId: gatewayId as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching payment transactions:", error);
      res.status(500).json({ message: "Failed to fetch payment transactions" });
    }
  });

  app.get('/api/admin/payment-analytics', adminAuth, async (req, res) => {
    try {
      const transactions = await storage.getPaymentTransactions();
      const gateways = await storage.getPaymentGateways();
      
      const analytics = {
        totalTransactions: transactions.length,
        completedTransactions: transactions.filter(t => t.status === 'completed').length,
        failedTransactions: transactions.filter(t => t.status === 'failed').length,
        pendingTransactions: transactions.filter(t => t.status === 'pending').length,
        totalRevenue: transactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0),
        gatewayStats: gateways.map(gateway => {
          const gatewayTransactions = transactions.filter(t => t.gatewayId === gateway.id);
          return {
            gateway: gateway.displayName,
            totalTransactions: gatewayTransactions.length,
            successRate: gatewayTransactions.length > 0 ? 
              (gatewayTransactions.filter(t => t.status === 'completed').length / gatewayTransactions.length * 100) : 0,
            revenue: gatewayTransactions
              .filter(t => t.status === 'completed')
              .reduce((sum, t) => sum + parseFloat(t.amount), 0),
          };
        }),
      };
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching payment analytics:", error);
      res.status(500).json({ message: "Failed to fetch payment analytics" });
    }
  });

  // Initialize default payment gateways if they don't exist
  app.post('/api/admin/initialize-payment-gateways', adminAuth, async (req, res) => {
    try {
      const defaultGateways = [
        {
          name: 'easypaisa',
          displayName: 'EasyPaisa',
          icon: 'smartphone',
          description: 'Mobile wallet payments',
          isEnabled: true,
          testMode: true,
          configuration: { supportedOperations: ['wallet_payment', 'mobile_account'] },
        },
        {
          name: 'jazzcash',
          displayName: 'JazzCash',
          icon: 'wallet',
          description: 'Digital payments made easy',
          isEnabled: true,
          testMode: true,
          configuration: { supportedOperations: ['wallet_payment', 'mobile_account'] },
        },
        {
          name: 'hbl',
          displayName: 'HBL Bank',
          icon: 'building',
          description: 'Secure bank transfers',
          isEnabled: true,
          testMode: true,
          configuration: { supportedOperations: ['bank_transfer', 'online_banking'] },
        },
        {
          name: 'cod',
          displayName: 'Cash on Delivery',
          icon: 'banknote',
          description: 'Pay when your order arrives',
          isEnabled: true,
          testMode: false,
          configuration: { supportedOperations: ['cash_payment'] },
        },
      ];

      const createdGateways = [];
      for (const gatewayData of defaultGateways) {
        const existing = await storage.getPaymentGatewayByName(gatewayData.name);
        if (!existing) {
          const gateway = await storage.createPaymentGateway(gatewayData);
          createdGateways.push(gateway);
        }
      }

      res.json({ message: 'Payment gateways initialized', gateways: createdGateways });
    } catch (error) {
      console.error("Error initializing payment gateways:", error);
      res.status(500).json({ message: "Failed to initialize payment gateways" });
    }
  });

  // Create a new payment gateway
  app.post('/api/admin/payment-gateways', adminAuth, async (req, res) => {
    try {
      const { name, displayName, icon, description, isEnabled, testMode, apiKey, apiSecret, webhookUrl, configuration } = req.body;
      
      const existing = await storage.getPaymentGatewayByName(name);
      if (existing) {
        return res.status(400).json({ message: "Payment gateway with this name already exists" });
      }

      const gateway = await storage.createPaymentGateway({
        name,
        displayName,
        icon: icon || 'credit-card',
        description,
        isEnabled: isEnabled ?? true,
        testMode: testMode ?? true,
        apiKey,
        apiSecret,
        webhookUrl,
        configuration,
      });

      res.status(201).json(gateway);
    } catch (error) {
      console.error("Error creating payment gateway:", error);
      res.status(500).json({ message: "Failed to create payment gateway" });
    }
  });

  // Delete a payment gateway
  app.delete('/api/admin/payment-gateways/:id', adminAuth, async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
