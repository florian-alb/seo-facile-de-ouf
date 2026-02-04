import { Generation } from "../models/generation.model";

export async function getAll(userId: string) {
  try {
    // Filter generations by userId - users can only see their own generations
    const generations = await Generation.find({ userId });
    return generations;
  } catch (error: unknown) {
    throw new Error(
      `Failed to get all generations: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function getById(id: string, userId: string) {
  try {
    // Filter by both id and userId to ensure users can only access their own generations
    const generation = await Generation.findOne({ _id: id, userId });
    return generation;
  } catch (error: unknown) {
    throw new Error(
      `Failed to get generation by id: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
