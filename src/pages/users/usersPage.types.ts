import type { z } from 'zod';
import type { registerSchema } from './usersPage.constants';

export type RegisterFormValues = z.infer<typeof registerSchema>;

export type RoleFilter = 'all' | 'admin' | 'customer';

export interface ClientOption {
  _id: string;
  name: string;
}
