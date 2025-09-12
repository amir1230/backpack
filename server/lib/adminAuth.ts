import { Request, Response, NextFunction } from 'express';

// Admin email allowlist - in production this should be in environment variables
const ADMIN_EMAILS = [
  'admin@tripwise.com',
  'support@tripwise.com',
  // Add more admin emails as needed
];

export interface AdminAuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

/**
 * Middleware to check if user has admin privileges
 * Verifies user authentication and checks against admin email allowlist
 */
export function requireAdmin(req: AdminAuthRequest, res: Response, next: NextFunction) {
  // For now, using simple admin check - in production this should check actual session
  // Check if user header contains admin email (temporary implementation)
  const userEmail = req.headers['x-user-email'] as string;
  
  if (!userEmail) {
    return res.status(401).json({
      error: 'authentication_required',
      message: 'Authentication required'
    });
  }
  
  // Check if user email is in admin allowlist
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
    return res.status(403).json({
      error: 'admin_access_required', 
      message: 'Admin access required'
    });
  }

  // Add admin flag to request for downstream handlers
  req.user = {
    id: userEmail.split('@')[0], // Simple ID from email
    email: userEmail,
    isAdmin: true
  };

  next();
}

/**
 * Check if user has admin privileges (without middleware)
 * Returns boolean for programmatic checks
 */
export function isAdmin(userEmail?: string): boolean {
  if (!userEmail) return false;
  return ADMIN_EMAILS.includes(userEmail.toLowerCase());
}

/**
 * Get admin configuration
 */
export function getAdminConfig() {
  return {
    allowedEmails: ADMIN_EMAILS,
    requiresEmailVerification: true,
    sessionRequired: true
  };
}