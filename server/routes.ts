import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated, optionalAuth, hashPassword, comparePassword, generateToken, toSafeUser } from "./auth";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { insertProductSchema, insertCategorySchema, insertOrderSchema, insertCartItemSchema, registerUserSchema, loginUserSchema, orders as ordersTable, orderItems as orderItemsTable } from "@shared/schema";
import { sql } from "drizzle-orm";
import { db } from "./db";
import { shouldSendAdminNotification, shouldSendEmailNotification, invalidateNotificationSettingsCache, type NotificationType } from "./notificationHelper";
import { sendAdminNotification, sendCustomerNotification, defaultNotificationMessages } from "./notificationSender";
import { sendVerificationEmail, sendOrderConfirmationEmail, sendOrderStatusUpdateEmail, sendPaymentVerifiedEmail, sendPasswordResetEmail } from "./emailService";

// Generate a secure JWT secret - use environment variable or generate a secure random secret
const getJwtSecret = (): string => {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  // Generate a secure random secret for this server instance
  // Note: This will change on server restart, logging out all admin users
  const generatedSecret = crypto.randomBytes(64).toString('hex');
  console.warn('WARNING: SESSION_SECRET not set in environment. Using generated secret. Admin sessions will not persist across server restarts.');
  return generatedSecret;
};

const JWT_SECRET = getJwtSecret();

