// Re-export gateway-guard middleware for backward compatibility
export { gatewayGuard, requireAuth, getUserId } from "./gateway-guard";
export type { GatewayAuthenticatedRequest } from "./gateway-guard";
