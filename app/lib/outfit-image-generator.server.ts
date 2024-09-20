import * as fal from '@fal-ai/serverless-client';
import { z } from 'zod';

fal.config({ credentials: process.env.FAL_KEY });

export const FalInputSchema = z.object({
  prompt: z.string(),
  image_size: z
    .enum([
      'square_hd',
      'square',
      'portrait_4_3',
      'portrait_16_9',
      'landscape_4_3',
      'landscape_16_9',
    ])
    .optional(),
  num_inference_steps: z.number().int().min(1).max(50).default(28).optional(),
  seed: z.number().int().optional(),
  guidance_scale: z.number().min(0).max(20).default(3.5).optional(),
  sync_mode: z.boolean().optional(),
  num_images: z.number().int().min(1).max(5).default(1).optional(),
  enable_safety_checker: z.boolean().default(true).optional(),
});

export const ImageSchema = z.object({
  url: z.string().url(),
  width: z.number().int().default(512),
  height: z.number().int().default(512),
  content_type: z.string().default('image/jpeg'),
});
export const FalOutputSchema = z.object({
  images: z.array(ImageSchema),
  timings: z.object({ inference: z.number() }),
  seed: z.number().int(),
  has_nsfw_concepts: z.array(z.boolean()),
  prompt: z.string(),
});

export type FalInput = z.infer<typeof FalInputSchema>;
export type FalOutput = z.infer<typeof FalOutputSchema>;

export const generateOutfitImage = async (prompt: string) => {
  const result = await fal.subscribe<FalInput, FalOutput>('fal-ai/flux/schnell', {
    input: { prompt, image_size: 'square_hd' },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS') {
        update.logs.map((log) => log.message).forEach(console.log);
      }
    },
  });

  return result;
};
