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

  app.post('/api/admin/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if admin already exists
      const existingAdmin = await storage.getAdminUserByUsername(username);
      if (existingAdmin) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getAdminUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      
      const admin = await storage.createAdminUser({
        username,
        email,
        passwordHash,
        role: 'admin',
      });

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
      console.error("Admin registration error:", error);
      res.status(500).json({ message: "Registration failed" });
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
      
      for (const cartItem of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
          total: (parseFloat(cartItem.product.price) * cartItem.quantity).toString(),
        });
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
      const order = await storage.updateOrder(req.params.id, {
        status,
        paymentStatus,
      });
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Failed to update order" });
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

  // Payment gateway routes (mock implementation)
  app.post('/api/payment/easypaisa', isAuthenticated, async (req, res) => {
    try {
      // Mock EasyPaisa payment processing
      const { orderId, amount, phoneNumber } = req.body;
      
      // In a real implementation, this would integrate with EasyPaisa API
      const mockResponse = {
        success: true,
        transactionId: `EP_${Date.now()}`,
        status: 'completed',
        message: 'Payment processed successfully',
      };

      res.json(mockResponse);
    } catch (error) {
      console.error("EasyPaisa payment error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  app.post('/api/payment/jazzcash', isAuthenticated, async (req, res) => {
    try {
      // Mock JazzCash payment processing
      const { orderId, amount, phoneNumber } = req.body;
      
      const mockResponse = {
        success: true,
        transactionId: `JC_${Date.now()}`,
        status: 'completed',
        message: 'Payment processed successfully',
      };

      res.json(mockResponse);
    } catch (error) {
      console.error("JazzCash payment error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  app.post('/api/payment/hbl', isAuthenticated, async (req, res) => {
    try {
      // Mock HBL bank transfer processing
      const { orderId, amount, accountNumber } = req.body;
      
      const mockResponse = {
        success: true,
        transactionId: `HBL_${Date.now()}`,
        status: 'pending',
        message: 'Bank transfer initiated',
      };

      res.json(mockResponse);
    } catch (error) {
      console.error("HBL payment error:", error);
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
