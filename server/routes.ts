import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, optionalAuth, hashPassword, comparePassword, generateToken, toSafeUser } from "./auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertProductSchema, insertCategorySchema, insertOrderSchema, insertCartItemSchema, registerUserSchema, loginUserSchema } from "@shared/schema";
import { createBinancePayService } from "./binancePay";

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
  // ==================== CUSTOMER AUTH ROUTES ====================
  
  // Register new customer
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validation = registerUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validation.error.errors 
        });
      }

      const { email, password, firstName, lastName, mobile } = validation.data;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
        mobile,
      });

      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });

      res.status(201).json({
        token,
        user: toSafeUser(user),
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login customer
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validation = loginUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: validation.error.errors 
        });
      }

      const { email, password } = validation.data;

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is inactive" });
      }

      // Compare password
      const isValidPassword = await comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });

      res.json({
        token,
        user: toSafeUser(user),
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile update route
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, mobile, shippingAddress } = req.body;
      
      // Whitelist allowed updates
      const allowedUpdates: any = {
        updatedAt: new Date(),
      };
      
      if (typeof firstName === 'string') {
        allowedUpdates.firstName = firstName.trim().slice(0, 100);
      }
      if (typeof lastName === 'string') {
        allowedUpdates.lastName = lastName.trim().slice(0, 100);
      }
      if (typeof mobile === 'string') {
        allowedUpdates.mobile = mobile.trim().slice(0, 20);
      }
      if (shippingAddress && typeof shippingAddress === 'object') {
        allowedUpdates.shippingAddress = shippingAddress;
      }
      
      const updatedUser = await storage.updateUser(userId, allowedUpdates);
      
      res.json(toSafeUser(updatedUser));
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Customer profile picture upload (base64)
  app.post('/api/profile/picture', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { imageData } = req.body;
      
      if (!imageData || typeof imageData !== 'string') {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      // Validate base64 image format (data:image/xxx;base64,...)
      if (!imageData.startsWith('data:image/')) {
        return res.status(400).json({ message: "Invalid image format" });
      }
      
      // Check file size (max 2MB for base64)
      const base64Size = imageData.length * 0.75;
      if (base64Size > 2 * 1024 * 1024) {
        return res.status(400).json({ message: "Image size must be less than 2MB" });
      }
      
      const updatedUser = await storage.updateUser(userId, {
        profileImageUrl: imageData,
        updatedAt: new Date(),
      });
      
      res.json({ success: true, profileImageUrl: updatedUser.profileImageUrl });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });

  // Customer profile picture delete
  app.delete('/api/profile/picture', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      await storage.updateUser(userId, {
        profileImageUrl: null,
        updatedAt: new Date(),
      });
      
      res.json({ success: true, message: "Profile picture deleted" });
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      res.status(500).json({ message: "Failed to delete profile picture" });
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

      // Get full permissions from role data
      const permissions = admin.roleData?.permissions || null;

      res.json({
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          roleId: admin.roleId,
          permissions: permissions,
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Initialize default roles on startup
  storage.initializeDefaultRoles().catch(console.error);

  // Change admin password
  app.post('/api/admin/change-password', adminAuth, async (req: any, res) => {
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
      
      const isValidPassword = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await storage.updateAdminUserPassword(adminId, newPasswordHash);
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Get admin profile
  app.get('/api/admin/profile', adminAuth, async (req: any, res) => {
    try {
      const adminId = req.admin.id;
      const admin = await storage.getAdminUser(adminId);
      
      if (!admin) {
        return res.status(404).json({ message: "Admin user not found" });
      }
      
      res.json({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        roleId: admin.roleId,
        profilePicture: admin.profilePicture,
      });
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update admin profile
  app.patch('/api/admin/profile', adminAuth, async (req: any, res) => {
    try {
      const adminId = req.admin.id;
      const { username, email } = req.body;
      
      const updates: any = { updatedAt: new Date() };
      
      if (typeof username === 'string' && username.trim()) {
        updates.username = username.trim().slice(0, 50);
      }
      if (typeof email === 'string' && email.trim()) {
        updates.email = email.trim().slice(0, 100);
      }
      
      const updatedAdmin = await storage.updateAdminUser(adminId, updates);
      
      res.json({
        id: updatedAdmin.id,
        username: updatedAdmin.username,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        profilePicture: updatedAdmin.profilePicture,
      });
    } catch (error) {
      console.error("Error updating admin profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Admin profile picture upload (base64)
  app.post('/api/admin/profile/picture', adminAuth, async (req: any, res) => {
    try {
      const adminId = req.admin.id;
      const { imageData } = req.body;
      
      if (!imageData || typeof imageData !== 'string') {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      // Validate base64 image format (data:image/xxx;base64,...)
      if (!imageData.startsWith('data:image/')) {
        return res.status(400).json({ message: "Invalid image format" });
      }
      
      // Check file size (max 2MB for base64)
      const base64Size = imageData.length * 0.75;
      if (base64Size > 2 * 1024 * 1024) {
        return res.status(400).json({ message: "Image size must be less than 2MB" });
      }
      
      const updatedAdmin = await storage.updateAdminUser(adminId, {
        profilePicture: imageData,
        updatedAt: new Date(),
      });
      
      res.json({ success: true, profilePicture: updatedAdmin.profilePicture });
    } catch (error) {
      console.error("Error uploading admin profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });

  // Admin profile picture delete
  app.delete('/api/admin/profile/picture', adminAuth, async (req: any, res) => {
    try {
      const adminId = req.admin.id;
      
      await storage.updateAdminUser(adminId, {
        profilePicture: null,
        updatedAt: new Date(),
      });
      
      res.json({ success: true, message: "Profile picture deleted" });
    } catch (error) {
      console.error("Error deleting admin profile picture:", error);
      res.status(500).json({ message: "Failed to delete profile picture" });
    }
  });

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

  app.get('/api/categories/featured', async (req, res) => {
    try {
      const categories = await storage.getFeaturedCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching featured categories:", error);
      res.status(500).json({ message: "Failed to fetch featured categories" });
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

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.patch('/api/cart/:productId', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/cart/:productId', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  app.post('/api/cart/merge', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { items } = req.body;
      
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: "Items must be an array" });
      }
      
      for (const item of items) {
        if (item.productId && item.quantity > 0) {
          const existingItems = await storage.getCartItems(userId);
          const existing = existingItems.find((ci: any) => ci.productId === item.productId);
          
          if (existing) {
            await storage.updateCartItemByProductId(userId, item.productId, existing.quantity + item.quantity);
          } else {
            await storage.addToCart({
              userId,
              productId: item.productId,
              quantity: item.quantity,
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

  // Order routes
  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Get customer's pending orders count for sidebar badge
  app.get('/api/orders/pending-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const count = await storage.getCustomerPendingOrdersCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching pending orders count:", error);
      res.status(500).json({ message: "Failed to fetch pending orders count" });
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

  // Customer order cancellation
  app.post('/api/orders/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      
      // Get the order
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Verify the order belongs to this user
      if (order.userId !== userId) {
        return res.status(403).json({ message: "You can only cancel your own orders" });
      }
      
      // Check if order can be cancelled (only pending or processing)
      if (order.status !== 'pending' && order.status !== 'processing') {
        return res.status(400).json({ 
          message: "This order cannot be cancelled. Orders can only be cancelled before shipping." 
        });
      }
      
      // Update order status to cancelled
      const updatedOrder = await storage.updateOrder(orderId, { status: 'cancelled' });
      
      // If payment was completed, mark for refund
      if (order.paymentStatus === 'completed') {
        await storage.updateOrder(orderId, { paymentStatus: 'refunded' });
        
        // Update the transaction status to refunded
        const transactions = await storage.getPaymentTransactions({ orderId });
        if (transactions.length > 0) {
          await storage.updatePaymentTransaction(transactions[0].id, { status: 'refunded' });
        }
      }
      
      // Restore product stock
      const orderItems = await storage.getOrderItems(orderId);
      for (const item of orderItems) {
        await storage.increaseProductStock(item.productId, item.quantity);
      }
      
      // Create admin notification
      const user = await storage.getUser(userId);
      const customerName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.email || 'Customer');
      await storage.createNotification({
        recipientType: 'admin',
        type: 'order_status_update',
        title: 'Order Cancelled by Customer',
        message: `Order #${order.id.slice(-8).toUpperCase()} was cancelled by ${customerName}`,
        data: { orderId, userId, reason: 'customer_requested' },
      });
      
      res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

      // Create payment transaction for this order
      try {
        const gateways = await storage.getPaymentGateways();
        const gateway = gateways.find(g => g.name === orderData.paymentMethod);
        if (gateway) {
          const transactionStatus = orderData.paymentMethod === 'cod' ? 'pending' : 'pending';
          await storage.createPaymentTransaction({
            orderId: order.id,
            gatewayId: gateway.id,
            amount: order.total,
            currency: 'PKR',
            status: transactionStatus,
          });
        }
      } catch (transactionError) {
        console.error("Error creating payment transaction:", transactionError);
      }

      // Return order with items
      const orderWithItems = await storage.getOrderWithItems(order.id);
      
      // Create admin notification for new order
      try {
        const user = await storage.getUser(userId);
        const customerName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.email || 'Customer');
        await storage.createNotification({
          recipientType: 'admin',
          type: 'order_placed',
          title: 'New Order Received',
          message: `New order #${order.id.slice(-8).toUpperCase()} from ${customerName} for Rs. ${parseFloat(order.total).toLocaleString()}`,
          data: { orderId: order.id, userId, total: order.total },
        });
        
        // Check for low stock and create notifications
        for (const cartItem of cartItems) {
          const updatedProduct = await storage.getProduct(cartItem.productId);
          if (updatedProduct && updatedProduct.stock <= 10) {
            await storage.createNotification({
              recipientType: 'admin',
              type: 'low_stock',
              title: 'Low Stock Alert',
              message: `Product "${updatedProduct.name}" is running low. Only ${updatedProduct.stock} units left.`,
              data: { productId: updatedProduct.id, currentStock: updatedProduct.stock },
            });
          }
        }
      } catch (notificationError) {
        console.error("Error creating order notification:", notificationError);
      }
      
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

  // Get pending orders count for sidebar badge
  app.get('/api/admin/orders/pending-count', adminAuth, async (req, res) => {
    try {
      const count = await storage.getPendingOrdersCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching pending orders count:", error);
      res.status(500).json({ message: "Failed to fetch pending orders count" });
    }
  });

  // Get single order details for admin
  app.get('/api/admin/orders/:id', adminAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      const orderItems = await storage.getOrderItems(req.params.id);
      res.json({ ...order, items: orderItems });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ message: "Failed to fetch order details" });
    }
  });

  app.patch('/api/admin/orders/:id', adminAuth, async (req, res) => {
    try {
      const { status, paymentStatus } = req.body;
      
      // Get original order to check for status change
      const originalOrder = await storage.getOrder(req.params.id);
      
      let order;
      // If status is being changed to cancelled, restore inventory
      if (status === 'cancelled') {
        order = await storage.cancelOrderAndRestoreInventory(req.params.id);
      } else {
        order = await storage.updateOrder(req.params.id, {
          status,
          paymentStatus,
        });
      }
      
      // Create customer notification for order status update
      if (originalOrder && order.userId && status && originalOrder.status !== status) {
        try {
          const statusMessages: Record<string, string> = {
            'pending': 'Your order is being reviewed.',
            'processing': 'Your order is now being processed.',
            'shipped': 'Great news! Your order has been shipped.',
            'delivered': 'Your order has been delivered. Enjoy!',
            'cancelled': 'Your order has been cancelled.',
          };
          
          await storage.createNotification({
            recipientType: 'customer',
            recipientId: order.userId,
            type: 'order_status_update',
            title: `Order #${order.id.slice(-8).toUpperCase()} Updated`,
            message: statusMessages[status] || `Your order status changed to ${status}.`,
            data: { orderId: order.id, status, previousStatus: originalOrder.status },
          });
        } catch (notificationError) {
          console.error("Error creating order update notification:", notificationError);
        }
      }
      
      // Update payment transaction when payment status changes
      if (paymentStatus && originalOrder && originalOrder.paymentStatus !== paymentStatus) {
        try {
          const transactions = await storage.getPaymentTransactions({ orderId: order.id });
          if (transactions.length > 0) {
            const transactionStatus = paymentStatus === 'completed' ? 'completed' : 
                                       paymentStatus === 'failed' ? 'failed' : 'pending';
            await storage.updatePaymentTransaction(transactions[0].id, { status: transactionStatus });
          }
        } catch (transactionError) {
          console.error("Error updating payment transaction:", transactionError);
        }
      }
      
      // Create customer notification for payment status update
      if (originalOrder && order.userId && paymentStatus && originalOrder.paymentStatus !== paymentStatus) {
        try {
          const paymentMessages: Record<string, string> = {
            'pending': 'Payment is pending for your order.',
            'completed': 'Payment received! Thank you for your purchase.',
            'failed': 'Payment failed. Please try again or contact support.',
            'refunded': 'Your order payment has been refunded.',
          };
          
          const paymentType = paymentStatus === 'paid' ? 'payment_received' : (paymentStatus === 'failed' ? 'payment_failed' : 'general');
          
          await storage.createNotification({
            recipientType: 'customer',
            recipientId: order.userId,
            type: paymentType,
            title: `Payment Update for Order #${order.id.slice(-8).toUpperCase()}`,
            message: paymentMessages[paymentStatus] || `Payment status changed to ${paymentStatus}.`,
            data: { orderId: order.id, paymentStatus, previousPaymentStatus: originalOrder.paymentStatus },
          });
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

  app.patch('/api/admin/payment-transactions/:id', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedTransaction = await storage.updatePaymentTransaction(id, { status });
      
      if (!updatedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Also update the associated order's payment status
      if (updatedTransaction.orderId) {
        const paymentStatus = status === 'completed' ? 'completed' : 
                              status === 'failed' ? 'failed' : 
                              status === 'refunded' ? 'refunded' : 'pending';
        await storage.updateOrder(updatedTransaction.orderId, { paymentStatus });
        
        // Create customer notification for payment status update
        const order = await storage.getOrder(updatedTransaction.orderId);
        if (order?.userId) {
          const paymentMessages: Record<string, string> = {
            'pending': 'Payment is pending for your order.',
            'completed': 'Payment received! Thank you for your purchase.',
            'failed': 'Payment failed. Please try again or contact support.',
            'refunded': 'Your order payment has been refunded.',
          };
          
          const paymentType = status === 'completed' ? 'payment_received' : 
                              status === 'failed' ? 'payment_failed' : 'general';
          
          await storage.createNotification({
            recipientType: 'customer',
            recipientId: order.userId,
            type: paymentType,
            title: `Payment Update for Order #${order.id.slice(-8).toUpperCase()}`,
            message: paymentMessages[status] || `Payment status changed to ${status}.`,
            data: { orderId: order.id, paymentStatus: status },
          });
        }
      }
      
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error updating payment transaction:", error);
      res.status(500).json({ message: "Failed to update payment transaction" });
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
        {
          name: 'tron_usdt',
          displayName: 'Tron USDT (TRC-20)',
          icon: 'usdt',
          description: 'Pay with USDT on Tron network',
          isEnabled: true,
          testMode: true,
          apiKey: 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
          configuration: { walletAddress: 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', network: 'tron' },
        },
        {
          name: 'binance_pay',
          displayName: 'Binance Pay',
          icon: 'binance',
          description: 'Pay with Binance Pay',
          isEnabled: true,
          testMode: true,
          configuration: { network: 'binance', supportedCurrencies: ['USDT', 'BUSD', 'BNB'] },
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

  // ============================================
  // CRYPTO PAYMENT ROUTES
  // ============================================

  // Create a crypto payment for an order
  app.post('/api/crypto-payments/create', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId, gatewayName, cryptoCurrency } = req.body;
      
      if (!orderId || !gatewayName) {
        return res.status(400).json({ message: "Order ID and gateway name are required" });
      }

      // Get the order
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify the order belongs to this user
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Get the payment gateway
      const gateway = await storage.getPaymentGatewayByName(gatewayName);
      if (!gateway || !gateway.isEnabled) {
        return res.status(400).json({ message: "Payment gateway not available" });
      }

      const config = gateway.configuration as any;

      // Calculate crypto amount based on exchange rate (simplified - in production use real-time rates)
      const orderAmount = parseFloat(order.total || "0");
      let exchangeRate = "1"; // Default for USDT
      let cryptoAmount = orderAmount.toFixed(2);

      // Generate unique payment reference
      const externalOrderId = `ESP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Set expiry time (1 hour from now)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      let paymentData: any = {
        orderId,
        gatewayName,
        cryptoAmount,
        cryptoCurrency: cryptoCurrency || 'USDT',
        exchangeRate,
        externalOrderId,
        status: 'awaiting_payment',
        expiresAt,
      };

      if (gatewayName === 'tron_usdt') {
        // For Tron USDT, we need a wallet address from the gateway configuration
        const walletAddress = config?.walletAddress || gateway.apiKey; // Use API key as fallback for wallet address
        paymentData.walletAddress = walletAddress;
        paymentData.network = 'tron';
        paymentData.cryptoCurrency = 'USDT';
        
        // In production, generate QR code for wallet address payment
        paymentData.paymentUrl = `tron:${walletAddress}?amount=${cryptoAmount}&token=USDT`;
      } else if (gatewayName === 'binance_pay') {
        paymentData.network = 'binance';
        paymentData.cryptoCurrency = cryptoCurrency || 'USDT';
        
        const binancePayService = createBinancePayService();
        
        if (binancePayService) {
          try {
            const baseUrl = process.env.REPLIT_DEV_DOMAIN 
              ? `https://${process.env.REPLIT_DEV_DOMAIN}`
              : process.env.BASE_URL || 'http://localhost:5000';
            
            const binanceOrder = await binancePayService.createOrder({
              merchantTradeNo: externalOrderId,
              orderAmount: orderAmount,
              currency: paymentData.cryptoCurrency,
              description: `Eshaal Store Order #${orderId.slice(0, 8)}`,
              goodsDetails: [{
                goodsType: '01',
                goodsCategory: 'D000',
                referenceGoodsId: orderId,
                goodsName: 'Eshaal Store Purchase',
                goodsDetail: `Order total: ${orderAmount} USDT`
              }],
              returnUrl: `${baseUrl}/?view=orders`,
              cancelUrl: `${baseUrl}/?view=cart`,
              webhookUrl: `${baseUrl}/api/webhooks/binance`
            });
            
            if (binanceOrder.data) {
              paymentData.paymentUrl = binanceOrder.data.checkoutUrl;
              paymentData.qrCode = binanceOrder.data.qrcodeLink || binanceOrder.data.qrContent;
              paymentData.binancePrepayId = binanceOrder.data.prepayId;
            }
          } catch (apiError) {
            console.error('Binance Pay API error:', apiError);
            return res.status(500).json({ 
              message: "Failed to create Binance Pay order. Please check API credentials or try another payment method."
            });
          }
        } else {
          return res.status(500).json({ 
            message: "Binance Pay is not configured. Please contact the store administrator."
          });
        }
      }

      // Create the crypto payment record
      const cryptoPayment = await storage.createCryptoPayment(paymentData);

      // Update the order's payment method
      await storage.updateOrder(orderId, {
        paymentDetails: {
          method: gatewayName,
          cryptoPaymentId: cryptoPayment.id,
        }
      });

      res.status(201).json({
        id: cryptoPayment.id,
        orderId: cryptoPayment.orderId,
        gatewayName: cryptoPayment.gatewayName,
        walletAddress: cryptoPayment.walletAddress,
        cryptoAmount: cryptoPayment.cryptoAmount,
        cryptoCurrency: cryptoPayment.cryptoCurrency,
        network: cryptoPayment.network,
        paymentUrl: cryptoPayment.paymentUrl,
        qrCode: cryptoPayment.qrCode,
        externalOrderId: cryptoPayment.externalOrderId,
        status: cryptoPayment.status,
        expiresAt: cryptoPayment.expiresAt,
      });
    } catch (error) {
      console.error("Error creating crypto payment:", error);
      res.status(500).json({ message: "Failed to create crypto payment" });
    }
  });

  // Get crypto payment status
  app.get('/api/crypto-payments/:orderId/status', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify the order belongs to this user
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const cryptoPayment = await storage.getCryptoPaymentByOrderId(orderId);
      if (!cryptoPayment) {
        return res.status(404).json({ message: "No crypto payment found for this order" });
      }

      res.json({
        id: cryptoPayment.id,
        status: cryptoPayment.status,
        txHash: cryptoPayment.txHash,
        confirmations: cryptoPayment.confirmations,
        requiredConfirmations: cryptoPayment.requiredConfirmations,
        paidAt: cryptoPayment.paidAt,
        expiresAt: cryptoPayment.expiresAt,
      });
    } catch (error) {
      console.error("Error fetching crypto payment status:", error);
      res.status(500).json({ message: "Failed to fetch payment status" });
    }
  });

  // Webhook for Tron USDT payment confirmation (called by payment provider or blockchain monitor)
  app.post('/api/webhooks/tron', async (req, res) => {
    try {
      const { externalOrderId, txHash, amount, status, confirmations } = req.body;
      
      console.log('Tron webhook received:', { externalOrderId, txHash, status });

      if (!externalOrderId) {
        return res.status(400).json({ message: "External order ID required" });
      }

      const cryptoPayment = await storage.getCryptoPaymentByExternalId(externalOrderId);
      if (!cryptoPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Update the crypto payment with blockchain data
      const updateData: any = {
        webhookData: req.body,
      };

      if (txHash) updateData.txHash = txHash;
      if (confirmations !== undefined) updateData.confirmations = confirmations;

      // Check if payment is confirmed
      if (status === 'confirmed' || (confirmations && confirmations >= (cryptoPayment.requiredConfirmations || 1))) {
        updateData.status = 'completed';
        updateData.paidAt = new Date();

        // Update the order status
        await storage.updateOrder(cryptoPayment.orderId, {
          paymentStatus: 'completed',
          status: 'processing',
        });

        // Notify admin of completed payment
        await storage.createNotification({
          recipientType: 'admin',
          type: 'payment_received',
          title: 'Crypto Payment Received',
          message: `Payment of ${cryptoPayment.cryptoAmount} ${cryptoPayment.cryptoCurrency} received for order #${cryptoPayment.orderId.slice(0, 8)}`,
          metadata: { orderId: cryptoPayment.orderId, txHash, gateway: 'tron_usdt' },
        });
      } else if (status === 'pending' || status === 'confirming') {
        updateData.status = 'confirming';
      } else if (status === 'failed') {
        updateData.status = 'failed';
      }

      await storage.updateCryptoPayment(cryptoPayment.id, updateData);

      res.json({ success: true, message: 'Webhook processed' });
    } catch (error) {
      console.error("Error processing Tron webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Webhook for Binance Pay payment confirmation
  app.post('/api/webhooks/binance', async (req, res) => {
    try {
      const { bizType, bizStatus, data } = req.body;
      
      console.log('Binance Pay webhook received:', { bizType, bizStatus });

      // Verify webhook signature if secret key is configured
      const binancePayService = createBinancePayService();
      if (binancePayService) {
        const timestamp = req.headers['binancepay-timestamp'] as string;
        const nonce = req.headers['binancepay-nonce'] as string;
        const signature = req.headers['binancepay-signature'] as string;
        
        if (timestamp && nonce && signature) {
          const isValid = binancePayService.verifyWebhookSignature(
            timestamp, 
            nonce, 
            JSON.stringify(req.body), 
            signature
          );
          
          if (!isValid) {
            console.warn('Invalid Binance Pay webhook signature');
            return res.status(401).json({ returnCode: 'FAIL', returnMessage: 'Invalid signature' });
          }
        }
      }

      // Binance Pay sends bizStatus: PAY_SUCCESS, PAY_CLOSED, etc.
      if (bizType !== 'PAY') {
        return res.json({ returnCode: 'SUCCESS', returnMessage: 'OK' });
      }

      const externalOrderId = data?.merchantTradeNo;
      if (!externalOrderId) {
        return res.status(400).json({ message: "Merchant trade number required" });
      }

      const cryptoPayment = await storage.getCryptoPaymentByExternalId(externalOrderId);
      if (!cryptoPayment) {
        console.log('Payment not found for:', externalOrderId);
        return res.json({ returnCode: 'SUCCESS', returnMessage: 'OK' });
      }

      // Update the crypto payment
      const updateData: any = {
        webhookData: req.body,
      };

      if (bizStatus === 'PAY_SUCCESS') {
        updateData.status = 'completed';
        updateData.paidAt = new Date();
        if (data?.transactionId) updateData.txHash = data.transactionId;

        // Update the order status
        await storage.updateOrder(cryptoPayment.orderId, {
          paymentStatus: 'completed',
          status: 'processing',
        });

        // Notify admin of completed payment
        await storage.createNotification({
          recipientType: 'admin',
          type: 'payment_received',
          title: 'Binance Pay Payment Received',
          message: `Payment of ${data?.totalFee || cryptoPayment.cryptoAmount} ${data?.currency || cryptoPayment.cryptoCurrency} received for order #${cryptoPayment.orderId.slice(0, 8)}`,
          metadata: { orderId: cryptoPayment.orderId, gateway: 'binance_pay' },
        });
      } else if (bizStatus === 'PAY_CLOSED' || bizStatus === 'EXPIRED') {
        updateData.status = 'expired';
      } else if (bizStatus === 'PAY_ERROR') {
        updateData.status = 'failed';
      }

      await storage.updateCryptoPayment(cryptoPayment.id, updateData);

      // Binance expects this response format
      res.json({ returnCode: 'SUCCESS', returnMessage: 'OK' });
    } catch (error) {
      console.error("Error processing Binance webhook:", error);
      res.json({ returnCode: 'FAIL', returnMessage: 'Processing error' });
    }
  });

  // Admin endpoint to manually confirm a crypto payment (for testing or manual verification)
  app.post('/api/admin/crypto-payments/:id/confirm', adminAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { txHash } = req.body;

      const cryptoPayment = await storage.getCryptoPayment(id);
      if (!cryptoPayment) {
        return res.status(404).json({ message: "Crypto payment not found" });
      }

      // Mark as completed
      const updated = await storage.updateCryptoPayment(id, {
        status: 'completed',
        paidAt: new Date(),
        txHash: txHash || 'manual-confirmation',
        confirmations: cryptoPayment.requiredConfirmations || 1,
      });

      // Update the order
      await storage.updateOrder(cryptoPayment.orderId, {
        paymentStatus: 'completed',
        status: 'processing',
      });

      res.json({ message: 'Payment confirmed', payment: updated });
    } catch (error) {
      console.error("Error confirming crypto payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Admin endpoint to get all crypto payments
  app.get('/api/admin/crypto-payments', adminAuth, async (req: any, res) => {
    try {
      const payments = await storage.getCryptoPayments();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching crypto payments:", error);
      res.status(500).json({ message: "Failed to fetch crypto payments" });
    }
  });

  // Store Settings API (public GET for landing page, admin PUT for updates)
  app.get('/api/store-settings', async (req, res) => {
    try {
      const settings = await storage.getStoreSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching store settings:", error);
      res.status(500).json({ message: "Failed to fetch store settings" });
    }
  });

  app.put('/api/admin/store-settings', adminAuth, async (req, res) => {
    try {
      const updateData: Record<string, any> = {};
      
      const allowedFields = [
        'storeName', 'storeLogo', 'storeEmail', 'storePhone', 'storeAddress',
        'currency', 'timezone', 'language',
        'orderNotifications', 'stockAlerts', 'customerRegistrations',
        'paymentUpdates', 'marketingEmails'
      ];
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      const updated = await storage.updateStoreSettings(updateData);
      res.json(updated);
    } catch (error) {
      console.error("Error updating store settings:", error);
      res.status(500).json({ message: "Failed to update store settings" });
    }
  });

  // ============================================
  // NOTIFICATION ROUTES
  // ============================================

  // Get admin notifications
  app.get('/api/admin/notifications', adminAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotifications('admin');
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching admin notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Get admin unread notification count
  app.get('/api/admin/notifications/count', adminAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount('admin');
      res.json({ count });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });

  // Mark single admin notification as read
  app.patch('/api/admin/notifications/:id/read', adminAuth, async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all admin notifications as read
  app.post('/api/admin/notifications/read-all', adminAuth, async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead('admin');
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Delete admin notification
  app.delete('/api/admin/notifications/:id', adminAuth, async (req, res) => {
    try {
      await storage.deleteNotification(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Get customer notifications
  app.get('/api/notifications', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const notifications = await storage.getNotifications('customer', userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching customer notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Get customer unread notification count
  app.get('/api/notifications/count', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const count = await storage.getUnreadNotificationCount('customer', userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching notification count:", error);
      res.status(500).json({ message: "Failed to fetch notification count" });
    }
  });

  // Mark single customer notification as read
  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Mark all customer notifications as read
  app.post('/api/notifications/read-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.markAllNotificationsAsRead('customer', userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // ============== CUSTOMER CHAT ENDPOINTS ==============

  // Get or create customer's active conversation
  app.get('/api/chat/conversation', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      let conversation = await storage.getCustomerConversation(userId);
      
      if (!conversation) {
        conversation = await storage.createChatConversation({
          customerId: userId,
          status: 'open',
        });
      }
      
      const fullConversation = await storage.getChatConversation(conversation.id);
      res.json(fullConversation);
    } catch (error) {
      console.error("Error getting chat conversation:", error);
      res.status(500).json({ message: "Failed to get conversation" });
    }
  });

  // Get messages for a conversation (customer)
  app.get('/api/chat/conversation/:id/messages', isAuthenticated, async (req: any, res) => {
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

  // Send message (customer) - fallback for when WebSocket is not available
  app.post('/api/chat/conversation/:id/messages', isAuthenticated, async (req: any, res) => {
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
        senderType: 'customer',
        message: content.trim(),
      });
      
      // Create notification for agent if assigned
      if (conversation.assignedAgentId) {
        await storage.createNotification({
          recipientType: 'admin',
          recipientId: conversation.assignedAgentId,
          type: 'chat_message',
          title: 'New Chat Message',
          message: `Customer ${conversation.customer?.firstName || 'Customer'} sent a message`,
          data: { conversationId: req.params.id, messageId: message.id },
        });
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // ============== ADMIN CHAT ENDPOINTS ==============

  // Get all chat conversations (admin)
  app.get('/api/admin/chat/conversations', adminAuth, async (req: any, res) => {
    try {
      const { status, unassigned, agentId } = req.query;
      const filters: { status?: string; assignedAgentId?: string; unassigned?: boolean } = {};
      
      if (status) filters.status = status;
      if (agentId) filters.assignedAgentId = agentId;
      if (unassigned === 'true') filters.unassigned = true;
      
      const conversations = await storage.getChatConversations(filters);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get single conversation (admin)
  app.get('/api/admin/chat/conversations/:id', adminAuth, async (req: any, res) => {
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

  // Get messages for a conversation (admin)
  app.get('/api/admin/chat/conversations/:id/messages', adminAuth, async (req: any, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message (admin)
  app.post('/api/admin/chat/conversations/:id/messages', adminAuth, async (req: any, res) => {
    try {
      const { content } = req.body;
      const adminId = req.admin.id;
      
      const conversation = await storage.getChatConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      // Auto-assign agent if not assigned
      if (!conversation.assignedAgentId) {
        await storage.assignChatAgent(req.params.id, adminId);
      }
      
      const message = await storage.createChatMessage({
        conversationId: req.params.id,
        senderId: adminId,
        senderType: 'agent',
        message: content.trim(),
      });
      
      // Create notification for customer
      await storage.createNotification({
        recipientType: 'customer',
        recipientId: conversation.customerId,
        type: 'chat_message',
        title: 'New Chat Message',
        message: 'Support agent responded to your inquiry',
        data: { conversationId: req.params.id, messageId: message.id },
      });
      
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Assign agent to conversation
  app.post('/api/admin/chat/conversations/:id/assign', adminAuth, async (req: any, res) => {
    try {
      const { agentId } = req.body;
      const conversation = await storage.assignChatAgent(req.params.id, agentId || req.admin.id);
      res.json(conversation);
    } catch (error) {
      console.error("Error assigning agent:", error);
      res.status(500).json({ message: "Failed to assign agent" });
    }
  });

  // Update conversation status
  app.patch('/api/admin/chat/conversations/:id/status', adminAuth, async (req: any, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      
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

  // Mark messages as read (admin)
  app.post('/api/admin/chat/conversations/:id/read', adminAuth, async (req: any, res) => {
    try {
      await storage.markMessagesAsRead(req.params.id, 'customer');
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Get unread message count for all conversations (admin)
  app.get('/api/admin/chat/unread-count', adminAuth, async (req: any, res) => {
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

  const httpServer = createServer(app);
  
  // Setup WebSocket for chat
  const { setupChatWebSocket } = await import('./chatWebSocket');
  setupChatWebSocket(httpServer);
  
  return httpServer;
}
