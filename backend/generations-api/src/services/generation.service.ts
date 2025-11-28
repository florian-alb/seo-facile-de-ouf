import { Generation } from "../models/generation.model";

export async function getAll() {
  try {
    const generations = await Generation.find();
    return generations;
  } catch (error: unknown) {
    throw new Error(
      `Failed to get all generations: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function getById(id: string) {
  try {
    const generation = await Generation.findById(id);
    return generation;
  } catch (error: unknown) {
    throw new Error(
      `Failed to get generation by id: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
