import { z } from 'zod';

export const CLIENTS_PAGE_SIZE = 20;

export const clientFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
});
