// ---------------------------------------------------------------------------
// LLM Client — Provider-Agnostic Wrapper
// ---------------------------------------------------------------------------
// Currently uses Anthropic. Set LLM_PROVIDER=openai to switch (future).
// ---------------------------------------------------------------------------

import Anthropic from "@anthropic-ai/sdk";

const provider = process.env.LLM_PROVIDER || "anthropic";

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      throw new Error("LLM_API_KEY environment variable is not set");
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Call the LLM and return the raw text response.
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  if (provider === "anthropic") {
    return callAnthropic(request);
  }

  throw new Error(`Unsupported LLM provider: ${provider}`);
}

async function callAnthropic(request: LLMRequest): Promise<LLMResponse> {
  const client = getAnthropicClient();
  const model = "claude-sonnet-4-20250514";

  const response = await client.messages.create({
    model,
    max_tokens: request.maxTokens || 8192,
    system: request.systemPrompt,
    messages: [{ role: "user", content: request.userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from LLM");
  }

  return {
    content: textBlock.text,
    model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}

/**
 * Call the LLM and parse the response as JSON.
 * Retries once on parse failure with a shorter prompt.
 */
export async function callLLMJson<T>(request: LLMRequest): Promise<{
  data: T;
  model: string;
  inputTokens: number;
  outputTokens: number;
}> {
  const response = await callLLM(request);

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = response.content.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  try {
    const data = JSON.parse(jsonStr) as T;
    return {
      data,
      model: response.model,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
    };
  } catch {
    // Retry once with explicit JSON reminder
    const retryResponse = await callLLM({
      ...request,
      userPrompt: `${request.userPrompt}\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY valid JSON with no markdown formatting, no code blocks, no explanation.`,
    });

    let retryStr = retryResponse.content.trim();
    const retryMatch = retryStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (retryMatch) {
      retryStr = retryMatch[1].trim();
    }

    const data = JSON.parse(retryStr) as T;
    return {
      data,
      model: retryResponse.model,
      inputTokens: response.inputTokens + retryResponse.inputTokens,
      outputTokens: response.outputTokens + retryResponse.outputTokens,
    };
  }
}
