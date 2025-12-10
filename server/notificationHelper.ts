import { db } from "./db";
import { storeSettings } from "@shared/schema";

interface StoreNotificationSettings {
  orderNotifications: boolean;
  stockAlerts: boolean;
  customerRegistrations: boolean;
  paymentUpdates: boolean;
  marketingEmails: boolean;
}

let cachedSettings: StoreNotificationSettings | null = null;
let cacheExpiresAt: number = 0;
const CACHE_TTL_MS = 60000;

export type NotificationType = 
  | 'order_placed'
  | 'order_status_update'
  | 'low_stock'
  | 'payment_received'
  | 'payment_failed'
  | 'new_customer'
  | 'chat_message'
  | 'general';

const notificationTypeToPreference: Record<NotificationType, keyof StoreNotificationSettings | null> = {
  'order_placed': 'orderNotifications',
  'order_status_update': 'orderNotifications',
  'low_stock': 'stockAlerts',
  'payment_received': 'paymentUpdates',
  'payment_failed': 'paymentUpdates',
  'new_customer': 'customerRegistrations',
  'chat_message': null,
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

export async function shouldSendAdminNotification(type: NotificationType): Promise<boolean> {
  const preferenceKey = notificationTypeToPreference[type];
  
  if (preferenceKey === null) {
    return true;
  }
  
  const settings = await getNotificationSettings();
  return settings[preferenceKey];
}

export function invalidateNotificationSettingsCache(): void {
  cachedSettings = null;
  cacheExpiresAt = 0;
}
