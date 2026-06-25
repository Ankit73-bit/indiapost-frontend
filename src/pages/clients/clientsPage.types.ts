import type { z } from 'zod';
import type { clientFormSchema } from './clientsPage.constants';

export type ClientFormValues = z.infer<typeof clientFormSchema>;