// Admin JWT middleware
const adminAuth = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Admin access token required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
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

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Hash password and create user
      const passwordHash = await hashPassword(password);
      const user = await storage.createUser({
        email,
        passwordHash,
        firstName,
        lastName,
        mobile,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      });

      // Send verification email (non-blocking)
      sendVerificationEmail(email, firstName || '', verificationToken)
        .then(result => {
          if (!result.success) {
            console.error('Failed to send verification email:', result.error);
          }
        })
        .catch(err => console.error('Verification email error:', err));

      // Generate token
      const token = generateToken({ userId: user.id, email: user.email });

      res.status(201).json({
        token,
        user: toSafeUser(user),
        message: "Registration successful! Please check your email to verify your account.",
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

  // Verify email
  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Verification token is required" });
      }

      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }

      if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
        return res.status(400).json({ message: "Verification token has expired. Please request a new one." });
      }

      // Mark email as verified
      await storage.updateUser(user.id, {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date(),
      });

      res.json({ success: true, message: "Email verified successfully!" });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });

  // Resend verification email
  app.post('/api/auth/resend-verification', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await storage.updateUser(userId, {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        updatedAt: new Date(),
      });

      // Send verification email
      const result = await sendVerificationEmail(user.email, user.firstName || '', verificationToken);
      
      if (!result.success) {
        return res.status(500).json({ message: "Failed to send verification email" });
      }

      res.json({ success: true, message: "Verification email sent!" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Failed to send verification email" });
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
        JWT_SECRET,
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
      
      // Fetch permissions from the role if roleId exists
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
        permissions: permissions,
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

  // Wishlist routes
  app.get('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const wishlistItems = await storage.getWishlistItems(userId);
      res.json(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post('/api/wishlist', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/wishlist/:productId', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/wishlist/check/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const isInWishlist = await storage.isInWishlist(userId, req.params.productId);
      res.json({ isInWishlist });
    } catch (error) {
      console.error("Error checking wishlist:", error);
      res.status(500).json({ message: "Failed to check wishlist" });
    }
  });

  app.delete('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.clearWishlist(userId);
      res.json({ message: "Wishlist cleared" });
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      res.status(500).json({ message: "Failed to clear wishlist" });
    }
  });

  app.post('/api/wishlist/merge', isAuthenticated, async (req: any, res) => {
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
      
      // Refund wallet amount if wallet was used for this order
      const walletAmountUsed = parseFloat(order.walletAmountUsed || "0");
      if (walletAmountUsed > 0 && order.userId) {
        const wallet = await storage.getWalletByUserId(order.userId);
        if (wallet) {
          const currentBalance = parseFloat(wallet.balance);
          const newBalance = (currentBalance + walletAmountUsed).toFixed(2);
          
          // Refund to wallet
          await storage.updateWalletBalance(wallet.id, newBalance);
          
          // Create wallet transaction for the refund
          await storage.createWalletTransaction({
            walletId: wallet.id,
            type: 'credit',
            amount: walletAmountUsed.toString(),
            balanceAfter: newBalance,
            description: `Refund for cancelled order #${order.orderNumber || order.id.slice(-8).toUpperCase()}`,
            referenceType: 'order',
            referenceId: order.id,
          });
        }
      }
      
      // Restore product stock
      const orderItems = await storage.getOrderItems(orderId);
      for (const item of orderItems) {
        await storage.increaseProductStock(item.productId, item.quantity);
      }
      
      // Create admin notification for order cancellation (using templates)
      const user = await storage.getUser(userId);
      const customerName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.email || 'Customer');
      const orderNumber = order.id.slice(-8).toUpperCase();
      
      await sendAdminNotification(
        'order_status_update',
        { orderNumber, customerName, status: 'cancelled', statusMessage: `Order was cancelled by ${customerName}` },
        { title: 'Order Cancelled by Customer', message: `Order #{{orderNumber}} was cancelled by {{customerName}}` },
        { orderId, userId, reason: 'customer_requested' }
      );
      
      res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ message: "Failed to cancel order" });
    }
  });

  // Guest order endpoint - no auth required
  app.post('/api/orders/guest', async (req: any, res) => {
    try {
      // Check if guest checkout is enabled
      const settings = await storage.getStoreSettings();
      if (!settings.guestCheckoutEnabled) {
        return res.status(403).json({ message: "Guest checkout is not enabled" });
      }

      const { guestName, guestEmail, guestPhone, shippingAddress, paymentMethod, items } = req.body;

      // Validate guest info
      if (!guestName || !guestPhone || !shippingAddress) {
        return res.status(400).json({ message: "Guest name, phone, and shipping address are required" });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Validate payment method
      const validPaymentMethods = ['cod', 'easypaisa', 'jazzcash', 'hbl', 'bank_transfer'];
      if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({ message: "Invalid payment method" });
      }

      // Aggregate duplicate productIds so each product appears only once
      const aggregated = new Map<string, number>();
      for (const item of items) {
        if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1) {
          return res.status(400).json({ message: "Invalid item: productId and positive integer quantity are required" });
        }
        aggregated.set(item.productId, (aggregated.get(item.productId) ?? 0) + item.quantity);
      }

      // Validate each product (stock check against aggregated quantity) and build validated list
      const validatedItems: Array<{ product: any; quantity: number }> = [];
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

      // Compute totals from trusted product prices
      const computedSubtotal = validatedItems.reduce(
        (sum, { product, quantity }) => sum + parseFloat(product.price) * quantity, 0
      );
      const computedShippingCost = computedSubtotal > 5000 ? 0 : 300;
      const computedTotal = computedSubtotal + computedShippingCost;

      // Generate a cryptographically random capability token for guest proof upload
      const { randomBytes } = await import('crypto');
      const guestToken = randomBytes(32).toString('hex');

      // Create order, line items, and decrement stock atomically in a transaction
      const orderNumber = `PKM-${Date.now()}`;
      const order = await db.transaction(async (tx) => {
        const [created] = await tx.insert(ordersTable).values({
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
          status: 'pending',
          paymentStatus: 'pending',
          verificationStatus: paymentMethod === 'cod' ? 'approved' : 'pending',
        }).returning();

        for (const { product, quantity } of validatedItems) {
          // Atomic stock decrement — the WHERE clause enforces the reservation.
          // Throwing here causes the whole transaction (including the order insert) to roll back.
          const decrementResult = await tx.execute(
            sql`UPDATE products SET stock = stock - ${quantity} WHERE id = ${product.id} AND stock >= ${quantity} RETURNING id`
          );
          if (!decrementResult.rows || decrementResult.rows.length === 0) {
            throw new Error(`Insufficient stock for ${product.name} — the item may have sold out while you were checking out.`);
          }

          await tx.insert(orderItemsTable).values({
            orderId: created.id,
            productId: product.id,
            quantity,
            price: product.price,
            total: (parseFloat(product.price) * quantity).toString(),
          });
        }

        return created;
      });

      // Create admin notification
      try {
        await sendAdminNotification(
          'order_placed',
          { orderNumber: order.orderNumber, customerName: guestName + ' (Guest)', total: parseFloat(order.total).toLocaleString() },
          defaultNotificationMessages.order_placed,
          { orderId: order.id, total: order.total }
        );
      } catch (notificationError) {
        console.error("Error creating order notification:", notificationError);
      }

      // Send confirmation email to guest if email provided
      if (guestEmail) {
        try {
          sendOrderConfirmationEmail(
            guestEmail,
            guestName,
            order.id,
            order.total,
            paymentMethod || 'Unknown'
          ).catch(err => console.error('Guest order confirmation email error:', err));
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

  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { walletAmountUsed, couponId, couponCode, couponDiscount, ...restBody } = req.body;
      
      const orderData = insertOrderSchema.parse({
        ...restBody,
        userId,
        walletAmountUsed: walletAmountUsed ? walletAmountUsed.toString() : "0",
        couponCode: couponCode || null,
        discountAmount: couponDiscount ? couponDiscount.toString() : "0",
      });

      // Get cart items first
      const cartItems = await storage.getCartItems(userId);
      
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // IMPORTANT: Validate stock BEFORE any wallet operations
      for (const cartItem of cartItems) {
        const product = await storage.getProduct(cartItem.productId);
        if (!product || product.stock < cartItem.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for product: ${product?.name || 'Unknown'}. Available: ${product?.stock || 0}, Requested: ${cartItem.quantity}` 
          });
        }
      }

      // Handle wallet payment if applicable (only after stock is validated)
      const walletAmount = parseFloat(walletAmountUsed || "0");
      let walletId: string | null = null;
      let newWalletBalance: string | null = null;
      
      if (walletAmount > 0) {
        const wallet = await storage.getWalletByUserId(userId);
        if (!wallet) {
          return res.status(400).json({ message: "Wallet not found" });
        }
        
        const currentBalance = parseFloat(wallet.balance);
        if (walletAmount > currentBalance) {
          return res.status(400).json({ message: "Insufficient wallet balance" });
        }
        
        // Calculate new balance and store for later use
        newWalletBalance = (currentBalance - walletAmount).toFixed(2);
        walletId = wallet.id;
        
        // Deduct from wallet
        await storage.updateWalletBalance(wallet.id, newWalletBalance);
      }

      // Create order
      const order = await storage.createOrder(orderData);
      
      // Auto-approve wallet and COD orders (no manual payment verification needed)
      if (orderData.paymentMethod === 'wallet' || orderData.paymentMethod === 'cod') {
        await storage.updateOrder(order.id, {
          verificationStatus: 'approved',
          paymentStatus: orderData.paymentMethod === 'wallet' ? 'completed' : 'pending',
        });
      }
      
      // Create wallet transaction if wallet was used (use stored values, not re-fetch)
      // Store positive amount for 'debit' type (indicates money used from wallet)
      if (walletAmount > 0 && walletId && newWalletBalance !== null) {
        await storage.createWalletTransaction({
          walletId: walletId,
          type: 'debit',
          amount: walletAmount.toString(),
          balanceAfter: newWalletBalance,
          description: `Order #${order.orderNumber || order.id.slice(-8).toUpperCase()}`,
          referenceType: 'order',
          referenceId: order.id,
        });
      }
      
      // Track coupon redemption if coupon was used
      if (couponId) {
        try {
          await storage.createCouponRedemption({
            couponId,
            userId,
            orderId: order.id,
            discountAmount: couponDiscount ? couponDiscount.toString() : "0",
          });
        } catch (couponError) {
          console.error("Error recording coupon redemption:", couponError);
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
      
      // Create admin notification for new order (using templates)
      try {
        const user = await storage.getUser(userId);
        const customerName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.email || 'Customer');
        const orderNumber = order.id.slice(-8).toUpperCase();
        
        await sendAdminNotification(
          'order_placed',
          { orderNumber, customerName, total: parseFloat(order.total).toLocaleString() },
          defaultNotificationMessages.order_placed,
          { orderId: order.id, userId, total: order.total }
        );
        
        // Check for low stock and create notifications (using templates)
        for (const cartItem of cartItems) {
          const updatedProduct = await storage.getProduct(cartItem.productId);
          if (updatedProduct && updatedProduct.stock <= 10) {
            await sendAdminNotification(
              'low_stock',
              { productName: updatedProduct.name, stock: updatedProduct.stock },
              defaultNotificationMessages.low_stock,
              { productId: updatedProduct.id, currentStock: updatedProduct.stock }
            );
          }
        }
      } catch (notificationError) {
        console.error("Error creating order notification:", notificationError);
      }
      
      // Send order confirmation email to customer (non-blocking)
      try {
        const user = await storage.getUser(userId);
        if (user?.email) {
          sendOrderConfirmationEmail(
            user.email,
            user.firstName || '',
            order.id,
            order.total,
            orderData.paymentMethod || 'Unknown'
          ).catch(err => console.error('Order confirmation email error:', err));
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

  // Admin: Get orders pending payment verification (must be before :id route)
  app.get('/api/admin/orders/pending-verification', adminAuth, async (req, res) => {
    try {
      const orders = await storage.getOrdersPendingVerification();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching pending verification orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
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
      const { status, paymentStatus, refundFullToWallet } = req.body;
      
      // Get original order to check for status change
      const originalOrder = await storage.getOrder(req.params.id);
      
      let order;
      // If status is being changed to cancelled, restore inventory and refund wallet
      if (status === 'cancelled') {
        order = await storage.cancelOrderAndRestoreInventory(req.params.id);
        
        // Handle wallet refunds for cancelled order
        if (originalOrder && originalOrder.userId) {
          const walletAmountUsed = parseFloat(originalOrder.walletAmountUsed || "0");
          const orderTotal = parseFloat(originalOrder.total || "0");
          
          // Calculate refund amount: full order amount if refundFullToWallet is true, otherwise just wallet portion
          let refundAmount = walletAmountUsed;
          let refundDescription = `Refund for cancelled order #${originalOrder.orderNumber || originalOrder.id.slice(-8).toUpperCase()}`;
          
          if (refundFullToWallet && orderTotal > 0) {
            refundAmount = orderTotal;
            refundDescription = `Full refund to wallet for cancelled order #${originalOrder.orderNumber || originalOrder.id.slice(-8).toUpperCase()}`;
          }
          
          if (refundAmount > 0) {
            let wallet = await storage.getWalletByUserId(originalOrder.userId);
            
            // Create wallet if it doesn't exist
            if (!wallet) {
              wallet = await storage.createWallet(originalOrder.userId);
            }
            
            const currentBalance = parseFloat(wallet.balance);
            const newBalance = (currentBalance + refundAmount).toFixed(2);
            
            // Refund to wallet
            await storage.updateWalletBalance(wallet.id, newBalance);
            
            // Create wallet transaction for the refund
            await storage.createWalletTransaction({
              walletId: wallet.id,
              type: 'credit',
              amount: refundAmount.toString(),
              balanceAfter: newBalance,
              description: refundDescription,
              referenceType: 'order',
              referenceId: originalOrder.id,
            });
          }
        }
      } else {
        order = await storage.updateOrder(req.params.id, {
          status,
          paymentStatus,
        });
      }
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Create customer notification for order status update (using templates)
      if (originalOrder && order.userId && status && originalOrder.status !== status) {
        try {
          const statusMessages: Record<string, string> = {
            'pending': 'Your order is being reviewed.',
            'processing': 'Your order is now being processed.',
            'shipped': 'Great news! Your order has been shipped.',
            'delivered': 'Your order has been delivered. Enjoy!',
            'cancelled': 'Your order has been cancelled.',
          };
          const orderNumber = order.id.slice(-8).toUpperCase();
          const statusMessage = statusMessages[status] || `Your order status changed to ${status}.`;
          
          await sendCustomerNotification(
            order.userId,
            'order_status_update',
            { orderNumber, status, statusMessage },
            defaultNotificationMessages.order_status_update,
            { orderId: order.id, status, previousStatus: originalOrder.status }
          );
          
          // Send order status update email (respecting email preferences)
          if (await shouldSendEmailNotification('order_status_update')) {
            const user = await storage.getUser(order.userId);
            if (user?.email) {
              sendOrderStatusUpdateEmail(
                user.email,
                user.firstName || '',
                order.id,
                status
              ).catch(err => console.error('Order status email error:', err));
            }
          }
        } catch (notificationError) {
          console.error("Error creating order update notification:", notificationError);
        }
      }
      
      // Update payment transaction when payment status changes
      if (paymentStatus && originalOrder && originalOrder.paymentStatus !== paymentStatus) {
        try {
          const transactions = await storage.getPaymentTransactions({ orderId: order.id });
          if (transactions.length > 0) {
            // Map order payment status to transaction status (they should mirror each other)
            const statusMapping: Record<string, string> = {
              'pending': 'pending',
              'processing': 'processing',
              'completed': 'completed',
              'failed': 'failed',
              'refunded': 'refunded',
            };
            const transactionStatus = statusMapping[paymentStatus] || paymentStatus;
            await storage.updatePaymentTransaction(transactions[0].id, { status: transactionStatus });
          }
        } catch (transactionError) {
          console.error("Error updating payment transaction:", transactionError);
        }
      }
      
      // Create customer notification for payment status update (using templates)
      if (originalOrder && order.userId && paymentStatus && originalOrder.paymentStatus !== paymentStatus) {
        try {
          const paymentMessages: Record<string, string> = {
            'pending': 'Payment is pending for your order.',
            'completed': 'Payment received! Thank you for your purchase.',
            'failed': 'Payment failed. Please try again or contact support.',
            'refunded': 'Your order payment has been refunded.',
          };
          const orderNumber = order.id.slice(-8).toUpperCase();
          
          const paymentType: NotificationType = paymentStatus === 'completed' ? 'payment_received' : (paymentStatus === 'failed' ? 'payment_failed' : 'general');
          
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

  // ==================== SUPPLIER MANAGEMENT ROUTES ====================
  
  // Get all suppliers
  app.get('/api/admin/suppliers', adminAuth, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  // Get single supplier
  app.get('/api/admin/suppliers/:id', adminAuth, async (req, res) => {
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

  // Create supplier
  app.post('/api/admin/suppliers', adminAuth, async (req, res) => {
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
        isActive: isActive !== false,
      });
      
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  // Update supplier
  app.patch('/api/admin/suppliers/:id', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, contactPerson, email, phone, address, city, notes, isActive } = req.body;
      
      const existingSupplier = await storage.getSupplier(id);
      if (!existingSupplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      const updates: any = { updatedAt: new Date() };
      if (name !== undefined) updates.name = name.trim();
      if (contactPerson !== undefined) updates.contactPerson = contactPerson?.trim() || null;
      if (email !== undefined) updates.email = email?.trim() || null;
      if (phone !== undefined) updates.phone = phone?.trim() || null;
      if (address !== undefined) updates.address = address?.trim() || null;
      if (city !== undefined) updates.city = city?.trim() || null;
      if (notes !== undefined) updates.notes = notes?.trim() || null;
      if (isActive !== undefined) updates.isActive = isActive;
      
      const supplier = await storage.updateSupplier(id, updates);
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  // Delete supplier
  app.delete('/api/admin/suppliers/:id', adminAuth, async (req, res) => {
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

  // ==================== PURCHASE ORDER ROUTES ====================
  
  // Get all purchases
  app.get('/api/admin/purchases', adminAuth, async (req, res) => {
    try {
      const purchases = await storage.getPurchases();
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  // Get single purchase with items
  app.get('/api/admin/purchases/:id', adminAuth, async (req, res) => {
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

  // Create purchase order
  app.post('/api/admin/purchases', adminAuth, async (req: any, res) => {
    try {
      const { supplierId, items, shippingCost, otherCosts, notes, expectedDate } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "At least one item is required" });
      }
      
      // Calculate subtotal
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
        status: 'pending',
        subtotal: subtotal.toString(),
        shippingCost: (shippingCost || 0).toString(),
        otherCosts: (otherCosts || 0).toString(),
        total: total.toString(),
        notes: notes || null,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
      }, items, req.admin.id);
      
      res.status(201).json(purchase);
    } catch (error) {
      console.error("Error creating purchase:", error);
      res.status(500).json({ message: "Failed to create purchase" });
    }
  });

  // Update purchase order
  app.patch('/api/admin/purchases/:id', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { supplierId, shippingCost, otherCosts, notes, expectedDate } = req.body;
      
      const existingPurchase = await storage.getPurchase(id);
      if (!existingPurchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      
      // Don't allow updates if purchase is received or cancelled
      if (existingPurchase.status === 'received' || existingPurchase.status === 'cancelled') {
        return res.status(400).json({ message: "Cannot update a received or cancelled purchase" });
      }
      
      const updates: any = { updatedAt: new Date() };
      if (supplierId !== undefined) updates.supplierId = supplierId;
      if (shippingCost !== undefined) updates.shippingCost = shippingCost.toString();
      if (otherCosts !== undefined) updates.otherCosts = otherCosts.toString();
      if (notes !== undefined) updates.notes = notes;
      if (expectedDate !== undefined) updates.expectedDate = expectedDate ? new Date(expectedDate) : null;
      
      // Recalculate total if costs changed
      if (shippingCost !== undefined || otherCosts !== undefined) {
        const subtotal = parseFloat(existingPurchase.subtotal);
        const newShipping = shippingCost !== undefined ? parseFloat(shippingCost) : parseFloat(existingPurchase.shippingCost || '0');
        const newOther = otherCosts !== undefined ? parseFloat(otherCosts) : parseFloat(existingPurchase.otherCosts || '0');
        updates.total = (subtotal + newShipping + newOther).toString();
      }
      
      const purchase = await storage.updatePurchase(id, updates);
      res.json(purchase);
    } catch (error) {
      console.error("Error updating purchase:", error);
      res.status(500).json({ message: "Failed to update purchase" });
    }
  });

  // Update purchase status
  app.patch('/api/admin/purchases/:id/status', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const validStatuses = ['pending', 'ordered', 'received', 'partially_received', 'cancelled'];
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

  // Receive purchase (adds stock to products)
  app.post('/api/admin/purchases/:id/receive', adminAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { receivedItems } = req.body; // Array of { purchaseItemId, receivedQuantity }
      
      const existingPurchase = await storage.getPurchase(id);
      if (!existingPurchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      
      if (existingPurchase.status === 'cancelled') {
        return res.status(400).json({ message: "Cannot receive a cancelled purchase" });
      }
      
      const purchase = await storage.receivePurchase(id, receivedItems, req.admin.id);
      res.json(purchase);
    } catch (error) {
      console.error("Error receiving purchase:", error);
      res.status(500).json({ message: "Failed to receive purchase" });
    }
  });

  // Delete purchase order
  app.delete('/api/admin/purchases/:id', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      const existingPurchase = await storage.getPurchase(id);
      if (!existingPurchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      
      // Don't allow deletion if purchase is received (stock already added)
      if (existingPurchase.status === 'received' || existingPurchase.status === 'partially_received') {
        return res.status(400).json({ message: "Cannot delete a received purchase" });
      }
      
      await storage.deletePurchase(id);
      res.json({ message: "Purchase deleted successfully" });
    } catch (error) {
      console.error("Error deleting purchase:", error);
      res.status(500).json({ message: "Failed to delete purchase" });
    }
  });

  // ==================== INVENTORY DASHBOARD ROUTES ====================
  
  // Get inventory summary
  app.get('/api/admin/inventory/summary', adminAuth, async (req, res) => {
    try {
      const summary = await storage.getInventorySummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching inventory summary:", error);
      res.status(500).json({ message: "Failed to fetch inventory summary" });
    }
  });

  // Get low stock products
  app.get('/api/admin/inventory/low-stock', adminAuth, async (req, res) => {
    try {
      const products = await storage.getLowStockProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  // Get stock adjustments history
  app.get('/api/admin/inventory/adjustments', adminAuth, async (req, res) => {
    try {
      const { productId } = req.query;
      const adjustments = await storage.getStockAdjustments(
        productId as string | undefined
      );
      res.json(adjustments);
    } catch (error) {
      console.error("Error fetching stock adjustments:", error);
      res.status(500).json({ message: "Failed to fetch stock adjustments" });
    }
  });

  // Create manual stock adjustment
  app.post('/api/admin/inventory/adjust', adminAuth, async (req: any, res) => {
    try {
      const { productId, newStock, reason, adjustmentType } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      
      if (typeof newStock !== 'number' || newStock < 0) {
        return res.status(400).json({ message: "New stock must be a non-negative number" });
      }
      
      const validTypes = ['manual', 'damage', 'return', 'correction', 'other'];
      if (adjustmentType && !validTypes.includes(adjustmentType)) {
        return res.status(400).json({ message: "Invalid adjustment type" });
      }
      
      const result = await storage.adjustProductStock(
        productId,
        newStock,
        adjustmentType || 'manual',
        reason || null,
        req.admin.id
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error adjusting stock:", error);
      res.status(500).json({ message: "Failed to adjust stock" });
    }
  });

  // ==================== PROFIT ANALYTICS ROUTES ====================
  
  // Get profit analytics
  app.get('/api/admin/profit-analytics', adminAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const analytics = await storage.getProfitAnalytics(start, end);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching profit analytics:", error);
      res.status(500).json({ message: "Failed to fetch profit analytics" });
    }
  });

  // Get balance sheet data
  app.get('/api/admin/balance-sheet', adminAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const balanceSheet = await storage.getBalanceSheet(start, end);
      res.json(balanceSheet);
    } catch (error) {
      console.error("Error fetching balance sheet:", error);
      res.status(500).json({ message: "Failed to fetch balance sheet" });
    }
  });

  // ===== NOTIFICATION MANAGEMENT ROUTES =====
  
  // Get all notification types
  app.get('/api/admin/notification-types', adminAuth, async (req, res) => {
    try {
      // Seed default types if empty
      await storage.seedNotificationTypes();
      const types = await storage.getNotificationTypes();
      res.json(types);
    } catch (error) {
      console.error("Error fetching notification types:", error);
      res.status(500).json({ message: "Failed to fetch notification types" });
    }
  });

  // Update notification type
  app.patch('/api/admin/notification-types/:id', adminAuth, async (req, res) => {
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

  // Toggle notification type enabled status
  app.patch('/api/admin/notification-types/:id/toggle', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { field, value } = req.body;
      
      if (!['isEnabled', 'isEmailEnabled', 'isInAppEnabled'].includes(field)) {
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

  // Get all notification templates
  app.get('/api/admin/notification-templates', adminAuth, async (req, res) => {
    try {
      const templates = await storage.getNotificationTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching notification templates:", error);
      res.status(500).json({ message: "Failed to fetch notification templates" });
    }
  });

  // Get templates by type
  app.get('/api/admin/notification-templates/by-type/:typeKey', adminAuth, async (req, res) => {
    try {
      const { typeKey } = req.params;
      const templates = await storage.getNotificationTemplatesByType(typeKey);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates by type:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Create notification template
  app.post('/api/admin/notification-templates', adminAuth, async (req, res) => {
    try {
      const template = await storage.createNotificationTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating notification template:", error);
      res.status(500).json({ message: "Failed to create notification template" });
    }
  });

  // Update notification template
  app.patch('/api/admin/notification-templates/:id', adminAuth, async (req, res) => {
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

  // Toggle notification template active status
  app.patch('/api/admin/notification-templates/:id/toggle', adminAuth, async (req, res) => {
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

  // Delete notification template
  app.delete('/api/admin/notification-templates/:id', adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteNotificationTemplate(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification template:", error);
      res.status(500).json({ message: "Failed to delete notification template" });
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
  // PAYMENT ACCOUNTS ROUTES (for manual payment verification)
  // ============================================

  // Get all payment accounts (public - for checkout)
  app.get('/api/payment-accounts', async (req, res) => {
    try {
      const accounts = await storage.getPaymentAccounts(true); // Only active accounts
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching payment accounts:", error);
      res.status(500).json({ message: "Failed to fetch payment accounts" });
    }
  });

  // Get payment accounts by method (public - for checkout)
  app.get('/api/payment-accounts/method/:method', async (req, res) => {
    try {
      const { method } = req.params;
      const accounts = await storage.getPaymentAccountsByMethod(method);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching payment accounts by method:", error);
      res.status(500).json({ message: "Failed to fetch payment accounts" });
    }
  });

  // Admin: Get all payment accounts
  app.get('/api/admin/payment-accounts', adminAuth, async (req, res) => {
    try {
      const accounts = await storage.getPaymentAccounts(false); // All accounts
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching payment accounts:", error);
      res.status(500).json({ message: "Failed to fetch payment accounts" });
    }
  });

  // Admin: Create payment account
  app.post('/api/admin/payment-accounts', adminAuth, async (req, res) => {
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
        isActive: isActive !== false,
      });

      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating payment account:", error);
      res.status(500).json({ message: "Failed to create payment account" });
    }
  });

  // Admin: Update payment account
  app.patch('/api/admin/payment-accounts/:id', adminAuth, async (req, res) => {
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

  // Admin: Delete payment account
  app.delete('/api/admin/payment-accounts/:id', adminAuth, async (req, res) => {
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

  // ============================================
  // PAYMENT VERIFICATION ROUTES
  // ============================================

  // Upload payment screenshot for an order
  // Guest payment proof (no auth - for guest orders, capability-token protected)
  app.post('/api/orders/guest/:orderId/payment-proof', async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const { screenshot, transactionId, guestToken } = req.body;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Only allow for guest orders (no userId)
      if (order.userId) {
        return res.status(403).json({ message: "Use the authenticated endpoint for account orders" });
      }

      // Verify capability token — must match what was issued at order creation
      const orderWithToken = order as any;
      if (!guestToken || !orderWithToken.guestToken || guestToken !== orderWithToken.guestToken) {
        return res.status(403).json({ message: "Invalid or missing guest token" });
      }

      if (!screenshot || !screenshot.startsWith('data:image/')) {
        return res.status(400).json({ message: "Valid payment screenshot is required" });
      }

      const base64Data = screenshot.split(',')[1];
      if (base64Data && Buffer.from(base64Data, 'base64').length > 2 * 1024 * 1024) {
        return res.status(400).json({ message: "Screenshot file size must be less than 2MB" });
      }

      const updated = await storage.updateOrder(orderId, {
        paymentScreenshotUrl: screenshot,
        transactionId: transactionId || null,
        verificationStatus: 'pending',
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

  app.post('/api/orders/:orderId/payment-proof', isAuthenticated, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const { screenshot, transactionId } = req.body;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Verify the order belongs to this user
      if (order.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Validate screenshot (base64 data URL)
      if (!screenshot || !screenshot.startsWith('data:image/')) {
        return res.status(400).json({ message: "Valid payment screenshot is required" });
      }

      // Check size (max 2MB)
      const base64Data = screenshot.split(',')[1];
      if (base64Data && Buffer.from(base64Data, 'base64').length > 2 * 1024 * 1024) {
        return res.status(400).json({ message: "Screenshot file size must be less than 2MB" });
      }

      // Update order with payment proof
      const updated = await storage.updateOrder(orderId, {
        paymentScreenshotUrl: screenshot,
        transactionId: transactionId || null,
        verificationStatus: 'pending',
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

  // Admin: Verify payment (approve or reject)
  app.post('/api/admin/orders/:orderId/verify-payment', adminAuth, async (req: any, res) => {
    try {
      const { orderId } = req.params;
      const { approved, note } = req.body;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const updated = await storage.verifyOrderPayment(orderId, req.admin.id, approved, note);

      // Create admin notification about the verification
      await storage.createNotification({
        recipientType: 'admin',
        type: approved ? 'payment_received' : 'payment_failed',
        title: approved ? 'Payment Approved' : 'Payment Rejected',
        message: `Payment for order #${order.orderNumber} has been ${approved ? 'approved' : 'rejected'}.`,
        data: { orderId: order.id, orderNumber: order.orderNumber },
      });

      // Send payment verified email to customer if approved
      if (approved && order.userId) {
        try {
          const user = await storage.getUser(order.userId);
          if (user?.email) {
            sendPaymentVerifiedEmail(
              user.email,
              user.firstName || '',
              order.id,
              order.total
            ).catch(err => console.error('Payment verified email error:', err));
          }
        } catch (emailError) {
          console.error("Error sending payment verified email:", emailError);
        }
      }

      res.json({ 
        message: `Payment ${approved ? 'approved' : 'rejected'} successfully`,
        order: updated 
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  // ============================================
  // CRYPTO PAYMENT ROUTES (DEPRECATED - No longer supported)
  // ============================================
  
  // Crypto payments have been deprecated in favor of manual payment verification
  app.post('/api/crypto-payments/create', isAuthenticated, (req, res) => {
    res.status(410).json({ message: "Crypto payments are no longer supported. Please use manual payment verification." });
  });

  app.get('/api/crypto-payments/:orderId/status', isAuthenticated, (req, res) => {
    res.status(410).json({ message: "Crypto payments are no longer supported." });
  });

  app.post('/api/webhooks/tron', (req, res) => {
    res.status(410).json({ message: "Tron USDT payments are no longer supported." });
  });

  app.post('/api/webhooks/binance', (req, res) => {
    res.status(410).json({ returnCode: 'SUCCESS', returnMessage: 'Binance Pay is no longer supported.' });
  });

  app.post('/api/admin/crypto-payments/:id/confirm', adminAuth, (req, res) => {
    res.status(410).json({ message: "Crypto payments are no longer supported." });
  });

  app.get('/api/admin/crypto-payments', adminAuth, (req, res) => {
    res.json([]); // Return empty array for backward compatibility
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
        'paymentUpdates', 'marketingEmails', 'defaultProductImage', 'defaultCategoryImage',
        'guestCheckoutEnabled', 'shippingFee', 'freeShippingThreshold'
      ];
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      const updated = await storage.updateStoreSettings(updateData);
      
      // Invalidate notification settings cache when preferences change
      invalidateNotificationSettingsCache();
      
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

  // ==================== TEAM CHAT ROUTES (Employee Internal Chat) ====================

  // Get all team chat conversations for current admin user
  app.get('/api/admin/team-chat/conversations', adminAuth, async (req: any, res) => {
    try {
      const conversations = await storage.getTeamChatConversations(req.admin.id);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching team chat conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Get all admin users for starting new chats
  app.get('/api/admin/team-chat/users', adminAuth, async (req: any, res) => {
    try {
      const users = await storage.getAdminUsers();
      // Exclude current user from the list
      const filteredUsers = users.filter(u => u.id !== req.admin.id);
      res.json(filteredUsers);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get a specific team chat conversation
  app.get('/api/admin/team-chat/conversations/:id', adminAuth, async (req: any, res) => {
    try {
      // Check if user is a participant
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

  // Create a new direct message conversation
  app.post('/api/admin/team-chat/conversations/direct', adminAuth, async (req: any, res) => {
    try {
      const { targetUserId } = req.body;
      
      if (!targetUserId) {
        return res.status(400).json({ message: "Target user ID is required" });
      }

      // Check if a direct conversation already exists
      const existingConv = await storage.findDirectConversation(req.admin.id, targetUserId);
      if (existingConv) {
        const fullConv = await storage.getTeamChatConversation(existingConv.id);
        return res.json(fullConv);
      }

      // Create new conversation
      const conversation = await storage.createTeamChatConversation({
        type: 'direct',
        createdById: req.admin.id,
      });

      // Add both participants
      await storage.addTeamChatParticipant({
        conversationId: conversation.id,
        adminUserId: req.admin.id,
        isAdmin: true,
      });
      await storage.addTeamChatParticipant({
        conversationId: conversation.id,
        adminUserId: targetUserId,
        isAdmin: false,
      });

      const fullConv = await storage.getTeamChatConversation(conversation.id);
      res.json(fullConv);
    } catch (error) {
      console.error("Error creating direct conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Create a new group chat conversation
  app.post('/api/admin/team-chat/conversations/group', adminAuth, async (req: any, res) => {
    try {
      const { title, description, memberIds } = req.body;
      
      if (!title) {
        return res.status(400).json({ message: "Group title is required" });
      }

      if (!memberIds || memberIds.length < 1) {
        return res.status(400).json({ message: "At least one other member is required" });
      }

      // Create new group conversation
      const conversation = await storage.createTeamChatConversation({
        type: 'group',
        title,
        description,
        createdById: req.admin.id,
      });

      // Add creator as admin participant
      await storage.addTeamChatParticipant({
        conversationId: conversation.id,
        adminUserId: req.admin.id,
        isAdmin: true,
      });

      // Add other members
      for (const memberId of memberIds) {
        await storage.addTeamChatParticipant({
          conversationId: conversation.id,
          adminUserId: memberId,
          isAdmin: false,
        });
      }

      const fullConv = await storage.getTeamChatConversation(conversation.id);
      res.json(fullConv);
    } catch (error) {
      console.error("Error creating group conversation:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  // Update group conversation (title, description)
  app.patch('/api/admin/team-chat/conversations/:id', adminAuth, async (req: any, res) => {
    try {
      const { title, description } = req.body;
      
      // Check if user is a participant
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

  // Delete/leave a conversation
  app.delete('/api/admin/team-chat/conversations/:id', adminAuth, async (req: any, res) => {
    try {
      const conversation = await storage.getTeamChatConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // For direct chats, just remove participant (effectively leaving)
      // For groups, remove participant unless they're the last admin
      await storage.removeTeamChatParticipant(req.params.id, req.admin.id);
      
      // Check if conversation is empty
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

  // Add member to group
  app.post('/api/admin/team-chat/conversations/:id/members', adminAuth, async (req: any, res) => {
    try {
      const { userId } = req.body;
      
      const conversation = await storage.getTeamChatConversation(req.params.id);
      if (!conversation || conversation.type !== 'group') {
        return res.status(400).json({ message: "Can only add members to group chats" });
      }

      // Check if current user is a participant
      const isParticipant = await storage.isTeamChatParticipant(req.params.id, req.admin.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Check if user is already a member
      const alreadyMember = await storage.isTeamChatParticipant(req.params.id, userId);
      if (alreadyMember) {
        return res.status(400).json({ message: "User is already a member" });
      }

      await storage.addTeamChatParticipant({
        conversationId: req.params.id,
        adminUserId: userId,
        isAdmin: false,
      });

      const updatedConv = await storage.getTeamChatConversation(req.params.id);
      res.json(updatedConv);
    } catch (error) {
      console.error("Error adding member:", error);
      res.status(500).json({ message: "Failed to add member" });
    }
  });

  // Remove member from group
  app.delete('/api/admin/team-chat/conversations/:id/members/:userId', adminAuth, async (req: any, res) => {
    try {
      const conversation = await storage.getTeamChatConversation(req.params.id);
      if (!conversation || conversation.type !== 'group') {
        return res.status(400).json({ message: "Can only remove members from group chats" });
      }

      // Check if current user is a participant and admin
      const participants = await storage.getTeamChatParticipants(req.params.id);
      const currentUserParticipant = participants.find(p => p.adminUserId === req.admin.id);
      
      if (!currentUserParticipant) {
        return res.status(403).json({ message: "Not authorized" });
      }

      // Only group admins or the user themselves can remove members
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

  // Get messages for a conversation
  app.get('/api/admin/team-chat/conversations/:id/messages', adminAuth, async (req: any, res) => {
    try {
      // Check if user is a participant
      const isParticipant = await storage.isTeamChatParticipant(req.params.id, req.admin.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const before = req.query.before as string;
      
      const messages = await storage.getTeamChatMessages(req.params.id, limit, before);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post('/api/admin/team-chat/conversations/:id/messages', adminAuth, async (req: any, res) => {
    try {
      const { message, replyToMessageId } = req.body;
      
      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Check if user is a participant
      const isParticipant = await storage.isTeamChatParticipant(req.params.id, req.admin.id);
      if (!isParticipant) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const newMessage = await storage.createTeamChatMessage({
        conversationId: req.params.id,
        senderId: req.admin.id,
        message: message.trim(),
        replyToMessageId,
      });

      // Get sender info
      const sender = await storage.getAdminUser(req.admin.id);
      
      res.json({ ...newMessage, sender });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Mark messages as read
  app.post('/api/admin/team-chat/conversations/:id/read', adminAuth, async (req: any, res) => {
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

  // Get total unread count for team chat
  app.get('/api/admin/team-chat/unread-count', adminAuth, async (req: any, res) => {
    try {
      const count = await storage.getTeamChatUnreadCount(req.admin.id);
      res.json({ count });
    } catch (error) {
      console.error("Error getting unread count:", error);
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });

  // ==================== WALLET ROUTES (CUSTOMER) ====================

  // Get customer's wallet
  app.get('/api/wallet', isAuthenticated, async (req: any, res) => {
    try {
      let wallet = await storage.getWalletByUserId(req.user.id);
      
      // Create wallet if it doesn't exist
      if (!wallet) {
        wallet = await storage.createWallet(req.user.id);
      }
      
      res.json(wallet);
    } catch (error) {
      console.error("Error getting wallet:", error);
      res.status(500).json({ message: "Failed to get wallet" });
    }
  });

  // Get wallet transactions
  app.get('/api/wallet/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const wallet = await storage.getWalletByUserId(req.user.id);
      
      if (!wallet) {
        return res.json([]);
      }
      
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getWalletTransactions(wallet.id, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error getting wallet transactions:", error);
      res.status(500).json({ message: "Failed to get wallet transactions" });
    }
  });

  // Get customer's topup requests
  app.get('/api/wallet/topup-requests', isAuthenticated, async (req: any, res) => {
    try {
      const requests = await storage.getUserTopupRequests(req.user.id);
      res.json(requests);
    } catch (error) {
      console.error("Error getting topup requests:", error);
      res.status(500).json({ message: "Failed to get topup requests" });
    }
  });

  // Create topup request
  app.post('/api/wallet/topup-request', isAuthenticated, async (req: any, res) => {
    try {
      const { amount, paymentMethod, screenshotUrl, transactionId } = req.body;
      
      if (!amount || !paymentMethod || !screenshotUrl) {
        return res.status(400).json({ message: "Amount, payment method, and screenshot are required" });
      }
      
      if (parseFloat(amount) < 100) {
        return res.status(400).json({ message: "Minimum topup amount is Rs. 100" });
      }
      
      // Get or create wallet
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
        transactionId: transactionId || null,
      });
      
      // Create notification for admins (using templates)
      await sendAdminNotification(
        'wallet_topup_request',
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

  // ==================== WALLET ROUTES (ADMIN) ====================

  // Get all wallets with user info
  app.get('/api/admin/wallets', adminAuth, async (req: any, res) => {
    try {
      const wallets = await storage.getAllWallets();
      res.json(wallets);
    } catch (error) {
      console.error("Error getting wallets:", error);
      res.status(500).json({ message: "Failed to get wallets" });
    }
  });

  // Get pending topup requests count (MUST be before :userId route)
  app.get('/api/admin/wallets/topup-requests/pending-count', adminAuth, async (req: any, res) => {
    try {
      const count = await storage.getPendingTopupRequestsCount();
      res.json({ count });
    } catch (error) {
      console.error("Error getting pending count:", error);
      res.status(500).json({ message: "Failed to get pending count" });
    }
  });

  // Get all topup requests (MUST be before :userId route)
  app.get('/api/admin/wallets/topup-requests', adminAuth, async (req: any, res) => {
    try {
      const status = req.query.status as string | undefined;
      const requests = await storage.getWalletTopupRequests(status);
      res.json(requests);
    } catch (error) {
      console.error("Error getting topup requests:", error);
      res.status(500).json({ message: "Failed to get topup requests" });
    }
  });

  // Get specific wallet with transactions (parameterized route MUST come after specific routes)
  app.get('/api/admin/wallets/:userId', adminAuth, async (req: any, res) => {
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

  // Process topup request (approve/reject)
  app.post('/api/admin/wallets/topup-requests/:id/process', adminAuth, async (req: any, res) => {
    try {
      const { approved, note } = req.body;
      
      if (typeof approved !== 'boolean') {
        return res.status(400).json({ message: "Approved status is required" });
      }
      
      const request = await storage.getWalletTopupRequest(req.params.id);
      
      if (!request) {
        return res.status(404).json({ message: "Topup request not found" });
      }
      
      if (request.status !== 'pending') {
        return res.status(400).json({ message: "Request has already been processed" });
      }
      
      // Update the request
      const updatedRequest = await storage.processWalletTopupRequest(
        req.params.id,
        req.admin.id,
        approved,
        note
      );
      
      if (approved) {
        // Get wallet and add balance
        const wallet = await storage.getWallet(request.walletId);
        if (wallet) {
          const currentBalance = parseFloat(wallet.balance);
          const topupAmount = parseFloat(request.amount);
          const newBalance = (currentBalance + topupAmount).toFixed(2);
          
          // Update wallet balance
          await storage.updateWalletBalance(wallet.id, newBalance);
          
          // Create transaction record
          await storage.createWalletTransaction({
            walletId: wallet.id,
            type: 'topup',
            amount: request.amount,
            balanceAfter: newBalance,
            description: `Wallet top-up via ${request.paymentMethod}`,
            referenceType: 'topup_request',
            referenceId: request.id,
            createdBy: req.admin.id,
          });
          
          // Notify customer (using templates)
          await sendCustomerNotification(
            request.userId,
            'wallet_topup_approved',
            { amount: topupAmount.toLocaleString() },
            defaultNotificationMessages.wallet_topup_approved,
            { topupRequestId: request.id, amount: request.amount }
          );
        }
      } else {
        // Notify customer of rejection (using templates)
        await sendCustomerNotification(
          request.userId,
          'wallet_topup_rejected',
          { amount: parseFloat(request.amount).toLocaleString(), reason: note || 'Please contact support for more information.' },
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

  // Add funds manually to customer wallet (admin)
  app.post('/api/admin/wallets/:userId/add-funds', adminAuth, async (req: any, res) => {
    try {
      const { amount, description } = req.body;
      
      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      // Get or create wallet
      let wallet = await storage.getWalletByUserId(req.params.userId);
      if (!wallet) {
        wallet = await storage.createWallet(req.params.userId);
      }
      
      const currentBalance = parseFloat(wallet.balance);
      const addAmount = parseFloat(amount);
      const newBalance = (currentBalance + addAmount).toFixed(2);
      
      // Update wallet balance
      await storage.updateWalletBalance(wallet.id, newBalance);
      
      // Create transaction record
      await storage.createWalletTransaction({
        walletId: wallet.id,
        type: 'credit',
        amount: amount.toString(),
        balanceAfter: newBalance,
        description: description || 'Manual credit by admin',
        referenceType: 'manual',
        createdBy: req.admin.id,
      });
      
      // Notify customer (using templates)
      await sendCustomerNotification(
        req.params.userId,
        'wallet_topup_approved',
        { amount: addAmount.toLocaleString() },
        { title: 'Funds Added to Wallet', message: 'Rs. {{amount}} has been added to your wallet.' },
        { amount, source: 'admin_credit' }
      );
      
      res.json({ success: true, newBalance });
    } catch (error) {
      console.error("Error adding funds:", error);
      res.status(500).json({ message: "Failed to add funds" });
    }
  });

  // Deduct funds from customer wallet (admin)
  app.post('/api/admin/wallets/:userId/deduct-funds', adminAuth, async (req: any, res) => {
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
      
      // Update wallet balance
      await storage.updateWalletBalance(wallet.id, newBalance);
      
      // Create transaction record
      await storage.createWalletTransaction({
        walletId: wallet.id,
        type: 'adjustment',
        amount: (-deductAmount).toString(),
        balanceAfter: newBalance,
        description: description || 'Manual deduction by admin',
        referenceType: 'manual',
        createdBy: req.admin.id,
      });
      
      res.json({ success: true, newBalance });
    } catch (error) {
      console.error("Error deducting funds:", error);
      res.status(500).json({ message: "Failed to deduct funds" });
    }
  });

  // ============================================
  // COUPON ROUTES
  // ============================================

  // Get all coupons (admin only)
  app.get('/api/admin/coupons', adminAuth, async (req: any, res) => {
    try {
      const coupons = await storage.getCoupons();
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  // Get single coupon with details (admin only)
  app.get('/api/admin/coupons/:id', adminAuth, async (req: any, res) => {
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

  // Create coupon (admin only)
  app.post('/api/admin/coupons', adminAuth, async (req: any, res) => {
    try {
      const { categoryIds, productIds, ...couponData } = req.body;
      
      // Check if code already exists
      const existing = await storage.getCouponByCode(couponData.code);
      if (existing) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
      
      const coupon = await storage.createCoupon(couponData);
      
      // Set category/product scope if applicable
      if (couponData.scope === 'category' && categoryIds?.length > 0) {
        await storage.setCouponCategories(coupon.id, categoryIds);
      }
      if (couponData.scope === 'product' && productIds?.length > 0) {
        await storage.setCouponProducts(coupon.id, productIds);
      }
      
      res.json(coupon);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  // Update coupon (admin only)
  app.patch('/api/admin/coupons/:id', adminAuth, async (req: any, res) => {
    try {
      const { categoryIds, productIds, ...couponData } = req.body;
      
      // Check if changing to a code that already exists
      if (couponData.code) {
        const existing = await storage.getCouponByCode(couponData.code);
        if (existing && existing.id !== req.params.id) {
          return res.status(400).json({ message: "Coupon code already exists" });
        }
      }
      
      const coupon = await storage.updateCoupon(req.params.id, couponData);
      
      // Update category/product scope
      if (categoryIds !== undefined) {
        await storage.setCouponCategories(coupon.id, categoryIds || []);
      }
      if (productIds !== undefined) {
        await storage.setCouponProducts(coupon.id, productIds || []);
      }
      
      res.json(coupon);
    } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });

  // Delete coupon (admin only)
  app.delete('/api/admin/coupons/:id', adminAuth, async (req: any, res) => {
    try {
      await storage.deleteCoupon(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  // Validate and apply coupon (customer)
  app.post('/api/coupons/validate', async (req, res) => {
    try {
      const { code, cartItems, userId } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Coupon code is required" });
      }
      
      const coupon = await storage.getCouponByCode(code);
      if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon code" });
      }
      
      // Check if coupon is active
      if (!coupon.isActive) {
        return res.status(400).json({ message: "This coupon is no longer active" });
      }
      
      // Check date validity
      const now = new Date();
      if (coupon.validFrom && new Date(coupon.validFrom) > now) {
        return res.status(400).json({ message: "This coupon is not yet active" });
      }
      if (coupon.validUntil && new Date(coupon.validUntil) < now) {
        return res.status(400).json({ message: "This coupon has expired" });
      }
      
      // Check usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "This coupon has reached its usage limit" });
      }
      
      // Check per-user usage limit
      if (userId && coupon.perUserLimit) {
        const userRedemptions = await storage.getCouponRedemptionsByUser(coupon.id, userId);
        if (userRedemptions.length >= coupon.perUserLimit) {
          return res.status(400).json({ message: "You have already used this coupon the maximum number of times" });
        }
      }
      
      // Calculate discount based on scope
      let eligibleTotal = 0;
      let applicableItems: string[] = [];
      
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      for (const item of cartItems) {
        let isEligible = false;
        
        if (coupon.scope === 'all') {
          isEligible = true;
        } else if (coupon.scope === 'category' && coupon.categories) {
          const product = await storage.getProduct(item.productId);
          isEligible = product ? coupon.categories.some((c: any) => c.categoryId === product.categoryId) : false;
        } else if (coupon.scope === 'product' && coupon.products) {
          isEligible = coupon.products.some((p: any) => p.productId === item.productId);
        }
        
        if (isEligible) {
          eligibleTotal += parseFloat(item.price) * item.quantity;
          applicableItems.push(item.productId);
        }
      }
      
      if (eligibleTotal === 0) {
        return res.status(400).json({ message: "No items in your cart are eligible for this coupon" });
      }
      
      // Check minimum order amount
      if (coupon.minOrderAmount && eligibleTotal < parseFloat(coupon.minOrderAmount)) {
        return res.status(400).json({ 
          message: `Minimum order amount of Rs. ${coupon.minOrderAmount} required for this coupon` 
        });
      }
      
      // Calculate discount
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = (eligibleTotal * parseFloat(coupon.value)) / 100;
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
          discountValue: coupon.value,
        },
        discount: discount.toFixed(2),
        applicableItems,
        message: `Coupon applied! You save Rs. ${discount.toFixed(2)}`,
      });
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ message: "Failed to validate coupon" });
    }
  });

  // ============================================
  // PRODUCT REVIEW ROUTES
  // ============================================

  // Get reviews for a product (public - approved only)
  app.get('/api/products/:productId/reviews', async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.productId, 'approved');
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Check if user can review a product (authenticated customer)
  app.get('/api/products/:productId/can-review', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.productId;
      
      // Check if user already reviewed
      const existingReview = await storage.getUserReviewForProduct(userId, productId);
      if (existingReview) {
        return res.json({ canReview: false, reason: "You have already reviewed this product", existingReview });
      }
      
      // Check if user has purchased and received the product
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

  // Submit a review (authenticated customer)
  app.post('/api/products/:productId/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.productId;
      const { rating, title, comment } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      
      // Check if user already reviewed
      const existingReview = await storage.getUserReviewForProduct(userId, productId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this product" });
      }
      
      // Check if user has purchased and received the product
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
        isVerifiedPurchase: true,
      });
      
      // Create notification for admin
      await storage.createNotification({
        recipientType: 'admin',
        type: 'review_submitted',
        title: 'New Product Review',
        message: `A new review has been submitted and is pending moderation.`,
        data: { reviewId: review.id, productId },
      });
      
      res.json({ success: true, message: "Review submitted successfully and is pending approval" });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  // Edit a review (authenticated customer - can only edit their own reviews)
  app.patch('/api/products/:productId/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.productId;
      const { rating, title, comment } = req.body;
      
      // Find user's existing review for this product
      const existingReview = await storage.getUserReviewForProduct(userId, productId);
      if (!existingReview) {
        return res.status(404).json({ message: "You haven't reviewed this product yet" });
      }
      
      if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      
      // Update the review - reset status to pending for re-moderation
      const updatedReview = await storage.updateReview(existingReview.id, {
        rating: rating || existingReview.rating,
        title: title !== undefined ? (title || null) : existingReview.title,
        comment: comment !== undefined ? (comment || null) : existingReview.comment,
        status: 'pending', // Reset to pending for re-moderation
        moderatedBy: null,
        moderatedAt: null,
        moderationNote: null,
      });
      
      // Create notification for admin about edited review
      await storage.createNotification({
        recipientType: 'admin',
        type: 'review_submitted',
        title: 'Review Updated',
        message: `A customer has updated their review and it requires re-moderation.`,
        data: { reviewId: updatedReview.id, productId },
      });
      
      res.json({ success: true, message: "Review updated successfully and is pending re-approval", review: updatedReview });
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  // Get all reviews (admin only)
  app.get('/api/admin/reviews', adminAuth, async (req: any, res) => {
    try {
      const status = req.query.status as string | undefined;
      const reviews = await storage.getAllReviews(status);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Get pending reviews count (admin only)
  app.get('/api/admin/reviews/pending-count', adminAuth, async (req: any, res) => {
    try {
      const count = await storage.getPendingReviewsCount();
      res.json({ count });
    } catch (error) {
      console.error("Error fetching pending reviews count:", error);
      res.status(500).json({ message: "Failed to fetch pending reviews count" });
    }
  });

  // Moderate a review (admin only)
  app.post('/api/admin/reviews/:id/moderate', adminAuth, async (req: any, res) => {
    try {
      const { status, note } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }
      
      const review = await storage.moderateReview(req.params.id, req.admin.id, status, note);
      res.json(review);
    } catch (error) {
      console.error("Error moderating review:", error);
      res.status(500).json({ message: "Failed to moderate review" });
    }
  });

  // Delete a review (admin only)
  app.delete('/api/admin/reviews/:id', adminAuth, async (req: any, res) => {
    try {
      await storage.deleteReview(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // ============================================
  // SEO ROUTES - Sitemap and Robots.txt
  // ============================================

  // robots.txt
  app.get('/robots.txt', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /api/*

Sitemap: ${baseUrl}/sitemap.xml
`);
  });

  // sitemap.xml
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const products = await storage.getProducts();
      const categories = await storage.getCategories();
      
      const urls: string[] = [];
      
      // Static pages
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
      
      // Category pages
      for (const category of categories) {
        urls.push(`
    <url>
      <loc>${baseUrl}/?view=category-${category.id}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);
      }
      
      // Product pages
      for (const product of products) {
        urls.push(`
    <url>
      <loc>${baseUrl}/?view=product-${product.id}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`);
      }
      
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;
      
      res.type('application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send('Error generating sitemap');
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket for customer support chat
  const { setupChatWebSocket } = await import('./chatWebSocket');
  setupChatWebSocket(httpServer);
  
  // Setup WebSocket for team chat
  const { setupTeamChatWebSocket } = await import('./teamChatWebSocket');
  setupTeamChatWebSocket(httpServer);
  
  return httpServer;
}
