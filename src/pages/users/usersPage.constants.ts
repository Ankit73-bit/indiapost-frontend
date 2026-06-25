import { z } from 'zod';

export const USERS_PAGE_SIZE = 20;
export const CLIENTS_LOOKUP_LIMIT = 100;

export const registerSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Min 8 characters'),
  role: z.enum(['admin', 'customer']),
  name: z.string().min(1, 'Name is required'),
  clientId: z.string().optional(),
});
