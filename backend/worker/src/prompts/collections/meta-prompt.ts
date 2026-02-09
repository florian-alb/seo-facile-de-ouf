interface CollectionMetaPromptParams {
  collectionName: string;
  keywords: string[];
  languageName: string;
}

export function buildCollectionMetaPrompt(params: CollectionMetaPromptParams): string {
  return `Generate SEO meta tags for this e-commerce collection/category:

Collection: ${params.collectionName}
Keywords: ${params.keywords.join(', ')}

Respond in JSON:
{
  "metaTitle": "max 60 characters, include main keyword",
  "metaDescription": "max 155 characters, call-to-action inviting to discover the collection",
  "slug": "url-slug-optimized"
}

IMPORTANT RULES:
- Write ALL content in ${params.languageName}
`;
}
