import type { ElementType, ReactNode } from 'react';

export interface ProfileCardProps {
  icon: ElementType;
  title: string;
  children: ReactNode;
}

export interface ProfileInfoStripProps {
  email?: string;
  role?: string;
  clientName: string | null;
}
