/**
 * Chat Module
 * Handles AI chat completions with multiple provider support
 */

import { ipcMain } from 'electron';
import { getApiKey, getSettings } from './settings.js';

/**
 * Provider API endpoints
 */
const PROVIDER_ENDPOINTS: Record<string, string> = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  ollama: 'http://localhost:11434/api/chat',
  together: 'https://api.together.xyz/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  mistral: 'https://api.mistral.ai/v1/chat/completions',
  moonshot: 'https://api.moonshot.cn/v1/chat/completions',
  perplexity: 'https://api.perplexity.ai/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
};

/**
 * Message role type
 */
type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Chat message input
 */
interface IChatMessageInput {
  role: MessageRole;
  content: string;
}

/**
 * RAG query options
 */
interface IRagQueryOptions {
  contextLimit?: number;
  similarityThreshold?: number;
  sourceTypes?: string[];
  includeSources?: boolean;
  systemPrompt?: string;
}

/**
 * Source reference
 */
interface ISourceReference {
  entryId: string;
  score: number;
  snippet: string;
  title: string;
  sourceType: string;
  sourcePath: string;
}

/**
 * Chat response
 */
interface IChatResponse {
  response: string;
  sources: ISourceReference[];
}

/**
 * Make OpenAI-compatible API call (works for most providers)
 */
async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  model: string,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Make Anthropic API call (different format)
 */
async function callAnthropic(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  model: string,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  // Extract system message if present
  const systemMessage = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch(PROVIDER_ENDPOINTS.anthropic, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 2048,
      system: systemMessage?.content || 'You are a helpful assistant.',
      messages: chatMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as { content?: Array<{ text?: string }> };
  return data.content?.[0]?.text || '';
}

/**
 * Make Ollama API call (local)
 */
async function callOllama(
  baseUrl: string,
  messages: Array<{ role: string; content: string }>,
  model: string,
  options: { temperature?: number } = {}
): Promise<string> {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.7,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama error: ${response.status} - ${error}`);
  }

  const data = await response.json() as { message?: { content?: string } };
  return data.message?.content || '';
}

/**
 * Get chat completion from the configured provider
 */
async function getChatCompletion(
  messages: IChatMessageInput[],
  options: { model?: string; temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const settings = await getSettings();
  const provider = settings?.preferences?.aiProvider || 'groq';
  const model = options.model || settings?.preferences?.aiModel || 'llama-3.3-70b-versatile';

  console.log(`Chat using provider: ${provider}, model: ${model}`);

  // Get API key for the provider (except Ollama which is local)
  let apiKey: string | null = null;
  if (provider !== 'ollama') {
    apiKey = await getApiKey(provider);
    if (!apiKey) {
      throw new Error(`No API key configured for ${provider}. Please add it in Settings.`);
    }
  }

  // Format messages
  const formattedMessages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  // Call the appropriate provider
  switch (provider) {
    case 'anthropic':
      return callAnthropic(apiKey!, formattedMessages, model, options);

    case 'ollama':
      const ollamaUrl = settings?.ollama?.baseUrl || 'http://localhost:11434';
      return callOllama(ollamaUrl, formattedMessages, model, options);

    case 'groq':
    case 'openai':
    case 'together':
    case 'openrouter':
    case 'mistral':
    case 'moonshot':
    case 'perplexity':
    case 'deepseek':
    default:
      const endpoint = PROVIDER_ENDPOINTS[provider] || PROVIDER_ENDPOINTS.groq;
      return callOpenAICompatible(endpoint, apiKey!, formattedMessages, model, options);
  }
}

/**
 * Query with RAG context
 */
async function queryWithRag(
  query: string,
  history: IChatMessageInput[],
  options: IRagQueryOptions = {}
): Promise<IChatResponse> {
  const {
    // contextLimit = 5, // TODO: Use when RAG is implemented
    systemPrompt = `You are a helpful assistant with access to a knowledge base. 
Answer questions based on the provided context. If the context doesn't contain 
relevant information, say so and provide a general answer if possible.
Always cite your sources when using information from the context.`,
  } = options;

  // For now, we'll skip RAG context retrieval since vector store embedding
  // requires API integration. Just do a simple chat completion.
  // TODO: Integrate with vector store for actual RAG
  
  const sources: ISourceReference[] = [];
  
  // Build messages
  const messages: IChatMessageInput[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: query },
  ];

  try {
    const response = await getChatCompletion(messages);
    return { response, sources };
  } catch (error) {
    console.error('Chat completion error:', error);
    throw error;
  }
}

/**
 * Register chat IPC handlers
 */
export function registerChatHandlers(): void {
  console.log('Registering chat handlers...');

  ipcMain.handle('chat-query-with-rag', async (_, query: string, history: IChatMessageInput[], options?: IRagQueryOptions) => {
    try {
      return await queryWithRag(query, history, options);
    } catch (error) {
      console.error('RAG query error:', error);
      throw error;
    }
  });

  ipcMain.handle('chat-completion', async (_, messages: IChatMessageInput[], options?: { model?: string; temperature?: number; maxTokens?: number }) => {
    try {
      const content = await getChatCompletion(messages, options);
      return { content };
    } catch (error) {
      console.error('Chat completion error:', error);
      throw error;
    }
  });

  console.log('Chat handlers registered');
}
