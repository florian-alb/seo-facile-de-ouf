interface CollectionDescriptionUserPromptParams {
  collectionName: string;
  keywords: string[];
  handle?: string;
  productsCount?: number;
  currentDescription?: string | null;
}

export function buildCollectionDescriptionUserPrompt(
  params: CollectionDescriptionUserPromptParams,
): string {
  const parts = [`Write an SEO-optimized collection page description for:`];
  parts.push(`\nCollection name: ${params.collectionName}`);

  if (params.handle) parts.push(`URL handle: ${params.handle}`);
  if (params.productsCount)
    parts.push(`Number of products: ${params.productsCount}`);
  if (params.keywords?.length)
    parts.push(`Target SEO keywords: ${params.keywords.join(", ")}`);
  if (params.currentDescription) {
    const stripped = params.currentDescription
      .replace(/<[^>]*>/g, "")
      .substring(0, 500);
    if (stripped.trim()) {
      parts.push(
        `\nCurrent description (improve and expand this):\n${stripped}`,
      );
    }
  }

  return parts.join("\n");
}
