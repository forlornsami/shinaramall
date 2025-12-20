import { db } from "./db";
import { storeSettings, notificationTypes } from "@shared/schema";

interface StoreNotificationSettings {
  orderNotifications: boolean;
  stockAlerts: boolean;
  customerRegistrations: boolean;
  paymentUpdates: boolean;
  marketingEmails: boolean;
}

interface NotificationTypeSettings {
  isEnabled: boolean;
  isEmailEnabled: boolean;
  isInAppEnabled: boolean;
}

let cachedSettings: StoreNotificationSettings | null = null;
let cachedNotificationTypes: Map<string, NotificationTypeSettings> | null = null;
let cacheExpiresAt: number = 0;
const CACHE_TTL_MS = 60000;

export type NotificationType = 
  | 'order_placed'
  | 'order_status_update'
  | 'low_stock'
  | 'payment_received'
  | 'payment_failed'
  | 'new_customer'
  | 'customer_registration'
  | 'review_submitted'
  | 'chat_message'
  | 'wallet_topup_request'
  | 'wallet_topup_approved'
  | 'wallet_topup_rejected'
  | 'general';

const notificationTypeToPreference: Record<NotificationType, keyof StoreNotificationSettings | null> = {
  'order_placed': 'orderNotifications',
  'order_status_update': 'orderNotifications',
  'low_stock': 'stockAlerts',
  'payment_received': 'paymentUpdates',
  'payment_failed': 'paymentUpdates',
  'new_customer': 'customerRegistrations',
  'customer_registration': 'customerRegistrations',
  'review_submitted': null,
  'chat_message': null,
  'wallet_topup_request': 'paymentUpdates',
  'wallet_topup_approved': 'paymentUpdates',
  'wallet_topup_rejected': 'paymentUpdates',
  'general': null,
};

async function getNotificationSettings(): Promise<StoreNotificationSettings> {
  const now = Date.now();
  
  if (cachedSettings && cacheExpiresAt > now) {
    return cachedSettings;
  }
  
  const [settings] = await db.select().from(storeSettings).limit(1);
  
  cachedSettings = {
    orderNotifications: settings?.orderNotifications ?? true,
    stockAlerts: settings?.stockAlerts ?? true,
    customerRegistrations: settings?.customerRegistrations ?? true,
    paymentUpdates: settings?.paymentUpdates ?? true,
    marketingEmails: settings?.marketingEmails ?? false,
  };
  cacheExpiresAt = now + CACHE_TTL_MS;
  
  return cachedSettings;
}

async function getNotificationTypeSettings(): Promise<Map<string, NotificationTypeSettings>> {
  const now = Date.now();
  
  if (cachedNotificationTypes && cacheExpiresAt > now) {
    return cachedNotificationTypes;
  }
  
  const types = await db.select().from(notificationTypes);
  cachedNotificationTypes = new Map();
  
  for (const type of types) {
    cachedNotificationTypes.set(type.key, {
      isEnabled: type.isEnabled ?? true,
      isEmailEnabled: type.isEmailEnabled ?? true,
      isInAppEnabled: type.isInAppEnabled ?? true,
    });
  }
  
  return cachedNotificationTypes;
}

export async function shouldSendAdminNotification(type: NotificationType): Promise<boolean> {
  // First check the notification_types table (managed via Notification Center)
  const typeSettings = await getNotificationTypeSettings();
  const typeSetting = typeSettings.get(type);
  
  if (typeSetting) {
    // If master switch is off, don't send any notification
    if (!typeSetting.isEnabled) {
      return false;
    }
    // If in-app notifications are disabled, don't send admin notification
    if (!typeSetting.isInAppEnabled) {
      return false;
    }
  }
  
  // Also check store settings for backward compatibility
  const preferenceKey = notificationTypeToPreference[type];
  
  if (preferenceKey === null) {
    return true;
  }
  
  const settings = await getNotificationSettings();
  return settings[preferenceKey];
}

export async function shouldSendEmailNotification(type: NotificationType): Promise<boolean> {
  // Check the notification_types table for email settings
  const typeSettings = await getNotificationTypeSettings();
  const typeSetting = typeSettings.get(type);
  
  if (typeSetting) {
    // If master switch is off, don't send email
    if (!typeSetting.isEnabled) {
      return false;
    }
    // If email notifications are disabled, don't send email
    if (!typeSetting.isEmailEnabled) {
      return false;
    }
  }
  
  return true;
}

export function invalidateNotificationSettingsCache(): void {
  cachedSettings = null;
  cachedNotificationTypes = null;
  cacheExpiresAt = 0;
}
