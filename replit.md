# Overview

This is a Pakistani e-commerce platform called Eshaal Store that allows customers to browse and purchase products using local payment methods like EasyPaisa, JazzCash, and HBL. The application features a fully internal email/password authentication system for both customers and administrators (no external auth dependencies), with a comprehensive product catalog management system and order processing capabilities.

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
- **Customer Authentication**: Internal email/password auth with JWT tokens stored in localStorage
- **Admin Authentication**: JWT-based authentication with bcrypt password hashing
- **Unified Auth Pattern**: Both customers and admins use JWT tokens (separate systems)
- **Password Security**: bcrypt (10 rounds) for password hashing
- **Auth Endpoints**: 
  - Customer: POST /api/auth/register, POST /api/auth/login, GET /api/auth/user
  - Admin: POST /api/admin/login

## Database Design
- **Users Table**: Customer data with email, passwordHash, firstName, lastName, mobile, shippingAddress
- **Admin Users Table**: Separate admin accounts with username/password and role-based permissions
- **Product Catalog**: Products, categories with full e-commerce fields (pricing, inventory, images)
- **Order Management**: Orders, order items, and cart items with shipping details

## Payment Integration
- **Pakistani Payment Methods**: EasyPaisa, JazzCash, HBL bank, and Cash on Delivery (COD) support
- **Cryptocurrency Payments**: Tron USDT (TRC-20) and Binance Pay support with automatic webhook-based confirmation
- **Payment Gateway Management**: Full CRUD operations for payment gateways with icons and descriptions
- **Order Processing**: Structured checkout flow with shipping address collection
- **Payment Status Tracking**: Order status management (pending, processing, shipped, delivered)
- **COD Support**: Cash on Delivery option marks orders as confirmed with pending payment collection

## Cryptocurrency Payment System
- **Supported Gateways**: Tron USDT (TRC-20), Binance Pay
- **Database Table**: `crypto_payments` tracks blockchain transactions with orderId, gatewayName, walletAddress, cryptoAmount, cryptoCurrency, network, txHash, confirmations, status, expiresAt
- **Payment Status**: awaiting_payment, confirming, completed, failed, expired

### Tron USDT (Manual Wallet Transfer)
- **Customer Flow**: Customer copies wallet address and manually sends USDT via their Tron wallet
- **Configuration**: Admin sets TRC-20 wallet address in Payment Management
- **Confirmation**: Webhook receives blockchain confirmation or admin manually confirms

### Binance Pay (Direct API Integration)
- **Customer Flow**: Customer is redirected to Binance's secure checkout page to complete payment
- **Configuration**: Requires environment secrets (NOT database config for security)
- **Required Environment Secrets**:
  - `BINANCE_PAY_API_KEY` - Your Binance Pay API Key from merchant portal
  - `BINANCE_PAY_SECRET_KEY` - Your Binance Pay Secret Key
- **API Integration**: server/binancePay.ts handles order creation with HMAC SHA512 signature
- **Confirmation**: Binance sends webhook with signature verification to `/api/webhooks/binance`
- **Get Credentials**: Register at https://merchant.binance.com → Developers → API Keys

### Common Features
- **Webhook Endpoints**:
  - POST /api/webhooks/tron - Receives Tron blockchain payment confirmations
  - POST /api/webhooks/binance - Receives Binance Pay payment notifications (with signature verification)
- **Admin Features**:
  - Configure Tron wallet address in Payment Management
  - Manual payment confirmation option for both gateways
  - View all crypto payments via GET /api/admin/crypto-payments
- **API Endpoints**:
  - POST /api/crypto-payments/create - Create crypto payment for order
  - GET /api/crypto-payments/:orderId/status - Check payment status
  - POST /api/admin/crypto-payments/:id/confirm - Manual confirmation

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
- **Profile Picture System**: Both customers and admins can upload, change, and delete profile pictures (base64 storage, max 2MB, JPG/PNG/GIF)
- **Sidebar Profile Display**: User profile pictures and emails displayed in bottom-left of both admin and storefront sidebars
- **Admin Settings & Help Center**: Store configuration, notifications, security settings, FAQ, and support features
- **Customizable Store Branding**: Admins can upload store logo (base64) and change store name, which dynamically updates across all navigation components
- **Security Features**: Password change with bcrypt verification, active session management in admin security settings
- **RBAC System**: Case-insensitive admin role checking supports various role formats (Super_admin, admin, etc.)
- **In-App Notification System**: Real-time notifications for both admin and customer users with automatic triggers
- **Live Chat Support**: Real-time customer support chat with WebSocket messaging, agent assignment, and conversation management

## Live Chat Support System
- **Database Tables**: 
  - `chat_conversations`: Tracks conversations with customerId, assignedAgentId, status (open, in_progress, resolved, closed), subject
  - `chat_messages`: Stores messages with conversationId, senderId, senderType (customer, agent, system), message content, isRead status
- **WebSocket Server**: Real-time messaging on `/ws/chat` endpoint for instant message delivery
- **Chat Support Role**: Dedicated admin role with permissions (view, respond) for customer support agents
- **Customer Features**:
  - Chat widget in storefront sidebar for authenticated users
  - Create conversations and send messages to support team
  - View message history and conversation status
- **Admin Features**:
  - Chat Support dashboard with conversation list and filters
  - Assign agents to conversations, update status
  - Real-time message view and response
  - Notification integration for new messages
- **API Endpoints**:
  - Customer: GET /api/chat/conversation, GET /api/chat/conversation/:id/messages, POST /api/chat/conversation/:id/messages
  - Admin: GET /api/admin/chat/conversations, POST /api/admin/chat/conversations/:id/assign, PATCH /api/admin/chat/conversations/:id/status, POST /api/admin/chat/conversations/:id/messages
- **Notification Integration**: Creates chat_message notifications for offline agents/customers

## Notification System
- **Database Table**: `notifications` table stores all notifications with recipientType (admin/customer), type, title, message, and metadata
- **Notification Types**: order_placed, order_status_update, low_stock, chat_message, customer_registration, payment_received, payment_failed, general
- **Admin Notifications**: 
  - New order placed (when customer completes checkout)
  - Low stock alerts (when product stock falls to 10 or below)
  - Customer registration (when new customer signs up)
- **Customer Notifications**:
  - Order status updates (when admin changes order status)
  - Payment status updates (when payment is received or fails)
- **UI Components**:
  - Admin: Notification bell in dashboard header (AdminNotificationBell)
  - Customer: Notification bell in storefront sidebar and mobile header (CustomerNotificationBell)
- **API Endpoints**:
  - Admin: GET /api/admin/notifications, GET /api/admin/notifications/count, PATCH /api/admin/notifications/:id/read
  - Customer: GET /api/notifications, GET /api/notifications/count, PATCH /api/notifications/:id/read
- **Polling**: Notifications refresh every 30 seconds to check for new messages

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
- **bcrypt**: Password hashing for customer and admin accounts
- **jsonwebtoken**: JWT token generation and verification for both customers and admins

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