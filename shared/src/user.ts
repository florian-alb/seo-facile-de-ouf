export type User = {
  id: string;
  name: string;
  email: string;
  generationIds: string[];
  createdAt: Date;
  emailVerified: boolean;
  image: string | null;
  updatedAt: Date;
};

export type UserPublic = Pick<User, "id" | "name" | "email" | "image">;
