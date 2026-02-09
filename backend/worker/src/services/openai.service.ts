import OpenAI from "openai";
import { buildProductDescriptionSystemPrompt } from "../prompts/products/description-system-prompt";
import { buildProductDescriptionUserPrompt } from "../prompts/products/description-user-prompt";
import { buildProductMetaPrompt } from "../prompts/products/meta-prompt";
import { buildCollectionDescriptionSystemPrompt } from "../prompts/collections/description-system-prompt";
import { buildCollectionDescriptionUserPrompt } from "../prompts/collections/description-user-prompt";
import { buildCollectionMetaPrompt } from "../prompts/collections/meta-prompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const LANGUAGE_MAP: Record<string, string> = {
  fr: "French",
  en: "English",
  es: "Spanish",
  de: "German",
  it: "Italian",
};

// ═══════════════════════════════════════════════════════════
// Product meta tags generation
// ═══════════════════════════════════════════════════════════

interface MetaInput {
  productName: string;
  keywords: string[];
  languageName: string;
}

interface MetaContent {
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

export async function generateWithOpenAI(
  input: MetaInput,
): Promise<MetaContent> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: buildProductMetaPrompt({
          productName: input.productName,
          keywords: input.keywords,
          languageName: input.languageName,
        }),
      },
    ],
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("Empty response from OpenAI");

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

export async function generateDescriptionWithOpenAI(
  input: DescriptionInput,
): Promise<string> {
  const settings = input.storeSettings;
  const ctx = input.productContext;

  const language = settings?.language || "fr";
  const languageName = LANGUAGE_MAP[language] || "French";
  const wordCount = settings?.productWordCount || 400;

  const systemPrompt = buildProductDescriptionSystemPrompt({
    customerPersona: settings?.customerPersona,
    nicheKeyword: settings?.nicheKeyword,
    nicheDescription: settings?.nicheDescription,
    languageName,
    wordCount,
  });

  const userPrompt = buildProductDescriptionUserPrompt({
    productName: input.productName,
    keywords: input.keywords,
    vendor: ctx?.vendor,
    productType: ctx?.productType,
    price: ctx?.price,
    tags: ctx?.tags,
    currentDescription: ctx?.currentDescription,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("Empty response from OpenAI");

  // Strip markdown code fences if OpenAI wraps the HTML
  return content
    .replace(/^```html?\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();
}

// ═══════════════════════════════════════════════════════════
// Collection description generation
// ═══════════════════════════════════════════════════════════

interface CollectionDescriptionInput {
  collectionName: string;
  keywords: string[];
  storeSettings?: {
    nicheKeyword: string;
    nicheDescription: string;
    language: string;
    productWordCount: number;
    collectionWordCount?: number;
    customerPersona: string;
  } | null;
  collectionContext?: {
    title: string;
    handle: string;
    productsCount: number;
    currentDescription: string | null;
  } | null;
}

export async function generateCollectionDescriptionWithOpenAI(
  input: CollectionDescriptionInput,
): Promise<string> {
  const settings = input.storeSettings;
  const ctx = input.collectionContext;

  const language = settings?.language || "fr";
  const languageName = LANGUAGE_MAP[language] || "French";
  const wordCount = settings?.collectionWordCount || 800;

  const systemPrompt = buildCollectionDescriptionSystemPrompt({
    customerPersona: settings?.customerPersona,
    nicheKeyword: settings?.nicheKeyword,
    nicheDescription: settings?.nicheDescription,
    languageName,
    wordCount,
  });

  const userPrompt = buildCollectionDescriptionUserPrompt({
    collectionName: input.collectionName,
    keywords: input.keywords,
    handle: ctx?.handle,
    productsCount: ctx?.productsCount,
    currentDescription: ctx?.currentDescription,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("Empty response from OpenAI");

  return content
    .replace(/^```html?\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();
}

// ═══════════════════════════════════════════════════════════
// Collection meta tags generation
// ═══════════════════════════════════════════════════════════

export async function generateCollectionMetaWithOpenAI(input: {
  collectionName: string;
  keywords: string[];
  languageName: string;
}): Promise<MetaContent> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: buildCollectionMetaPrompt({
          collectionName: input.collectionName,
          keywords: input.keywords,
          languageName: input.languageName,
        }),
      },
    ],
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("Empty response from OpenAI");

  return JSON.parse(content);
}
