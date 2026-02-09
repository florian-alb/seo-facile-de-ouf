interface MetaPromptParams {
  productName: string;
  keywords: string[];
  languageName: string;
}

export function buildProductMetaPrompt(params: MetaPromptParams): string {
  return `Generate SEO meta tags for this e-commerce product:

Product: ${params.productName}
Keywords: ${params.keywords.join(", ")}

Respond in JSON:
{
  "metaTitle": "max 60 characters, include main keyword",
  "metaDescription": "max 155 characters, call-to-action",
  "slug": "url-slug-optimized"
}

IMPORTANT RULES:
- Write ALL content in ${params.languageName}
`;
}
