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
- **Manual Payment Verification**: Customers upload payment screenshots and transaction IDs for admin approval
- **Payment Account Management**: Admin can configure bank/mobile wallet account details for each payment method
- **Order Processing**: Structured checkout flow with shipping address collection
- **Payment Status Tracking**: Order verification status management (pending, approved, rejected)
- **COD Support**: Cash on Delivery option marks orders as confirmed with pending payment collection

## Manual Payment Verification System
- **Customer Flow**:
  1. Customer selects payment method at checkout
  2. System displays payment account details (bank name, account number, account holder)
  3. Customer makes payment using their banking app
  4. Customer uploads payment screenshot and enters transaction ID
  5. Order is created with pending verification status
- **Admin Flow**:
  1. Admin navigates to Payments > Verification tab in dashboard
  2. Views pending orders with payment screenshots and transaction IDs
  3. Clicks to view full-size screenshot in modal
  4. Approves or rejects payment with optional notes
  5. Customer receives notification of verification result

### Payment Accounts Table
- **Database Table**: `payment_accounts` stores account details per payment method
- **Fields**: method (easypaisa, jazzcash, hbl_bank), bankName, accountNumber, accountHolderName, description, isActive
- **Admin Management**: Full CRUD operations via Payment Management > Payment Accounts tab

### Order Verification Fields
- **Orders Table Extensions**: transactionId, paymentScreenshot (base64), verificationStatus (pending, approved, rejected), verificationNote, verifiedBy, verifiedAt
- **API Endpoints**:
  - GET /api/payment-accounts?method=xyz - Get active payment accounts for a method
  - POST /api/admin/payment-accounts - Create new payment account
  - PUT /api/admin/payment-accounts/:id - Update payment account
  - DELETE /api/admin/payment-accounts/:id - Delete payment account
  - POST /api/admin/orders/:id/verify - Approve or reject payment with notes

## Product Image Management System
- **File Upload**: Device-based file upload (no URL input) with drag-and-drop support
- **Multiple Images**: Products support multiple images stored in `imageUrls` JSONB array
- **Primary Image**: First image in `imageUrls` array is the primary/thumbnail image
- **Image Reordering**: Drag-and-drop reordering in admin panel; primary selection by moving image to first position
- **Image Removal**: Remove individual images from the gallery
- **Validation**: Max 2MB per image, supports JPG, PNG, GIF, WebP formats
- **Base64 Storage**: Images stored as base64-encoded strings in the database
- **Thumbnail Consistency**: `getProductThumbnail()` function ensures same image displays across admin and storefront
- **Product Details Page**: Full image gallery with zoom, navigation arrows, quantity selector, and add-to-cart

## Key Features
- **Unified Storefront**: Single consistent UI for both logged-in and guest users with left sidebar navigation
- **Dual User Roles**: Customer shopping interface and admin management dashboard
- **Product Management**: Full CRUD operations for products and categories with multi-image upload
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

## Team Chat System (Internal Employee Communication)
- **Purpose**: Internal messaging system for admin team members to communicate with each other
- **Database Tables**:
  - `team_chat_conversations`: Stores conversations with type (direct, group), name, createdById
  - `team_chat_participants`: Tracks conversation membership with adminUserId, isAdmin flag, lastReadMessageId
  - `team_chat_messages`: Stores messages with senderId, message content, replyToMessageId support
- **WebSocket Server**: Real-time messaging on `/ws/team-chat` endpoint for instant message delivery
- **Features**:
  - Direct Messages (1-on-1 private conversations between team members)
  - Group Chats (multi-member conversations with admin management)
  - Reply to specific messages
  - Online presence indicators
  - Unread message counts
- **Admin Features**:
  - Team Chat section in admin sidebar (requires 'chat' permission)
  - Create new direct messages or group conversations
  - Add/remove members from group chats
  - Real-time message delivery with WebSocket
- **API Endpoints**:
  - GET /api/admin/team-chat/conversations - List all conversations for current admin
  - POST /api/admin/team-chat/conversations - Create new conversation (direct or group)
  - GET /api/admin/team-chat/conversations/:id - Get conversation details
  - GET /api/admin/team-chat/conversations/:id/messages - Get messages in conversation
  - POST /api/admin/team-chat/conversations/:id/messages - Send message to conversation
  - POST /api/admin/team-chat/conversations/:id/participants - Add participants to group
  - DELETE /api/admin/team-chat/conversations/:id/participants/:userId - Remove participant
  - POST /api/admin/team-chat/conversations/:id/read - Mark messages as read
  - GET /api/admin/team-chat/unread-count - Get total unread count

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