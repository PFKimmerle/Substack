import { z } from "zod";

export const ChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string().min(1).max(4000)
    })
  ).min(1).max(30),
  temperature: z.number().min(0).max(1).optional(),
  max_tokens: z.number().min(1).max(800).optional()
});
