# Overview

Eshaal Store is a Pakistani e-commerce platform offering customers product browsing and purchasing with local payment methods (EasyPaisa, JazzCash, HBL, COD). It features an internal email/password authentication system for customers and administrators, comprehensive product catalog management, and order processing capabilities. The platform aims to provide a unified shopping experience and efficient administration, supporting various payment verification methods, real-time communication, and secure user management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React with TypeScript and Vite.
- **Routing**: Wouter for client-side navigation.
- **State Management**: TanStack Query for server state.
- **UI**: Shadcn/UI (built on Radix UI) with Tailwind CSS for styling.
- **Structure**: Modular components organized by feature.

## Backend
- **Framework**: Express.js with TypeScript.
- **Database**: PostgreSQL (Neon serverless) via Drizzle ORM.
- **Session Management**: Express sessions with PostgreSQL storage.
- **API**: RESTful endpoints for customer and admin operations.
- **Structure**: Monorepo with shared schema.

## Authentication & Authorization
- **Method**: Internal email/password authentication using JWT tokens (stored in localStorage for customers).
- **Security**: bcrypt (10 rounds) for password hashing.
- **Roles**: Separate customer and admin authentication systems.
- **Authorization**: RBAC for admin users, including specialized roles like Chat Support.

## Database Design
- **Core Entities**: Users (customers), Admin Users, Products, Categories, Orders, Order Items, Cart Items.
- **Payment**: `payment_accounts` for method details, extended `orders` table for verification status.
- **Communication**: `chat_conversations`, `chat_messages`, `team_chat_conversations`, `team_chat_participants`, `team_chat_messages` for real-time chat.
- **Notifications**: `notifications` table for system alerts.
- **Wishlist**: `wishlistItems` for user preferences.
- **Images**: Product images stored as base64-encoded strings in `imageUrls` JSONB array.

## Key Features
- **Product Management**: CRUD for products and categories, multi-image upload with reordering, base64 storage.
- **Order Processing**: Full lifecycle management, including manual payment verification (screenshot upload, admin approval).
- **Payment Methods**: EasyPaisa, JazzCash, HBL Bank Transfer, Cash on Delivery (COD).
- **User Experience**: Unified storefront with guest/logged-in modes, dynamic sidebar navigation, persistent cart (localStorage/DB merge), secure customer profiles.
- **Admin Dashboard**: Comprehensive management of orders, products, customers, payments, and system settings.
- **Real-time Communication**:
    - **Live Chat Support**: Customer-to-agent chat with WebSocket, agent assignment, and notification integration.
    - **Team Chat System**: Internal admin communication (direct and group chats) with WebSocket, presence indicators, and unread counts.
- **Notification System**: In-app notifications for both admin and customer users based on events (e.g., new orders, low stock, chat messages) with polling for updates.
- **Wishlist**: Persistent wishlist for authenticated users (DB-backed) and guest users (localStorage), with automatic merge on login.
- **Store Customization**: Admin can upload store logo and change store name, affecting UI dynamically.
- **Security**: Password change, active session management, robust validation.

# External Dependencies

## Database & ORM
- **Neon PostgreSQL**: Serverless PostgreSQL database.
- **Drizzle ORM**: Type-safe ORM for database interactions.
- **connect-pg-simple**: PostgreSQL session store for Express.

## Authentication
- **bcrypt**: Password hashing.
- **jsonwebtoken**: JWT token handling.

## UI & Styling
- **Radix UI**: Headless UI components.
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn/UI**: Component library.
- **Lucide React**: Icon library.

## State Management & API
- **TanStack Query**: Server state management.
- **React Hook Form**: Form handling.
- **Zod**: Schema validation.

## Development Tools
- **Vite**: Frontend build tool.
- **TypeScript**: Language.
- **ESBuild**: Backend bundling.