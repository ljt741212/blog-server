import { z } from "zod";
import { StructuredTool } from "@langchain/core/tools";

export function createTool<S extends z.ZodTypeAny>(
  name: string,
  description: string,
  schema: S,
  handler: (args: z.infer<S>) => Promise<string>,
): StructuredTool {
  return new (class extends StructuredTool {
    name = name;
    description = description;
    schema = schema;
    async _call(args: z.infer<S>) {
      return handler(args);
    }
  })();
}

export function success(message: string, extra?: Record<string, unknown>): string {
  return JSON.stringify({ success: true, message, ...extra });
}

export function error(message: string): string {
  return JSON.stringify({ error: true, message });
}