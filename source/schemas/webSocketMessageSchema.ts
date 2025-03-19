import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const webSocketMessageSchema = z.object({
  type: z.enum(['notification', 'welcome']),
  data: z.record(z.unknown()).optional()
});

export type WebSocketMessage = z.infer<typeof webSocketMessageSchema>;
export const webSocketMessageSchemaSwagger = zodToJsonSchema(webSocketMessageSchema);
