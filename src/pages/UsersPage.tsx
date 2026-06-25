import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/PageHeader';
import { RegisterUserDialog } from '@/components/users/RegisterUserDialog';
import { UsersTable } from '@/components/users/UsersTable';
import { useUsersPage } from '@/pages/users/useUsersPage';
import type { RoleFilter } from '@/pages/users/usersPage.types';

export function UsersPage() {
  const users = useUsersPage();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description="Manage admin and customer user accounts."
        actions={
          <Button size="sm" onClick={() => users.setCreateOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Create User
          </Button>
        }
      />

      <Tabs
        value={users.roleFilter}
        onValueChange={(v) =>
          users.handleRoleFilterChange(v as RoleFilter)
        }
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
          <TabsTrigger value="customer">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value={users.roleFilter}>
          <UsersTable
            isLoading={users.isLoading}
            data={users.data}
            clientOptions={users.clientOptions}
            currentUserId={users.currentUserId}
            onPageChange={users.setPage}
          />
        </TabsContent>
      </Tabs>

      <RegisterUserDialog
        open={users.createOpen}
        onClose={() => users.setCreateOpen(false)}
        clientOptions={users.clientOptions}
      />
    </div>
  );
}
