// Extend Express Request type to include user info from gateway-guard middleware
declare namespace Express {
  export interface Request {
    userId?: string;
    userEmail?: string;
    userName?: string;
  }
}
