/**
 * LLM integration using OpenAI API directly.
 * Set OPENAI_API_KEY in your environment variables.
 */
import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";
export type TextContent = { type: "text"; text: string };
export type ImageContent = {
  type: "image_url";
  image_url: { url: string; detail?: "auto" | "low" | "high" };
};
export type MessageContent = string | TextContent | ImageContent;
export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};
export type Tool = {
  type: "function";
  function: { name: string; description?: string; parameters?: Record<string, unknown> };
};
export type LLMOptions = {
  model?: string;
  messages: Message[];
  tools?: Tool[];
  tool_choice?: "none" | "auto" | "required";
  response_format?: {
    type: "json_schema";
    json_schema: { name: string; strict?: boolean; schema: Record<string, unknown> };
  };
  temperature?: number;
  max_tokens?: number;
};

export async function invokeLLM(options: LLMOptions) {
  const apiKey = ENV.openaiApiKey;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured. Please add it to your environment variables.");
  }
  const model = options.model ?? "gpt-4o-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: options.messages,
      ...(options.tools && { tools: options.tools }),
      ...(options.tool_choice && { tool_choice: options.tool_choice }),
      ...(options.response_format && { response_format: options.response_format }),
      ...(options.temperature !== undefined && { temperature: options.temperature }),
      ...(options.max_tokens !== undefined && { max_tokens: options.max_tokens }),
    }),
  });
  if (!response.ok) {
    const error = await response.text().catch(() => "Unknown error");
    throw new Error(`OpenAI API error (${response.status}): ${error}`);
  }
  return response.json();
}

export async function listLLMModels() {
  const apiKey = ENV.openaiApiKey;
  if (!apiKey) {
    return { data: [{ id: "gpt-4o-mini" }, { id: "gpt-4o" }, { id: "gpt-4-turbo" }] };
  }
  const response = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    return { data: [{ id: "gpt-4o-mini" }, { id: "gpt-4o" }] };
  }
  return response.json();
}
