import type { Session } from "./session";
import type { UserPublic } from "./user";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
export type GetSessionResponse = ApiResponse<{
  session: Session;
  user: UserPublic;
}>;
