/**
 * Base URL for all API/WebSocket calls.
 * In dev (same origin) this is empty → relative URLs work as-is.
 * In production builds pointing to an external backend, set VITE_API_BASE_URL.
 */
export const API_BASE: string = (import.meta.env.VITE_API_BASE_URL as string) || '';

/**
 * Returns a WebSocket URL pointing to the backend.
 * e.g. getWsUrl('/ws/chat') → 'wss://api.shinaramall.com/ws/chat'
 */
export function getWsUrl(path: string): string {
  if (API_BASE) {
    const url = new URL(API_BASE);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${url.host}${path}`;
  }
  // same-origin fallback
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${path}`;
}
