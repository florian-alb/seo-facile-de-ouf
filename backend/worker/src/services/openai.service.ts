// backend/worker/src/services/openai.service.ts
import OpenAI from 'openai';
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
 
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
