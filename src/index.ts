#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TolgeeApi } from "./tolgee-api.js";

async function handleToolCall(fn: () => Promise<unknown>) {
  try {
    const result = await fn();
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { isError: true, content: [{ type: "text" as const, text: String(error) }] };
  }
}

const TOLGEE_URL = process.env.TOLGEE_URL ?? "https://app.tolgee.io";
const TOLGEE_TOKEN = process.env.TOLGEE_TOKEN;
const PROJECT_ID = process.env.PROJECT_ID;

if (!TOLGEE_TOKEN) throw new Error("TOLGEE_TOKEN environment variable is required.");
if (!PROJECT_ID || !Number.isInteger(Number(PROJECT_ID))) throw new Error("PROJECT_ID environment variable must be a numeric project ID.");

const api = new TolgeeApi(TOLGEE_TOKEN, PROJECT_ID, TOLGEE_URL);

const server = new McpServer({
  name: "Tolgee MCP",
  version: "1.0.0",
});

server.tool(
  "tolgee_get_keys",
  "Search for existing translation keys in Tolgee. Use this to check if a key already exists before creating it.",
  {
    filter_keys: z.array(z.string()).min(1).describe("Key names to search for"),
    namespace: z.string().optional().describe("Filter by namespace"),
    languages: z.array(z.string()).optional().describe("Language ISO codes to include translations for (e.g. ['en', 'fr'])"),
  },
  async ({ filter_keys, namespace, languages }) => handleToolCall(() => api.getKeys(filter_keys, namespace, languages)),
);

server.tool(
  "tolgee_create_keys",
  "Create translation keys in Tolgee with initial translations. Always use tolgee_get_keys first to check for duplicates.",
  {
    keys: z.array(z.object({
      key_name: z.string().describe("The translation key name"),
      namespace: z.string().optional().describe("Namespace for the key"),
      description: z.string().optional().describe("Description of the key"),
      translations: z.array(z.object({
        language_iso: z.string().describe("Language ISO code (e.g. en, fr)"),
        translation: z.string().describe("Translation text"),
      })).describe("Initial translations for the key"),
    })).describe("List of keys to create"),
    tags: z.array(z.string()).optional().describe("Tags to apply to the keys"),
  },
  async ({ keys, tags }) => handleToolCall(() => {
    const tolgeeKeys = keys.map((key) => ({
      name: key.key_name,
      namespace: key.namespace,
      description: key.description,
      translations: Object.fromEntries(key.translations.map((t) => [t.language_iso, t.translation])),
      tags: tags ?? [],
    }));
    return api.createKeys(tolgeeKeys);
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Tolgee MCP Server running on stdio");
