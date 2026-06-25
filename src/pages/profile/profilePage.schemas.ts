import { z } from 'zod';

export const nameSchema = z.object({ name: z.string().min(1, 'Name is required') });
export type NameForm = z.infer<typeof nameSchema>;

export const pwSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
export type PwForm = z.infer<typeof pwSchema>;
