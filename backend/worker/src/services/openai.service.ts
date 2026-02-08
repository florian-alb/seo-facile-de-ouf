// backend/worker/src/services/openai.service.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ═══════════════════════════════════════════════════════════
// Meta tags generation (existing)
// ═══════════════════════════════════════════════════════════

interface MetaInput {
  productName: string;
  keywords: string[];
}

interface MetaContent {
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

export async function generateWithOpenAI(
  input: MetaInput
): Promise<MetaContent> {

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [{
      role: 'user',
      content: `Génère les meta tags SEO pour ce produit e-commerce:

Produit: ${input.productName}
Mots-clés: ${input.keywords.join(', ')}

Réponds en JSON:
{
  "metaTitle": "max 60 caractères, inclure mot-clé principal",
  "metaDescription": "max 155 caractères, call-to-action",
  "slug": "url-slug-optimise"
}`
    }]
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  return JSON.parse(content);
}

// ═══════════════════════════════════════════════════════════
// Product description generation
// ═══════════════════════════════════════════════════════════

interface DescriptionInput {
  productName: string;
  keywords: string[];
  storeSettings?: {
    nicheKeyword: string;
    nicheDescription: string;
    language: string;
    productWordCount: number;
    customerPersona: string;
  } | null;
  productContext?: {
    title: string;
    tags: string[];
    vendor: string | null;
    productType: string | null;
    price: number;
    currentDescription: string | null;
  } | null;
}

const LANGUAGE_MAP: Record<string, string> = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
  de: 'German',
  it: 'Italian',
};

export async function generateDescriptionWithOpenAI(
  input: DescriptionInput
): Promise<string> {
  const settings = input.storeSettings;
  const ctx = input.productContext;

  const language = settings?.language || 'fr';
  const languageName = LANGUAGE_MAP[language] || 'French';
  const wordCount = settings?.productWordCount || 400;

  const systemPrompt = `You are an expert e-commerce SEO copywriter. Write product descriptions that are:
- SEO-optimized with natural keyword integration (no keyword stuffing)
- Compelling, conversion-focused, and engaging
- Written in valid, well-structured HTML using these tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- Organized with clear sections: key features, benefits, use cases, specifications if relevant
- Adapted to the target audience${settings?.customerPersona ? `: ${settings.customerPersona}` : ''}
${settings?.nicheKeyword ? `- Within the niche: ${settings.nicheKeyword}` : ''}
${settings?.nicheDescription ? `- Niche context: ${settings.nicheDescription}` : ''}

IMPORTANT RULES:
- Write in ${languageName}
- Target approximately ${wordCount} words
- Output ONLY the HTML content, no markdown code fences, no explanations, no wrapping
- Do NOT include <html>, <head>, <body> tags - only the content HTML
- Start directly with the first <h2> or <p> tag`;

  const userPromptParts = [`Write an SEO-optimized product description for:`];
  userPromptParts.push(`\nProduct name: ${input.productName}`);

  if (ctx?.vendor) userPromptParts.push(`Brand/Vendor: ${ctx.vendor}`);
  if (ctx?.productType) userPromptParts.push(`Category: ${ctx.productType}`);
  if (ctx?.price) userPromptParts.push(`Price: ${ctx.price}`);
  if (ctx?.tags?.length) userPromptParts.push(`Tags: ${ctx.tags.join(', ')}`);
  if (input.keywords?.length) userPromptParts.push(`Target SEO keywords: ${input.keywords.join(', ')}`);
  if (ctx?.currentDescription) {
    const stripped = ctx.currentDescription.replace(/<[^>]*>/g, '').substring(0, 500);
    if (stripped.trim()) {
      userPromptParts.push(`\nCurrent description (improve and expand this):\n${stripped}`);
    }
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPromptParts.join('\n') },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('Empty response from OpenAI');

  // Strip markdown code fences if OpenAI wraps the HTML
  return content
    .replace(/^```html?\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();
}
