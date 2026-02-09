interface DescriptionUserPromptParams {
  productName: string;
  keywords: string[];
  vendor?: string | null;
  productType?: string | null;
  price?: number;
  tags?: string[];
  currentDescription?: string | null;
}

export function buildProductDescriptionUserPrompt(params: DescriptionUserPromptParams): string {
  const parts = [`Write an SEO-optimized product description for:`];
  parts.push(`\nProduct name: ${params.productName}`);

  if (params.vendor) parts.push(`Brand/Vendor: ${params.vendor}`);
  if (params.productType) parts.push(`Category: ${params.productType}`);
  if (params.price) parts.push(`Price: ${params.price}`);
  if (params.tags?.length) parts.push(`Tags: ${params.tags.join(', ')}`);
  if (params.keywords?.length) parts.push(`Target SEO keywords: ${params.keywords.join(', ')}`);
  if (params.currentDescription) {
    const stripped = params.currentDescription.replace(/<[^>]*>/g, '').substring(0, 500);
    if (stripped.trim()) {
      parts.push(`\nCurrent description (improve and expand this):\n${stripped}`);
    }
  }

  return parts.join('\n');
}
