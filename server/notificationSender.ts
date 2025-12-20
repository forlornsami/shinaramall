import { storage } from "./storage";
import { shouldSendAdminNotification, shouldSendEmailNotification, type NotificationType } from "./notificationHelper";

interface NotificationVariables {
  [key: string]: string | number | undefined;
}

interface NotificationResult {
  title: string;
  message: string;
}

function applyVariables(template: string, variables: NotificationVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    const value = variables[varName];
    return value !== undefined ? String(value) : match;
  });
}

async function getNotificationContent(
  type: NotificationType,
  channel: 'in_app' | 'email',
  variables: NotificationVariables,
  defaults: NotificationResult
): Promise<NotificationResult> {
  try {
    // Use original type key for template lookup (templates are stored with original keys)
    const templates = await storage.getNotificationTemplatesByType(type);
    const template = templates.find(t => t.channel === channel && t.isActive);
    
    if (template) {
      return {
        title: applyVariables(template.title || defaults.title, variables),
        message: applyVariables(template.body, variables),
      };
    }
  } catch (error) {
    console.error(`Error fetching template for ${type}:`, error);
  }
  
  return {
    title: applyVariables(defaults.title, variables),
    message: applyVariables(defaults.message, variables),
  };
}

type SchemaNotificationType = "order_placed" | "order_status_update" | "low_stock" | "payment_received" | "payment_failed" | "customer_registration" | "review_submitted" | "chat_message" | "general";

function mapToSchemaType(type: NotificationType): SchemaNotificationType {
  const mapping: Record<NotificationType, SchemaNotificationType> = {
    'order_placed': 'order_placed',
    'order_status_update': 'order_status_update',
    'low_stock': 'low_stock',
    'payment_received': 'payment_received',
    'payment_failed': 'payment_failed',
    'new_customer': 'customer_registration',
    'customer_registration': 'customer_registration',
    'review_submitted': 'review_submitted',
    'chat_message': 'chat_message',
    'wallet_topup_request': 'general',
    'wallet_topup_approved': 'general',
    'wallet_topup_rejected': 'general',
    'general': 'general',
  };
  return mapping[type] || 'general';
}

export async function sendAdminNotification(
  type: NotificationType,
  variables: NotificationVariables,
  defaults: { title: string; message: string },
  data?: Record<string, any>
): Promise<boolean> {
  try {
    if (!(await shouldSendAdminNotification(type))) {
      return false;
    }
    
    const content = await getNotificationContent(type, 'in_app', variables, defaults);
    
    await storage.createNotification({
      recipientType: 'admin',
      type: mapToSchemaType(type),
      title: content.title,
      message: content.message,
      data: { ...data, notificationType: type },
    });
    
    return true;
  } catch (error) {
    console.error(`Error sending admin notification (${type}):`, error);
    return false;
  }
}

export async function sendCustomerNotification(
  recipientId: string,
  type: NotificationType,
  variables: NotificationVariables,
  defaults: { title: string; message: string },
  data?: Record<string, any>
): Promise<boolean> {
  try {
    const content = await getNotificationContent(type, 'in_app', variables, defaults);
    
    await storage.createNotification({
      recipientType: 'customer',
      recipientId,
      type: mapToSchemaType(type),
      title: content.title,
      message: content.message,
      data: { ...data, notificationType: type },
    });
    
    return true;
  } catch (error) {
    console.error(`Error sending customer notification (${type}):`, error);
    return false;
  }
}

export async function getEmailContent(
  type: NotificationType,
  variables: NotificationVariables,
  defaults: { subject: string; title: string; body: string }
): Promise<{ subject: string; title: string; body: string } | null> {
  try {
    // Check email preferences using the original type
    if (!(await shouldSendEmailNotification(type))) {
      return null; // Return null to indicate email should not be sent
    }
    
    // Use original type key for template lookup (templates are stored with original keys)
    const templates = await storage.getNotificationTemplatesByType(type);
    const template = templates.find(t => t.channel === 'email' && t.isActive);
    
    if (template) {
      return {
        subject: applyVariables(template.subject || defaults.subject, variables),
        title: applyVariables(template.title || defaults.title, variables),
        body: applyVariables(template.body, variables),
      };
    }
  } catch (error) {
    console.error(`Error fetching email template for ${type}:`, error);
  }
  
  return {
    subject: applyVariables(defaults.subject, variables),
    title: applyVariables(defaults.title, variables),
    body: applyVariables(defaults.body, variables),
  };
}

export const defaultNotificationMessages = {
  order_placed: {
    title: 'New Order Received',
    message: 'New order #{{orderNumber}} from {{customerName}} for Rs. {{total}}',
  },
  order_status_update: {
    title: 'Order #{{orderNumber}} Updated',
    message: 'Order status changed to {{status}}.',
  },
  order_cancelled: {
    title: 'Order Cancelled',
    message: 'Order #{{orderNumber}} was cancelled by {{customerName}}',
  },
  low_stock: {
    title: 'Low Stock Alert',
    message: 'Product "{{productName}}" is running low. Only {{stock}} units left.',
  },
  payment_received: {
    title: 'Payment Received',
    message: 'Payment received for order #{{orderNumber}}. Amount: Rs. {{amount}}',
  },
  payment_verified: {
    title: 'Payment Verified',
    message: 'Your payment for order #{{orderNumber}} has been verified.',
  },
  payment_failed: {
    title: 'Payment Failed',
    message: 'Payment failed for order #{{orderNumber}}. Please try again.',
  },
  customer_registration: {
    title: 'New Customer Registered',
    message: 'New customer {{customerName}} ({{email}}) has registered.',
  },
  review_submitted: {
    title: 'New Review Submitted',
    message: '{{customerName}} left a {{rating}}-star review for "{{productName}}".',
  },
  chat_message: {
    title: 'New Chat Message',
    message: 'You have a new message from {{senderName}}.',
  },
  wallet_topup_request: {
    title: 'Wallet Top-up Request',
    message: '{{customerName}} requested a wallet top-up of Rs. {{amount}}.',
  },
  wallet_topup_approved: {
    title: 'Wallet Top-up Approved',
    message: 'Your wallet top-up of Rs. {{amount}} has been approved.',
  },
  wallet_topup_rejected: {
    title: 'Wallet Top-up Rejected',
    message: 'Your wallet top-up of Rs. {{amount}} has been rejected.',
  },
};
