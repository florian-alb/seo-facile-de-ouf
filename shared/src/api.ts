import type { Session } from "./session";
import type { UserPublic } from "./user";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
export type GetSessionResponse = ApiResponse<{
  session: Session;
  user: UserPublic;
}>;
