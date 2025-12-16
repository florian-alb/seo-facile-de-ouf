import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

/**
 * Get current user session
 * GET /me
 */
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    return res.json(session);
  } catch (err) {
    next(err);
  }
}

/**
 * Sign in with email and password
 * POST /login
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: fromNodeHeaders(req.headers),
    });

    if (!result) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Better Auth handles cookies automatically via the handler
    // We just return the user data
    return res.json({
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Sign out current user
 * POST /logout
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await auth.api.signOut({
      headers: fromNodeHeaders(req.headers),
    });

    // Better Auth handles cookie clearing automatically
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

/**
 * Sign up with email and password
 * POST /register
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "Email, password and name required" });
    }

    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (!result) {
      return res.status(400).json({ error: "Failed to register" });
    }

    return res.json({
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    next(err);
  }
}
