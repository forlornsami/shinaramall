# Overview

This is a Pakistani e-commerce platform called Eshaal Store that allows customers to browse and purchase products using local payment methods like EasyPaisa, JazzCash, and HBL. The application features separate authentication systems for customers (via Replit Auth) and administrators (via JWT), with a comprehensive product catalog management system and order processing capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React + TypeScript** with Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management 
- **UI Framework**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Component Structure**: Modular components organized by feature (admin, ui, pages)

## Backend Architecture
- **Express.js** server with TypeScript support
- **Database Layer**: Drizzle ORM with PostgreSQL (Neon serverless)
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints for customer and admin operations
- **File Structure**: Monorepo with shared schema between client and server

## Authentication & Authorization
- **Customer Authentication**: Replit OpenID Connect (OIDC) integration with session-based auth
- **Admin Authentication**: JWT-based authentication with bcrypt password hashing
- **Dual Auth Systems**: Separate authentication flows for customers and administrators
- **Session Storage**: PostgreSQL-backed session store for Replit Auth

## Database Design
- **Users Table**: Customer data from Replit Auth (id, email, names, profile image)
- **Admin Users Table**: Separate admin accounts with username/password
- **Product Catalog**: Products, categories with full e-commerce fields (pricing, inventory, images)
- **Order Management**: Orders, order items, and cart items with shipping details
- **Session Storage**: Dedicated sessions table for authentication persistence

## Payment Integration
- **Pakistani Payment Methods**: EasyPaisa, JazzCash, HBL bank, and Cash on Delivery (COD) support
- **Payment Gateway Management**: Full CRUD operations for payment gateways with icons and descriptions
- **Order Processing**: Structured checkout flow with shipping address collection
- **Payment Status Tracking**: Order status management (pending, processing, shipped, delivered)
- **COD Support**: Cash on Delivery option marks orders as confirmed with pending payment collection

## Key Features
- **Unified Storefront**: Single consistent UI for both logged-in and guest users with left sidebar navigation
- **Dual User Roles**: Customer shopping interface and admin management dashboard
- **Product Management**: Full CRUD operations for products and categories
- **Featured Categories**: Admin-manageable featured categories displayed on storefront. Admins toggle the Featured switch in category management to show/hide categories
- **Smart Cart System**: LocalStorage-based cart for guests, database cart for authenticated users with automatic merge on login
- **Checkout Auth Guard**: Login modal appears when guests attempt checkout, cart persists and merges after sign-in
- **Order Processing**: Complete order lifecycle from cart to delivery
- **Admin Dashboard**: Statistics, order management, product management, and customer oversight
- **Customer Profile Management**: Users can view and edit their profile (firstName, lastName) with secure backend validation
- **Admin Settings & Help Center**: Store configuration, notifications, security settings, FAQ, and support features
- **Customizable Store Branding**: Admins can upload store logo (base64) and change store name, which dynamically updates across all navigation components
- **Security Features**: Password change with bcrypt verification, active session management in admin security settings
- **RBAC System**: Case-insensitive admin role checking supports various role formats (Super_admin, admin, etc.)

## Storefront Architecture
- **URL-based Navigation**: Query parameters control views (/?view=products, /?view=cart, etc.)
- **Sidebar Sections**: All Products, Categories, Featured, Cart, My Orders, My Account, Help & Support
- **Dynamic Categories**: Sidebar automatically updates when admin adds/removes categories
- **Cart Context**: Provides unified cart API (addToCart, removeFromCart, updateQuantity) across app
- **Cart Merge Endpoint**: POST /api/cart/merge merges guest cart items with user's database cart on login

# External Dependencies

## Database & ORM
- **Neon PostgreSQL**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations with schema migrations
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Authentication
- **Replit Auth**: OpenID Connect integration for customer authentication
- **openid-client**: OIDC client implementation
- **Passport.js**: Authentication middleware framework
- **bcrypt**: Password hashing for admin accounts
- **jsonwebtoken**: JWT token generation and verification

## UI & Styling
- **Radix UI**: Headless UI component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Pre-built component library
- **Lucide React**: Icon library

## State Management & API
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation

## Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Backend bundling for production
- **Replit Plugins**: Development environment integration