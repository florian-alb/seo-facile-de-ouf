// Extend Express Request type to include userId from auth middleware
declare namespace Express {
  export interface Request {
    userId?: string;
  }
}
