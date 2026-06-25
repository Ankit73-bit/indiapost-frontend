import { useState } from 'react';
import { useListUsersQuery } from '@/store/api/usersApi';
import { useListClientsQuery } from '@/store/api/clientsApi';
import { useAppSelector } from '@/store';
import {
  CLIENTS_LOOKUP_LIMIT,
  USERS_PAGE_SIZE,
} from './usersPage.constants';
import type { RoleFilter } from './usersPage.types';

export function useUsersPage() {
  const currentUser = useAppSelector((s) => s.auth.user);
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const { data: clientsData } = useListClientsQuery({
    limit: CLIENTS_LOOKUP_LIMIT,
  });
  const { data, isLoading } = useListUsersQuery({
    role: roleFilter === 'all' ? undefined : roleFilter,
    page,
    limit: USERS_PAGE_SIZE,
  });

  const clientOptions = clientsData?.data ?? [];

  function handleRoleFilterChange(value: RoleFilter) {
    setRoleFilter(value);
    setPage(1);
  }

  return {
    currentUserId: currentUser?.id ?? '',
    page,
    setPage,
    createOpen,
    setCreateOpen,
    roleFilter,
    handleRoleFilterChange,
    clientOptions,
    data,
    isLoading,
  };
}
