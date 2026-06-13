/**
 * Security Service
 * 
 * Provides rate limiting, input validation, and security features.
 */

import crypto from "crypto";

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Rate limit configuration
const RATE_LIMITS = {
  default: { requests: 100, windowMs: 60000 }, // 100 requests per minute
  auth: { requests: 10, windowMs: 60000 }, // 10 auth attempts per minute
  api: { requests: 1000, windowMs: 60000 }, // 1000 API calls per minute
  upload: { requests: 20, windowMs: 60000 }, // 20 uploads per minute
  ai: { requests: 30, windowMs: 60000 }, // 30 AI calls per minute
};

type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(
  key: string,
  type: RateLimitType = 'default'
): { allowed: boolean; remaining: number; resetAt: number } {
  const config = RATE_LIMITS[type];
  const now = Date.now();
  const storeKey = `${type}:${key}`;
  
  let entry = rateLimitStore.get(storeKey);
  
  // Reset if window has passed
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + config.windowMs };
    rateLimitStore.set(storeKey, entry);
  }
  
  entry.count++;
  
  const remaining = Math.max(0, config.requests - entry.count);
  const allowed = entry.count <= config.requests;
  
  return { allowed, remaining, resetAt: entry.resetAt };
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetAt) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);

/**
 * Input validation utilities
 */
export const validators = {
  // Email validation
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },
  
  // Password strength validation
  isStrongPassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return { valid: errors.length === 0, errors };
  },
  
  // Sanitize string input
  sanitizeString(input: string, maxLength: number = 1000): string {
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, ''); // Basic XSS prevention
  },
  
  // Validate URL
  isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },
  
  // Validate UUID
  isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },
  
  // Validate phone number (UK format)
  isValidUkPhone(phone: string): boolean {
    const ukPhoneRegex = /^(\+44|0)7\d{9}$/;
    return ukPhoneRegex.test(phone.replace(/\s/g, ''));
  },
  
  // Validate company registration number (UK)
  isValidCompanyNumber(number: string): boolean {
    const companyRegex = /^[A-Z]{2}\d{6}$|^\d{8}$/;
    return companyRegex.test(number.toUpperCase());
  },
};

/**
 * Security headers for responses
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) return false;
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(sessionToken)
  );
}

/**
 * Hash sensitive data for logging (partial masking)
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  const start = data.slice(0, visibleChars);
  const end = data.slice(-visibleChars);
  const masked = '*'.repeat(Math.min(data.length - visibleChars * 2, 10));
  return `${start}${masked}${end}`;
}

/**
 * Check for common SQL injection patterns
 */
export function hasSqlInjectionPattern(input: string): boolean {
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
    /(--)|(\/\*)|(\*\/)/,
    /(;|\||\||&&)/,
    /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i,
    /'.*--/,
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Audit log for security events
 */
export interface SecurityEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'password_change' | 
        'api_key_created' | 'api_key_revoked' | 'rate_limit_exceeded' | 
        'suspicious_activity' | 'permission_denied';
  userId?: number;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

const securityLog: SecurityEvent[] = [];

/**
 * Log security event
 */
export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const fullEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  };
  
  securityLog.push(fullEvent);
  
  // Keep only last 10000 events in memory
  if (securityLog.length > 10000) {
    securityLog.shift();
  }
  
  // Log to console for monitoring
  console.log('[SECURITY]', JSON.stringify(fullEvent));
}

/**
 * Get recent security events
 */
export function getSecurityEvents(options?: {
  type?: SecurityEvent['type'];
  userId?: number;
  limit?: number;
}): SecurityEvent[] {
  let events = [...securityLog];
  
  if (options?.type) {
    events = events.filter(e => e.type === options.type);
  }
  
  if (options?.userId) {
    events = events.filter(e => e.userId === options.userId);
  }
  
  const limit = options?.limit || 100;
  return events.slice(-limit).reverse();
}

/**
 * IP-based blocking (for brute force prevention)
 */
const blockedIps = new Map<string, number>(); // IP -> unblock time

export function blockIp(ip: string, durationMs: number = 15 * 60 * 1000): void {
  blockedIps.set(ip, Date.now() + durationMs);
  logSecurityEvent({
    type: 'suspicious_activity',
    ip,
    details: { action: 'ip_blocked', duration: durationMs },
  });
}

export function isIpBlocked(ip: string): boolean {
  const unblockTime = blockedIps.get(ip);
  if (!unblockTime) return false;
  
  if (Date.now() > unblockTime) {
    blockedIps.delete(ip);
    return false;
  }
  
  return true;
}

export function unblockIp(ip: string): void {
  blockedIps.delete(ip);
}

/**
 * Data encryption utilities
 */
const ENCRYPTION_KEY = process.env.JWT_SECRET || 'default-key-change-in-production';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, encrypted] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
