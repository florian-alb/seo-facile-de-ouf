interface DescriptionSystemPromptParams {
  customerPersona?: string;
  nicheKeyword?: string;
  nicheDescription?: string;
  languageName: string;
  wordCount: number;
}

export function buildProductDescriptionSystemPrompt(
  params: DescriptionSystemPromptParams,
): string {
  return `You are an expert e-commerce SEO copywriter. Write product descriptions that are:
- SEO-optimized with natural keyword integration (no keyword stuffing)
- Compelling, conversion-focused, and engaging
- Written in valid, well-structured HTML using these tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- Organized with clear sections: key features, benefits, use cases, specifications if relevant
- Adapted to the target audience${params.customerPersona ? `: ${params.customerPersona}` : ""}
${params.nicheKeyword ? `- Within the niche: ${params.nicheKeyword}` : ""}
${params.nicheDescription ? `- Niche context: ${params.nicheDescription}` : ""}

IMPORTANT RULES:
- Write in ${params.languageName}
- Target approximately ${params.wordCount} words
- Output ONLY the HTML content, no markdown code fences, no explanations, no wrapping
- Do NOT include <html>, <head>, <body> tags - only the content HTML
- Start directly with the first <h2> or <p> tag`;
}
