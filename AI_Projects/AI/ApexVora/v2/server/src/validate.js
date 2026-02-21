import { z } from "zod";

// Text content part (e.g., { type: "text", text: "What's wrong with this plant?" })
const TextContentPart = z.object({
  type: z.literal("text"),
  text: z.string().min(1).max(4000)
});

// Image URL content part (e.g., { type: "image_url", image_url: { url: "data:image/jpeg;base64,..." } })
const ImageUrlContentPart = z.object({
  type: z.literal("image_url"),
  image_url: z.object({
    url: z.string()
      .min(1)
      .max(6_000_000) // ~4MB base64 encoded
      .refine(
        (url) => url.startsWith("data:image/") && url.includes(";base64,"),
        { message: "Image URL must be a base64 data URL (data:image/...;base64,...)" }
      )
  })
});

// Content can be either a string or an array of text/image parts
const ContentSchema = z.union([
  z.string().min(1).max(4000),
  z.array(z.union([TextContentPart, ImageUrlContentPart])).min(1).max(5)
]);

export const ChatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: ContentSchema
    })
  ).min(1).max(30),
  temperature: z.number().min(0).max(1).optional(),
  max_tokens: z.number().min(1).max(2000).optional()
});

// Helper to check if messages contain image content
export function hasImageContent(messages) {
  return messages.some(msg => {
    if (Array.isArray(msg.content)) {
      return msg.content.some(part => part.type === "image_url");
    }
    return false;
  });
}
